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

  it('cuts a child’s quarter but a one-cell rim inside the tile', () => {
    // The north-east child: lattice cells 2–3 east and north; only 3,3 has
    // every neighbour inside the tile cut.
    const child = { face: 'pz', level: 4, x: 5, y: 11 } as const;
    const kept = cellsOf(indicesOutside(lattice, GRID, tile, [child]));
    assert.equal(kept.size, 15);
    assert.ok(!kept.has('3,3'));
  });

  it('cuts every cell and skirt when the children cover the whole tile', () => {
    const children = [4, 5].flatMap((x) =>
      [10, 11].map((y) => ({ face: 'pz', level: 4, x, y }) as const),
    );
    const skirt = [0, GRID * GRID, 1];
    const kept = indicesOutside([...lattice, ...skirt], GRID, tile, children);
    assert.equal(kept.length, 0);
  });

  it('keeps the rim along what is left uncut', () => {
    // Every child but the north-west: cells 0–1 west, 2–3 north stay, and the
    // cut cells touching them.
    const three = [
      { face: 'pz', level: 4, x: 4, y: 10 },
      { face: 'pz', level: 4, x: 5, y: 10 },
      { face: 'pz', level: 4, x: 5, y: 11 },
    ] as const;
    const kept = cellsOf(indicesOutside(lattice, GRID, tile, three));
    assert.deepEqual([...kept].toSorted(), [
      '0,1',
      '0,2',
      '0,3',
      '1,1',
      '1,2',
      '1,3',
      '2,1',
      '2,2',
      '2,3',
    ]);
  });

  it('cuts nothing for a tile finer than a lattice cell, which no triangle lies wholly in', () => {
    // A quarter of lattice cell 0,0.
    const fine = { face: 'pz', level: 6, x: 16, y: 40 } as const;
    assert.deepEqual([...indicesOutside(lattice, GRID, tile, [fine])], lattice);
  });
});
