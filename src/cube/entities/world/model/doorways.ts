import {
  type Along,
  centreEnd,
  drawBelow,
  halfOf,
  isOpenEast,
  isOpenSouth,
  type Partition,
  partitionKey,
  passageOf,
  type RolledMaze,
  spotOf,
  type Wall,
  wallOf,
} from './maze';
import { type Memo, memo } from './memo';
import { type Cell, isRoom } from './room';

/**
 * What stands between two neighbouring rooms: the maze's own `passage` or
 * `wall`, or a doorway cut into a wall — a `door`, closed until opened, or a
 * `gap`, a missing wall nobody can tell from a passage.
 */
const WALL_KINDS = ['wall', 'passage', 'door', 'gap'] as const;
export type WallKind = (typeof WALL_KINDS)[number];

/**
 * How a floor's doorways are placed. The numbers come from the doors analysis
 * on the cube board (stickies `doors-threshold` and `doors-roll`).
 */
export const DOORWAYS = {
  /**
   * The fewest steps through native passages between a wall's two rooms for
   * it to hold a doorway: ~50 doors and ~15 gaps an hour for an explorer
   * (`doorways-hour.test.ts`). A count of rooms, not a share of the floor,
   * so deep doorways stay as findable as shallow ones. Walk rounds are odd,
   * so 10 acts as 11.
   */
  threshold: 10,
  /**
   * The odds that a partition with an allowed wall gets a doorway. At 1 every
   * such partition gets one; it stays a number so it can be turned down.
   */
  density: 1,
  /** The odds that a doorway is a door; the rest are gaps. */
  doorShare: 0.75,
} as const;

const neighbours = ({ x, y }: Cell): Cell[] => [
  { x: x + 1n, y },
  { x: x - 1n, y },
  { x, y: y + 1n },
  { x, y: y - 1n },
];

/** Whether floor `n`'s native maze joins neighbouring rooms `a` and `b`. */
function isPassage(rolled: RolledMaze, n: number, a: Cell, b: Cell): boolean {
  if (!isRoom(n, b.x, b.y)) return false;
  const [lo, hi] = a.x + a.y < b.x + b.y ? [a, b] : [b, a];
  return lo.x === hi.x
    ? isOpenSouth(rolled, n, lo.x, lo.y)
    : isOpenEast(rolled, n, lo.x, lo.y);
}

const cellKey = ({ x, y }: Cell) => `${x}/${y}`;

/**
 * Whether the rooms either side of `wall` are fewer than `limit` steps apart
 * through floor `n`'s native passages: a breadth-first search `limit − 1`
 * deep, which never reads a doorway.
 */
function isNear(
  rolled: RolledMaze,
  n: number,
  { across, x, y }: Wall,
  limit: number,
): boolean {
  const target = cellKey(
    across === 'east' ? { x: x + 1n, y } : { x, y: y + 1n },
  );
  let frontier: Cell[] = [{ x, y }];
  const seen = new Set([cellKey({ x, y })]);
  for (let steps = 1; steps < limit; steps += 1) {
    const next: Cell[] = [];
    for (const room of frontier) {
      for (const step of neighbours(room)) {
        const key = cellKey(step);
        if (seen.has(key) || !isPassage(rolled, n, room, step)) continue;
        if (key === target) return true;
        seen.add(key);
        next.push(step);
      }
    }
    frontier = next;
  }
  return false;
}

export const ascending = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The offsets along `partition` that may not hold a doorway, ascending: its
 * native passage, and every closed wall whose walk round is under `threshold`.
 * The walk round crosses the partition only at its passage, or turns the
 * centre end of a partition with none, so a wall `d` from that anchor walks
 * at least `2·d + 1`: only walls with less are searched, fewer than
 * `threshold` of them, so a partition of `2^58` walls costs no more than one
 * of ten.
 */
export function barredOf(
  rolled: RolledMaze,
  partition: Partition,
  threshold: number = DOORWAYS.threshold,
): bigint[] {
  const half = halfOf(partition.level);
  const passage = passageOf(rolled, partition);
  const anchor = passage ?? centreEnd(partition);
  const barred: bigint[] = [];
  for (let d = 0n; 2n * d + 1n < BigInt(threshold); d += 1n) {
    for (const offset of d === 0n ? [anchor] : [anchor - d, anchor + d]) {
      if (offset < 0n || offset >= half) continue;
      const near =
        offset === passage ||
        isNear(rolled, partition.n, wallOf(partition, offset), threshold);
      if (near) barred.push(offset);
    }
  }
  return barred.toSorted(ascending);
}

/**
 * The `index`-th offset not in `barred` (ascending), counting past each
 * barred offset at or below it.
 */
export function unbarred(index: bigint, barred: readonly bigint[]): bigint {
  let offset = index;
  for (const skip of barred) if (skip <= offset) offset += 1n;
  return offset;
}

/** A partition's one doorway: the wall it is cut into, and what it is. */
type Opening = Along & { isDoor: boolean };

function rollOpening(rolled: RolledMaze, partition: Partition): Opening | null {
  const { has, at, kind } = rolled.doorway.at(partition).at(partition.arm);
  if (has >= DOORWAYS.density) return null;
  const barred = barredOf(rolled, partition);
  const allowed = halfOf(partition.level) - BigInt(barred.length);
  if (allowed <= 0n) return null;
  return {
    offset: unbarred(drawBelow(at, allowed), barred),
    isDoor: kind < DOORWAYS.doorShare,
  };
}

const memos = new WeakMap<RolledMaze, Memo<Opening | null>>();

/**
 * `partition`'s doorway, decided from its own rolls and the native walls
 * around it alone, so no partition's answer depends on another's or on the
 * order they are asked in. Kept while it stays in the cache.
 */
function openingOf(rolled: RolledMaze, partition: Partition): Opening | null {
  const kept = memos.get(rolled) ?? memo<Opening | null>();
  memos.set(rolled, kept);
  return kept(partitionKey(partition), () => rollOpening(rolled, partition));
}

/** The offset of `partition`'s doorway, door or gap; null when it has none. */
export const doorwayOf = (
  rolled: RolledMaze,
  partition: Partition,
): bigint | null => openingOf(rolled, partition)?.offset ?? null;

function kindOf(rolled: RolledMaze, n: number, wall: Wall): WallKind {
  const { partition, offset } = spotOf(n, wall);
  if (passageOf(rolled, partition) === offset) return 'passage';
  const opening = openingOf(rolled, partition);
  if (opening?.offset !== offset) return 'wall';
  return opening.isDoor ? 'door' : 'gap';
}

/** The kind of the wall between `(x, y)` and `(x + 1, y)` on floor `n`. */
export const eastKind = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): WallKind => kindOf(rolled, n, { across: 'east', x, y });

/** The kind of the wall between `(x, y)` and `(x, y + 1)` on floor `n`. */
export const southKind = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): WallKind => kindOf(rolled, n, { across: 'south', x, y });

/** Whether a body walks and an eye sees through a wall of `kind` as it stands. */
export const isPassable = (kind: WallKind): boolean =>
  kind === 'passage' || kind === 'gap';

/** Whether the wall east of `(x, y)` lets a body and an eye through. */
export const isPassableEast = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): boolean => isPassable(eastKind(rolled, n, x, y));

/** Whether the wall south of `(x, y)` lets a body and an eye through. */
export const isPassableSouth = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): boolean => isPassable(southKind(rolled, n, x, y));
