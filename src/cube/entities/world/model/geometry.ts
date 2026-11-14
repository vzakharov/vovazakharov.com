import { ROOM_DOORWAY, type WallSide } from '@/cube/shared/cube-boundary';
import {
  CEILING_HEIGHT,
  ROOM_METRES,
  SLAB_THICK,
  WALL_HALF,
} from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/shared/lib/vec';

import { type Footprint, footprint, slabHeight } from './frame';
import { holeMiddle, type HoleOf, type Quarter, QUARTERS, under } from './hole';
import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';
import type { InRoom, Pose } from './pose';
import { face, type Quad } from './quad';
import { type InRoomOf, isRoom, type Room, roomKey, roomsAcross } from './room';
import type { View } from './rooms';
import { shelfSeen } from './shelf';

/** A hole's side, in its room's side; it sits in the middle of its quarter. */
export const HOLE_SIDE = 0.08;

/** A square gap in a footprint: its middle and its side, in the footprint's sides. */
type Gap = InRoom & { gapSide: number };

/** The gap a hole in `quarter` leaves in its room's floor. */
const holeGap = (quarter: Quarter): Gap => ({
  ...holeMiddle(quarter),
  gapSide: HOLE_SIDE,
});

/** That hole as the room under it sees it: the middle of its ceiling. */
const HATCH_GAP: Gap = { u: 0.5, v: 0.5, gapSide: 2 * HOLE_SIDE };

type Rect = [east: number, south: number, width: number, depth: number];

/** The rects `area` covers once `gap` is cut from it. */
function cut(
  { east, south, roomSide: side }: Footprint,
  gap: Gap | null,
): Rect[] {
  if (gap === null) return [[east, south, side, side]];
  const half = (side * gap.gapSide) / 2;
  const west = east + side * gap.u - half;
  const north = south + side * gap.v - half;
  const hole = 2 * half;
  return [
    [east, south, west - east, side],
    [west + hole, south, east + side - west - hole, side],
    [west, south, hole, north - south],
    [west, north + hole, hole, south + side - north - hole],
  ];
}

/**
 * `room`'s floor or its ceiling over `area` at height `y` of the eye's frame,
 * `gap` cut from it.
 */
function level(
  area: Footprint,
  y: number,
  gap: Gap | null,
  room: Room,
  surface: 'floor' | 'owned' | 'ceiling',
): Quad[] {
  return cut(area, gap).map(([east, south, width, depth]) => {
    const corner: Vec3 = [east, y, south];
    const across: Vec3 = [width, 0, 0];
    const along: Vec3 = [0, 0, depth];
    return surface === 'ceiling'
      ? face(corner, across, along, room, surface)
      : face(corner, along, across, room, surface);
  });
}

/** The four faces of the shaft a hole cuts through `room`'s slab, `deep` down from `y`. */
function shaft(
  { east, south, roomSide: side }: Footprint,
  { u, v, gapSide }: Gap,
  y: number,
  deep: number,
  room: Room,
): Quad[] {
  const wide = side * gapSide;
  const west = east + side * u - wide / 2;
  const north = south + side * v - wide / 2;
  const down: Vec3 = [0, -deep, 0];
  const runEast: Vec3 = [wide, 0, 0];
  const runSouth: Vec3 = [0, 0, wide];
  return [
    // Each faces into the shaft: `runSouth × down` points east, `down ×
    // runEast` south.
    face([west, y, north], runSouth, down, room, 'trim'),
    face([west + wide, y, north], down, runSouth, room, 'trim'),
    face([west, y, north], down, runEast, room, 'trim'),
    face([west, y, north + wide], runEast, down, room, 'trim'),
  ];
}

/**
 * `room`'s slab over `area`, at its height in the eye's frame: its top is the
 * room's floor, `owned` where the viewer bought it, and its underside,
 * `SLAB_THICK` of their sides lower, the ceilings of the four rooms beneath,
 * the hole coming out in the middle of one of them down a shaft. The
 * underside is drawn only where the eye can get under it: over its floor, or
 * through a hole in it — so the floor below is asked about only once a hole
 * shows it.
 */
function slab(
  eye: Room,
  room: Room,
  area: Footprint,
  quarter: Quarter | null,
  owned: boolean,
): Quad[] {
  const y = slabHeight(eye.n, room.n);
  const half = area.roomSide / 2;
  const deep = SLAB_THICK * half;
  const gap = quarter === null ? null : holeGap(quarter);
  const underneath = room.n < eye.n || (room.n === eye.n && gap !== null);
  return [
    ...level(area, y, gap, room, owned ? 'owned' : 'floor'),
    ...(gap === null ? [] : shaft(area, gap, y, deep, room)),
    ...(underneath ? QUARTERS : []).flatMap((q) =>
      level(
        {
          east: area.east + q.qx * half,
          south: area.south + q.qy * half,
          roomSide: half,
        },
        y - deep,
        q.qx === quarter?.qx && q.qy === quarter.qy ? HATCH_GAP : null,
        under(room, q),
        'ceiling',
      ),
    ),
  ];
}

/**
 * A wall along `run` from `corner`, `half` thick either side of that line,
 * as its two faces: one into `front`, the room `run × up` points into, and
 * one into `back`. A side outside the floor is null, and has no face; the
 * wall's ends are left to the pillars on its corners.
 */
function wall(
  corner: Vec3,
  run: Vec3,
  height: number,
  half: number,
  front: Room | null,
  back: Room | null,
): Quad[] {
  const up: Vec3 = [0, height, 0];
  const length = Math.hypot(run[0], run[2]);
  const shift = (by: number): Vec3 => [
    corner[0] - (run[2] / length) * by,
    corner[1],
    corner[2] + (run[0] / length) * by,
  ];
  return [
    ...(front === null ? [] : [face(shift(half), run, up, front, 'wall')]),
    ...(back === null ? [] : [face(shift(-half), up, run, back, 'wall')]),
  ];
}

/**
 * The walls of a set of rooms on one floor: each room's east and south walls,
 * and its west and north ones where no room of the set stands beyond them.
 * The cube's outer walls are always closed; an open wall is drawn as nothing.
 */
function walls(rolled: RolledMaze, eye: Room, rooms: readonly Room[]): Quad[] {
  const keys = new Set(rooms.map((room) => roomKey(room)));
  const absent = (room: Room) => !keys.has(roomKey(room));
  return rooms.flatMap((room) => roomWalls(rolled, eye, room, absent));
}

/** One room's share of `walls`, `absent` naming the rooms outside the set. */
function roomWalls(
  rolled: RolledMaze,
  eye: Room,
  room: Room,
  absent: (room: Room) => boolean,
): Quad[] {
  const { n, x, y } = room;
  const last = roomsAcross(n) - 1n;
  const { east, south, roomSide: side } = footprint(eye, room);
  const floorY = slabHeight(eye.n, n);
  const height = side * CEILING_HEIGHT;
  const half = side * WALL_HALF;
  const runSouth: Vec3 = [0, 0, side];
  const runEast: Vec3 = [side, 0, 0];
  const beside = (dx: bigint, dy: bigint): Room | null =>
    isRoom(n, x + dx, y + dy) ? { n, x: x + dx, y: y + dy } : null;
  const westClosed =
    x === 0n ||
    (absent({ n, x: x - 1n, y }) && !isOpenEast(rolled, n, x - 1n, y));
  const northClosed =
    y === 0n ||
    (absent({ n, x, y: y - 1n }) && !isOpenSouth(rolled, n, x, y - 1n));
  const sides: Record<WallSide, Quad[]> = {
    east:
      x === last || !isOpenEast(rolled, n, x, y)
        ? wall(
            [east + side, floorY, south],
            runSouth,
            height,
            half,
            room,
            beside(1n, 0n),
          )
        : [],
    south:
      y === last || !isOpenSouth(rolled, n, x, y)
        ? wall(
            [east, floorY, south + side],
            runEast,
            height,
            half,
            beside(0n, 1n),
            room,
          )
        : [],
    west: westClosed
      ? wall(
          [east, floorY, south],
          runSouth,
          height,
          half,
          beside(-1n, 0n),
          room,
        )
      : [],
    north: northClosed
      ? wall(
          [east, floorY, south],
          runEast,
          height,
          half,
          room,
          beside(0n, -1n),
        )
      : [],
  };
  if (n === 1) {
    sides[ROOM_DOORWAY.wall] = doorwayWall([east, floorY, south], side, room);
  }
  return Object.values(sides).flat();
}

/**
 * The quarter of a pillar standing in each corner of `room`, `half` room
 * sides thick: the two faces of each that look into the room. Four rooms'
 * quarters make one pillar on their shared corner, each lit by its own room.
 */
function pillars(eye: Room, room: Room, half: number): Quad[] {
  if (half <= 0) return [];
  const { east, south, roomSide: side } = footprint(eye, room);
  const floorY = slabHeight(eye.n, room.n);
  const up: Vec3 = [0, side * CEILING_HEIGHT, 0];
  const thick = half * side;
  return QUARTERS.flatMap(({ qx, qy }) => {
    const inX = 1 - 2 * qx;
    const inZ = 1 - 2 * qy;
    const x = east + qx * side;
    const z = south + qy * side;
    const alongZ: Vec3 = [0, 0, inZ * thick];
    const alongX: Vec3 = [inX * thick, 0, 0];
    const facingX: Vec3 = [x + inX * thick, floorY, z];
    const facingZ: Vec3 = [x, floorY, z + inZ * thick];
    // `up × alongZ` points along x with `inZ`'s sign, `alongX × up` along z
    // with `inX`'s, so each pair is ordered to face into the room.
    return inX === inZ
      ? [
          face(facingX, up, alongZ, room, 'trim'),
          face(facingZ, alongX, up, room, 'trim'),
        ]
      : [
          face(facingX, alongZ, up, room, 'trim'),
          face(facingZ, up, alongX, room, 'trim'),
        ];
  });
}

/** The lid's footprint: floor 1's one room, which is the whole cube. */
const CUBE: Room = { n: 1, x: 0n, y: 0n };

/** The rooms of `view` whose walls the eye sees: near, below and overhead. */
export const walledRooms = (view: View): Room[] => [
  ...view.near,
  ...view.below,
  ...(view.overhead === null ? [] : [view.overhead]),
];

/**
 * Every face the eye at `pose` sees of `view`: the walls of its floor's rooms,
 * of the rooms below them and of the room overhead, and those rooms' pillars,
 * `pillarOf` their floor's half-thickness in room sides; the slabs of all of
 * them, holes cut; the shelves of the holed rooms among those; and the ceiling
 * over the topmost room it sees, which on floors 1 and 2 is the lid. Every
 * shelf holds its pill but the one `taken`. Slabs come first, so a depth
 * test that keeps the first of two equal depths draws a slab, not the wall
 * tops meeting it from below. A room `owns` names has its floor drawn `owned`.
 */
export function faces(
  rolled: RolledMaze,
  pose: Pose,
  view: View,
  holeOf: HoleOf,
  taken: InRoomOf | null,
  owns: (room: Room) => boolean,
  pillarOf: (n: number) => number,
): Quad[] {
  const slabOf = (room: Room) =>
    slab(pose, room, footprint(pose, room), holeOf(room), owns(room));
  const cube = footprint(pose, CUBE);
  const lid =
    view.topmost === null
      ? level(
          cube,
          slabHeight(pose.n, 0) - SLAB_THICK * cube.roomSide,
          null,
          CUBE,
          'ceiling',
        )
      : slabOf(view.topmost);
  const walled = walledRooms(view);
  return [
    ...[...view.near, ...view.below, ...view.above].flatMap((room) =>
      slabOf(room),
    ),
    ...lid,
    ...walls(rolled, pose, view.near),
    ...walls(rolled, pose, view.below),
    ...(view.overhead === null ? [] : walls(rolled, pose, [view.overhead])),
    ...walled.flatMap((room) => pillars(pose, room, pillarOf(room.n))),
    ...walled.flatMap((room) =>
      shelfSeen(rolled, pose, room, holeOf(room), taken),
    ),
  ];
}

/** A rect of a wall: along it from its north end, then up from the slab. */
type Pane = readonly [from: number, to: number, foot: number, top: number];

/**
 * The wall of floor 1 the doorway opens in, as the room sees it: its face,
 * the room `side` across from `corner`, its north-west one on the slab, with
 * the doorway left open. The side stays a closed one to everything that asks
 * — lamps, decor, the body — since only the eye and the sun go through it.
 */
function doorwayWall(corner: Vec3, side: number, room: Room): Quad[] {
  const [x, y, z] = corner;
  const metre = side / ROOM_METRES;
  const top = side * CEILING_HEIGHT;
  const [near, far, head] = [
    ROOM_DOORWAY.from * metre,
    ROOM_DOORWAY.to * metre,
    ROOM_DOORWAY.height * metre,
  ];
  const panes: Pane[] = [
    [0, near, 0, top],
    [far, side, 0, top],
    [near, far, head, top],
  ];
  const inset = side * WALL_HALF;
  const { wall: on } = ROOM_DOORWAY;
  const across = on === 'east' || on === 'south' ? side - inset : inset;
  const runsSouth = on === 'east' || on === 'west';
  const upFirst = on === 'west' || on === 'south';
  return panes.map(([from, to, foot, upTo]) => {
    const start: Vec3 = runsSouth
      ? [x + across, y + foot, z + from]
      : [x + from, y + foot, z + across];
    const run: Vec3 = runsSouth ? [0, 0, to - from] : [to - from, 0, 0];
    const up: Vec3 = [0, upTo - foot, 0];
    // The order of the face's two edges is what turns it to face the room.
    return upFirst
      ? face(start, up, run, room, 'wall')
      : face(start, run, up, room, 'wall');
  });
}
