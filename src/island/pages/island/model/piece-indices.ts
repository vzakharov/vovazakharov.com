import type { CubeCell } from '@/island/shared/globe';
import { borderLoop } from '@/island/entities/terrain';

/**
 * The triangles of a tile mesh's `indices` (a `grid`-vertex lattice and its
 * skirt, as `TileMesh` lays them out) whose middle lies in none of the finer
 * tiles `except` inside `key`. A triangle wider than an `except` tile is kept
 * unless its middle falls in it, so a cut finer than the lattice overlaps the
 * finer tile by under one lattice cell.
 */
export function indicesOutside(
  indices: ArrayLike<number>,
  grid: number,
  key: CubeCell,
  except: readonly CubeCell[],
): Uint32Array {
  const cells = grid - 1;
  const loop = borderLoop(grid);
  const lattice = grid * grid;
  /** Lattice column and row of vertex `v`, a skirt vertex at its border vertex's. */
  const spot = (v: number): readonly [number, number] => {
    const at = v < lattice ? v : (loop[v - lattice] ?? 0);
    return [at % grid, Math.floor(at / grid)];
  };
  const cut = new Set(
    except.map(({ level, x, y }) => {
      const depth = level - key.level;
      return `${depth}/${x - key.x * 2 ** depth}/${y - key.y * 2 ** depth}`;
    }),
  );
  const depths = [...new Set(except.map(({ level }) => level - key.level))];
  const kept: number[] = [];
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const corners = [indices[t] ?? 0, indices[t + 1] ?? 0, indices[t + 2] ?? 0];
    const spots = corners.map((v) => spot(v));
    const u = spots.reduce((sum, [i]) => sum + i, 0) / 3 / cells;
    const v = spots.reduce((sum, [, j]) => sum + j, 0) / 3 / cells;
    const inCut = depths.some((depth) => {
      const n = 2 ** depth;
      const cx = Math.min(n - 1, Math.floor(u * n));
      const cy = Math.min(n - 1, Math.floor(v * n));
      return cut.has(`${depth}/${cx}/${cy}`);
    });
    if (!inCut) kept.push(...corners);
  }
  return Uint32Array.from(kept);
}
