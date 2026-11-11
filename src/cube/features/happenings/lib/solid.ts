import type { Surface } from '@/cube/shared/lib/surface';
import { box, type Quad, type Room, type Vec3 } from '@/cube/entities/world';

export const UP: Vec3 = [0, 1, 0];

export const added = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax + bx,
  ay + by,
  az + bz,
];

export const less = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax - bx,
  ay - by,
  az - bz,
];

export const scaled = ([x, y, z]: Vec3, by: number): Vec3 => [
  x * by,
  y * by,
  z * by,
];

const dot = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): number =>
  ax * bx + ay * by + az * bz;

export const crossed = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

const lengthOf = ([x, y, z]: Vec3): number => Math.hypot(x, y, z);

export const unitOf = (v: Vec3): Vec3 => scaled(v, 1 / lengthOf(v));

export const distance = (a: Vec3, b: Vec3): number => lengthOf(less(b, a));

/** The point `share` of the way from `a` to `b`. */
export const between = (a: Vec3, b: Vec3, share: number): Vec3 =>
  added(a, scaled(less(b, a), share));

/** `from` turned by `angle` towards `towards`: both of length 1, square to each other. */
export const tilted = (from: Vec3, towards: Vec3, angle: number): Vec3 =>
  added(scaled(from, Math.cos(angle)), scaled(towards, Math.sin(angle)));

/** A rotation about the origin. */
export type Turn = (v: Vec3) => Vec3;

/** The right-handed rotation by `angle` about `axis`, of length 1. */
export function about(axis: Vec3, angle: number): Turn {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return (v) =>
    added(
      added(scaled(v, cos), scaled(crossed(axis, v), sin)),
      scaled(axis, dot(axis, v) * (1 - cos)),
    );
}

/** `turns` one after another, the first applied first. */
export const turned =
  (...turns: readonly Turn[]): Turn =>
  (v) => {
    let out = v;
    for (const turn of turns) out = turn(out);
    return out;
  };

/**
 * The turn standing a thing built looking east — its own x forward, z to its
 * right — to look along `yaw`: 0 east, π/2 south, as a pose's yaw counts.
 */
export const heading = (yaw: number): Turn => about(UP, -yaw);

/** The unitOf direction `yaw` looks along. */
export const forward = (yaw: number): Vec3 => [Math.cos(yaw), 0, Math.sin(yaw)];

/** The yaw looking from `from` towards `to`, both on one level. */
export const yawTo = (from: Vec3, to: Vec3): number =>
  Math.atan2(to[2] - from[2], to[0] - from[0]);

/** What a box is made of. */
export type Made = { stuff: Surface; tint?: number };

/** The box `size` about `centre`, turned by `turn` about its centre. */
export function block(
  room: Room,
  centre: Vec3,
  [wide, tall, deep]: Vec3,
  turn: Turn,
  { stuff, tint }: Made,
): Quad[] {
  const p = turn([wide, 0, 0]);
  const q = turn([0, tall, 0]);
  const r = turn([0, 0, deep]);
  const corner = less(centre, scaled(added(added(p, q), r), 0.5));
  return box(corner, [p, q, r], room, stuff, tint);
}

const AXES: readonly Vec3[] = [UP, [1, 0, 0], [0, 0, 1]];

/** `v` with its part along `axis`, of length 1 taken out. */
const across = (v: Vec3, axis: Vec3): Vec3 =>
  less(v, scaled(axis, dot(v, axis)));

/**
 * A bar from `from` to `to`, `wide` towards `side` — as near to it as a
 * direction square to the bar gets — and `deep` the other way.
 */
export function bar(
  room: Room,
  [from, to]: readonly [Vec3, Vec3],
  [wide, deep]: readonly [number, number],
  side: Vec3,
  { stuff, tint }: Made,
): Quad[] {
  const run = less(to, from);
  const axis = unitOf(run);
  const flat = [side, ...AXES]
    .map((hint) => across(hint, axis))
    .find((hint) => lengthOf(hint) > 1e-3);
  if (flat === undefined) return [];
  const p = unitOf(flat);
  const r = crossed(p, axis);
  const corner = less(from, added(scaled(p, wide / 2), scaled(r, deep / 2)));
  return box(
    corner,
    [scaled(p, wide), run, scaled(r, deep)],
    room,
    stuff,
    tint,
  );
}
