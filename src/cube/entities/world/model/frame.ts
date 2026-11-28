import { ROOM_HEIGHT } from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/shared/lib/vec';

import type { Pose } from './pose';
import type { Room } from './room';

/** A room's side in the eye's frame, in the eye room's sides. */
type Sided = { roomSide: number };

/** A room's footprint in the eye's frame: its north-west corner and side. */
export type Footprint = Sided & { east: number; south: number };

/**
 * The eye's frame: floor `n`'s room sides, origin at the north-west corner of
 * the eye's room on its slab, x east, y up, z south. A room's place is taken
 * as a BigInt difference before it becomes a double, so every coordinate is a
 * few rooms wide on floor 66 as on floor 1.
 */
export function footprint(eye: Room, room: Room): Footprint {
  const depth = room.n - eye.n;
  if (depth >= 0) {
    const k = 1n << BigInt(depth);
    const roomSide = 1 / Number(k);
    return {
      east: Number(room.x - eye.x * k) * roomSide,
      south: Number(room.y - eye.y * k) * roomSide,
      roomSide,
    };
  }
  const k = 1n << BigInt(-depth);
  return {
    east: Number(room.x * k - eye.x),
    south: Number(room.y * k - eye.y),
    roomSide: Number(k),
  };
}

/** Floor `m`'s slab height in the frame of an eye on floor `n`. */
export const slabHeight = (n: number, m: number): number =>
  ROOM_HEIGHT * (2 ** (n - m) - 1);

/** How far floor `n + 1`'s slab lies under floor `n`'s, in floor `n`'s units. */
export const DROP = -slabHeight(1, 2);

/**
 * `pose` in the units of the floor below: the room of floor `n + 1` under its
 * eye, with every length doubled. The eye's place, gaze and size in the cube
 * are unchanged, so a frame drawn from either is the same frame.
 */
export function descend(pose: Pose): Pose {
  const qx = pose.u < 0.5 ? 0 : 1;
  const qy = pose.v < 0.5 ? 0 : 1;
  return {
    ...pose,
    n: pose.n + 1,
    x: 2n * pose.x + BigInt(qx),
    y: 2n * pose.y + BigInt(qy),
    u: 2 * pose.u - qx,
    v: 2 * pose.v - qy,
    eyeAbove: 2 * (pose.eyeAbove + DROP),
    scale: 2 * pose.scale,
  };
}

/**
 * The eye of `pose` in the frame of `frame` (see `footprint`), on any floor,
 * and `side`, the length of one of `pose`'s room sides there.
 */
export function eyeInFrame(
  frame: Room,
  pose: Pose,
): { eye: Vec3; side: number } {
  const { east, south, roomSide: side } = footprint(frame, pose);
  return {
    eye: [
      east + pose.u * side,
      slabHeight(frame.n, pose.n) + pose.eyeAbove * side,
      south + pose.v * side,
    ],
    side,
  };
}

/** Where `room` sits in the eye's frame: its north-west slab corner and side. */
export type Placed = Sided & { origin: Vec3 };

export function placed(eye: Room, room: Room): Placed {
  const { east, south, roomSide } = footprint(eye, room);
  return { origin: [east, slabHeight(eye.n, room.n), south], roomSide };
}
