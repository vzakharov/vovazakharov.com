import {
  isOpenEast,
  isOpenSouth,
  maze,
  planted,
  type RolledMaze,
  roomKey,
  roomsAcross,
} from '@/cube/entities/world';

/**
 * The walls a body collides with, asked one wall at a time. A wall touching a
 * room outside floor `n` — the floor's outer boundary, or anything past it —
 * is closed, so callers ask about any neighbour without bounds checks.
 */
export type Walls = {
  /** The wall between `(x, y)` and `(x + 1, y)`. */
  isOpenEast: (n: number, x: bigint, y: bigint) => boolean;
  /** The wall between `(x, y)` and `(x, y + 1)`. */
  isOpenSouth: (n: number, x: bigint, y: bigint) => boolean;
};

/** Walls remembered at once; a walk re-reads the same handful every frame. */
const CACHE_SIZE = 1024;

type Predicate = typeof isOpenEast;
type Wall = Walls['isOpenEast'];

function cached(rolled: RolledMaze, predicate: Predicate): Wall {
  const memo = new Map<string, boolean>();
  return (n, x, y) => {
    const key = roomKey({ n, x, y });
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const open = predicate(rolled, n, x, y);
    if (memo.size >= CACHE_SIZE) memo.clear();
    memo.set(key, open);
    return open;
  };
}

const isRoom = (n: number, x: bigint, y: bigint): boolean => {
  const rooms = roomsAcross(n);
  return x >= 0n && y >= 0n && x < rooms && y < rooms;
};

/** `rolled`'s walls, each hashed once while it stays in the cache. */
function mazeWalls(rolled: RolledMaze): Walls {
  const east = cached(rolled, isOpenEast);
  const south = cached(rolled, isOpenSouth);
  return {
    isOpenEast: (n, x, y) =>
      isRoom(n, x, y) && isRoom(n, x + 1n, y) && east(n, x, y),
    isOpenSouth: (n, x, y) =>
      isRoom(n, x, y) && isRoom(n, x, y + 1n) && south(n, x, y),
  };
}

/** The planted world's maze. */
export const plantedMaze = maze(planted.seed);

/** The planted world's walls. */
export const plantedWalls: Walls = mazeWalls(plantedMaze);
