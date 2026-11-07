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
