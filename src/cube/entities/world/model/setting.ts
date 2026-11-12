import type { Sides, Walled } from '@/cube/shared/lib/sides';
import type { Vec3 } from '@/cube/shared/lib/vec';

import type { Placed } from './frame';
import type { Quarter } from './hole';
import type { Quad } from './quad';
import type { InRoomOf, Room } from './room';
import { opens, STEPS } from './rooms';
import type { RolledTraits } from './traits';
import type { Walls } from './walls';

/**
 * What a room offers whatever is set in it: its closed sides, which a thing
 * may stand against, and its open ones, which stay clear to walk through;
 * the hole in its floor, which stays clear too; and its own word.
 *
 * Things are set in the room's own frame — its side 1, x east, y up, z south
 * from the north-west corner of its floor, the ceiling at `CEILING_HEIGHT` — and
 * `inPlace` stands them in the eye's.
 */
export type Setting = InRoomOf &
  Walled & {
    /** The quarter of the floor the room's hole is in, null where it has none. */
    hole: Quarter | null;
    /** The word to roll what stands in the room from. */
    grain: number;
  };

/** Which of `room`'s sides are closed walls. */
export function closedSides(walls: Walls, room: Room): Sides {
  const [east, south, west, north] = STEPS;
  return [
    !opens(walls, room, east),
    !opens(walls, room, south),
    !opens(walls, room, west),
    !opens(walls, room, north),
  ];
}

export const settingOf = (
  walls: Walls,
  rolled: RolledTraits,
  room: Room,
  hole: Quarter | null,
): Setting => {
  const { grain } = rolled.room.at(room);
  return { room, closed: closedSides(walls, room), hole, grain };
};

/** `quads`, set in a room's own frame, standing where the eye's frame has it. */
export function inPlace(
  quads: readonly Quad[],
  { origin: [east, floor, south], roomSide }: Placed,
): Quad[] {
  const stood = ([x, y, z]: Vec3): Vec3 => [
    east + x * roomSide,
    floor + y * roomSide,
    south + z * roomSide,
  ];
  return quads.map((quad) => {
    const [a, b, c, d] = quad.corners;
    return { ...quad, corners: [stood(a), stood(b), stood(c), stood(d)] };
  });
}
