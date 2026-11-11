import { type Placed, walledRooms } from './geometry';
import type { HoleOf } from './hole';
import type { InRoom, WallMounted } from './pose';
import { box, type Facet, facet, type Quad, times, type Vec3 } from './quad';
import { type InRoomOf, type Room, roomKey } from './room';
import { opens, parent, type Step, stepped, STEPS, type View } from './rooms';
import type { Walls } from './walls';

/**
 * What a sign says: a room for sale, one for sale because it adjoins a room
 * the viewer bought, or a room the viewer bought.
 */
export const SIGN_KINDS = ['for-sale', 'buy-more', 'yours'] as const;
export type SignKind = (typeof SIGN_KINDS)[number];

/**
 * Where a sign hangs: on a wall, or, `onPost`, on a post standing at `at`,
 * readable from both faces.
 */
export type SignMount = WallMounted & { onPost: boolean };

/** A room's sign: where it hangs, and what it says. */
export type Sign = SignMount & { kind: SignKind };

/** A room with a sign. */
export type Signed = InRoomOf & { sign: Sign };

/** The rooms the viewer bought, by `roomKey`, each where its sign hung. */
export type Holdings = ReadonlyMap<string, SignMount>;

/** Floor 2's one room for sale, in dollars: the rate every floor's is set by. */
const FLOOR_TWO_PRICE = 10_000_000;

/** No room sells for less, however small: floor 9's and every one below. */
const LOWEST_PRICE = 4.99;

/**
 * A room of floor `n`'s price, in dollars. Every floor's room is an eighth of
 * the volume of the floor above's, so down to the lowest price this is one
 * price per cubic metre.
 */
export const priceOf = (n: number): number =>
  Math.max(FLOOR_TWO_PRICE / 8 ** (n - 2), LOWEST_PRICE);

type Side = { step: Step; is: 'wall' | 'bought' | 'open' };

/**
 * How far a post stands in from the doorway it faces away from, in room sides:
 * 1 m on floor 1, so a body walks round it rather than through its doorway.
 */
const POST_IN = 0.2;

/** The way facing back along `(u, v)`: `0 - d`, not `-d`, so no negative zero. */
const against = (u: number, v: number): InRoom => ({ u: 0 - u, v: 0 - v });

/**
 * The sign of `room` on the side across `step`, facing into the room: on that
 * side's wall, or on a post standing `POST_IN` in from it.
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
 * The side a for-sale room's sign faces from: the one across from its one
 * opening still on sale, the far wall, when that side is a wall. Where it is
 * a bought room instead, the next wall clockwise from it; with no wall at all,
 * the sign stands on a post in from that far side. A room every opening of
 * which is bought counts its sides clockwise from the east.
 */
function farSide(sides: readonly Side[], door: Side | undefined): SignMount {
  // STEPS run clockwise, so two on from a step is the one across from it.
  const start = door === undefined ? 0 : (sides.indexOf(door) + 2) % 4;
  const turn = [...sides.slice(start), ...sides.slice(0, start)];
  const wall = turn.find((side) => side.is === 'wall');
  if (wall !== undefined) return mountedOn(wall.step, false);
  const [across = { step: STEPS[0] }] = turn;
  return mountedOn(across.step, true);
}

/**
 * `room`'s sign, given the rooms the viewer `bought` and `isEnd`, which says
 * whether a room is its floor's landing room — the one the floor above's hole
 * drops a body into — or its holed room. A bought room's sign reads as its own
 * where it hung. Otherwise a room on floor 2 and below is for sale when every
 * side of it but at most one is a closed wall or opens onto a bought room, the
 * floor's boundary counting as wall, and it is neither end; it reads "buy
 * more" when it adjoins a bought room. With nothing bought those are the dead
 * ends off the path from landing to hole, and no room of that path can ever
 * sell: its two ends never do, so each room between keeps two openings on
 * sale. `isEnd` is asked only of a room the walls alone leave for sale.
 */
export function lotSign(
  walls: Walls,
  bought: Holdings,
  room: Room,
  isEnd: (room: Room) => boolean,
): Sign | null {
  const own = bought.get(roomKey(room));
  if (own !== undefined) return { ...own, kind: 'yours' };
  if (room.n < 2) return null;
  const sides: Side[] = STEPS.map((step) => {
    if (!opens(walls, room, step)) return { step, is: 'wall' };
    const beyond = roomKey(stepped(room, step));
    return { step, is: bought.has(beyond) ? 'bought' : 'open' };
  });
  const doors = sides.filter((side) => side.is === 'open');
  if (doors.length > 1 || isEnd(room)) return null;
  return {
    ...farSide(sides, doors[0]),
    kind: sides.some((side) => side.is === 'bought') ? 'buy-more' : 'for-sale',
  };
}

/** Whether `room` is the one the floor above's hole drops a body into. */
function isLanding(room: Room, holeOf: HoleOf): boolean {
  const over = parent(room);
  const quarter = holeOf(over);
  return (
    quarter !== null &&
    room.x === 2n * over.x + BigInt(quarter.qx) &&
    room.y === 2n * over.y + BigInt(quarter.qy)
  );
}

/** `lotSign`'s ends read off `holeOf`, which must know a room and the one over it. */
export const endsOf =
  (holeOf: HoleOf) =>
  (room: Room): boolean =>
    holeOf(room) !== null || isLanding(room, holeOf);

/** The rooms with signs among those whose walls `view` draws. */
export function signsSeen(
  walls: Walls,
  bought: Holdings,
  view: View,
  holeOf: HoleOf,
): Signed[] {
  const isEnd = endsOf(holeOf);
  return walledRooms(view).flatMap((room) => {
    const sign = lotSign(walls, bought, room, isEnd);
    return sign === null ? [] : [{ room, sign }];
  });
}

/** The board's middle over the slab, in room sides: 1.5 m on floor 1. */
const SIGN_HEIGHT = 0.3;
const SIGN_WIDTH = 0.3;
const SIGN_TALL = 0.15;
/**
 * How far the board stands off its wall, in room sides: 1 cm on floor 1. A
 * wall has no thickness, so a board on it would tie with it in depth.
 */
const SIGN_OFF = 0.002;
/** Half a post's side, in room sides: 5 cm on floor 1. */
const POST_HALF = 0.01;

/**
 * One board facing `facing`, its foot `off` room sides out from `at`, in a
 * room placed at `origin` with room side `side`.
 */
function board(
  at: WallMounted['at'],
  facing: WallMounted['facing'],
  off: number,
  n: number,
  { origin, roomSide: side }: Placed,
): Facet {
  // Rightward for a reader facing the board, so (along, up) faces them.
  const along: Vec3 = [facing.v, 0, -facing.u];
  const offset = (axis: 0 | 2, foot: number, out: number): number =>
    origin[axis] + (foot + out * off - (along[axis] * SIGN_WIDTH) / 2) * side;
  const corner: Vec3 = [
    offset(0, at.u, facing.u),
    origin[1] + (SIGN_HEIGHT - SIGN_TALL / 2) * side,
    offset(2, at.v, facing.v),
  ];
  return facet(
    corner,
    times(along, SIGN_WIDTH * side),
    [0, SIGN_TALL * side, 0],
    n,
  );
}

/**
 * The board of `sign` in a room of floor `n` placed at `place` in the eye's
 * frame: one facet facing into the room off a wall, or, on a post, two back
 * to back either side of it, so it reads from every opening. Each facet's
 * first corner is the bottom left as a reader facing it sees it, then bottom
 * right, top right and top left.
 */
export function signFacets(
  { at, facing, onPost }: SignMount,
  n: number,
  place: Placed,
): Facet[] {
  if (!onPost) return [board(at, facing, SIGN_OFF, n, place)];
  const off = POST_HALF + SIGN_OFF;
  return [
    board(at, facing, off, n, place),
    board(at, against(facing.u, facing.v), off, n, place),
  ];
}

/**
 * The post under `sign`, if it stands on one: a thin box in the walls' hue
 * from the slab up to the board's middle, in a room of floor `n` placed at
 * `place` in the eye's frame.
 */
export function signPost(
  { at, onPost }: SignMount,
  n: number,
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
      [0, SIGN_HEIGHT * side, 0],
      [0, 0, width],
    ],
    n,
    'wall',
  );
}
