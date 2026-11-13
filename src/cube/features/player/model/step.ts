import type { Gazing, Pose, Walls } from '@/cube/entities/world';

import { walk } from './body';

/** Walking speed in room sides a second: 1.4 m/s on floor 1. */
export const WALK_SPEED = 0.28;

/** Running speed, the body's pace while it runs: 3.5 m/s on floor 1. */
export const RUN_SPEED = 0.7;

/** Eye height over the slab, in room sides: 1.6 m on floor 1. */
export const EYE_HEIGHT = 0.32;

export const MAX_PITCH = (89 * Math.PI) / 180;

/** Radians a second a held turn key turns the eye: 90°/s. */
export const TURN_RATE = Math.PI / 2;

/** Radians a second a held tilt key tilts the eye: 60°/s. */
export const TILT_RATE = Math.PI / 3;

/**
 * One frame's controls. `walk` (forward), `strafe` (rightward), `turnKeys`
 * (rightward) and `tiltKeys` (upward) are in `[-1, 1]` — keys give -1, 0 or
 * 1, a diagonal is normalized to the body's pace, and the turn and tilt go at
 * their rates over the frame; `yawBy` and `elevationBy` are radians to add to
 * the pose's this frame, whatever its length; `running` quickens the body's
 * walk to a run, indoors and out; `use` is whether what is in reach — a pill,
 * a sign — was asked for
 * since the last frame, `answer` what was said to a question since then, and
 * `goTo` the floor asked for by its number, null when none was.
 */
export type Input = {
  walk: number;
  strafe: number;
  turnKeys: number;
  tiltKeys: number;
  yawBy: number;
  elevationBy: number;
  running: boolean;
  use: boolean;
  answer: 'yes' | 'no' | null;
  goTo: number | null;
};

/** A frame of no controls at all. */
export const STILL: Input = {
  walk: 0,
  strafe: 0,
  turnKeys: 0,
  tiltKeys: 0,
  yawBy: 0,
  elevationBy: 0,
  running: false,
  use: false,
  answer: null,
  goTo: null,
};

const TAU = 2 * Math.PI;

const wrap = (angle: number): number => ((angle % TAU) + TAU) % TAU;

const clamp = (value: number, bound: number): number =>
  Math.min(bound, Math.max(-bound, value));

/** `gaze` after `dt` seconds of `input`'s turning and tilting. */
export function turned(gaze: Gazing, input: Input, dt: number): Gazing {
  if (!(dt >= 0) || !Number.isFinite(dt)) {
    throw new RangeError(`Not a frame time: ${dt}`);
  }
  return {
    yaw: wrap(gaze.yaw + input.yawBy + input.turnKeys * TURN_RATE * dt),
    elevation: clamp(
      gaze.elevation + input.elevationBy + input.tiltKeys * TILT_RATE * dt,
      MAX_PITCH,
    ),
  };
}

/**
 * How far `input` carries a body looking along `yaw` in a frame it covers
 * `reach` in at its pace: east and south, a diagonal held to that pace.
 */
export function strideOf(
  input: Input,
  yaw: number,
  reach: number,
): readonly [east: number, south: number] {
  const stride = reach / Math.max(1, Math.hypot(input.walk, input.strafe));
  const forward = input.walk * stride;
  const right = input.strafe * stride;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return [forward * cos - right * sin, forward * sin + right * cos];
}

/**
 * `pose` after `dt` seconds of `input` among `walls`, standing on its slab:
 * walking, colliding and eye height go by its scale, turning does not.
 */
export function step(pose: Pose, input: Input, dt: number, walls: Walls): Pose {
  const gaze = turned(pose, input, dt);
  const speed = input.running ? RUN_SPEED : WALK_SPEED;
  const [east, south] = strideOf(input, gaze.yaw, speed * pose.scale * dt);
  return walk(
    { ...pose, ...gaze, eyeAbove: EYE_HEIGHT * pose.scale },
    east,
    south,
    walls,
  );
}
