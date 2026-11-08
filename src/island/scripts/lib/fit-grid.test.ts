import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CoastField } from '@/island/entities/terrain';

import { boxGrid, landOf, resample } from './fit-grid';

/** A 3 × 2 field whose value is `x + 10 y` metres, nodes 100 m apart. */
const field: CoastField = {
  originX: 0,
  originY: 0,
  cellMetres: 100,
  columns: 3,
  rows: 2,
  distance: Float32Array.from([0, 100, 200, 1000, 1100, 1200]),
};

describe('resample', () => {
  it('lands on the nodes exactly and is bilinear between them', () => {
    const values = resample(field, {
      originX: 0,
      originY: 0,
      cellMetres: 50,
      columns: 5,
      rows: 3,
    });
    for (let j = 0; j < 3; j += 1) {
      for (let i = 0; i < 5; i += 1) {
        assert.equal(values[j * 5 + i], 50 * i + 500 * j);
      }
    }
  });

  it('falls away by the distance past the field’s edge', () => {
    const [left] = resample(field, {
      originX: -300,
      originY: 0,
      cellMetres: 300,
      columns: 1,
      rows: 1,
    });
    assert.equal(left, -300);
    const [beyond] = resample(field, {
      originX: 500,
      originY: 400,
      cellMetres: 1,
      columns: 1,
      rows: 1,
    });
    assert.ok(Math.abs((beyond ?? 0) - (1200 - Math.hypot(300, 300))) < 1e-9);
  });
});

describe('boxGrid', () => {
  it('covers the box from its low corner, both ends included', () => {
    assert.deepEqual(boxGrid([10, 30], [-5, 0], 5), {
      originX: 10,
      originY: -5,
      cellMetres: 5,
      columns: 5,
      rows: 2,
    });
  });
});

describe('landOf', () => {
  it('marks the positive values', () => {
    assert.deepEqual([...landOf([-1, 0, 2, Number.NaN])], [0, 0, 1, 0]);
  });
});
