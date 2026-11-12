import type { Placed } from './frame';
import { walledRooms } from './geometry';
import type { HoleOf } from './hole';
import { isLanding } from './landing';
import {
  boardFacets,
  boardPost,
  type BoardShape,
  farSide,
  type Side,
  type SignMount,
} from './mount';
import type { Facet, Quad } from './quad';
import { type InRoomOf, type Room, roomKey } from './room';
import { opens, stepped, STEPS, type View } from './rooms';
import type { Walls } from './walls';

/**
 * What a sign says: a room for sale, one for sale because it adjoins a room
 * the viewer bought, or a room the viewer bought.
 */
const SIGN_KINDS = ['for-sale', 'buy-more', 'yours'] as const;
export type SignKind = (typeof SIGN_KINDS)[number];

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

/** A sale sign: 1.5 m wide and 75 cm tall on floor 1, its middle 1.5 m up. */
const SIGN: BoardShape = { width: 0.3, height: 0.15, hungAt: 0.3 };

/** The board of `sign` in `room`, placed at `place` in the eye's frame. */
export const signFacets = (
  mount: SignMount,
  room: Room,
  place: Placed,
): Facet[] => boardFacets(mount, SIGN, room, place);

/** The post under `sign`, if it stands on one. */
export const signPost = (mount: SignMount, room: Room, place: Placed): Quad[] =>
  boardPost(mount, SIGN, room, place);
