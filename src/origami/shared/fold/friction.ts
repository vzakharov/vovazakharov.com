/**
 * Friction between touching layers, as a stick-slip spring per pair: where a
 * vertex's foot first lands on a triangle is kept as an anchor (barycentric,
 * so it rides with the triangle), and the foot is pulled back to it — up to a
 * limit, past which the anchor is dragged along behind the foot (slip).
 */
import type { Triangle } from './triangulate.ts';

/** The foot's barycentric weights on a triangle's corners. */
export type Weights = [number, number, number];

/**
 * Adds into `f` the pull of vertex `v`'s foot, at `w` on `corners`, back to
 * `anchor`: `stiffness` times the offset, capped at `limit`, the triangle
 * taking it back at the foot so the pair adds no net force. On slip, moves
 * `anchor` along to where the spring holds `limit`. True when it slipped.
 */
export function rub(
  x: Float64Array,
  f: Float64Array,
  v: number,
  corners: Triangle,
  w: Readonly<Weights>,
  anchor: Weights,
  stiffness: number,
  limit: number,
): boolean {
  // The foot's offset from the anchor, in space: in the triangle's plane.
  const d = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const share = (w[c] ?? 0) - (anchor[c] ?? 0);
    const at = 3 * (corners[c] ?? 0);
    for (let axis = 0; axis < 3; axis++) {
      d[axis] = (d[axis] ?? 0) + share * (x[at + axis] ?? 0);
    }
  }
  const off = Math.hypot(d[0] ?? 0, d[1] ?? 0, d[2] ?? 0);
  let pull = stiffness;
  const slipped = pull * off > limit;
  if (slipped) {
    const keep = limit / (pull * off);
    for (let c = 0; c < 3; c++) {
      const foot = w[c] ?? 0;
      anchor[c] = foot - keep * (foot - (anchor[c] ?? 0));
    }
    pull *= keep;
  }
  const w0 = Math.max(0, w[0]);
  const w1 = Math.max(0, w[1]);
  const w2 = Math.max(0, w[2]);
  const total = w0 + w1 + w2;
  for (let axis = 0; axis < 3; axis++) {
    const along = -pull * (d[axis] ?? 0);
    f[3 * v + axis] = (f[3 * v + axis] ?? 0) + along;
    f[3 * corners[0] + axis] =
      (f[3 * corners[0] + axis] ?? 0) - (along * w0) / total;
    f[3 * corners[1] + axis] =
      (f[3 * corners[1] + axis] ?? 0) - (along * w1) / total;
    f[3 * corners[2] + axis] =
      (f[3 * corners[2] + axis] ?? 0) - (along * w2) / total;
  }
  return slipped;
}
