import type { HoleOf } from './hole';
import type { Pose } from './pose';
import { isRoom, type Room, roomKey } from './room';
import type { Walls } from './walls';

/** What an eye sees on its own floor and up, which no hole decides. */
export type Sight = {
  /** Floor `n`'s rooms in sight, the eye's own first. */
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

/** A point of the seat's frame: room sides from its north-west corner, x east, y south. */
type Point = readonly [number, number];

/**
 * The left normals still open to a straight line through every opening walked
 * so far, as an arc of angles `lo..hi`, no wider than half a turn. `'any'`
 * before the first opening.
 */
type Arc = { lo: number; hi: number } | 'any';

const TURN = 2 * Math.PI;
const QUARTER = Math.PI / 2;
/** How far a line may miss an opening's edge and still count as through it. */
const GRAZE = 1e-9;

const minus = ([ax, ay]: Point, [bx, by]: Point): Point => [ax - bx, ay - by];

const STEPS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] as const;
type Step = (typeof STEPS)[number];

/**
 * The arc whose normals `n` keep `n · w ≥ 0`, within `arc`; null once none do.
 * A half-turn arc meeting a half-plane is one arc, so `lo..hi` stays whole.
 */
function narrowed(arc: Arc, [wx, wy]: Point): Arc | null {
  if (Math.hypot(wx, wy) < GRAZE) return arc;
  const facing = Math.atan2(wy, wx);
  if (arc === 'any') return { lo: facing - QUARTER, hi: facing + QUARTER };
  const centre =
    facing + TURN * Math.round((arc.lo + arc.hi) / 2 / TURN - facing / TURN);
  const lo = Math.max(arc.lo, centre - QUARTER);
  const hi = Math.min(arc.hi, centre + QUARTER);
  return lo <= hi + GRAZE ? { lo, hi: Math.max(lo, hi) } : null;
}

/** `arc` narrowed by each of `ws` in turn; null once it closes. */
function narrowedAll(arc: Arc, ws: readonly Point[]): Arc | null {
  let open = arc;
  for (const w of ws) {
    const next = narrowed(open, w);
    if (next === null) return null;
    open = next;
  }
  return open;
}

/**
 * The wall crossed stepping by `[dx, dy]` from the room whose north-west
 * corner is `(east, south)`, as its two ends: the one left of the step first.
 */
function opening(east: number, south: number, [dx, dy]: Step): [Point, Point] {
  if (dx === 0) {
    const y = south + (dy > 0 ? 1 : 0);
    return dy > 0
      ? [
          [east, y],
          [east + 1, y],
        ]
      : [
          [east + 1, y],
          [east, y],
        ];
  }
  const x = east + (dx > 0 ? 1 : 0);
  return dx > 0
    ? [
        [x, south + 1],
        [x, south],
      ]
    : [
        [x, south],
        [x, south + 1],
      ];
}

/** The room one step from `room` towards `[dx, dy]`. */
const stepped = ({ n, x, y }: Room, [dx, dy]: Step): Room => ({
  n,
  x: x + BigInt(dx),
  y: y + BigInt(dy),
});

/** Whether the wall from `room` towards `[dx, dy]` is open. */
function opens(walls: Walls, { n, x, y }: Room, [dx, dy]: Step): boolean {
  if (dx === 1) return walls.isOpenEast(n, x, y);
  if (dx === -1) return walls.isOpenEast(n, x - 1n, y);
  if (dy === 1) return walls.isOpenSouth(n, x, y);
  return walls.isOpenSouth(n, x, y - 1n);
}

/** How far the room at `(east, south)` lies from the seat, at its nearest. */
const gap = (east: number, south: number): number =>
  Math.hypot(Math.max(0, Math.abs(east) - 1), Math.max(0, Math.abs(south) - 1));

/**
 * The rooms of `seat`'s floor some straight line from inside `seat` reaches
 * through open walls alone, none farther than `far` room sides from it.
 *
 * A line through a chain of openings, crossing each in the direction the walk
 * stepped, has each opening's left end on its left and right end on its
 * right, so its left normal `n` keeps `n · (left_i − right_j) ≥ 0` for every
 * pair of openings: each opening narrows the arc of normals by a half-plane
 * per opening before it, and a room whose arc closes is out of sight along
 * with everything past it. Every such line crosses the seat's own wall, so it
 * starts inside the seat; the set is what some eye anywhere in the seat sees.
 *
 * The maze is a tree, so each room has one walk from the seat and none is
 * expanded twice; the far bound and the closing arcs bound the walk.
 */
export function seenFrom(seat: Room, far: number, walls: Walls): Room[] {
  const { n } = seat;
  const seen = new Map<string, Room>();
  const walk = (
    room: Room,
    [east, south]: Point,
    arc: Arc,
    lefts: readonly Point[],
    rights: readonly Point[],
  ): void => {
    seen.set(roomKey(room), room);
    for (const step of STEPS) {
      const next = stepped(room, step);
      const at: Point = [east + step[0], south + step[1]];
      const inside = isRoom(n, next.x, next.y);
      if (!inside || seen.has(roomKey(next)) || gap(...at) > far) continue;
      if (!opens(walls, room, step)) continue;
      const [left, right] = opening(east, south, step);
      const open = narrowedAll(arc, [
        minus(left, right),
        ...lefts.map((before) => minus(before, right)),
        ...rights.map((before) => minus(left, before)),
      ]);
      if (open !== null) {
        walk(next, at, open, [...lefts, left], [...rights, right]);
      }
    }
  };
  walk(seat, [0, 0], 'any', [], []);
  return [...seen.values()];
}

/** The rooms `room` opens into on its floor. */
const openNeighbours = (walls: Walls, room: Room): Room[] =>
  STEPS.filter((step) => opens(walls, room, step)).map((step) =>
    stepped(room, step),
  );

/**
 * What an eye at `pose` sees on its floor and up: floor `n`'s rooms some line
 * of sight reaches through open walls, within `far` room sides, and the floors
 * above them that its holes open onto. Lines are taken from anywhere in the
 * eye's room or a room it opens into, so a mesh built on entering a room holds
 * wherever the eye goes until the next room's mesh replaces it.
 */
export function sight(pose: Pose, far: number, walls: Walls): Sight {
  const { n, x, y } = pose;
  const own: Room = { n, x, y };
  const near = unique(
    [own, ...openNeighbours(walls, own)].flatMap((seat) =>
      seenFrom(seat, far, walls),
    ),
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
