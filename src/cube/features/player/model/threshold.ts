import { clamp01 } from '@/cube/shared/lib/ease';
import { toCube, toWorld } from '@/cube/shared/outside';
import type { Pose } from '@/cube/entities/world';

import { byDoorway } from './abroad';
import type { Stage } from './scenes';
import { EYE_HEIGHT } from './step';
import type { Shot } from './track';

const TAU = 2 * Math.PI;

/** The largest a spot in a room gets: `u` and `v` stop short of 1. */
const SHORT_OF_ONE = 1 - 1e-9;

/**
 * A whole body's eye in floor 1's room as a scene's camera, in the world's
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

/**
 * Whether a body at `pose` can take the ladder down: whole, on floor 1, by
 * the doorway and looking out of it.
 */
export const canLeave = (pose: Pose, stage: Stage): boolean =>
  pose.n === 1 && pose.scale >= 1 && byDoorway(shotWithin(pose, stage), stage);
