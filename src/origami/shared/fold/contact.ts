/**
 * Layers of paper keeping apart: each vertex is held at least the paper's
 * thickness from every triangle it is not joined to, on the side the flat
 * stack puts it, or else the side it was first seen on — so a vertex that
 * starts or slips through comes back rather than staying.
 */
import { edgePoints, gather, spread } from './edge-points.ts';
import { rub, type Weights } from './friction.ts';
import type { FlatStack, Mesh } from './mesh.ts';
import { grid, longestEdge, NX, over, project, S, W0 } from './proximity.ts';

/** Within this share past a triangle's outline, a vertex still counts as over
 * it; wider when collecting pairs, which must not miss one before it acts. */
const OVER = 0.02;
const OVER_COLLECTING = 0.1;

/**
 * The side of triangle `t` vertex `v` belongs on by the flat stack: 1 in front,
 * -1 behind, 0 when the stack does not say — the vertex lies on pieces either
 * side of the triangle's (a crease wrapping it), or in another plane.
 */
function stackedSide(stack: FlatStack, v: number, t: number): number {
  const face = stack.faces[t];
  const sheets = stack.sheets[v];
  if (!face || !sheets) return 0;
  let side = 0;
  for (const sheet of sheets) {
    const own = Math.sign(sheet.order - face.order);
    if (sheet.plane !== face.plane || own === 0 || (side && own !== side)) {
      return 0;
    }
    side = own;
  }
  return side * face.facing;
}

/** The stack's side for an edge point: its ends' when they agree or only one
 * says; 0 when they disagree. */
function stackedEdgeSide(
  stack: FlatStack,
  a: number,
  b: number,
  t: number,
): number {
  const sa = stackedSide(stack, a, t);
  const sb = stackedSide(stack, b, t);
  if (sa && sb) return sa === sb ? sa : 0;
  return sa || sb;
}

/** Leaves out the (vertex, triangle) pairs it names. */
type Suspended = (v: number, t: number) => boolean;

export type Contact = {
  /** Finds the pairs that can touch within `reach` of where they are now. */
  refresh: (x: Float64Array, reach: number) => void;
  /** Adds the forces holding each pair apart, and rubbing, into `f`. */
  push: (x: Float64Array, f: Float64Array) => void;
  /** Takes the sides of pairs not yet sided from another flat stack: the
   * state after the step being folded. Pairs sided now keep theirs. */
  restack: (stack: FlatStack) => void;
  /** Holds apart the pairs `pairs` names, until called with nothing: a
   * pocket's lid held up while a flap slides under it. A held pair found on
   * the wrong side of its stacked one is skipped and takes no side, so the
   * flap passes the lid it comes in under; an edge point is held when either
   * end is, since its side comes from the one end the stack decides. */
  suspend: (pairs: Suspended | undefined) => void;
  /** Sets the friction coefficient for the pushes that follow. */
  rubAt: (level: number) => void;
};

/**
 * Contact between the layers of `mesh`, holding them `gap` apart. Options:
 * `edgePoints`, contact points along each outline edge besides its ends;
 * `friction`, Coulomb's coefficient between layers until `rubAt` sets
 * another (0 is frictionless; paper on paper is ~0.3–0.6); `release`, a pair
 * out of reach at a refresh forgetting its side and its friction anchor, so
 * when it meets again the current stack decides — a flap turned over comes
 * back on its new side.
 */
export function contact(
  mesh: Mesh,
  gap: number,
  stiffness: number,
  { edgePoints: perEdge = 0, friction = 0, release = false } = {},
): Contact {
  const { triangles, paper } = mesh;
  const real = paper.length;
  const points = edgePoints(mesh, perEdge);
  const { ends, weight } = points;
  const count = real + weight.length;
  // Positions and forces over the vertices and then the edge points.
  const xe = new Float64Array(3 * count);
  const fe = new Float64Array(3 * count);
  const cell = longestEdge(mesh);
  const seen = new Float64Array(7);
  let sides = new Map<number, number>();
  let stack: FlatStack = mesh;
  let pairs = new Int32Array(0);
  let signs = new Float64Array(0);
  let rubbing = friction;
  let skip: Suspended | undefined;
  const anchors = new Map<number, Weights>();

  const refresh = (x: Float64Array, reach: number) => {
    spread(points, x, xe);
    const near = grid(xe, triangles, cell, reach);
    const found: number[] = [];
    const kept = new Map<number, number>();
    for (let v = 0; v < count; v++) {
      // An edge point is joined to every triangle either end is a corner of.
      const ea = v < real ? v : (ends[2 * (v - real)] ?? 0);
      const eb = v < real ? v : (ends[2 * (v - real) + 1] ?? 0);
      for (const t of near(
        xe[3 * v] ?? 0,
        xe[3 * v + 1] ?? 0,
        xe[3 * v + 2] ?? 0,
      )) {
        // Only the triangles a vertex is a corner of are joined to it: any
        // other is one an edge from it can pass through, which is what the
        // crossing check counts. Across a crease pressed flat this holds the
        // two sides a sheet apart, as paper's thickness does.
        const [i, j, k] = triangles[t] ?? [ea, ea, ea];
        if (i === ea || j === ea || k === ea) continue;
        if (i === eb || j === eb || k === eb) continue;
        if (!project(xe, v, i, j, k, seen)) continue;
        const s = seen[S] ?? 0;
        if (Math.abs(s) > reach || !over(seen, OVER_COLLECTING)) continue;
        const key = v * triangles.length + t;
        // The stack says which side, however the start lies; failing that,
        // the side first seen — unless touching already, when it is unknown
        // and the pair is left to the crossing check rather than pushed the
        // wrong way.
        if (!sides.has(key)) {
          const stacked =
            v < real
              ? stackedSide(stack, v, t)
              : stackedEdgeSide(stack, ea, eb, t);
          if (
            stacked &&
            s * stacked < 0 &&
            skip &&
            (skip(ea, t) || skip(eb, t))
          ) {
            continue;
          }
          sides.set(
            key,
            stacked || (Math.abs(s) > gap / 100 ? Math.sign(s) : 0),
          );
        }
        const side = sides.get(key) ?? 0;
        kept.set(key, side);
        if (side !== 0) found.push(v, t);
      }
    }
    if (release) {
      sides = kept;
      for (const key of anchors.keys()) if (!kept.has(key)) anchors.delete(key);
    }
    pairs = Int32Array.from(found);
    signs = Float64Array.from(
      { length: found.length / 2 },
      (_, p) =>
        sides.get(
          (found[2 * p] ?? 0) * triangles.length + (found[2 * p + 1] ?? 0),
        ) ?? 0,
    );
  };

  const pushPairs = (x: Float64Array, f: Float64Array) => {
    for (const [p, side] of signs.entries()) {
      const v = pairs[2 * p] ?? 0;
      const t = pairs[2 * p + 1] ?? 0;
      const corners = triangles[t] ?? [v, v, v];
      const [i, j, k] = corners;
      if (!project(x, v, i, j, k, seen) || !over(seen, OVER)) continue;
      const depth = gap - (seen[S] ?? 0) * side;
      const key = v * triangles.length + t;
      if (depth <= 0) {
        // Apart, nothing rubs: the pair lets go of its anchor.
        anchors.delete(key);
        continue;
      }
      // Fading out over the slack past the outline, so a vertex sliding off
      // one triangle onto the next feels no jump — one would keep the solver
      // ringing for good.
      const inside = Math.min(
        seen[W0] ?? 0,
        seen[W0 + 1] ?? 0,
        seen[W0 + 2] ?? 0,
      );
      const fade = Math.min(1, (inside + OVER) / OVER);
      const magnitude = stiffness * depth * side * fade;
      // The triangle takes the push back at the nearest point of it, its
      // weights summing to one so the pair adds no net force: otherwise the
      // whole model drifts, held by nothing.
      const w0 = Math.max(0, seen[W0] ?? 0);
      const w1 = Math.max(0, seen[W0 + 1] ?? 0);
      const w2 = Math.max(0, seen[W0 + 2] ?? 0);
      const total = w0 + w1 + w2;
      for (let axis = 0; axis < 3; axis++) {
        const along = magnitude * (seen[NX + axis] ?? 0);
        const back = along / total;
        f[3 * v + axis] = (f[3 * v + axis] ?? 0) + along;
        f[3 * i + axis] = (f[3 * i + axis] ?? 0) - back * w0;
        f[3 * j + axis] = (f[3 * j + axis] ?? 0) - back * w1;
        f[3 * k + axis] = (f[3 * k + axis] ?? 0) - back * w2;
      }
      // Without friction no anchor is kept, so one comes back fresh.
      if (rubbing <= 0) {
        anchors.delete(key);
        continue;
      }
      const w: Weights = [seen[W0] ?? 0, seen[W0 + 1] ?? 0, seen[W0 + 2] ?? 0];
      let anchor = anchors.get(key);
      if (!anchor) {
        anchor = [...w];
        anchors.set(key, anchor);
      }
      rub(
        x,
        f,
        v,
        corners,
        w,
        anchor,
        stiffness,
        rubbing * Math.abs(magnitude),
      );
    }
  };

  const push = (x: Float64Array, f: Float64Array) => {
    spread(points, x, xe);
    fe.fill(0);
    fe.set(f);
    pushPairs(xe, fe);
    gather(points, fe, f);
  };

  return {
    refresh,
    push,
    restack: (next) => {
      stack = next;
    },
    suspend: (held) => {
      skip = held;
    },
    rubAt: (level) => {
      rubbing = level;
    },
  };
}
