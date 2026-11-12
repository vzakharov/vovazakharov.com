import { walledRooms } from './geometry';
import { type HoleOf, under } from './hole';
import { type SignMount, wallMount } from './mount';
import { type InRoomOf, type Room, roomKey } from './room';
import { parent, type View } from './rooms';
import type { Walls } from './walls';

/**
 * Whether `room` is the one the floor above's hole drops a body into; `holeOf`
 * must know the room over it, so floor 1's rooms, under nothing, never are.
 */
export function isLanding(room: Room, holeOf: HoleOf): boolean {
  if (room.n < 2) return false;
  const over = parent(room);
  const quarter = holeOf(over);
  return quarter !== null && roomKey(under(over, quarter)) === roomKey(room);
}

/** A landing room, and where on its walls a board hangs. */
export type Landing = InRoomOf & { mount: SignMount };

/** The landing rooms among those whose walls `view` draws. */
export const landingsSeen = (
  walls: Walls,
  view: View,
  holeOf: HoleOf,
): Landing[] =>
  walledRooms(view)
    .filter((room) => isLanding(room, holeOf))
    .map((room) => ({ room, mount: wallMount(walls, room) }));
