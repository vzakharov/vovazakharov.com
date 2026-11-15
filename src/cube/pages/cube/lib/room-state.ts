import type { Sides } from '@/cube/shared/lib/sides';
import type { RoomState } from '@/cube/entities/theme';
import { isRoom, type Room, stepped, STEPS } from '@/cube/entities/world';

type Side = 0 | 1 | 2 | 3;

/** The side a quarter-turn clockwise of each, and the one a quarter-turn back. */
const NEXT = [1, 2, 3, 0] as const;
const BEFORE = [3, 0, 1, 2] as const;

const sides = (holds: (side: Side) => boolean): Sides => [
  holds(0),
  holds(1),
  holds(2),
  holds(3),
];

/**
 * What `room` tells its faces about itself and the eight rooms around it,
 * `closedOf` naming a room's closed sides and `lit` whether its lamps work.
 * Light crosses a corner by way of either room beside it, through two open
 * sides; a room past a closed side is never asked about, so the floor's edge
 * needs no care but for the walls that end on a corner.
 */
export function roomStateOf(
  room: Room,
  closedOf: (room: Room) => Sides,
  lit: (room: Room) => boolean,
): RoomState {
  const closed = closedOf(room);
  const through = (side: Side): Room => stepped(room, STEPS[side]);
  const way = (first: Side, then: Side): boolean =>
    !closed[first] && !closedOf(through(first))[then];
  const wayFirst = sides((corner) => way(corner, NEXT[corner]));
  const waySecond = sides((corner) => way(NEXT[corner], corner));
  const wallIn = (beside: Side, side: Side): boolean => {
    const next = through(beside);
    return isRoom(next.n, next.x, next.y) && closedOf(next)[side];
  };
  return {
    closed,
    lampsOn: lit(room),
    litBeside: sides((side) => !closed[side] && lit(through(side))),
    litAcross: sides(
      (corner) =>
        (wayFirst[corner] || waySecond[corner]) &&
        lit(stepped(through(corner), STEPS[NEXT[corner]])),
    ),
    waysAcross: [wayFirst, waySecond],
    wallsBeside: [
      sides((side) => wallIn(NEXT[side], side)),
      sides((side) => wallIn(BEFORE[side], side)),
    ],
  };
}
