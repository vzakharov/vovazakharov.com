import type { Room } from './room';

/** A point in some room's frame, in room sides: `u` east, `v` south. */
export type InRoom = { u: number; v: number };

/**
 * Where an eye is in the cube, in the units of the floor it stands on: the
 * room by its BigInt index, the point inside it in room sides (`u` east and
 * `v` south, each in `[0, 1)`), and the eye's height over that floor's slab in
 * room sides. Every renderer and collision reads positions this way, so no
 * float ever carries a floor-67 coordinate.
 */
export type Pose = Room &
  InRoom & {
    /** Eye height over the slab, in room sides. */
    eyeAbove: number;
    /** Radians; 0 looks east (+u), π/2 looks south (+v). */
    yaw: number;
    /** Radians above the horizon, clamped to ±89°. */
    elevation: number;
  };

/** Splits a coordinate that has left `[0, 1)` into whole rooms and the rest. */
function carry(index: bigint, within: number): [bigint, number] {
  const whole = Math.floor(within);
  return [index + BigInt(whole), within - whole];
}

/**
 * The same eye with `u` and `v` back in `[0, 1)`, its room moved by the whole
 * rooms they ran over, and clamped inside floor `n`'s grid at the cube's walls.
 */
export function rebase(pose: Pose): Pose {
  const rooms = 1n << BigInt(pose.n - 1);
  const [x, u] = carry(pose.x, pose.u);
  const [y, v] = carry(pose.y, pose.v);
  const inside = (index: bigint, within: number): [bigint, number] => {
    if (index < 0n) return [0n, 0];
    if (index >= rooms) return [rooms - 1n, 1 - Number.EPSILON];
    return [index, within];
  };
  const [cx, cu] = inside(x, u);
  const [cy, cv] = inside(y, v);
  return { ...pose, x: cx, u: cu, y: cy, v: cv };
}
