import { WALL_HALF } from '@/cube/shared/lib/room-shape';
import { scaled, unit3, type Vec3 } from '@/cube/shared/lib/vec';

import { placed } from './frame';
import { holeMiddle, type Quarter } from './hole';
import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';
import { PILL_RADIUS, pillQuads } from './pill';
import type { WallMounted } from './pose';
import { box, type Quad } from './quad';
import { type InRoomOf, type Room, roomKey, roomsAcross } from './room';

/**
 * Where a holed room's shelf is mounted: on the hole quarter's outer wall
 * across `u` (the x-wall), else on the one across `v` (the y-wall), else, both
 * being doors, on a post standing in that corner.
 */
type Mount = 'x-wall' | 'y-wall' | 'post';

/**
 * A holed room's shelf, the pill lying on it: `at` is the shelf's foot on the
 * wall or the post's face.
 */
export type Shelf = WallMounted & { mount: Mount };

/** Whether `room`'s pill is the one `taken`, the one pill off its shelf if any is. */
export const takenIn = (taken: InRoomOf | null, room: Room): boolean =>
  taken !== null && roomKey(taken.room) === roomKey(room);

/** The post's side, in room sides: 15 cm on floor 1. */
const POST_SIDE = 0.03;

/** Whether the room's outer wall across `u` on the `qx` side is closed. */
function xWallClosed(
  rolled: RolledMaze,
  { n, x, y }: Room,
  qx: Quarter['qx'],
): boolean {
  if (qx === 0) return x === 0n || !isOpenEast(rolled, n, x - 1n, y);
  return x === roomsAcross(n) - 1n || !isOpenEast(rolled, n, x, y);
}

/** Whether the room's outer wall across `v` on the `qy` side is closed. */
function yWallClosed(
  rolled: RolledMaze,
  { n, x, y }: Room,
  qy: Quarter['qy'],
): boolean {
  if (qy === 0) return y === 0n || !isOpenSouth(rolled, n, x, y - 1n);
  return y === roomsAcross(n) - 1n || !isOpenSouth(rolled, n, x, y);
}

/** The shelf of `room`, whose hole is in `quarter`, level with the hole. */
export function shelfOf(
  rolled: RolledMaze,
  room: Room,
  quarter: Quarter,
): Shelf {
  const { qx, qy } = quarter;
  const { u: holeU, v: holeV } = holeMiddle(quarter);
  const intoU = 1 - 2 * qx;
  const intoV = 1 - 2 * qy;
  if (xWallClosed(rolled, room, qx)) {
    return {
      mount: 'x-wall',
      at: { u: qx, v: holeV },
      facing: { u: intoU, v: 0 },
    };
  }
  if (yWallClosed(rolled, room, qy)) {
    return {
      mount: 'y-wall',
      at: { u: holeU, v: qy },
      facing: { u: 0, v: intoV },
    };
  }
  return {
    mount: 'post',
    at: { u: qx + intoU * POST_SIDE, v: qy + (intoV * POST_SIDE) / 2 },
    facing: { u: intoU, v: 0 },
  };
}

/** The shelf's top over the slab, in room sides: 1 m on floor 1. */
const SHELF_HEIGHT = 0.2;
const SHELF_WIDTH = 0.044;
const SHELF_DEPTH = 0.022;
const SHELF_THICK = 0.004;
/** The plate behind the shelf, which it stands a little over. */
const PLATE_WIDTH = 0.05;
const PLATE_TALL = 0.07;
const PLATE_DEPTH = 0.004;
const PLATE_MIDDLE = SHELF_HEIGHT + 0.014;
/** The square of paper the pill lies on, and how far it lies askew. */
const PAPER_SIDE = 0.018;
const PAPER_THICK = 0.0004;
const ASKEW = 0.35;
/** The post's height: the room's. */
const POST_HEIGHT = 0.5;

/** A shelf's own axes in its room: out of the wall, and along it. */
function axesOf({ mount, at, facing }: Shelf) {
  const out: Vec3 = [facing.u, 0, facing.v];
  // Along the wall, so that (along, up, out) is right-handed.
  const along: Vec3 = [facing.v, 0, -facing.u];
  // A wall's face stands in from the room's edge; a post's is where it is.
  const proud = mount === 'post' ? 0 : WALL_HALF;
  return {
    out,
    along,
    footU: at.u + out[0] * proud,
    footV: at.v + out[2] * proud,
  };
}

/**
 * Where `shelf`'s pill lies, in its room's own frame: its middle, and the
 * unit vector its length runs along, a little askew of the wall.
 */
export function pillOn(shelf: Shelf): { centre: Vec3; axis: Vec3 } {
  const { out, along, footU, footV } = axesOf(shelf);
  const off = PLATE_DEPTH + SHELF_DEPTH * 0.55;
  return {
    centre: [
      footU + out[0] * off,
      SHELF_HEIGHT + PAPER_THICK + PILL_RADIUS,
      footV + out[2] * off,
    ],
    axis: unit3([
      along[0] * Math.cos(ASKEW) + out[0] * Math.sin(ASKEW),
      0,
      along[2] * Math.cos(ASKEW) + out[2] * Math.sin(ASKEW),
    ]),
  };
}

/**
 * `shelf`'s faces in `room`, whose north-west slab corner sits at `origin` of
 * the eye's frame, `side` its room side there: the post where there is one,
 * the plate on the wall, the shelf out of it, the paper on that, and the pill
 * on the paper unless it is `taken`.
 */
export function shelfFaces(
  shelf: Shelf,
  room: Room,
  origin: Vec3,
  side: number,
  taken: boolean,
): Quad[] {
  const { mount, at } = shelf;
  const local = ([u, up, v]: Vec3): Vec3 => [
    origin[0] + u * side,
    origin[1] + up * side,
    origin[2] + v * side,
  ];
  const { out, along, footU, footV } = axesOf(shelf);
  const up: Vec3 = [0, 1, 0];
  const post =
    mount === 'post'
      ? box(
          local([
            at.u < 0.5 ? 0 : 1 - POST_SIDE,
            0,
            at.v < 0.5 ? 0 : 1 - POST_SIDE,
          ]),
          [
            [POST_SIDE * side, 0, 0],
            [0, POST_HEIGHT * side, 0],
            [0, 0, POST_SIDE * side],
          ],
          room,
          'trim',
        )
      : [];
  /**
   * A box centred on the shelf's foot along the wall: `wide` along it, from
   * `low` up `tall`, from `near` off the wall out `deep`.
   */
  const slab = (
    [wide, tall, deep]: Vec3,
    low: number,
    near: number,
    surface: 'plate' | 'handle' | 'paper',
  ) =>
    box(
      local([
        footU - (along[0] * wide) / 2 + out[0] * near,
        low,
        footV - (along[2] * wide) / 2 + out[2] * near,
      ]),
      [
        scaled(along, wide * side),
        scaled(up, tall * side),
        scaled(out, deep * side),
      ],
      room,
      surface,
    );
  const { centre, axis } = pillOn(shelf);
  return [
    ...post,
    ...slab(
      [PLATE_WIDTH, PLATE_TALL, PLATE_DEPTH],
      PLATE_MIDDLE - PLATE_TALL / 2,
      0,
      'plate',
    ),
    ...slab(
      [SHELF_WIDTH, SHELF_THICK, SHELF_DEPTH],
      SHELF_HEIGHT - SHELF_THICK,
      PLATE_DEPTH,
      'handle',
    ),
    ...slab(
      [PAPER_SIDE, PAPER_THICK, PAPER_SIDE],
      SHELF_HEIGHT,
      PLATE_DEPTH + (SHELF_DEPTH - PAPER_SIDE) / 2,
      'paper',
    ),
    ...(taken ? [] : pillQuads(local(centre), axis, side, room)),
  ];
}

/** The shelf of `room` in the eye's frame, if `room` has a hole. */
export function shelfSeen(
  rolled: RolledMaze,
  eye: Room,
  room: Room,
  quarter: Quarter | null,
  taken: InRoomOf | null,
): Quad[] {
  if (quarter === null) return [];
  const { origin, roomSide: side } = placed(eye, room);
  return shelfFaces(
    shelfOf(rolled, room, quarter),
    room,
    origin,
    side,
    takenIn(taken, room),
  );
}
