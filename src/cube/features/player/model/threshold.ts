import { clamp01 } from '@/cube/shared/lib/ease';
import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { DOORWAY, toCube, toWorld } from '@/cube/shared/outside';
import type { Pose } from '@/cube/entities/world';

import { BODY_RADIUS } from './body';
import type { Stage } from './scenes';
import { EYE_HEIGHT, type Input, strideOf } from './step';
import type { Shot } from './track';

const TAU = 2 * Math.PI;

/** The largest a spot in a room gets: `u` and `v` stop short of 1. */
const SHORT_OF_ONE = 1 - 1e-9;

/**
 * The eye of a body in floor 1's room as a scene's camera, in the world's
 * metres, exposed as `stage` has the room.
 */
export const shotWithin = (
  { u, v, eyeAbove, yaw, elevation }: Pose,
  { indoors }: Stage,
): Shot => {
  const [x, y, z] = toWorld([u, eyeAbove, v]);
  return { x, y, z, yaw, elevation, roll: 0, lids: 1, exposure: indoors };
};

/**
 * Where a scene that ends inside the doorway leaves the body: standing in
 * floor 1's room under the camera, a whole body with the camera's gaze.
 */
export const poseWithin = ({ x, y, z, yaw, elevation }: Shot): Pose => {
  const [u, , v] = toCube([x, y, z]);
  return {
    n: 1,
    x: 0n,
    y: 0n,
    u: Math.min(SHORT_OF_ONE, clamp01(u)),
    v: Math.min(SHORT_OF_ONE, clamp01(v)),
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: ((yaw % TAU) + TAU) % TAU,
    elevation,
  };
};

/** How near the east wall counts as pressed to it, in room sides. */
const PRESSED = 1e-3;

/**
 * Whether a body at `pose` walks out of the doorway under `input`: on floor
 * 1 at whatever size, pressed to the east wall with its whole width inside
 * the opening, and still walking east.
 */
export function stepsOut(pose: Pose, input: Input): boolean {
  const { n, u, v, yaw, scale } = pose;
  const radius = BODY_RADIUS * scale;
  const [east] = strideOf(input, yaw, 1);
  return (
    n === 1 &&
    east > 0 &&
    u >= 1 - radius - PRESSED &&
    (v - radius) * ROOM_METRES >= DOORWAY.from &&
    (v + radius) * ROOM_METRES <= DOORWAY.to
  );
}
