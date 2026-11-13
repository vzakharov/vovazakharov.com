/** A point or direction in space: x east, y up, z south. */
export type Vec3 = readonly [number, number, number];

/** Something seen from a point: `eye`, in the frame the thing names. */
export type WithEye = { eye: Vec3 };

/** Where a scene is seen from, in the frame its `eye` is in. */
export type Seen = WithEye & {
  /** That frame to clip space, column-major. */
  viewProjection: Float32Array;
};

/** A point on the ground plan: x east, z south. */
export type Vec2 = readonly [number, number];

export const dot3 = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** `from`, moved `metres` along `dir`. */
export const moved = (from: Vec3, dir: Vec3, metres = 1): Vec3 => [
  from[0] + dir[0] * metres,
  from[1] + dir[1] * metres,
  from[2] + dir[2] * metres,
];

/** `v`, `by` times as long. */
export const scaled = (v: Vec3, by: number): Vec3 => [
  v[0] * by,
  v[1] * by,
  v[2] * by,
];

/**
 * `v` at length 1. Divides rather than scaling by the reciprocal, which
 * costs an axis vector its exact 1 and so an axis-aligned face its exact
 * normal.
 */
export const unit3 = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};
