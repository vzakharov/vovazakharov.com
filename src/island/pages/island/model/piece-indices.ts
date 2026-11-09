import type { CubeCell } from '@/island/shared/globe';
import { borderLoop } from '@/island/entities/terrain';

/**
 * The triangles of a tile mesh's `indices` (a `grid`-vertex lattice and its
 * skirt, as `TileMesh` lays them out) not wholly inside the finer tiles
 * `except` inside `key`. Every triangle lies in one lattice cell, so it goes
 * when its cell lies in an `except` tile; a tile finer than a cell cuts
 * nothing, and the stand-in draws behind it instead.
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
  /** Whether each lattice cell, row by row from the south-west, lies in a cut tile. */
  const cut = new Uint8Array(cells * cells);
  for (const { level, x, y } of except) {
    const n = 2 ** (level - key.level);
    if (cells % n !== 0) continue;
    const span = cells / n;
    const i0 = (x - key.x * n) * span;
    const j0 = (y - key.y * n) * span;
    for (let j = j0; j < j0 + span; j++)
      cut.fill(1, j * cells + i0, j * cells + i0 + span);
  }
  /** Lattice index of vertex `v`, a skirt vertex at its border vertex's. */
  const spot = (v: number): number =>
    v < lattice ? v : (loop[v - lattice] ?? 0);
  const kept: number[] = [];
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = indices[t] ?? 0;
    const b = indices[t + 1] ?? 0;
    const c = indices[t + 2] ?? 0;
    const corners = [spot(a), spot(b), spot(c)];
    const u = corners.reduce((sum, at) => sum + (at % grid), 0) / 3;
    const v = corners.reduce((sum, at) => sum + Math.floor(at / grid), 0) / 3;
    const ci = Math.min(cells - 1, Math.floor(u));
    const cj = Math.min(cells - 1, Math.floor(v));
    if (cut[cj * cells + ci] !== 1) kept.push(a, b, c);
  }
  return Uint32Array.from(kept);
}
