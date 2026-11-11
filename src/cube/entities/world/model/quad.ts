import type { Surface } from '@/cube/shared/lib/surface';

import type { InRoomOf, Room } from './room';

export type Vec3 = readonly [number, number, number];

/**
 * One flat face, its corners counter-clockwise seen from the side `normal`
 * points to, and the room it faces into, whose light falls on it.
 */
export type Facet = InRoomOf & {
  corners: readonly [Vec3, Vec3, Vec3, Vec3];
  normal: Vec3;
};

/**
 * A facet made of `surface`, tinted `paint` (`0xRRGGBB`) where its surface
 * takes a tint.
 */
export type Quad = Facet & { surface: Surface; paint?: number };

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
export function facet(corner: Vec3, a: Vec3, b: Vec3, room: Room): Facet {
  return {
    corners: [
      corner,
      plus(corner, a),
      plus(plus(corner, a), b),
      plus(corner, b),
    ],
    normal: unit(cross(a, b)),
    room,
  };
}

/** `facet`'s parallelogram as `surface`. */
export const face = (
  corner: Vec3,
  a: Vec3,
  b: Vec3,
  room: Room,
  surface: Surface,
  paint?: number,
): Quad => ({
  ...facet(corner, a, b, room),
  surface,
  ...(paint === undefined ? {} : { paint }),
});

/**
 * The six outward faces of the box from `corner` along `p`, `q` and `r`, which
 * must be right-handed (`(p × q) · r > 0`) for the faces to point out.
 */
export function box(
  corner: Vec3,
  [p, q, r]: readonly [Vec3, Vec3, Vec3],
  room: Room,
  surface: Surface,
  paint?: number,
): Quad[] {
  const side = (from: Vec3, a: Vec3, b: Vec3) =>
    face(from, a, b, room, surface, paint);
  return [
    side(corner, q, p),
    side(plus(corner, r), p, q),
    side(corner, r, q),
    side(plus(corner, p), q, r),
    side(corner, p, r),
    side(plus(corner, q), r, p),
  ];
}
