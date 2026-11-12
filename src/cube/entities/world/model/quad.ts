import type { Surface } from '@/cube/shared/lib/surface';
import type { Vec3 } from '@/cube/shared/lib/vec';

import type { InRoomOf, Room } from './room';

type Four<T> = readonly [T, T, T, T];

/**
 * One flat face, its corners counter-clockwise seen from the side `normal`
 * points to, and the room it faces into, whose light falls on it. A face that
 * is a patch of a curved surface carries that surface's normal at each corner
 * in `normals`, and is lit as the curve.
 */
export type Facet = InRoomOf & {
  corners: Four<Vec3>;
  normal: Vec3;
  normals?: Four<Vec3>;
};

/** What a face is made of: `surface`, tinted `paint` (`0xRRGGBB`) where that takes a tint. */
export type Stuff = { surface: Surface; paint?: number };

/** A facet and what it is made of. */
export type Quad = Facet & Stuff;

export const UP: Vec3 = [0, 1, 0];

export const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

export const dot = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): number =>
  ax * bx + ay * by + az * bz;

export const unit = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};

export const plus = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax + bx,
  ay + by,
  az + bz,
];

export const minus = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax - bx,
  ay - by,
  az - bz,
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
