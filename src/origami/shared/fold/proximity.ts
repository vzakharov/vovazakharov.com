/**
 * Where points stand against a mesh's triangles: a point's projection onto
 * one, and a grid finding the triangles near a point.
 */
import type { Meshed } from './mesh.ts';
import type { Triangle } from './triangulate.ts';

/** Where a point stands over a triangle, as `project` fills it: signed
 * distance along the front normal, the unit normal, and the foot's
 * barycentric weights. */
export const S = 0;
export const NX = 1;
export const W0 = 4;

/** Fills `out` with where point `v` stands over triangle `[i, j, k]`; false
 * when the triangle has collapsed. */
export function project(
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
  // Not `Math.hypot`, which rounds differently: relaxed positions are kept
  // reproducible to the bit.
  const nn = nx * nx + ny * ny + nz * nz;
  const n = Math.sqrt(nn);
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

/** Whether the foot `project` found lies within `slack` past the outline. */
export const over = (seen: Float64Array, slack: number): boolean =>
  (seen[W0] ?? 0) > -slack &&
  (seen[W0 + 1] ?? 0) > -slack &&
  (seen[W0 + 2] ?? 0) > -slack;

/** Cells hash into one number; a collision only adds candidates. */
const key = (i: number, j: number, k: number) =>
  (i * 73_856_093) ^ (j * 19_349_663) ^ (k * 83_492_791);

/** Triangles by the cells of a grid their bounding boxes, grown by `margin`,
 * touch; the lookup returns those in a point's cell. */
export function grid(
  x: Float64Array,
  triangles: readonly Triangle[],
  cell: number,
  margin: number,
): (px: number, py: number, pz: number) => readonly number[] {
  const cells = new Map<number, number[]>();
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

/** The grid's cell: the longest edge, so a triangle spans few cells. */
export const longestEdge = ({ bars }: Meshed): number =>
  Math.max(...bars.map((bar) => bar[2]));
