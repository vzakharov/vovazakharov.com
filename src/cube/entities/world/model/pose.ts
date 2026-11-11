import type { FloorRoom } from './room';

/** A point in some room's frame, in room sides: `u` east, `v` south. */
export type InRoom = { u: number; v: number };

/**
 * Where an eye is in the cube, in the units of the floor it stands on: the
 * room by its BigInt index, the point inside it in room sides (`u` east and
 * `v` south, each in `[0, 1)`), and the eye's height over that floor's slab in
 * room sides. Every renderer and collision reads positions this way, so no
 * float ever carries a floor-67 coordinate.
 */
export type Pose = FloorRoom &
  InRoom & {
    /** Eye height over the slab, in room sides. */
    eyeAbove: number;
    /** Radians; 0 looks east (+u), π/2 looks south (+v). */
    yaw: number;
    /** Radians above the horizon, clamped to ±89°. */
    elevation: number;
  };
