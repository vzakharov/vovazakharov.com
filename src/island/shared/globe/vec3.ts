export type Vec3 = readonly [number, number, number];

export const sum = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

export const scaled = (v: Vec3, k: number): Vec3 => [
  v[0] * k,
  v[1] * k,
  v[2] * k,
];

export const dot = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const length = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);

export const unit = (v: Vec3): Vec3 => scaled(v, 1 / length(v));

/** Radians between two directions of any length but zero. */
export const arc = (a: Vec3, b: Vec3) =>
  Math.atan2(length(cross(a, b)), dot(a, b));

/** The rotation by `angle` about `axis` (any length but zero), as rows. */
export function turnAbout(
  axis: Vec3,
  angle: number,
): readonly [Vec3, Vec3, Vec3] {
  const size = length(axis);
  const [x, y, z] = [axis[0] / size, axis[1] / size, axis[2] / size];
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}
