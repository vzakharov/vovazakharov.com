import { DOORWAY_CUT, ROOM_DOORWAY } from '@/cube/shared/cube-boundary';
import { CEILING_HEIGHT, WALL_HALF } from '@/cube/shared/lib/room-shape';
import type { Sides as RoomSides } from '@/cube/shared/lib/sides';

import { doorFrame, type Facing } from './door';
import { eastKind, southKind } from './doorways';
import type { RolledMaze } from './maze';
import { isPortal } from './portal';
import type { Quad } from './quad';
import { isRoom, type Room } from './room';
import { type DoorWall, isSameWall, leaning, wallFrame } from './wall-frame';
import { mazeWalls, type Walls } from './walls';

export type Doors = { isDoor: (wall: DoorWall) => boolean };

export type Doored = Walls & Doors;

/** `room`'s four walls in the order of `STEPS` — east, south, west, north. */
export const wallsAround = ({
  n,
  x,
  y,
}: Room): readonly [Facing, Facing, Facing, Facing] => [
  { n, x, y, isEast: true, toward: 1 },
  { n, x, y, isEast: false, toward: 1 },
  { n, x: x - 1n, y, isEast: true, toward: -1 },
  { n, x, y: y - 1n, isEast: false, toward: -1 },
];

export function doorSides({ isDoor }: Doors, room: Room): RoomSides {
  const [east, south, west, north] = wallsAround(room);
  return [isDoor(east), isDoor(south), isDoor(west), isDoor(north)];
}

/**
 * `rolled`'s walls and doors, a portal's among them: a wall touching a room
 * outside its floor is no door.
 */
export const mazeDoored = (rolled: RolledMaze): Doored => ({
  ...mazeWalls(rolled),
  isDoor: (wall) => {
    const { n, x, y, isEast } = wall;
    return (
      isRoom(n, x, y) &&
      (isEast ? isRoom(n, x + 1n, y) : isRoom(n, x, y + 1n)) &&
      ((isEast ? eastKind : southKind)(rolled, n, x, y) === 'door' ||
        isPortal(wall))
    );
  },
});

/** The faces of a doorway's wall drawn: `near` into its west or north room, `far` into the other. */
export type Sides = { near: boolean; far: boolean };

/**
 * Floor 1's way out of the cube, as the doorway in its one room's wall: the
 * wall, and the one face of it the room has, the other being the cube's.
 */
export const EXIT: { wall: DoorWall; sides: Sides } = (() => {
  const { wall } = ROOM_DOORWAY;
  const inward = wall === 'east' || wall === 'south';
  return {
    wall: {
      n: 1,
      x: wall === 'west' ? -1n : 0n,
      y: wall === 'north' ? -1n : 0n,
      isEast: wall === 'east' || wall === 'west',
    },
    sides: { near: inward, far: !inward },
  };
})();

/**
 * `walls` with `door`'s wall open, for the eye of the one who opened it. A
 * portal stays shut to it: what shows through one is not the room behind it.
 */
export function withOpen(walls: Walls, door: DoorWall | null): Walls {
  if (door === null || isPortal(door)) return walls;
  const is = (n: number, x: bigint, y: bigint, isEast: boolean) =>
    isSameWall(door, { n, x, y, isEast });
  return {
    isOpenEast: (n, x, y) => is(n, x, y, true) || walls.isOpenEast(n, x, y),
    isOpenSouth: (n, x, y) => is(n, x, y, false) || walls.isOpenSouth(n, x, y),
  };
}

/**
 * `wall` with the doorway cut in it, each quad in the frame of the room it
 * faces into: the faces `sides` asks for, and, where both are drawn, the
 * door's frame lining the cut.
 */
export function doorwayWall(wall: DoorWall, sides: Sides): Quad[] {
  const { run, at, own } = wallFrame(wall);
  const { from, to, height: head } = DOORWAY_CUT;
  const panes = [
    [0, from, 0, CEILING_HEIGHT],
    [to, 1, 0, CEILING_HEIGHT],
    [from, to, head, CEILING_HEIGHT],
  ] as const;
  const side = (sign: -1 | 1): Quad[] =>
    panes.map(([a0, a1, h0, h1]) =>
      leaning(
        at(a0, sign * WALL_HALF, h0),
        [run(a1 - a0, 0, 0), run(0, 0, h1 - h0)],
        run(0, sign, 0),
        'wall',
      ),
    );
  return [
    ...own([...(sides.near ? side(-1) : []), ...(sides.far ? side(1) : [])]),
    ...(sides.near && sides.far ? doorFrame(wall) : []),
  ];
}
