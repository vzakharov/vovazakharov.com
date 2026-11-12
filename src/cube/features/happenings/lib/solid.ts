import type { Surface } from '@/cube/shared/lib/surface';
import {
  box,
  cross,
  dot,
  minus,
  plus,
  type Quad,
  type Room,
  times,
  unit,
  UP,
  type Vec3,
} from '@/cube/entities/world';

const lengthOf = ([x, y, z]: Vec3): number => Math.hypot(x, y, z);

export const distance = (a: Vec3, b: Vec3): number => lengthOf(minus(b, a));

/** The point `share` of the way from `a` to `b`. */
export const between = (a: Vec3, b: Vec3, share: number): Vec3 =>
  plus(a, times(minus(b, a), share));

/** `from` turned by `angle` towards `towards`: both of length 1, square to each other. */
export const tilted = (from: Vec3, towards: Vec3, angle: number): Vec3 =>
  plus(times(from, Math.cos(angle)), times(towards, Math.sin(angle)));

/** A rotation about the origin. */
export type Turn = (v: Vec3) => Vec3;

/** The right-handed rotation by `angle` about `axis`, of length 1. */
export function about(axis: Vec3, angle: number): Turn {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return (v) =>
    plus(
      plus(times(v, cos), times(cross(axis, v), sin)),
      times(axis, dot(axis, v) * (1 - cos)),
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

/** The direction `yaw` looks along, of length 1. */
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
  const corner = minus(centre, times(plus(plus(p, q), r), 0.5));
  return box(corner, [p, q, r], room, stuff, tint);
}

const AXES: readonly Vec3[] = [UP, [1, 0, 0], [0, 0, 1]];

/** `v` with its part along `axis` taken out; `axis` is of length 1. */
const across = (v: Vec3, axis: Vec3): Vec3 =>
  minus(v, times(axis, dot(v, axis)));

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
  const run = minus(to, from);
  const axis = unit(run);
  const flat = [side, ...AXES]
    .map((hint) => across(hint, axis))
    .find((hint) => lengthOf(hint) > 1e-3);
  if (flat === undefined) return [];
  const p = unit(flat);
  const r = cross(p, axis);
  const corner = minus(from, plus(times(p, wide / 2), times(r, deep / 2)));
  return box(corner, [times(p, wide), run, times(r, deep)], room, stuff, tint);
}
