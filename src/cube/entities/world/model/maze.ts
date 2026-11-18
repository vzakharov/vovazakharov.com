import { pathHash, roll, type Rolled, rollWith } from '@/dice/shared/roll';

import { type Cell, roomsAcross } from './room';

const blockKey = roll.key({
  n: roll.int,
  level: roll.int,
  x: roll.big,
  y: roll.big,
});

/** A block's inner walls, named for the half of a midline each one sits in. */
export const EDGES = ['north', 'east', 'south', 'west'] as const;
type Edge = (typeof EDGES)[number];

const edgeKey = roll.key(EDGES);

const Maze = roll.struct({
  block: roll.over(
    blockKey,
    roll.struct({
      omit: roll.pick(EDGES.length),
      door: roll.over(edgeKey, roll.wide()),
    }),
  ),
  // At most one doorway per partition, so its door-or-gap `kind` is rolled
  // once for the partition rather than for each wall.
  doorway: roll.over(
    blockKey,
    roll.over(
      edgeKey,
      roll.struct({
        has: roll.uniform(0, 1),
        at: roll.wide(),
        kind: roll.uniform(0, 1),
      }),
    ),
  ),
  portal: roll.struct({
    // One round function of a floor's site permutation, two draws wide
    // because the last floor's halves pass 64 bits.
    mix: roll.over(
      roll.key({ n: roll.int, round: roll.int, half: roll.big }),
      roll.struct({ high: roll.wide(), low: roll.wide() }),
    ),
    wall: roll.over(blockKey, roll.over(edgeKey, roll.wide())),
    // Where hub `hub` of floor `n` leads during tick `tick` of cycle `cycle`.
    hub: roll.over(
      roll.key({ n: roll.int, hub: roll.big, cycle: roll.int, tick: roll.int }),
      roll.struct({ floor: roll.wide(), spoke: roll.wide() }),
    ),
  }),
});

export type RolledMaze = Rolled<typeof Maze>;

/** The maze of floors under `seed`, a world number (`dice`'s rule). */
export const maze = (seed: string): RolledMaze =>
  rollWith(Maze, pathHash(seed));

/** How many bits a `roll.wide()` door draw spans. */
export const WIDE_BITS = 64n;

/**
 * The deepest floor whose every door the draw places exactly: floor `n`'s
 * longest half-edge is `2^(n-2)` rooms. Floor 67 is the first past it, and is
 * refused whole rather than walled coarsely; the game ends there by design.
 */
export const DEEPEST_FLOOR = Number(WIDE_BITS) + 2;

type Block = Parameters<RolledMaze['block']['at']>[0];

/**
 * One arm of a block's cross — a partition: a run of `2^(level-1)` walls,
 * offset 0 at the end nearer the origin, holding the native passage unless the
 * block omits it.
 */
export type Partition = Block & { arm: Edge };

/** A key naming one partition, for maps of partitions. */
export const partitionKey = ({ n, level, x, y, arm }: Partition): string =>
  `${n}/${level}/${x}/${y}/${arm}`;

/** A wall, named by the room west (`east`) or north (`south`) of it. */
export type Wall = Cell & { across: 'east' | 'south' };

/** How far along its partition a wall sits. */
export type Along = { offset: bigint };

/** Where a wall sits: its partition, and how far along it. */
export type Spot = Along & { partition: Partition };

/** How many walls a partition of a block at `level` holds. */
export const halfOf = (level: number): bigint => 1n << BigInt(level - 1);

/** A `roll.wide()` draw scaled to an integer uniform on `[0, count)`. */
export const drawBelow = (wide: bigint, count: bigint): bigint =>
  (wide * count) >> WIDE_BITS;

/** One more than the run of one-bits at the bottom of `value`. */
function levelOf(value: bigint): number {
  let level = 1;
  while (((value >> BigInt(level - 1)) & 1n) === 1n) level += 1;
  return level;
}

function side(n: number, x: bigint, y: bigint): bigint {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Not a floor: ${n}`);
  if (n > DEEPEST_FLOOR) {
    throw new RangeError(
      `Floor ${n}'s doors need ${n - 2} bits; roll.wide() has ${WIDE_BITS}`,
    );
  }
  const rooms = roomsAcross(n);
  if (x < 0n || y < 0n || x >= rooms || y >= rooms) {
    throw new Error(`Not a room of floor ${n}: (${x}, ${y})`);
  }
  return rooms;
}

/** The block at `level` that holds room `(x, y)` of floor `n`. */
const blockAt = (n: number, level: number, x: bigint, y: bigint): Block => ({
  n,
  level,
  x: x >> BigInt(level),
  y: y >> BigInt(level),
});

/**
 * Where an inner wall of floor `n` sits, from that wall alone: its block is at
 * the level where the two rooms' coordinates across it first differ, and the
 * coordinate along it picks the half of the midline and the place in it.
 */
export function spotOf(n: number, { across, x, y }: Wall): Spot {
  const rooms = side(n, x, y);
  if (across === 'east') {
    if (x + 1n >= rooms) throw new Error(`No wall east of (${x}, ${y})`);
    return spotIn(blockAt(n, levelOf(x), x, y), y, 'north', 'south');
  }
  if (y + 1n >= rooms) throw new Error(`No wall south of (${x}, ${y})`);
  return spotIn(blockAt(n, levelOf(y), x, y), x, 'west', 'east');
}

function spotIn(block: Block, along: bigint, first: Edge, second: Edge): Spot {
  const half = halfOf(block.level);
  const inBlock = along & ((half << 1n) - 1n);
  const inFirst = inBlock < half;
  return {
    partition: { ...block, arm: inFirst ? first : second },
    offset: inFirst ? inBlock : inBlock - half,
  };
}

/** Whether `arm` runs out from its block's centre rather than into it. */
const runsOut = (arm: Edge): boolean => arm === 'south' || arm === 'east';

/** The wall `offset` along `partition`: `spotOf`'s inverse. */
export function wallOf(partition: Partition, offset: bigint): Wall {
  const { level, arm } = partition;
  const half = halfOf(level);
  const x = partition.x << BigInt(level);
  const y = partition.y << BigInt(level);
  const along = (runsOut(arm) ? half : 0n) + offset;
  return arm === 'north' || arm === 'south'
    ? { across: 'east', x: x + half - 1n, y: y + along }
    : { across: 'south', x: x + along, y: y + half - 1n };
}

/** The offset of the wall at `partition`'s end in its block's centre. */
export const centreEnd = ({ level, arm }: Partition): bigint =>
  runsOut(arm) ? 0n : halfOf(level) - 1n;

/** The offset of `partition`'s native passage; null on the arm its block omits. */
export function passageOf(
  rolled: RolledMaze,
  partition: Partition,
): bigint | null {
  const { omit, door } = rolled.block.at(partition);
  if (EDGES[omit] === partition.arm) return null;
  return drawBelow(door.at(partition.arm), halfOf(partition.level));
}

const isOpen = (rolled: RolledMaze, { partition, offset }: Spot): boolean =>
  passageOf(rolled, partition) === offset;

/**
 * Whether the wall between `(x, y)` and `(x + 1, y)` is a passage of floor
 * `n`'s native maze: the wall's block keeps its partition, and the passage
 * sits at this row.
 */
export const isOpenEast = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): boolean => isOpen(rolled, spotOf(n, { across: 'east', x, y }));

/** Whether the wall between `(x, y)` and `(x, y + 1)` is a native passage. */
export const isOpenSouth = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): boolean => isOpen(rolled, spotOf(n, { across: 'south', x, y }));
