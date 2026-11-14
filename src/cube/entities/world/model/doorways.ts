import { isOpenEast, isOpenSouth, type RolledMaze } from './maze';

/**
 * What stands between two neighbouring rooms: the maze's own `passage` or
 * `wall`, or a doorway cut into a wall — a `door`, closed until opened, or a
 * `gap`, a missing wall nobody can tell from a passage.
 */
export const WALL_KINDS = ['wall', 'passage', 'door', 'gap'] as const;
export type WallKind = (typeof WALL_KINDS)[number];

const nativeKind = (open: boolean): WallKind => (open ? 'passage' : 'wall');

/** The kind of the wall between `(x, y)` and `(x + 1, y)` on floor `n`. */
export const eastKind = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): WallKind => nativeKind(isOpenEast(rolled, n, x, y));

/** The kind of the wall between `(x, y)` and `(x, y + 1)` on floor `n`. */
export const southKind = (
  rolled: RolledMaze,
  n: number,
  x: bigint,
  y: bigint,
): WallKind => nativeKind(isOpenSouth(rolled, n, x, y));

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
