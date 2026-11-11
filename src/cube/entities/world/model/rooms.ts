import type { Pose } from './pose';
import { type FloorRoom, roomKey } from './room';

/** The rooms an eye can see, by the part each plays in its picture. */
export type View = {
  /** Floor `n`'s rooms within the radius, the eye's own included. */
  near: readonly FloorRoom[];
  /** Floor `n + 1`'s rooms under `near`, seen through the floor's hole. */
  below: readonly FloorRoom[];
  /** Floor `n − 1`'s rooms over `near`, whose slab is `near`'s ceiling. */
  above: readonly FloorRoom[];
  /** The room over the eye's, seen through the ceiling's hole. */
  overhead: FloorRoom | null;
  /** The room whose slab is `overhead`'s ceiling; null where that is the lid. */
  topmost: FloorRoom | null;
};

const unique = (rooms: readonly FloorRoom[]): FloorRoom[] => [
  ...new Map(rooms.map((room) => [roomKey(room), room])).values(),
];

const parent = ({ n, x, y }: FloorRoom): FloorRoom => ({
  n: n - 1,
  x: x >> 1n,
  y: y >> 1n,
});

const children = ({ n, x, y }: FloorRoom): FloorRoom[] =>
  [0n, 1n].flatMap((j) =>
    [0n, 1n].map((i) => ({ n: n + 1, x: 2n * x + i, y: 2n * y + j })),
  );

/**
 * What an eye at `pose` sees of a cube of `floors` floors: floor `n`'s rooms
 * within `radius` rooms of its own (a square, clipped to the cube), the floors
 * above and below them that its holes open onto.
 */
export function view(pose: Pose, radius: number, floors: number): View {
  const rooms = 1n << BigInt(pose.n - 1);
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
    below: n < floors ? near.flatMap((room) => children(room)) : [],
    above: overhead === null ? [] : unique(near.map((room) => parent(room))),
    overhead,
    topmost: overhead !== null && overhead.n > 1 ? parent(overhead) : null,
  };
}

/** Every room whose slab the view draws, so whose hole it has to know. */
export const slabRooms = ({
  near,
  below,
  above,
  topmost,
}: View): FloorRoom[] => [
  ...near,
  ...below,
  ...above,
  ...(topmost === null ? [] : [topmost]),
];
