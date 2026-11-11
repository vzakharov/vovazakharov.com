import { pathHash, roll, type Rolled, rollWith } from '@/dice/shared/roll';

import { roomsAcross } from './room';

const blockKey = roll.key({
  n: roll.int,
  level: roll.int,
  x: roll.big,
  y: roll.big,
});

/** A block's inner walls, named for the half of a midline each one sits in. */
const EDGES = ['north', 'east', 'south', 'west'] as const;
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
});

export type RolledMaze = Rolled<typeof Maze>;

/** The maze of floors under `seed`, a world number (`dice`'s rule). */
export const maze = (seed: string): RolledMaze =>
  rollWith(Maze, pathHash(seed));

/** How many bits a `roll.wide()` door draw spans. */
const WIDE_BITS = 64n;

/**
 * The deepest floor whose every door the draw places exactly: floor `n`'s
 * longest half-edge is `2^(n-2)` rooms. Floor 67 is the first past it, and is
 * refused whole rather than walled coarsely; the game ends there by design.
 */
const DEEPEST = Number(WIDE_BITS) + 2;

type Block = Parameters<RolledMaze['block']['at']>[0];

/** A door's position along a half-edge of `2^(level-1)` rooms. */
const doorOffset = (wide: bigint, level: number): bigint =>
  (wide * (1n << BigInt(level - 1))) >> WIDE_BITS;

/** One more than the run of one-bits at the bottom of `value`. */
function levelOf(value: bigint): number {
  let level = 1;
  while (((value >> BigInt(level - 1)) & 1n) === 1n) level += 1;
  return level;
}

function side(n: number, x: bigint, y: bigint): bigint {
  if (!Number.isInteger(n) || n < 1) throw new Error(`Not a floor: ${n}`);
  if (n > DEEPEST) {
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
 * Whether the wall between `(x, y)` and `(x + 1, y)` is open on floor `n`,
 * decided from that wall alone: its block is at the level where `x` and `x + 1`
 * first differ, and the wall is open iff the block keeps that half-edge and its
 * door sits at this row.
 */
export function isOpenEast(
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): boolean {
  if (x + 1n >= side(n, x, y)) throw new Error(`No wall east of (${x}, ${y})`);
  return isOpenAt(rolled, blockAt(n, levelOf(x), x, y), y, 'north', 'south');
}

/** Whether the wall between `(x, y)` and `(x, y + 1)` is open on floor `n`. */
export function isOpenSouth(
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): boolean {
  if (y + 1n >= side(n, x, y)) {
    throw new Error(`No wall south of (${x}, ${y})`);
  }
  return isOpenAt(rolled, blockAt(n, levelOf(y), x, y), x, 'west', 'east');
}

// `along` is the coordinate running along the wall: it picks the half of the
// midline and the position in it.
function isOpenAt(
  rolled: RolledMaze,
  block: Block,
  along: bigint,
  first: Edge,
  second: Edge,
): boolean {
  const half = 1n << BigInt(block.level - 1);
  const inBlock = along & ((half << 1n) - 1n);
  const inFirst = inBlock < half;
  const { omit, door } = rolled.block.at(block);
  const edge = inFirst ? first : second;
  if (EDGES[omit] === edge) return false;
  const offset = inFirst ? inBlock : inBlock - half;
  return doorOffset(door.at(edge), block.level) === offset;
}
