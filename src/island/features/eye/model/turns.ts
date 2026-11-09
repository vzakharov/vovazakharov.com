/**
 * Rotations of unit vectors about the planet's centre, which is all the eye
 * on the sphere needs: moving a point along a great circle carries a tangent
 * with it, and turning a tangent about its point is a heading change.
 */

import {
  cross,
  dot,
  length,
  northAt,
  scaled,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

/** A rotation by `radians`, right-handed about unit `axis`. */
export type Turn = { readonly axis: Vec3; readonly radians: number };

/** `v` rotated by `turn` (Rodrigues). */
export function rotated(v: Vec3, { axis, radians }: Turn): Vec3 {
  const cos = Math.cos(radians);
  return sum(
    sum(scaled(v, cos), scaled(cross(axis, v), Math.sin(radians))),
    scaled(axis, dot(axis, v) * (1 - cos)),
  );
}

/**
 * The least rotation taking unit `from` to unit `to`. Where the two are
 * opposite, every great circle joins them, and it turns about `fallback`, a
 * unit vector square to `from`.
 */
export function turnBetween(from: Vec3, to: Vec3, fallback: Vec3): Turn {
  const axis = cross(from, to);
  const sin = length(axis);
  const radians = Math.atan2(sin, dot(from, to));
  return sin < 1e-15
    ? { axis: fallback, radians }
    : { axis: scaled(axis, 1 / sin), radians };
}

/** `turn` taken `share` of the way. */
export const partOf = ({ axis, radians }: Turn, share: number): Turn => ({
  axis,
  radians: radians * share,
});

/** The angle turning `from` onto `to` about `about`, in `[−π, π]`. */
export const signedAngle = (from: Vec3, to: Vec3, about: Vec3) =>
  Math.atan2(dot(cross(from, to), about), dot(from, to));

/** `v` with its part along unit `at` removed, unit length: a tangent at `at`. */
export const tangent = (v: Vec3, at: Vec3) =>
  unit(sum(v, scaled(at, -dot(v, at))));

/**
 * The unit tangent at unit `at` that faces `heading`, radians clockwise from
 * geographic north seen from above.
 */
export const aheadAt = (at: Vec3, heading: number) =>
  rotated(northAt(at), { axis: at, radians: -heading });

/** The heading tangent `ahead` faces at unit `at`: `aheadAt`'s inverse. */
export const headingAt = (at: Vec3, ahead: Vec3) =>
  signedAngle(northAt(at), ahead, scaled(at, -1));
