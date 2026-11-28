import type { Scaling } from '@/scene/shared/lib/plane';

import type { Room } from './room';

/** A point in some room's frame, in room sides: `u` east, `v` south. */
export type InRoom = { u: number; v: number };

/** A thing mounted in a room: its foot, in the room's frame, and the way it faces. */
export type WallMounted = {
  at: InRoom;
  /** The unit direction it faces, into the room. */
  facing: InRoom;
};

/** Where an eye looks. */
export type Gazing = {
  /** Radians; 0 looks east (+u), π/2 looks south (+v). */
  yaw: number;
  /** Radians above the horizon, clamped to ±89°. */
  elevation: number;
};

/** An eye's room, its spot in the room and its gaze, whatever its height. */
export type Standing = Room & InRoom & Gazing;

/**
 * Where an eye is in the cube, in the units of the floor it stands on, `u` and
 * `v` each in `[0, 1)`. Every renderer and collision reads positions this way,
 * so no float ever carries a floor-67 coordinate. Its `scale` is the body's
 * size in those units: 1 a person of this floor, ½ after a fall through its
 * hole, a person of the next.
 */
export type Pose = Standing &
  Scaling & {
    /** Eye height over the slab, in room sides; under 0 while falling. */
    eyeAbove: number;
  };

/** Something carrying an eye's pose. */
export type Posed = { pose: Pose };
