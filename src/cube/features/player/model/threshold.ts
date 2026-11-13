import { clamp01 } from '@/cube/shared/lib/ease';
import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import {
  ROOM_DOORWAY,
  type Standing,
  toCube,
  toWorld,
  type WallSide,
  yawToRoom,
  yawToShell,
} from '@/cube/shared/outside';
import type { InRoom, Pose, Whereabouts } from '@/cube/entities/world';

import { HEAD_OVER_EYE, outsideOf, type Stage } from './scenes';
import { EYE_HEIGHT } from './step';
import type { Shot } from './track';

const TAU = 2 * Math.PI;

/** The largest a spot in a room gets: `u` and `v` stop short of 1. */
const SHORT_OF_ONE = 1 - 1e-9;

/**
 * Past each wall of floor 1's room: the room a body walking out through it
 * would be in, were there one, and the spot on the sill it is set back to.
 */
const PAST: Record<WallSide, { x: bigint; y: bigint; sill: Partial<InRoom> }> =
  {
    east: { x: 1n, y: 0n, sill: { u: SHORT_OF_ONE } },
    west: { x: -1n, y: 0n, sill: { u: 0 } },
    south: { x: 0n, y: 1n, sill: { v: SHORT_OF_ONE } },
    north: { x: 0n, y: -1n, sill: { v: 0 } },
  };

const PAST_DOORWAY = PAST[ROOM_DOORWAY.wall];

/**
 * The eye of a body in floor 1's room as a scene's camera, in the world's
 * metres.
 */
export const shotWithin = ({ u, v, eyeAbove, yaw, elevation }: Pose): Shot => {
  const [x, y, z] = toWorld([u, eyeAbove, v]);
  return {
    x,
    y,
    z,
    yaw: yawToShell(yaw),
    elevation,
    roll: 0,
    lids: 1,
    exposure: 1,
  };
};

/**
 * Where a scene that ends inside the doorway leaves the body: standing in
 * floor 1's room under the camera, a whole body with the camera's gaze.
 */
export const poseWithin = ({ x, y, z, yaw: gaze, elevation }: Shot): Pose => {
  const [u, , v] = toCube([x, y, z]);
  const yaw = yawToRoom(gaze);
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
 * Where a scene's camera is as the eye's light goes by: in floor 1's room
 * once it is within the cube, out of doors until then.
 */
export function whereOf(shot: Shot, { cube }: Stage): Whereabouts {
  const { x, y, z } = shot;
  const within = [x, y, z].every(
    (at, axis) =>
      at > (cube.min[axis] ?? Infinity) && at < (cube.max[axis] ?? -Infinity),
  );
  return within ? poseWithin(shot) : outsideOf(shot);
}

/** A body in floor 1's room as what the sun through the doorway meets. */
export const standingWithin = ({ u, v, eyeAbove, scale }: Pose): Standing => ({
  foot: toWorld([u, 0, v]),
  headAbove: eyeAbove * ROOM_METRES + HEAD_OVER_EYE * scale,
});

/**
 * Whether a body at `pose` has walked out through the doorway: its middle is
 * past the wall of floor 1 the doorway opens in, where no room is.
 */
export const isPastSill = ({ n, x, y }: Pose): boolean =>
  n === 1 && x === PAST_DOORWAY.x && y === PAST_DOORWAY.y;

/** `pose`, past the sill, set back on the sill's edge. */
export const onSill = <P extends Pose>(pose: P): P => ({
  ...pose,
  x: 0n,
  y: 0n,
  ...PAST_DOORWAY.sill,
});
