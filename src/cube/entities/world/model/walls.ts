import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';
import { isRoom, roomKey } from './room';

/**
 * A floor's walls, asked one wall at a time. A wall touching a room outside
 * floor `n` — the floor's outer boundary, or anything past it — is closed, so
 * callers ask about any neighbour without bounds checks.
 */
export type Walls = {
  /** The wall between `(x, y)` and `(x + 1, y)`. */
  isOpenEast: (n: number, x: bigint, y: bigint) => boolean;
  /** The wall between `(x, y)` and `(x, y + 1)`. */
  isOpenSouth: (n: number, x: bigint, y: bigint) => boolean;
};

/** Walls remembered at once: a frame's walk or a room's sight re-reads its own. */
const CACHE_SIZE = 4096;

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

/** `rolled`'s walls, each hashed once while it stays in the cache. */
export function mazeWalls(rolled: RolledMaze): Walls {
  const east = cached(rolled, isOpenEast);
  const south = cached(rolled, isOpenSouth);
  return {
    isOpenEast: (n, x, y) =>
      isRoom(n, x, y) && isRoom(n, x + 1n, y) && east(n, x, y),
    isOpenSouth: (n, x, y) =>
      isRoom(n, x, y) && isRoom(n, x, y + 1n) && south(n, x, y),
  };
}
