import { WALL_HALF } from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/shared/lib/vec';

import { holeMiddle, type Quarter } from './hole';
import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';
import type { WallMounted } from './pose';
import { box, type Quad, times } from './quad';
import { type InRoomOf, type Room, roomKey, roomsAcross } from './room';

/**
 * Where a holed room's lever is mounted: on the hole quarter's outer wall
 * across `u` (the x-wall), else on the one across `v` (the y-wall), else, both
 * being doors, on a post standing in that corner.
 */
type Mount = 'x-wall' | 'y-wall' | 'post';

/** `at` is the plate's foot on the wall or the post's face. */
export type Lever = WallMounted & { mount: Mount };

/**
 * The one lever pulled, if any: its room, and how far its handle has swung,
 * from 0 (up, at rest) to 1 (down).
 */
export type Pulled = InRoomOf & { swung: number };

/** How far `room`'s lever has swung, given the one `pulled`. */
export const swungIn = (pulled: Pulled | null, room: Room): number =>
  pulled !== null && roomKey(pulled.room) === roomKey(room) ? pulled.swung : 0;

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

/** The lever of `room`, whose hole is in `quarter`, level with the hole. */
export function leverOf(
  rolled: RolledMaze,
  room: Room,
  quarter: Quarter,
): Lever {
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

/** The plate's middle over the slab, in room sides: 1 m on floor 1. */
const PLATE_HEIGHT = 0.2;
const PLATE_WIDTH = 0.05;
const PLATE_TALL = 0.07;
const PLATE_DEPTH = 0.006;
const HANDLE_LENGTH = 0.045;
const HANDLE_THICK = 0.01;
/** The handle's tilt up from the plate's normal at rest, and down once pulled. */
const HANDLE_TILT = (35 * Math.PI) / 180;
/** The post's height: the room's. */
const POST_HEIGHT = 0.5;

/**
 * `lever`'s faces in `room`, whose north-west slab corner sits at
 * `origin` of the eye's frame, `side` its room side there: the post where
 * there is one, the plate, and the handle out of it, `swung` of the way from
 * tilted up to tilted as far down.
 */
export function leverFaces(
  { mount, at, facing }: Lever,
  room: Room,
  origin: Vec3,
  side: number,
  swung: number,
): Quad[] {
  const local = (u: number, up: number, v: number): Vec3 => [
    origin[0] + u * side,
    origin[1] + up * side,
    origin[2] + v * side,
  ];
  const out: Vec3 = [facing.u, 0, facing.v];
  // Along the wall, so that (along, up, out) is right-handed.
  const along: Vec3 = [facing.v, 0, -facing.u];
  const up: Vec3 = [0, 1, 0];
  const post =
    mount === 'post'
      ? box(
          local(
            at.u < 0.5 ? 0 : 1 - POST_SIDE,
            0,
            at.v < 0.5 ? 0 : 1 - POST_SIDE,
          ),
          [
            [POST_SIDE * side, 0, 0],
            [0, POST_HEIGHT * side, 0],
            [0, 0, POST_SIDE * side],
          ],
          room,
          'trim',
        )
      : [];
  // A wall's face stands in from the room's edge; a post's is where it is.
  const proud = mount === 'post' ? 0 : WALL_HALF;
  const footU = at.u + out[0] * proud;
  const footV = at.v + out[2] * proud;
  const foot = local(footU, PLATE_HEIGHT, footV);
  const plateCorner = local(
    footU - (along[0] * PLATE_WIDTH) / 2,
    PLATE_HEIGHT - PLATE_TALL / 2,
    footV - (along[2] * PLATE_WIDTH) / 2,
  );
  const plate = box(
    plateCorner,
    [
      times(along, PLATE_WIDTH * side),
      times(up, PLATE_TALL * side),
      times(out, PLATE_DEPTH * side),
    ],
    room,
    'plate',
  );
  const tilt = HANDLE_TILT * (1 - 2 * swung);
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const lift: Vec3 = [-out[0] * sin, cos, -out[2] * sin];
  const reach: Vec3 = [out[0] * cos, sin, out[2] * cos];
  const half = (HANDLE_THICK * side) / 2;
  const handleCorner: Vec3 = [
    foot[0] - along[0] * half - lift[0] * half,
    foot[1] - lift[1] * half,
    foot[2] - along[2] * half - lift[2] * half,
  ];
  const handle = box(
    handleCorner,
    [
      times(along, HANDLE_THICK * side),
      times(lift, HANDLE_THICK * side),
      times(reach, HANDLE_LENGTH * side),
    ],
    room,
    'handle',
  );
  return [...post, ...plate, ...handle];
}
