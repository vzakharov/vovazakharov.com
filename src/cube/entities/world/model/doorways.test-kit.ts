import { eastKind, southKind, type WallKind } from './doorways';
import { isOpenEast, isOpenSouth, type RolledMaze, type Wall } from './maze';

export const sideOf = (n: number): number => Number(1n << BigInt(n - 1));

/** Every inner wall of floor `n`, row by row. */
function everyWall(n: number): Wall[] {
  const side = BigInt(sideOf(n));
  const out: Wall[] = [];
  for (let y = 0n; y < side; y += 1n) {
    for (let x = 0n; x < side; x += 1n) {
      if (x + 1n < side) out.push({ across: 'east', x, y });
      if (y + 1n < side) out.push({ across: 'south', x, y });
    }
  }
  return out;
}

export type Kinded = Wall & { kind: WallKind };

/** Every inner wall of floor `n` with its kind. */
export const wallsOf = (rolled: RolledMaze, n: number): Kinded[] =>
  everyWall(n).map((wall) => ({
    ...wall,
    kind: (wall.across === 'east' ? eastKind : southKind)(
      rolled,
      n,
      wall.x,
      wall.y,
    ),
  }));

/** Every inner wall of floor `n`, open or not in the native maze. */
export const nativeWallsOf = (
  rolled: RolledMaze,
  n: number,
): Array<Wall & { isOpen: boolean }> =>
  everyWall(n).map((wall) => ({
    ...wall,
    isOpen: (wall.across === 'east' ? isOpenEast : isOpenSouth)(
      rolled,
      n,
      wall.x,
      wall.y,
    ),
  }));

/** The two rooms a wall of a `side`-wide floor joins, as `y · side + x`. */
export function roomsOf(
  { across, x, y }: Wall,
  side: number,
): [number, number] {
  const a = Number(y) * side + Number(x);
  return [a, across === 'east' ? a + 1 : a + side];
}

/** The rooms of floor `n` joined to each room through the walls `open` keeps. */
export function adjacency<W extends Wall>(
  n: number,
  walls: readonly W[],
  open: (wall: W) => boolean,
): number[][] {
  const side = sideOf(n);
  const adj = Array.from({ length: side * side }, (): number[] => []);
  for (const wall of walls) {
    if (!open(wall)) continue;
    const [a, b] = roomsOf(wall, side);
    adj[a]?.push(b);
    adj[b]?.push(a);
  }
  return adj;
}

/**
 * The walk round between any two rooms through the native maze, a tree: up
 * both rooms' ways to the root until they meet.
 */
export function treeDistance(
  adj: number[][],
): (a: number, b: number) => number {
  const parent = new Int32Array(adj.length).fill(-2);
  const depth = new Int32Array(adj.length);
  parent[0] = -1;
  const queue = [0];
  // A for-of over an array visits what is pushed onto it meanwhile.
  for (const u of queue) {
    for (const v of adj[u] ?? []) {
      if (parent[v] !== -2) continue;
      parent[v] = u;
      depth[v] = (depth[u] ?? 0) + 1;
      queue.push(v);
    }
  }
  const up = (r: number) => parent[r] ?? -1;
  const deep = (r: number) => depth[r] ?? 0;
  return (a, b) => {
    let [p, q, d] = [a, b, 0];
    while (deep(p) > deep(q)) [p, d] = [up(p), d + 1];
    while (deep(q) > deep(p)) [q, d] = [up(q), d + 1];
    while (p !== q) [p, q, d] = [up(p), up(q), d + 2];
    return d;
  };
}
