import type { Sized } from '@/kernel/shared/typings';

import { WALL_HALF } from '@/cube/shared/lib/room-shape';
import { scaled as times, type Vec3 } from '@/cube/shared/lib/vec';

import type { Placed } from './frame';
import type { InRoom, WallMounted } from './pose';
import { box, type Facet, facet, type Quad } from './quad';
import type { Room } from './room';
import { opens, type Step, STEPS } from './rooms';
import type { Walls } from './walls';

/**
 * Where a board hangs: on a wall, or, `onPost`, on a post standing at `at`,
 * readable from both faces.
 */
export type SignMount = WallMounted & { onPost: boolean };

/**
 * A board's size and height, in room sides: its middle `hungAt` over the
 * slab, which is also how tall a post under it stands.
 */
export type BoardShape = Sized & { hungAt: number };

/** One side of a room: a wall, an opening onto a bought room, or open. */
export type Side = { step: Step; is: 'wall' | 'bought' | 'open' };

/**
 * How far a post stands in from the doorway it faces away from, in room sides:
 * 1 m on floor 1, so a body walks round it rather than through its doorway.
 */
const POST_IN = 0.2;

/** The way facing back along `(u, v)`: `0 - d`, not `-d`, so no negative zero. */
const against = (u: number, v: number): InRoom => ({ u: 0 - u, v: 0 - v });

/**
 * The board of a room on the side across `step`, facing into the room: on
 * that side's wall, or on a post standing `POST_IN` in from it.
 */
function mountedOn([dx, dy]: Step, onPost: boolean): SignMount {
  const into = onPost ? POST_IN : 0;
  return {
    at: { u: (1 + dx) / 2 - dx * into, v: (1 + dy) / 2 - dy * into },
    facing: against(dx, dy),
    onPost,
  };
}

/**
 * Where a room's board hangs, facing in from across `door`: the first wall
 * clockwise from the side opposite it, or with no `door` from the east; with
 * no wall at all, on a post in from that first side.
 */
export function farSide(
  sides: readonly Side[],
  door: Side | undefined,
): SignMount {
  // STEPS run clockwise, so two on from a step is the one across from it.
  const start = door === undefined ? 0 : (sides.indexOf(door) + 2) % 4;
  const turn = [...sides.slice(start), ...sides.slice(0, start)];
  const wall = turn.find((side) => side.is === 'wall');
  if (wall !== undefined) return mountedOn(wall.step, false);
  const [across = { step: STEPS[0] }] = turn;
  return mountedOn(across.step, true);
}

/** Where a board of `room` hangs when no opening of it sets the side. */
export const wallMount = (walls: Walls, room: Room): SignMount =>
  farSide(
    STEPS.map((step) => ({
      step,
      is: opens(walls, room, step) ? 'open' : 'wall',
    })),
    undefined,
  );

/**
 * How far a board stands off its wall's face or its post, in room sides:
 * 1 cm on floor 1, so the two do not tie in depth.
 */
const BOARD_OFF = 0.002;
/** Half a post's side, in room sides: 5 cm on floor 1. */
const POST_HALF = 0.01;

/**
 * One board of `shape` facing `facing`, its foot `off` room sides out from
 * `at`, in a room placed at `origin` with room side `side`.
 */
function board(
  at: WallMounted['at'],
  facing: WallMounted['facing'],
  off: number,
  { width, height, hungAt }: BoardShape,
  room: Room,
  { origin, roomSide: side }: Placed,
): Facet {
  // Rightward for a reader facing the board, so (along, up) faces them.
  const along: Vec3 = [facing.v, 0, -facing.u];
  const offset = (axis: 0 | 2, foot: number, out: number): number =>
    origin[axis] + (foot + out * off - (along[axis] * width) / 2) * side;
  const corner: Vec3 = [
    offset(0, at.u, facing.u),
    origin[1] + (hungAt - height / 2) * side,
    offset(2, at.v, facing.v),
  ];
  return facet(corner, times(along, width * side), [0, height * side, 0], room);
}

/**
 * The board of `shape` hung at `mount` in `room`, placed at `place` in the
 * eye's frame: one facet facing into the room off a wall, or, on a post, two
 * back to back either side of it, so it reads from every opening. Each
 * facet's first corner is the bottom left as a reader facing it sees it, then
 * bottom right, top right and top left.
 */
export function boardFacets(
  { at, facing, onPost }: SignMount,
  shape: BoardShape,
  room: Room,
  place: Placed,
): Facet[] {
  if (!onPost) {
    return [board(at, facing, WALL_HALF + BOARD_OFF, shape, room, place)];
  }
  const off = POST_HALF + BOARD_OFF;
  return [
    board(at, facing, off, shape, room, place),
    board(at, against(facing.u, facing.v), off, shape, room, place),
  ];
}

/**
 * The post under a board of `shape` at `mount`, if it stands on one: a thin
 * box of trim from the slab up to the board's middle, in `room` placed at
 * `place` in the eye's frame.
 */
export function boardPost(
  { at, onPost }: SignMount,
  { hungAt }: BoardShape,
  room: Room,
  { origin, roomSide: side }: Placed,
): Quad[] {
  if (!onPost) return [];
  const width = 2 * POST_HALF * side;
  return box(
    [
      origin[0] + (at.u - POST_HALF) * side,
      origin[1],
      origin[2] + (at.v - POST_HALF) * side,
    ],
    [
      [width, 0, 0],
      [0, hungAt * side, 0],
      [0, 0, width],
    ],
    room,
    'trim',
  );
}
