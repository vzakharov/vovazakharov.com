import type { Pose, Walls } from '@/cube/entities/world';

import { walk } from './body';

/** Walking speed in room sides a second: 1.4 m/s on floor 1. */
export const WALK_SPEED = 0.28;

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
 * 1, a walking diagonal is normalized to walking speed, and the turn and tilt
 * go at their rates over the frame; `yawBy` and `elevationBy` are radians to
 * add to the pose's this frame, whatever its length; `pull` is whether the
 * lever was asked for since the last frame.
 */
export type Input = {
  walk: number;
  strafe: number;
  turnKeys: number;
  tiltKeys: number;
  yawBy: number;
  elevationBy: number;
  pull: boolean;
};

const TAU = 2 * Math.PI;

const wrap = (angle: number): number => ((angle % TAU) + TAU) % TAU;

const clamp = (value: number, bound: number): number =>
  Math.min(bound, Math.max(-bound, value));

/**
 * `pose` after `dt` seconds of `input` among `walls`, standing on its slab:
 * walking, colliding and eye height go by its scale, turning does not.
 */
export function step(pose: Pose, input: Input, dt: number, walls: Walls): Pose {
  if (!(dt >= 0) || !Number.isFinite(dt)) {
    throw new RangeError(`Not a frame time: ${dt}`);
  }
  const yaw = wrap(pose.yaw + input.yawBy + input.turnKeys * TURN_RATE * dt);
  const elevation = clamp(
    pose.elevation + input.elevationBy + input.tiltKeys * TILT_RATE * dt,
    MAX_PITCH,
  );
  const length = Math.hypot(input.walk, input.strafe);
  const stride = (WALK_SPEED * pose.scale * dt) / Math.max(1, length);
  const forward = input.walk * stride;
  const right = input.strafe * stride;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return walk(
    { ...pose, yaw, elevation, eyeAbove: EYE_HEIGHT * pose.scale },
    forward * cos - right * sin,
    forward * sin + right * cos,
    walls,
  );
}
