import { roomFlags, themeOf } from '@/cube/entities/theme';
import {
  opens,
  placed,
  type RolledTraits,
  type Room,
  roomKey,
  type Step,
  stepped,
  STEPS,
  type Walls,
} from '@/cube/entities/world';

import type { RoomLook } from './mesh';

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
 * stands, its own word, and its flags — which walls are closed, whether its
 * lamps are among its floor's failed ones, and how many lit rooms it opens
 * onto.
 */
export function roomLooks(
  eye: Room,
  walls: Walls,
  rolled: RolledTraits,
): (room: Room) => RoomLook {
  const known = new Map<string, RoomLook>();
  const lit = (room: Room): boolean =>
    rolled.room.at(room).lamp >= themeOf(room.n).dark;
  const look = (room: Room): RoomLook => {
    const { origin, roomSide: side } = placed(eye, room);
    const closed = (step: Step): boolean => !opens(walls, room, step);
    const [east, south, west, north] = STEPS;
    return {
      origin,
      side,
      seed: rolled.room.at(room).grain,
      flags: roomFlags({
        closed: [closed(east), closed(south), closed(west), closed(north)],
        lit: lit(room),
        litBeside: STEPS.filter(
          (step) => !closed(step) && lit(stepped(room, step)),
        ).length,
      }),
      cell: cellOf(room),
    };
  };
  return (room) => {
    const key = roomKey(room);
    const found = known.get(key) ?? look(room);
    known.set(key, found);
    return found;
  };
}
