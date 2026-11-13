import {
  DROP,
  HOLE_SIDE,
  holeMiddle,
  type InRoom,
  type Quarter,
} from '@/cube/entities/world';

import { BODY_RADIUS } from './body';
import { rise } from './ease';
import { SMALL } from './shrink';

/** The speed a hop leaves the slab at, upward, in room sides a second. */
const HOP_UP = 0.16;

/** Gravity on a shrunk body, in its floor's room sides per s²: 8 m/s² to it. */
const GRAVITY_SIDES = 0.8;

/** Seconds a hop spends over the slab, in which the body gets over the hole. */
export const HOP_TIME = (2 * HOP_UP) / GRAVITY_SIDES;

/** The speed the feet reach the slab below at, in room sides a second. */
export const LAND_SPEED = Math.hypot(
  HOP_UP,
  Math.sqrt(2 * GRAVITY_SIDES * DROP),
);

/** Seconds from the hop to the slab below. */
export const LAND_AT = (HOP_UP + LAND_SPEED) / GRAVITY_SIDES;

/** The feet's height over the slab `t` seconds into a hop: up, then down the shaft. */
export const feetAt = (t: number): number =>
  Math.max(-DROP, HOP_UP * t - (GRAVITY_SIDES / 2) * t * t);

const HALF_HOLE = HOLE_SIDE / 2;
const SMALL_RADIUS = BODY_RADIUS * SMALL;

/** How far a shrunk body's middle may be from the shaft's, along each axis. */
export const SHAFT_STRAY = HALF_HOLE - SMALL_RADIUS;

/**
 * How near the hole's middle, along each axis, a shrunk body hops in: with
 * half its width over the rim.
 */
const HOP_STRAY = HALF_HOLE + SMALL_RADIUS / 2;

/** Whether a shrunk body at `at` has walked onto the hole in `quarter`. */
export function onHole(at: InRoom, quarter: Quarter): boolean {
  const middle = holeMiddle(quarter);
  return (
    Math.abs(at.u - middle.u) < HOP_STRAY &&
    Math.abs(at.v - middle.v) < HOP_STRAY
  );
}

const confine = (value: number, middle: number): number =>
  Math.min(middle + SHAFT_STRAY, Math.max(middle - SHAFT_STRAY, value));

/** The spot in the shaft of `quarter` nearest `at`, where a hop from it lands. */
export function intoShaft(at: InRoom, quarter: Quarter): InRoom {
  const middle = holeMiddle(quarter);
  return { u: confine(at.u, middle.u), v: confine(at.v, middle.v) };
}

/** Where a hop from `from` into the shaft at `to` is, `t` seconds in. */
export function hopAt(from: InRoom, to: InRoom, t: number): InRoom {
  const k = rise(t, 0, HOP_TIME);
  return {
    u: from.u + (to.u - from.u) * k,
    v: from.v + (to.v - from.v) * k,
  };
}

/** Seconds the knees take to give and straighten after a landing. */
export const LANDING_TIME = 0.5;

/** How much of its eye height a landing takes off at its deepest. */
const DIP = 0.3;

/**
 * The share of its height the eye is down by `t` seconds after a landing:
 * down fast, up slowly, 0 at both ends.
 */
export const dipAt = (t: number): number =>
  DIP * Math.sin(Math.PI * Math.min(1, Math.max(0, t / LANDING_TIME)) ** 0.6);
