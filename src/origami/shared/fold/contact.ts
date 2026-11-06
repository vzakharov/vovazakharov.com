/**
 * Layers of paper keeping apart: each vertex is held at least the paper's
 * thickness from every triangle it is not joined to, on the side the flat
 * stack puts it, or else the side it was first seen on — so a vertex that
 * starts or slips through comes back rather than staying.
 */
import type { Mesh } from './mesh.ts';
import type { Triangle } from './triangulate.ts';

/** Within this share past a triangle's outline, a vertex still counts as over
 * it; wider when collecting pairs, which must not miss one before it acts. */
const OVER = 0.02;
const OVER_COLLECTING = 0.1;

/** Where a vertex stands over a triangle: signed distance along the front
 * normal, the unit normal, and the foot's barycentric weights. */
const S = 0;
const NX = 1;
const W0 = 4;

/** Fills `out` with where vertex `v` stands over triangle `[i, j, k]`; false
 * when the triangle has collapsed. */
function project(
  x: Float64Array,
  v: number,
  i: number,
  j: number,
  k: number,
  out: Float64Array,
): boolean {
  const px = x[3 * i] ?? 0;
  const py = x[3 * i + 1] ?? 0;
  const pz = x[3 * i + 2] ?? 0;
  const ux = (x[3 * j] ?? 0) - px;
  const uy = (x[3 * j + 1] ?? 0) - py;
  const uz = (x[3 * j + 2] ?? 0) - pz;
  const wx = (x[3 * k] ?? 0) - px;
  const wy = (x[3 * k + 1] ?? 0) - py;
  const wz = (x[3 * k + 2] ?? 0) - pz;
  const qx = (x[3 * v] ?? 0) - px;
  const qy = (x[3 * v + 1] ?? 0) - py;
  const qz = (x[3 * v + 2] ?? 0) - pz;
  const nx = uy * wz - uz * wy;
  const ny = uz * wx - ux * wz;
  const nz = ux * wy - uy * wx;
  const n = Math.sqrt(nx * nx + ny * ny + nz * nz);
  const uu = ux * ux + uy * uy + uz * uz;
  const uw = ux * wx + uy * wy + uz * wz;
  const ww = wx * wx + wy * wy + wz * wz;
  const det = uu * ww - uw * uw;
  if (n === 0 || det === 0) return false;
  const qu = qx * ux + qy * uy + qz * uz;
  const qw = qx * wx + qy * wy + qz * wz;
  const b = (ww * qu - uw * qw) / det;
  const c = (uu * qw - uw * qu) / det;
  out[S] = (qx * nx + qy * ny + qz * nz) / n;
  out[NX] = nx / n;
  out[NX + 1] = ny / n;
  out[NX + 2] = nz / n;
  out[W0] = 1 - b - c;
  out[W0 + 1] = b;
  out[W0 + 2] = c;
  return true;
}

const over = (seen: Float64Array, slack: number): boolean =>
  (seen[W0] ?? 0) > -slack &&
  (seen[W0 + 1] ?? 0) > -slack &&
  (seen[W0 + 2] ?? 0) > -slack;

/** Triangles by the cells of a grid their bounding boxes, grown by `margin`,
 * touch; the lookup returns those in a point's cell. */
function grid(
  x: Float64Array,
  triangles: readonly Triangle[],
  cell: number,
  margin: number,
): (px: number, py: number, pz: number) => readonly number[] {
  const cells = new Map<number, number[]>();
  // Cells hash into one number; a collision only adds candidates.
  const key = (i: number, j: number, k: number) =>
    ((i * 73_856_093) ^ (j * 19_349_663) ^ (k * 83_492_791)) | 0;
  const bound = (corners: Triangle, axis: number, pick: typeof Math.min) =>
    pick(...corners.map((v) => x[3 * v + axis] ?? 0));
  for (const [t, corners] of triangles.entries()) {
    const lo = [0, 1, 2].map((axis) =>
      Math.floor((bound(corners, axis, Math.min) - margin) / cell),
    );
    const hi = [0, 1, 2].map((axis) =>
      Math.floor((bound(corners, axis, Math.max) + margin) / cell),
    );
    for (let i = lo[0] ?? 0; i <= (hi[0] ?? 0); i++) {
      for (let j = lo[1] ?? 0; j <= (hi[1] ?? 0); j++) {
        for (let k = lo[2] ?? 0; k <= (hi[2] ?? 0); k++) {
          const list = cells.get(key(i, j, k));
          if (list) list.push(t);
          else cells.set(key(i, j, k), [t]);
        }
      }
    }
  }
  return (px, py, pz) =>
    cells.get(
      key(Math.floor(px / cell), Math.floor(py / cell), Math.floor(pz / cell)),
    ) ?? [];
}

/**
 * The side of triangle `t` vertex `v` belongs on by the flat stack: 1 in front,
 * -1 behind, 0 when the stack does not say — the vertex lies on pieces either
 * side of the triangle's (a crease wrapping it), or in another plane.
 */
function stackedSide(mesh: Mesh, v: number, t: number): number {
  const face = mesh.faces[t];
  const sheets = mesh.sheets[v];
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

const longestEdge = (mesh: Mesh): number =>
  Math.max(...mesh.bars.map(([, , rest]) => rest));

export type Contact = {
  /** Finds the pairs that can touch within `reach` of where they are now. */
  refresh: (x: Float64Array, reach: number) => void;
  /** Adds the forces holding each pair apart into `f`. */
  push: (x: Float64Array, f: Float64Array) => void;
};

export function contact(mesh: Mesh, gap: number, stiffness: number): Contact {
  const { triangles } = mesh;
  const count = mesh.paper.length;
  const cell = longestEdge(mesh);
  const sides = new Map<number, number>();
  const seen = new Float64Array(7);
  let pairs = new Int32Array(0);
  let signs = new Float64Array(0);

  const refresh = (x: Float64Array, reach: number) => {
    const near = grid(x, triangles, cell, reach);
    const found: number[] = [];
    for (let v = 0; v < count; v++) {
      for (const t of near(
        x[3 * v] ?? 0,
        x[3 * v + 1] ?? 0,
        x[3 * v + 2] ?? 0,
      )) {
        // Only the triangles a vertex is a corner of are joined to it: any
        // other is one an edge from it can pass through, which is what the
        // crossing check counts. Across a crease pressed flat this holds the
        // two sides a sheet apart, as paper's thickness does.
        const [i, j, k] = triangles[t] ?? [v, v, v];
        if (i === v || j === v || k === v) continue;
        if (!project(x, v, i, j, k, seen)) continue;
        const s = seen[S] ?? 0;
        if (Math.abs(s) > reach || !over(seen, OVER_COLLECTING)) continue;
        const key = v * triangles.length + t;
        // The stack says which side, however the start lies; failing that,
        // the side first seen — unless touching already, when it is unknown
        // and the pair is left to the crossing check rather than pushed the
        // wrong way.
        if (!sides.has(key)) {
          sides.set(
            key,
            stackedSide(mesh, v, t) ||
              (Math.abs(s) > gap / 100 ? Math.sign(s) : 0),
          );
        }
        if (sides.get(key)) found.push(v, t);
      }
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

  const push = (x: Float64Array, f: Float64Array) => {
    for (let p = 0; p < signs.length; p++) {
      const v = pairs[2 * p] ?? 0;
      const [i, j, k] = triangles[pairs[2 * p + 1] ?? 0] ?? [v, v, v];
      if (!project(x, v, i, j, k, seen) || !over(seen, OVER)) continue;
      const side = signs[p] ?? 0;
      const depth = gap - (seen[S] ?? 0) * side;
      if (depth <= 0) continue;
      // Fading out over the slack past the outline, so a vertex sliding off
      // one triangle onto the next feels no jump — one would keep the solver
      // ringing for good.
      const inside = Math.min(seen[W0] ?? 0, seen[W0 + 1] ?? 0, seen[W0 + 2] ?? 0);
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
    }
  };

  return { refresh, push };
}

/**
 * Mesh edges passing through a triangle they are not part of, deeper than
 * `within` past its plane at their shallower end. Where several creases meet,
 * a sheet's own thickness is far finer than the mesh, so layers pressed there
 * graze one another by a fraction of it; that is touching, not passing
 * through.
 */
export function crossings(mesh: Mesh, x: Float64Array, within = 0): number {
  const { triangles } = mesh;
  const cell = longestEdge(mesh);
  const near = grid(x, triangles, cell, cell);
  const at = (v: number, axis: number) => x[3 * v + axis] ?? 0;
  let found = 0;
  for (const [a, b] of mesh.bars) {
    const mid = [0, 1, 2].map((axis) => (at(a, axis) + at(b, axis)) / 2);
    const hit = near(mid[0] ?? 0, mid[1] ?? 0, mid[2] ?? 0).some((t) => {
      const corners = triangles[t];
      return (
        corners !== undefined &&
        !corners.includes(a) &&
        !corners.includes(b) &&
        pierces(x, a, b, corners) > within
      );
    });
    if (hit) found++;
  }
  return found;
}

/** How far segment `a`–`b` passes through the triangle's interior
 * (Möller–Trumbore): its shallower end's distance past the plane, 0 when it
 * misses or only touches. */
function pierces(
  x: Float64Array,
  a: number,
  b: number,
  [t0, t1, t2]: Triangle,
): number {
  const eps = 1e-6;
  const d = (p: number, q: number) =>
    [0, 1, 2].map((axis) => (x[3 * p + axis] ?? 0) - (x[3 * q + axis] ?? 0));
  const cross = (u: number[], w: number[]) => [
    (u[1] ?? 0) * (w[2] ?? 0) - (u[2] ?? 0) * (w[1] ?? 0),
    (u[2] ?? 0) * (w[0] ?? 0) - (u[0] ?? 0) * (w[2] ?? 0),
    (u[0] ?? 0) * (w[1] ?? 0) - (u[1] ?? 0) * (w[0] ?? 0),
  ];
  const dot = (u: number[], w: number[]) =>
    u.reduce((sum, ui, axis) => sum + ui * (w[axis] ?? 0), 0);
  const dir = d(b, a);
  const e1 = d(t1, t0);
  const e2 = d(t2, t0);
  const h = cross(dir, e2);
  const det = dot(e1, h);
  if (Math.abs(det) < 1e-18) return 0;
  const s = d(a, t0);
  const u = dot(s, h) / det;
  const q = cross(s, e1);
  const w = dot(dir, q) / det;
  const t = dot(e2, q) / det;
  if (!(u > eps && w > eps && u + w < 1 - eps && t > eps && t < 1 - eps)) {
    return 0;
  }
  const normal = cross(e1, e2);
  const along = Math.abs(dot(dir, normal)) / Math.hypot(...normal);
  return Math.min(t, 1 - t) * along;
}
