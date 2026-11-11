import type { Floored } from './room';

export type Vec3 = readonly [number, number, number];

const SURFACES = ['wall', 'floor', 'ceiling', 'plate', 'handle'] as const;
export type Surface = (typeof SURFACES)[number];

/**
 * One flat face, its corners counter-clockwise seen from the side `normal`
 * points to, and the room it faces into: on floor `n`, as `surface`.
 */
export type Quad = Floored & {
  corners: readonly [Vec3, Vec3, Vec3, Vec3];
  normal: Vec3;
  surface: Surface;
};

const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

const unit = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};

const plus = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax + bx,
  ay + by,
  az + bz,
];

export const times = ([x, y, z]: Vec3, by: number): Vec3 => [
  x * by,
  y * by,
  z * by,
];

/** The parallelogram from `corner` along `a`, then `b`, facing `a × b`. */
export function face(
  corner: Vec3,
  a: Vec3,
  b: Vec3,
  n: number,
  surface: Surface,
): Quad {
  return {
    corners: [
      corner,
      plus(corner, a),
      plus(plus(corner, a), b),
      plus(corner, b),
    ],
    normal: unit(cross(a, b)),
    n,
    surface,
  };
}

/**
 * The six outward faces of the box from `corner` along `p`, `q` and `r`, which
 * must be right-handed (`(p × q) · r > 0`) for the faces to point out.
 */
export function box(
  corner: Vec3,
  [p, q, r]: readonly [Vec3, Vec3, Vec3],
  n: number,
  surface: Surface,
): Quad[] {
  return [
    face(corner, q, p, n, surface),
    face(plus(corner, r), p, q, n, surface),
    face(corner, r, q, n, surface),
    face(plus(corner, p), q, r, n, surface),
    face(corner, p, r, n, surface),
    face(plus(corner, q), r, p, n, surface),
  ];
}
