import type { Doored } from './doorway';
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
  sidesOf,
  type SignMount,
} from './mount';
import type { Facet, Quad } from './quad';
import { type InRoomOf, type Room, roomKey } from './room';
import { stepped, type View } from './rooms';

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

/** Floor 2's one room for sale, in кубики: the rate every floor's is set by. */
const FLOOR_TWO_PRICE = 10_000_000;

/** No room sells for less, however small: floor 9's and every one below. */
const LOWEST_PRICE = 5;

/** Digits a price keeps: a game's prices read as round numbers. */
const PRICE_DIGITS = 3;

/**
 * A room of floor `n`'s price, in whole кубики to three significant figures.
 * Every floor's room is an eighth of the volume of the floor above's, so down
 * to the lowest price this is one price per cubic metre, rounding aside.
 */
export const priceOf = (n: number): number =>
  Math.max(
    Math.round(
      Number((FLOOR_TWO_PRICE / 8 ** (n - 2)).toPrecision(PRICE_DIGITS)),
    ),
    LOWEST_PRICE,
  );

/**
 * `room`'s sign, given the rooms the viewer `bought` and `isEnd`, which says
 * whether a room is its floor's landing room — the one the floor above's hole
 * drops a body into — or its holed room. A bought room's sign reads as its own
 * where it hung. Otherwise a room on floor 2 and below is for sale when every
 * side of it but at most one is a closed wall or opens onto a bought room, the
 * floor's boundary and a door counting as wall, and it is neither end; it reads "buy
 * more" when it adjoins a bought room. With nothing bought those are dead
 * ends, and no room of any path from landing to hole can ever sell: its two
 * ends never do, so each room between keeps two openings on sale. `isEnd` is
 * asked only of a room the walls alone leave for sale.
 */
export function lotSign(
  walls: Doored,
  bought: Holdings,
  room: Room,
  isEnd: (room: Room) => boolean,
): Sign | null {
  const own = bought.get(roomKey(room));
  if (own !== undefined) return { ...own, kind: 'yours' };
  if (room.n < 2) return null;
  const sides = sidesOf(walls, room).map(
    (side): Side =>
      side.is === 'open' && bought.has(roomKey(stepped(room, side.step)))
        ? { ...side, is: 'bought' }
        : side,
  );
  const openings = sides.filter((side) => side.is === 'open');
  if (openings.length > 1 || isEnd(room)) return null;
  return {
    ...farSide(sides, openings[0]),
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
  walls: Doored,
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

/** A sale sign: 1 m wide and 50 cm tall on floor 1, its middle 1.5 m up. */
const SIGN: BoardShape = { width: 0.2, height: 0.1, hungAt: 0.3 };

/** The board of the sign at `mount` in `room`, at `place` in the eye's frame. */
export const signFacets = (
  mount: SignMount,
  room: Room,
  place: Placed,
): Facet[] => boardFacets(mount, SIGN, room, place);

/** The post under the sign hung at `mount`, if it stands on one. */
export const signPost = (mount: SignMount, room: Room, place: Placed): Quad[] =>
  boardPost(mount, SIGN, room, place);
