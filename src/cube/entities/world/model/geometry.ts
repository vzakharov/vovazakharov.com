import type { HoleOf, Quarter } from './hole';
import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';
import type { Pose } from './pose';
import { type Floored, type Room, roomKey, roomsAcross } from './room';
import type { View } from './rooms';

/** A room's height, in its own side. */
const ROOM_HEIGHT = 0.5;
/** A hole's side, in its room's side; it sits in the middle of its quarter. */
export const HOLE_SIDE = 0.08;

export type Vec3 = readonly [number, number, number];

const SURFACES = ['wall', 'floor', 'ceiling'] as const;
export type Surface = (typeof SURFACES)[number];

/**
 * One flat face, its corners counter-clockwise seen from the side `normal`
 * points to, and the room it faces into: on floor `n`, as `surface`.
 */
export type Quad = Floored & {
  corners: readonly [Vec3, Vec3, Vec3, Vec3];
  normal: Vec3;
  surface: Surface;
};

/** A room's footprint in the eye's frame: its north-west corner and side. */
type Footprint = { east: number; south: number; roomSide: number };

const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

const unit = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};

const plus = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax + bx,
  ay + by,
  az + bz,
];

/** The parallelogram from `corner` along `a`, then `b`, facing `a × b`. */
function face(
  corner: Vec3,
  a: Vec3,
  b: Vec3,
  n: number,
  surface: Surface,
): Quad {
  return {
    corners: [
      corner,
      plus(corner, a),
      plus(plus(corner, a), b),
      plus(corner, b),
    ],
    normal: unit(cross(a, b)),
    n,
    surface,
  };
}

/**
 * The eye's frame: floor `n`'s room sides, origin at the north-west corner of
 * the eye's room on its slab, x east, y up, z south. A room's place is taken
 * as a BigInt difference before it becomes a double, so every coordinate is a
 * few rooms wide on floor 66 as on floor 1.
 */
function footprint(eye: Room, room: Room): Footprint {
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
const slabHeight = (n: number, m: number): number =>
  ROOM_HEIGHT * (2 ** (n - m) - 1);

/** The rects a slab of `side` covers once a hole in `quarter` is cut from it. */
function cut(
  { east, south, roomSide: side }: Footprint,
  quarter: Quarter | null,
): Array<[east: number, south: number, width: number, depth: number]> {
  if (quarter === null) return [[east, south, side, side]];
  const half = (side * HOLE_SIDE) / 2;
  const west = east + (side * (quarter.qx + 0.5)) / 2 - half;
  const north = south + (side * (quarter.qy + 0.5)) / 2 - half;
  const hole = 2 * half;
  return [
    [east, south, west - east, side],
    [west + hole, south, east + side - west - hole, side],
    [west, south, hole, north - south],
    [west, north + hole, hole, south + side - north - hole],
  ];
}

/**
 * Floor `m`'s slab over `area`, at its height in the eye's frame: its top is
 * floor `m`'s floor, its underside floor `m + 1`'s ceiling. Floor 0 is the lid.
 */
function slab(
  eye: Room,
  m: number,
  area: Footprint,
  quarter: Quarter | null,
): Quad[] {
  const y = slabHeight(eye.n, m);
  return cut(area, quarter).flatMap(([east, south, width, depth]) => {
    const corner: Vec3 = [east, y, south];
    const across: Vec3 = [width, 0, 0];
    const along: Vec3 = [0, 0, depth];
    const under = face(corner, across, along, m + 1, 'ceiling');
    return m === 0 ? [under] : [face(corner, along, across, m, 'floor'), under];
  });
}

/** A wall seen from both rooms it parts, as the two faces of one rect. */
function wall(corner: Vec3, run: Vec3, height: number, floor: number): Quad[] {
  const up: Vec3 = [0, height, 0];
  return [
    face(corner, run, up, floor, 'wall'),
    face(corner, up, run, floor, 'wall'),
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
  const height = side * ROOM_HEIGHT;
  const runSouth: Vec3 = [0, 0, side];
  const runEast: Vec3 = [side, 0, 0];
  const westClosed =
    x === 0n ||
    (absent({ n, x: x - 1n, y }) && !isOpenEast(rolled, n, x - 1n, y));
  const northClosed =
    y === 0n ||
    (absent({ n, x, y: y - 1n }) && !isOpenSouth(rolled, n, x, y - 1n));
  return [
    x === last || !isOpenEast(rolled, n, x, y)
      ? wall([east + side, floorY, south], runSouth, height, n)
      : [],
    y === last || !isOpenSouth(rolled, n, x, y)
      ? wall([east, floorY, south + side], runEast, height, n)
      : [],
    westClosed ? wall([east, floorY, south], runSouth, height, n) : [],
    northClosed ? wall([east, floorY, south], runEast, height, n) : [],
  ].flat();
}

/** The lid's footprint: floor 1's one room, which is the whole cube. */
const CUBE: Room = { n: 1, x: 0n, y: 0n };

/**
 * Every face the eye at `pose` sees of `view`: the walls of its floor's rooms,
 * of the rooms below them and of the room overhead; the slabs of all of them,
 * holes cut; and the ceiling over the topmost room it sees, which on floors
 * 1 and 2 is the lid. Slabs come first, so a depth test that keeps the first
 * of two equal depths draws a slab, not the wall tops meeting it from below.
 */
export function faces(
  rolled: RolledMaze,
  pose: Pose,
  view: View,
  holeOf: HoleOf,
): Quad[] {
  const slabOf = (room: Room) =>
    slab(pose, room.n, footprint(pose, room), holeOf(room));
  const lid =
    view.topmost === null
      ? slab(pose, 0, footprint(pose, CUBE), null)
      : slabOf(view.topmost);
  return [
    ...[...view.near, ...view.below, ...view.above].flatMap((room) =>
      slabOf(room),
    ),
    ...lid,
    ...walls(rolled, pose, view.near),
    ...walls(rolled, pose, view.below),
    ...(view.overhead === null ? [] : walls(rolled, pose, [view.overhead])),
  ];
}
