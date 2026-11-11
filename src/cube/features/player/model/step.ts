import type { Pose } from '@/cube/entities/world';

import { walk } from './body';
import type { Walls } from './walls';

/** Walking speed in room sides a second: 1.4 m/s on floor 1. */
export const WALK_SPEED = 0.28;

/** Eye height over the slab, in room sides: 1.6 m on floor 1. */
export const EYE_HEIGHT = 0.32;

export const MAX_PITCH = (89 * Math.PI) / 180;

/**
 * One frame's controls. `walk` (forward) and `strafe` (rightward) are in
 * `[-1, 1]` — keys give -1, 0 or 1, and a diagonal is normalized to walking
 * speed; `yawBy` and `pitchBy` are radians to add to the pose's this frame.
 */
export type Input = {
  walk: number;
  strafe: number;
  yawBy: number;
  pitchBy: number;
};

const TAU = 2 * Math.PI;

const wrap = (angle: number): number => ((angle % TAU) + TAU) % TAU;

const clamp = (value: number, bound: number): number =>
  Math.min(bound, Math.max(-bound, value));

/** `pose` after `dt` seconds of `input` among `walls`. */
export function step(pose: Pose, input: Input, dt: number, walls: Walls): Pose {
  if (!(dt >= 0) || !Number.isFinite(dt)) {
    throw new RangeError(`Not a frame time: ${dt}`);
  }
  const yaw = wrap(pose.yaw + input.yawBy);
  const pitch = clamp(pose.pitch + input.pitchBy, MAX_PITCH);
  const length = Math.hypot(input.walk, input.strafe);
  const scale = (WALK_SPEED * dt) / Math.max(1, length);
  const forward = input.walk * scale;
  const right = input.strafe * scale;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  return walk(
    { ...pose, yaw, pitch, h: EYE_HEIGHT },
    forward * cos - right * sin,
    forward * sin + right * cos,
    walls,
  );
}
