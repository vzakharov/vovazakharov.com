import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CubeCell } from '@/island/shared/globe';

import { indicesOutside } from './piece-indices';

const GRID = 5;
const tile: CubeCell = { face: 'pz', level: 3, x: 2, y: 5 };

/** Two triangles a lattice cell, row by row from the south-west. */
const lattice = Array.from({ length: (GRID - 1) ** 2 }, (_, c) => {
  const v = Math.floor(c / (GRID - 1)) * GRID + (c % (GRID - 1));
  return [v, v + 1, v + GRID + 1, v, v + GRID + 1, v + GRID];
}).flat();

/** The lattice cells, `[column, row]`, that `indices`' triangles sit in. */
const cellsOf = (indices: Uint32Array) =>
  new Set(
    Array.from({ length: indices.length / 3 }, (_, t) => {
      const corners = [0, 1, 2].map((k) => indices[3 * t + k] ?? 0);
      const i = Math.min(...corners.map((v) => v % GRID));
      const j = Math.min(...corners.map((v) => Math.floor(v / GRID)));
      return `${i},${j}`;
    }),
  );

describe('indicesOutside', () => {
  it('keeps every triangle with nothing cut', () => {
    assert.deepEqual([...indicesOutside(lattice, GRID, tile, [])], lattice);
  });

  it('cuts the quarter a child covers, in its corner', () => {
    // The north-east child: lattice cells 2–3 east and north.
    const child = { face: 'pz', level: 4, x: 5, y: 11 } as const;
    const kept = cellsOf(indicesOutside(lattice, GRID, tile, [child]));
    assert.equal(kept.size, 12);
    for (const cell of ['2,2', '3,2', '2,3', '3,3']) {
      assert.ok(!kept.has(cell), cell);
    }
  });

  it('cuts one lattice cell for a grandchild, and a skirt under it', () => {
    // The south-west grandchild: lattice cell 0,0; skirt vertex 0 hangs under
    // the south-west corner.
    const grandchild = { face: 'pz', level: 5, x: 8, y: 20 } as const;
    const skirt = [0, GRID * GRID, 1];
    const kept = indicesOutside([...lattice, ...skirt], GRID, tile, [
      grandchild,
    ]);
    assert.equal(kept.length, lattice.length - 6);
    assert.ok(!cellsOf(kept).has('0,0'));
  });
});
