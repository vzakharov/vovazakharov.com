import type { HoleOf } from './hole';
import type { Pose } from './pose';
import { type Room, roomKey, roomsAcross } from './room';

/** What an eye sees on its own floor and up, which no hole decides. */
export type Sight = {
  /** Floor `n`'s rooms within the radius, the eye's own included. */
  near: readonly Room[];
  /** Floor `n − 1`'s rooms over `near`, whose slab is `near`'s ceiling. */
  above: readonly Room[];
  /** The room over the eye's, seen through the ceiling's hole. */
  overhead: Room | null;
  /** The room whose slab is `overhead`'s ceiling; null where that is the lid. */
  topmost: Room | null;
};

/** The rooms an eye can see, by the part each plays in its picture. */
export type View = Sight & {
  /** Floor `n + 1`'s rooms under `near`'s holes, the only way down the eye sees. */
  below: readonly Room[];
};

const unique = (rooms: readonly Room[]): Room[] => [
  ...new Map(rooms.map((room) => [roomKey(room), room])).values(),
];

const parent = ({ n, x, y }: Room): Room => ({
  n: n - 1,
  x: x >> 1n,
  y: y >> 1n,
});

const children = ({ n, x, y }: Room): Room[] =>
  [0n, 1n].flatMap((j) =>
    [0n, 1n].map((i) => ({ n: n + 1, x: 2n * x + i, y: 2n * y + j })),
  );

/**
 * What an eye at `pose` sees on its floor and up: floor `n`'s rooms within
 * `radius` rooms of its own (a square, clipped to the cube) and the floors
 * above them that its holes open onto.
 */
export function sight(pose: Pose, radius: number): Sight {
  const rooms = roomsAcross(pose.n);
  const reach = BigInt(radius);
  const span = (at: bigint): bigint[] => {
    const from = at - reach < 0n ? 0n : at - reach;
    const to = at + reach >= rooms ? rooms - 1n : at + reach;
    return Array.from(
      { length: Number(to - from) + 1 },
      (_, i) => from + BigInt(i),
    );
  };
  const { n, x: eastOf, y: southOf } = pose;
  const near = span(southOf).flatMap((y) =>
    span(eastOf).map((x) => ({ n, x, y })),
  );
  const overhead = n > 1 ? parent(pose) : null;
  return {
    near,
    above: overhead === null ? [] : unique(near.map((room) => parent(room))),
    overhead,
    topmost: overhead !== null && overhead.n > 1 ? parent(overhead) : null,
  };
}

/**
 * `seen` and the floor under it, which shows only through a hole: the children
 * of each near room that has one. A room `holeOf` gives none — the last floor's
 * every room — adds nothing, so a floor past the last is never asked for.
 */
export const withBelow = (seen: Sight, holeOf: HoleOf): View => ({
  ...seen,
  below: seen.near
    .filter((room) => holeOf(room) !== null)
    .flatMap((room) => children(room)),
});

/** Every room whose slab `seen` draws, so whose hole it has to know. */
export const slabRooms = ({ near, above, topmost }: Sight): Room[] => [
  ...near,
  ...above,
  ...(topmost === null ? [] : [topmost]),
];
