import { holeMiddle, type HoleOf, type Quarter } from './hole';
import { leverFaces, leverOf, type Pulled, swungIn } from './lever';
import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';
import type { Pose } from './pose';
import { face, type Quad, type Vec3 } from './quad';
import { type Room, roomKey, roomsAcross } from './room';
import type { View } from './rooms';

/** A room's height, in its own side. */
export const ROOM_HEIGHT = 0.5;
/** A hole's side, in its room's side; it sits in the middle of its quarter. */
export const HOLE_SIDE = 0.08;

/** A room's side in the eye's frame, in the eye room's sides. */
type Sided = { roomSide: number };

/** A room's footprint in the eye's frame: its north-west corner and side. */
type Footprint = Sided & { east: number; south: number };

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

/** The rects a slab of `side` covers once a hole in `quarter` is cut from it. */
function cut(
  { east, south, roomSide: side }: Footprint,
  quarter: Quarter | null,
): Array<[east: number, south: number, width: number, depth: number]> {
  if (quarter === null) return [[east, south, side, side]];
  const half = (side * HOLE_SIDE) / 2;
  const middle = holeMiddle(quarter);
  const west = east + side * middle.u - half;
  const north = south + side * middle.v - half;
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
 * floor `m`'s floor, `owned` where the viewer bought the room, its underside
 * floor `m + 1`'s ceiling. Floor 0 is the lid.
 */
function slab(
  eye: Room,
  m: number,
  area: Footprint,
  quarter: Quarter | null,
  owned: boolean,
): Quad[] {
  const y = slabHeight(eye.n, m);
  const top = owned ? 'owned' : 'floor';
  return cut(area, quarter).flatMap(([east, south, width, depth]) => {
    const corner: Vec3 = [east, y, south];
    const across: Vec3 = [width, 0, 0];
    const along: Vec3 = [0, 0, depth];
    const under = face(corner, across, along, m + 1, 'ceiling');
    return m === 0 ? [under] : [face(corner, along, across, m, top), under];
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

/** Where `room` sits in the eye's frame: its north-west slab corner and side. */
export type Placed = Sided & { origin: Vec3 };

export function placed(eye: Room, room: Room): Placed {
  const { east, south, roomSide } = footprint(eye, room);
  return { origin: [east, slabHeight(eye.n, room.n), south], roomSide };
}

/** The rooms of `view` whose walls the eye sees: near, below and overhead. */
export const walledRooms = (view: View): Room[] => [
  ...view.near,
  ...view.below,
  ...(view.overhead === null ? [] : [view.overhead]),
];

/** The lever of `room` in the eye's frame, if `room` has a hole. */
function lever(
  rolled: RolledMaze,
  eye: Room,
  room: Room,
  quarter: Quarter | null,
  pulled: Pulled | null,
): Quad[] {
  if (quarter === null) return [];
  const { origin, roomSide: side } = placed(eye, room);
  return leverFaces(
    leverOf(rolled, room, quarter),
    room.n,
    origin,
    side,
    swungIn(pulled, room),
  );
}

/**
 * Every face the eye at `pose` sees of `view`: the walls of its floor's rooms,
 * of the rooms below them and of the room overhead; the slabs of all of them,
 * holes cut; the levers of the holed rooms among those; and the ceiling over
 * the topmost room it sees, which on floors 1 and 2 is the lid. Every lever
 * is drawn at rest but the one `pulled`. Slabs come first, so a depth test
 * that keeps the first of two equal depths draws a slab, not the wall tops
 * meeting it from below. A room `owns` names has its floor drawn `owned`.
 */
export function faces(
  rolled: RolledMaze,
  pose: Pose,
  view: View,
  holeOf: HoleOf,
  pulled: Pulled | null,
  owns: (room: Room) => boolean,
): Quad[] {
  const slabOf = (room: Room) =>
    slab(pose, room.n, footprint(pose, room), holeOf(room), owns(room));
  const lid =
    view.topmost === null
      ? slab(pose, 0, footprint(pose, CUBE), null, false)
      : slabOf(view.topmost);
  return [
    ...[...view.near, ...view.below, ...view.above].flatMap((room) =>
      slabOf(room),
    ),
    ...lid,
    ...walls(rolled, pose, view.near),
    ...walls(rolled, pose, view.below),
    ...(view.overhead === null ? [] : walls(rolled, pose, [view.overhead])),
    ...walledRooms(view).flatMap((room) =>
      lever(rolled, pose, room, holeOf(room), pulled),
    ),
  ];
}
