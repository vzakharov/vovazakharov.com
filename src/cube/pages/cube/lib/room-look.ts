import type { Sides } from '@/cube/shared/lib/sides';
import { roomFlags, themeOf } from '@/cube/entities/theme';
import {
  closedSides,
  placed,
  type RolledTraits,
  type Room,
  roomKey,
  type Walls,
} from '@/cube/entities/world';

import type { RoomLook } from './mesh';
import { roomStateOf } from './room-state';

/** How many low bits of a room's place a vertex carries on each axis. */
const CELL_BITS = 6n;
const CELL_MASK = (1n << CELL_BITS) - 1n;

/**
 * The place of a room on its floor as a vertex holds it: the low bits of its
 * column, then of its row a byte up. A pattern drawn across rooms repeats
 * every 64 of them, farther than an eye sees.
 */
export const cellOf = ({ x, y }: Room): number =>
  Number(x & CELL_MASK) | (Number(y & CELL_MASK) << 8);

/**
 * Each room's look for an eye in room `eye`, resolved once per room: where it
 * stands, its own word, and its flags — what `roomStateOf` says of it, its
 * lamps working unless they are among its floor's failed ones.
 */
export function roomLooks(
  eye: Room,
  walls: Walls,
  rolled: RolledTraits,
): (room: Room) => RoomLook {
  const known = new Map<string, RoomLook>();
  const lit = (room: Room): boolean =>
    rolled.room.at(room).lamp >= themeOf(room.n).dark;
  const closures = new Map<string, Sides>();
  const closedOf = (room: Room): Sides => {
    const key = roomKey(room);
    const found = closures.get(key) ?? closedSides(walls, room);
    closures.set(key, found);
    return found;
  };
  const look = (room: Room): RoomLook => ({
    ...placed(eye, room),
    seed: rolled.room.at(room).grain,
    flags: roomFlags(roomStateOf(room, closedOf, lit)),
    cell: cellOf(room),
  });
  return (room) => {
    const key = roomKey(room);
    const found = known.get(key) ?? look(room);
    known.set(key, found);
    return found;
  };
}
