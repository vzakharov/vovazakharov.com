import { isPassableEast, isPassableSouth } from './doorways';
import type { RolledMaze } from './maze';
import { memo } from './memo';
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

type Predicate = typeof isPassableEast;
type Wall = Walls['isOpenEast'];

function cached(rolled: RolledMaze, predicate: Predicate): Wall {
  const kept = memo<boolean>();
  return (n, x, y) =>
    kept(roomKey({ n, x, y }), () => predicate(rolled, n, x, y));
}

/** `rolled`'s walls, each hashed once while it stays in the cache. */
export function mazeWalls(rolled: RolledMaze): Walls {
  const east = cached(rolled, isPassableEast);
  const south = cached(rolled, isPassableSouth);
  return {
    isOpenEast: (n, x, y) =>
      isRoom(n, x, y) && isRoom(n, x + 1n, y) && east(n, x, y),
    isOpenSouth: (n, x, y) =>
      isRoom(n, x, y) && isRoom(n, x, y + 1n) && south(n, x, y),
  };
}
