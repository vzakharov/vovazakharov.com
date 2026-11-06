/**
 * The folded state as one welded triangle mesh, for the solver that lets the
 * paper spring back: a point of the sheet is one vertex however many pieces
 * meet there, every piece is triangulated finely enough to bend, and every
 * edge knows whether it is a crease, plain paper or the sheet's edge.
 */
import { assign } from './crease-pattern.ts';
import {
  add,
  apply,
  contains,
  determinant,
  dot,
  edges,
  length,
  NEAR,
  normalize,
  type Polygon,
  type Segment,
  scale,
  sub,
  type Vec,
} from './geometry.ts';
import type { Wings } from './hinge.ts';
import { holdOf, type Paper } from './paper.ts';
import {
  add3,
  cross3,
  differ,
  dot3,
  sub3,
  transform,
  type Vec3,
} from './space.ts';
import { flatPolygon, type FoldState, type Piece } from './state.ts';
import { type Triangle, triangulateConvex } from './triangulate.ts';

/** The longest mesh edge, in sheet widths, by default: fine enough that the
 * paper between creases can curve. */
const MESH_EDGE = 1 / 25;
/** Lattice points closer than this share of an edge to a piece's outline would
 * leave slivers against it. */
const RIM_CLEARANCE = 0.45;
/** How far inside a piece its depth under a rim point is sampled. */
const INSIDE = 1e-5;

/**
 * An interior edge and the two triangles on it. `angle` is the fold angle the
 * edge rests at, valley positive as seen from the paper's front; `pressed` is
 * its angle in the pressed state.
 */
export type MeshHinge = Wings & {
  readonly crease: boolean;
  readonly angle: number;
  readonly pressed: number;
  /** The edge's length in paper. */
  readonly rest: number;
};

/** Where a piece lies in the flat stack: its order, and its plane — the
 * pieces sharing one shaping, the only ones the order ranks against it. */
export type Stacked = { readonly order: number; readonly plane: number };

/** Where each vertex lies in paper, and the hinges between its triangles. */
export type Creased = {
  /** Each vertex's point of the sheet. */
  readonly paper: readonly Vec[];
  readonly hinges: readonly MeshHinge[];
};

export type Meshed = {
  /** Counter-clockwise in paper, so their front faces the paper's front. */
  readonly triangles: readonly Triangle[];
  /** Every edge with its length in paper. */
  readonly bars: readonly (readonly [number, number, number])[];
};

export type Outlined = {
  /** Edges on the sheet's own outline. */
  readonly outline: readonly (readonly [number, number])[];
};

/** The flat stack a mesh was built from. */
export type FlatStack = {
  /** Each triangle's piece in the stack, and which way its front faces in the
   * flat state: 1 up, -1 down. The fold engine knows the stacking exactly;
   * the start positions only approximate it. */
  readonly faces: readonly (Stacked & { readonly facing: number })[];
  /** The pieces in the stack each vertex lies on. */
  readonly sheets: readonly (readonly Stacked[])[];
};

/** The mesh as it lies in paper, before anything places it in space. */
export type PaperMesh = Creased & Meshed;

export type Mesh = PaperMesh &
  Outlined &
  FlatStack & {
    /** Each vertex in space in the pressed state, layers lifted apart. */
    readonly start: readonly Vec3[];
  };

/** Vertices by paper point, one per point within `NEAR`. */
function welder() {
  const points: Vec[] = [];
  const cells = new Map<string, number[]>();
  const cell = (x: number, y: number) =>
    `${Math.floor(x / (10 * NEAR))},${Math.floor(y / (10 * NEAR))}`;
  const index = (pt: Vec): number => {
    const [cx, cy] = [
      Math.floor(pt[0] / (10 * NEAR)),
      Math.floor(pt[1] / (10 * NEAR)),
    ];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (const i of cells.get(`${cx + dx},${cy + dy}`) ?? []) {
          const other = points[i];
          if (other && length(sub(other, pt)) < NEAR) return i;
        }
      }
    }
    points.push(pt);
    const key = cell(pt[0], pt[1]);
    cells.set(key, [...(cells.get(key) ?? []), points.length - 1]);
    return points.length - 1;
  };
  return { points, index };
}

/** Where `pt` falls along segment `[p, q]` as a share of it, when it lies on
 * the segment's line. */
function along([p, q]: Segment, pt: Vec): number | undefined {
  const d = sub(q, p);
  const len = length(d);
  const off = sub(pt, p);
  if (Math.abs(d[0] * off[1] - d[1] * off[0]) / len > NEAR) return undefined;
  return dot(off, d) / (len * len);
}

const within = (segment: Segment, pt: Vec): boolean => {
  const t = along(segment, pt);
  return t !== undefined && t > -NEAR && t < 1 + NEAR;
};

/** A piece's outline as welded vertices: its corners, every other piece's
 * corner lying on one of its edges, and each stretch between subdivided. */
function rim(
  polygon: Polygon,
  corners: readonly number[],
  weld: ReturnType<typeof welder>,
  longest: number,
): number[] {
  return edges(polygon).flatMap((edge) => {
    const [p, q] = edge;
    const stops = [
      0,
      ...corners
        .map((i) => along(edge, weld.points[i] ?? p))
        .filter(
          (t): t is number => t !== undefined && t > NEAR && t < 1 - NEAR,
        ),
      1,
    ].toSorted((s, t) => s - t);
    return stops.slice(0, -1).flatMap((s, k) => {
      const lo = weld.points[weld.index(lerp(p, q, s))] ?? p;
      const hi = weld.points[weld.index(lerp(p, q, stops[k + 1] ?? 1))] ?? q;
      // Both pieces on a stretch subdivide it from the same end, so their
      // points weld.
      const [from, to] =
        lo[0] < hi[0] || (lo[0] === hi[0] && lo[1] < hi[1])
          ? [lo, hi]
          : [hi, lo];
      const parts = Math.ceil(length(sub(hi, lo)) / longest);
      return Array.from({ length: parts }, (_, j) => {
        const share = lo === from ? j / parts : 1 - j / parts;
        return weld.index(lerp(from, to, share));
      });
    });
  });
}

const lerp = (p: Vec, q: Vec, t: number): Vec => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

/** Points of a triangular lattice clear of the polygon's outline. */
function interior(polygon: Polygon, edge: number): Vec[] {
  const rowStep = (edge * Math.sqrt(3)) / 2;
  const ys = polygon.map(([, y]) => y);
  const xs = polygon.map(([x]) => x);
  const clear = (pt: Vec) =>
    edges(polygon).every(([p, q]) => {
      const d = sub(q, p);
      const off = sub(pt, p);
      return (d[0] * off[1] - d[1] * off[0]) / length(d) > RIM_CLEARANCE * edge;
    });
  const out: Vec[] = [];
  for (
    let row = Math.ceil(Math.min(...ys) / rowStep);
    row * rowStep < Math.max(...ys);
    row++
  ) {
    const shift = row % 2 === 0 ? 0 : edge / 2;
    for (
      let col = Math.ceil((Math.min(...xs) - shift) / edge);
      col * edge + shift < Math.max(...xs);
      col++
    ) {
      const pt: Vec = [col * edge + shift, row * rowStep];
      if (clear(pt)) out.push(pt);
    }
  }
  return out;
}

/** The paper's front normal of a piece in space. */
function front(piece: Piece): Vec3 {
  const facing = Math.sign(determinant(piece.placement));
  return sub3(
    transform(piece.shaping, [0, 0, facing]),
    transform(piece.shaping, [0, 0, 0]),
  );
}

/** Where a point of the paper lies in space on `piece`, lifted `lift`. */
const placed = (piece: Piece, pt: Vec, lift: number): Vec3 =>
  transform(piece.shaping, [...apply(piece.placement, pt), lift]);

/**
 * The fold angle between two pieces across edge `a`→`b`, which runs
 * counter-clockwise around `left`. Folded flat the geometry cannot tell valley
 * from mountain, so the stacking does.
 */
export function foldAngle(left: Piece, right: Piece, a: Vec, b: Vec): number {
  const n1 = front(left);
  const n2 = front(right);
  const axis = sub3(placed(left, a, 0), placed(left, b, 0));
  const sine = dot3(cross3(n1, n2), axis) / Math.hypot(...axis);
  const cosine = dot3(n1, n2);
  if (Math.abs(sine) > 1e-9 || cosine > 0) return Math.atan2(sine, cosine);
  const assignment = assign(left, right);
  if (assignment === 'F') {
    throw new Error('mesh: pieces face apart across an unfolded edge');
  }
  return assignment === 'V' ? Math.PI : -Math.PI;
}

/** The latest fold whose crease holds `segment`: the one that last bent it. */
function holdAt(state: FoldState, paper: Paper, [p, q]: Segment): number {
  const record = state.log.findLast(({ creases }) =>
    creases.some((crease) => within(crease, p) && within(crease, q)),
  );
  if (!record) {
    throw new Error(
      `mesh: a crease at ${p.join(',')}–${q.join(',')} no fold made`,
    );
  }
  return holdOf(record, paper);
}

/**
 * How many sheets lie under `piece` at flat point `flat`: the pieces lower in
 * the stack, in the same plane, covering that point. Counted per point rather
 * than per piece, since a piece's depth differs across it — a chain of
 * partial overlaps is not a stack — and welded neighbours must agree on where
 * the paper between them is.
 */
function depthAt(
  pieces: readonly { readonly piece: Piece; readonly flat: Polygon }[],
  piece: Piece,
  flat: Vec,
): number {
  let depth = 0;
  for (const other of pieces) {
    if (
      other.piece.order < piece.order &&
      !differ(other.piece.shaping, piece.shaping) &&
      contains(other.flat, flat)
    ) {
      depth++;
    }
  }
  return depth;
}

/** Where a vertex starts: the pressed state, each sheet beneath lifting it by
 * the paper's thickness, and a crease folded flat pushed out past the layers
 * it wraps. */
function startOf(
  pt: Vec,
  around: readonly Piece[],
  depthOf: (piece: Piece, flat: Vec) => number,
  lift: number,
): Vec3 {
  const [first] = around;
  if (!first) throw new Error('mesh: a vertex on no piece');
  const flat = apply(first.placement, pt);
  const toward = around.map((piece) => {
    const corners = piece.paper.map((corner) => apply(piece.placement, corner));
    const centroid = scale(
      corners.reduce(
        (sum, corner) => [sum[0] + corner[0], sum[1] + corner[1]],
        [0, 0],
      ),
      1 / corners.length,
    );
    return normalize(sub(centroid, flat));
  });
  const mean = scale(
    toward.reduce((sum, u) => [sum[0] + u[0], sum[1] + u[1]], [0, 0]),
    1 / toward.length,
  );
  // Sampled just inside each piece: on its rim, a neighbour merely touching
  // the point would count as a sheet beneath it.
  const depths = around.map((piece, k) =>
    depthOf(piece, add(flat, scale(toward[k] ?? [0, 0], INSIDE))),
  );
  const wrapped = (Math.max(...depths) - Math.min(...depths)) / 2;
  const oneSide =
    around.length > 1 &&
    length(mean) > NEAR &&
    toward.every((u) => dot(u, mean) > 0.2);
  const out = oneSide
    ? scale(normalize(mean), -wrapped * lift)
    : ([0, 0] as const);
  const sum = around.reduce<Vec3>(
    (total, piece, k) =>
      add3(
        total,
        transform(piece.shaping, [
          flat[0] + out[0],
          flat[1] + out[1],
          (depths[k] ?? 0) * lift,
        ]),
      ),
    [0, 0, 0],
  );
  return [
    sum[0] / around.length,
    sum[1] / around.length,
    sum[2] / around.length,
  ];
}

/** The pieces each of `vertices` vertices lies on, given each triangle's. */
export function piecesAround(
  vertices: number,
  triangles: readonly Triangle[],
  ofTriangle: readonly Piece[],
): Piece[][] {
  const around = Array.from({ length: vertices }, (): Piece[] => []);
  for (const [t, corners] of triangles.entries()) {
    const piece = ofTriangle[t];
    for (const i of corners) {
      const list = around[i];
      if (piece && list && !list.includes(piece)) list.push(piece);
    }
  }
  return around;
}

/** The stack of each triangle's and each vertex's pieces, planes numbered in
 * the order they are first met. */
export function flatStack(
  ofTriangle: readonly Piece[],
  around: ReadonlyArray<readonly Piece[]>,
): FlatStack {
  const planes: Array<Piece['shaping']> = [];
  const stacked = (piece: Piece): Stacked => {
    let plane = planes.findIndex((shaping) => !differ(shaping, piece.shaping));
    if (plane < 0) plane = planes.push(piece.shaping) - 1;
    const { order } = piece;
    return { order, plane };
  };
  return {
    faces: ofTriangle.map((piece) => ({
      ...stacked(piece),
      facing: Math.sign(determinant(piece.placement)),
    })),
    sheets: around.map((pieces) => pieces.map((piece) => stacked(piece))),
  };
}

/** `edge` bounds the longest mesh edge, in sheet widths. */
export function mesh(state: FoldState, paper: Paper, edge = MESH_EDGE): Mesh {
  const lift = paper.thickness / paper.side;
  const weld = welder();
  const cornerIds = state.pieces.flatMap((piece) =>
    piece.paper.map((pt) => weld.index(pt)),
  );
  const triangles: Triangle[] = [];
  const pieceOf: Piece[] = [];
  for (const piece of state.pieces) {
    const outline = rim(piece.paper, cornerIds, weld, edge);
    const inside = interior(piece.paper, edge);
    const local = triangulateConvex(
      [...outline.map((i): Vec => weld.points[i] ?? [0, 0]), ...inside],
      outline.length,
    );
    const ids = [...outline, ...inside.map((pt) => weld.index(pt))];
    const id = (i: number): number => {
      const found = ids[i];
      if (found === undefined) throw new Error(`mesh: no local point ${i}`);
      return found;
    };
    for (const [a, b, c] of local) {
      triangles.push([id(a), id(b), id(c)]);
      pieceOf.push(piece);
    }
  }

  const point = (i: number): Vec => {
    const pt = weld.points[i];
    if (!pt) throw new Error(`mesh: no vertex ${i}`);
    return pt;
  };
  const sides = new Map<
    string,
    { a: number; b: number; wing: number; piece: Piece }[]
  >();
  for (const [t, [a, b, c]] of triangles.entries()) {
    const piece = pieceOf[t];
    if (!piece) continue;
    for (const [i, j, k] of [
      [a, b, c],
      [b, c, a],
      [c, a, b],
    ] as const) {
      const key = i < j ? `${i},${j}` : `${j},${i}`;
      sides.set(key, [
        ...(sides.get(key) ?? []),
        { a: i, b: j, wing: k, piece },
      ]);
    }
  }

  const bars: [number, number, number][] = [];
  const hinges: MeshHinge[] = [];
  const outline: [number, number][] = [];
  const angles = new Map<string, number>();
  for (const pair of sides.values()) {
    const [one, two, ...more] = pair;
    if (!one) continue;
    const rest = length(sub(point(one.b), point(one.a)));
    bars.push([one.a, one.b, rest]);
    if (!two) {
      outline.push([one.a, one.b]);
      continue;
    }
    if (more.length > 0 || two.a !== one.b || two.b !== one.a) {
      throw new Error(
        `mesh: edge ${one.a}–${one.b} is not between two triangles`,
      );
    }
    const key = `${one.piece.id}>${two.piece.id}`;
    const start =
      one.piece === two.piece
        ? 0
        : (angles.get(key) ??
          foldAngle(one.piece, two.piece, point(one.a), point(one.b)));
    angles.set(key, start);
    const crease = Math.abs(start) > 1e-9;
    const hold = crease
      ? holdAt(state, paper, [point(one.a), point(one.b)])
      : 0;
    hinges.push({
      a: one.a,
      b: one.b,
      c: one.wing,
      d: two.wing,
      crease,
      angle: hold * start,
      pressed: start,
      rest,
    });
  }

  const around = piecesAround(weld.points.length, triangles, pieceOf);
  const flats = state.pieces.map((piece) => ({
    piece,
    flat: flatPolygon(piece),
  }));
  const depthOf = (piece: Piece, flat: Vec) => depthAt(flats, piece, flat);
  return {
    paper: weld.points,
    start: weld.points.map((pt, i) =>
      startOf(pt, around[i] ?? [], depthOf, lift),
    ),
    triangles,
    bars,
    hinges,
    outline,
    ...flatStack(pieceOf, around),
  };
}
