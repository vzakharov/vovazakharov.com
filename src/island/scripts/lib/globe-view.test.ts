import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sphereTransform } from '@/island/entities/terrain';

import { globeSamples, OFF_DISK } from './globe-view';

const { grid } = sphereTransform(63);
const { rows, columns } = grid;
const SIZE = 101;
const MIDDLE = 50;
const at = (cells: Int32Array, row: number, col: number) => {
  const cell = cells[row * SIZE + col] ?? OFF_DISK;
  return { ring: Math.floor(cell / columns), column: cell % columns, cell };
};

describe('globeSamples', () => {
  const front = globeSamples(grid, { lat: 0, lon: 0 }, SIZE);

  it('leaves the corners off the disk', () => {
    assert.equal(at(front, 0, 0).cell, OFF_DISK);
    assert.equal(at(front, SIZE - 1, SIZE - 1).cell, OFF_DISK);
  });

  it('puts the centre on the equator at its longitude', () => {
    const { ring, column } = at(front, MIDDLE, MIDDLE);
    assert.ok(ring === rows / 2 - 1 || ring === rows / 2);
    assert.equal(column, 0);
    const back = globeSamples(grid, { lat: 0, lon: Math.PI }, SIZE);
    assert.equal(at(back, MIDDLE, MIDDLE).column, columns / 2);
  });

  it('draws east to the right and north up', () => {
    // u = 0.7: longitude asin(0.7) ≈ 44.4° east of the centre.
    const col = Math.round(((0.7 + 1) * SIZE) / 2 - 0.5);
    const u = (2 * (col + 0.5)) / SIZE - 1;
    const east = Math.round((Math.asin(u) / (2 * Math.PI)) * columns);
    assert.equal(at(front, MIDDLE, col).column, east);
    assert.equal(at(front, MIDDLE, SIZE - 1 - col).column, columns - east);
    assert.ok(at(front, 10, MIDDLE).ring < rows / 4);
    assert.ok(at(front, SIZE - 11, MIDDLE).ring > (3 * rows) / 4);
  });

  it('puts the pole at the centre of a view from over it', () => {
    const north = globeSamples(grid, { lat: Math.PI / 2, lon: 0 }, SIZE);
    assert.equal(at(north, MIDDLE, MIDDLE).ring, 0);
  });
});
