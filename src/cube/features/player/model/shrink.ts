import {
  descend,
  DROP,
  HOLE_SIDE,
  holeMiddle,
  type Lever,
  type Pose,
  type Quarter,
  type Walls,
} from '@/cube/entities/world';

import { BODY_RADIUS } from './body';
import { EYE_HEIGHT, type Input, step } from './step';

/** Seconds the body takes to halve: its scale is `2^(−t / HALVING)`. */
export const HALVING = 3;

/** The scale at which the body is as wide as the hole, and drops through it. */
export const FALL_SCALE = HOLE_SIDE / (2 * BODY_RADIUS);

/** Seconds from the pull to the drop. */
export const FALL_AT = -HALVING * Math.log2(FALL_SCALE);

/**
 * Gravity in room sides per s², whatever lets the feet cover `DROP` from the
 * drop to the halving, so the body lands a person of the floor below: 1.6
 * m/s² on floor 1.
 */
const GRAVITY = (2 * DROP) / (HALVING - FALL_AT) ** 2;

/**
 * How far the body's middle may be from the hole's, along each axis, to pull:
 * as far as the body still covers some of the hole, 50 cm on floor 1. The hole
 * is narrower than the body, so "dead over it" would be a 40 cm square the
 * player cannot see under their own feet.
 */
const PULL_STRAY = HOLE_SIDE / 2 + BODY_RADIUS;

/**
 * How far from the body's middle the lever can be pulled, in room sides: 2.4
 * m on floor 1. A hole's middle is a quarter side from a wall lever and under
 * 0.33 from a post's, and the body may stand `PULL_STRAY` off it on each axis,
 * so a body touching the hole reaches its lever.
 */
export const LEVER_REACH = 0.48;

/** The body's scale `t` seconds after the pull. */
export const scaleAt = (t: number): number =>
  2 ** (-Math.min(t, HALVING) / HALVING);

/** The feet's height over the slab `t` seconds after the pull. */
export const feetAt = (t: number): number =>
  t <= FALL_AT ? 0 : (-GRAVITY / 2) * (Math.min(t, HALVING) - FALL_AT) ** 2;

/** A holed room's hole and lever. */
export type Holed = { quarter: Quarter; lever: Lever };

type Shrinking = Holed & {
  /** Seconds since the pull. */
  sincePull: number;
};

/** The body and what its lever set going; `shrinking` is null at rest. */
export type Player = { pose: Pose; shrinking: Shrinking | null };

const HALF_HOLE = HOLE_SIDE / 2;

/** Whether a body at `pose` stands on the hole and reaches its lever. */
export function canPull(pose: Pose, { quarter, lever }: Holed): boolean {
  const middle = holeMiddle(quarter);
  return (
    Math.abs(pose.u - middle.u) < PULL_STRAY &&
    Math.abs(pose.v - middle.v) < PULL_STRAY &&
    Math.hypot(pose.u - lever.at.u, pose.v - lever.at.v) <= LEVER_REACH
  );
}

/**
 * How far the body's middle may stray from the hole's along each axis, `t`
 * seconds after the pull. On the slab, the rim draws a body sinking into it to
 * its middle, from anywhere on the hole at the pull to dead centre at
 * `FALL_AT`, so it drops exactly when as wide as the hole; falling, the shaft
 * holds it in.
 */
function strayAt(t: number): number {
  const scale = scaleAt(t);
  if (t < FALL_AT)
    return (PULL_STRAY * (scale - FALL_SCALE)) / (1 - FALL_SCALE);
  return HALF_HOLE - BODY_RADIUS * scale;
}

const confine = (value: number, middle: number, stray: number): number =>
  Math.min(middle + stray, Math.max(middle - stray, value));

/** A shrinking body `dt` seconds on: walking scaled, confined to the hole. */
function shrink(
  { pose, shrinking }: Player & { shrinking: Shrinking },
  input: Input,
  dt: number,
  walls: Walls,
): Player {
  const t = Math.min(shrinking.sincePull + dt, HALVING);
  const scale = scaleAt(t);
  const walked = step({ ...pose, scale }, input, dt, walls);
  const middle = holeMiddle(shrinking.quarter);
  const stray = strayAt(t);
  const moved: Pose = {
    ...walked,
    u: confine(walked.u, middle.u, stray),
    v: confine(walked.v, middle.v, stray),
    eyeAbove: feetAt(t) + EYE_HEIGHT * scale,
  };
  if (t < HALVING)
    return { pose: moved, shrinking: { ...shrinking, sincePull: t } };
  return { pose: descend(moved), shrinking: null };
}

/**
 * `player` after `dt` seconds of `input` among `walls`, `here` being its
 * room's hole and lever (null where it has none, or none known yet). A pull
 * over the hole within reach shrinks the body from that frame on; it drops
 * through at `FALL_AT` and lands at `HALVING`, rebased onto the floor below.
 */
export function play(
  player: Player,
  input: Input,
  dt: number,
  walls: Walls,
  here: Holed | null,
): Player {
  const { pose, shrinking } = player;
  if (shrinking !== null) return shrink({ pose, shrinking }, input, dt, walls);
  if (input.pull && here !== null && canPull(pose, here)) {
    return shrink(
      { pose, shrinking: { ...here, sincePull: 0 } },
      input,
      dt,
      walls,
    );
  }
  return { pose: step(pose, input, dt, walls), shrinking: null };
}
