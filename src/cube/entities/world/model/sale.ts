import { type Placed, walledRooms } from './geometry';
import type { HoleOf } from './hole';
import type { WallMounted } from './pose';
import { type Facet, facet, times, type Vec3 } from './quad';
import { type InRoomOf, type Room, roomKey } from './room';
import { opens, parent, type Step, stepped, STEPS, type View } from './rooms';
import type { Walls } from './walls';

/**
 * What a sign says: a room for sale, one for sale because it adjoins a room
 * the viewer bought, or a room the viewer bought.
 */
export const SIGN_KINDS = ['for-sale', 'buy-more', 'yours'] as const;
export type SignKind = (typeof SIGN_KINDS)[number];

/** A room's sign: where it hangs, and what it says. */
export type Sign = WallMounted & { kind: SignKind };

/** A room with a sign. */
export type Signed = InRoomOf & { sign: Sign };

/** The rooms the viewer bought, by `roomKey`, each where its sign hung. */
export type Holdings = ReadonlyMap<string, WallMounted>;

/** Floor 2's one room for sale, in dollars: the rate every floor's is set by. */
const FLOOR_TWO_PRICE = 10_000_000;

/**
 * A room of floor `n`'s price, in dollars. Every floor's room is an eighth of
 * the volume of the floor above's, so this is one price per cubic metre.
 */
export const priceOf = (n: number): number => FLOOR_TWO_PRICE / 8 ** (n - 2);

type Side = { step: Step; is: 'wall' | 'bought' | 'open' };

/** The sign hung on the wall of `room` across `step`, facing into it. */
const mountedOn = ([dx, dy]: Step): WallMounted => ({
  at: { u: (1 + dx) / 2, v: (1 + dy) / 2 },
  // `0 - d`, not `-d`, so a facing has no negative zero.
  facing: { u: 0 - dx, v: 0 - dy },
});

/**
 * The side a for-sale room's sign hangs on: the one across from its one
 * opening still on sale, the far wall, when that side is a wall. Where it is
 * a bought room instead, the next wall clockwise from it; with no wall at all,
 * the board stands in that far doorway. A room every opening of which is
 * bought hangs it on its first wall clockwise from the east.
 */
function farSide(sides: readonly Side[], door: Side | undefined): Step {
  // STEPS run clockwise, so two on from a step is the one across from it.
  const start = door === undefined ? 0 : (sides.indexOf(door) + 2) % 4;
  const turn = [...sides.slice(start), ...sides.slice(0, start)];
  const [across = { step: STEPS[0] }] = turn;
  return (turn.find((side) => side.is === 'wall') ?? across).step;
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
    ...mountedOn(farSide(sides, doors[0])),
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

/**
 * The board of `sign` in a room of floor `n` placed at `place` in the eye's
 * frame: one facet facing into the room, its first corner the bottom left as
 * a reader facing it sees it, then bottom right, top right and top left.
 */
export function signFacet(
  { at, facing }: WallMounted,
  n: number,
  { origin, roomSide: side }: Placed,
): Facet {
  // Rightward for a reader facing the board, so (along, up) faces them.
  const along: Vec3 = [facing.v, 0, -facing.u];
  const offset = (axis: 0 | 2, foot: number, out: number): number =>
    origin[axis] +
    (foot + out * SIGN_OFF - (along[axis] * SIGN_WIDTH) / 2) * side;
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
