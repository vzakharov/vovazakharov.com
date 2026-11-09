import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { latLonToUnit } from '@/island/shared/globe';
import type { RingGrid } from '@/island/entities/terrain';

import { layersMask, polygonMask } from './earth-mask';
import type { GeoPolygon } from './natural-earth';

/** 36 rings of 5° bands, centres from 87.5° N down, and 72 columns of 5°. */
const ROWS = 36;
const COLUMNS = 72;
const GRID: RingGrid = {
  weights: new Float64Array(ROWS),
  rows: ROWS,
  columns: COLUMNS,
  x: Float64Array.from({ length: ROWS }, (_, ring) =>
    Math.sin(((87.5 - 5 * ring) * Math.PI) / 180),
  ),
};

const ringAt = (lat: number) => Math.round((87.5 - lat) / 5);

/** The node nearest `lat`, `lon` (degrees east), as the fit indexes it. */
function nodeAt(lat: number, lon: number): number {
  const j = ((Math.round(lon / 5) % COLUMNS) + COLUMNS) % COLUMNS;
  return ringAt(lat) * COLUMNS + j;
}

/** A closed lon/lat box, counter-clockwise. */
function box(
  west: number,
  south: number,
  east: number,
  north: number,
): GeoPolygon[number] {
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ];
}

const count = (mask: Uint8Array) => mask.reduce((sum, v) => sum + v, 0);

describe('polygonMask', () => {
  it('fills a square and nothing else', () => {
    const mask = polygonMask([[box(-12, -12, 12, 12)]], GRID);
    // Rings at ±7.5° and ±2.5°, columns at −10°, −5°, 0°, 5°, 10°.
    assert.equal(count(mask), 4 * 5);
    assert.equal(mask[nodeAt(2.5, 0)], 1);
    assert.equal(mask[nodeAt(2.5, 15)], 0);
    assert.equal(mask[nodeAt(17.5, 0)], 0);
  });

  it('reads east longitude as east: a mirrored Earth fails here', () => {
    const mask = polygonMask([[box(11, 37, 17, 43)]], GRID);
    const lat = 37.5;
    const columnAt = (lon: number) => Math.round((lon * COLUMNS) / 360);
    const east = ringAt(lat) * COLUMNS + columnAt(15);
    const west = ringAt(lat) * COLUMNS + COLUMNS - columnAt(15);
    assert.equal(mask[east], 1);
    assert.equal(mask[west], 0);
    // The fit places column j at lon 2πj/columns through latLonToUnit, whose
    // east is −Z: the land node must lie there.
    const lon = (2 * Math.PI * (east % COLUMNS)) / COLUMNS;
    const z = latLonToUnit({ lat: (lat * Math.PI) / 180, lon })[2];
    assert.ok(z < 0, `land node at z = ${z}, east is −Z`);
  });

  it('cuts a hole', () => {
    const mask = polygonMask(
      [[box(-22, -22, 22, 22), box(-8, -8, 8, 8)]],
      GRID,
    );
    assert.equal(mask[nodeAt(2.5, 0)], 0);
    assert.equal(mask[nodeAt(2.5, 15)], 1);
    assert.equal(mask[nodeAt(17.5, 0)], 1);
  });

  it('joins a pair split at ±180° with no gap and no overlap', () => {
    const mask = polygonMask(
      [[box(170, 10, 180, 30)], [box(-180, 10, -170, 30)]],
      GRID,
    );
    const lat = 17.5;
    // Columns at 170°, 175° from the east half; −180° (j = 36), −175°, −170°…
    for (const lon of [170, 175, 180, -175]) {
      assert.equal(mask[nodeAt(lat, lon)], 1, `${lon}°`);
    }
    assert.equal(mask[nodeAt(lat, 165)], 0);
    assert.equal(mask[nodeAt(lat, -165)], 0);
    assert.equal(count(mask), 4 * 4);
  });

  it('covers the pole with a ring closing along −90°', () => {
    const cap: GeoPolygon[number] = [
      [-180, -70],
      [-90, -72],
      [0, -70],
      [90, -72],
      [180, -70],
      [180, -90],
      [-180, -90],
      [-180, -70],
    ];
    const mask = polygonMask([[cap]], GRID);
    for (const lat of [-87.5, -82.5, -77.5, -72.5]) {
      for (let j = 0; j < COLUMNS; j += 1) {
        assert.equal(
          mask[ringAt(lat) * COLUMNS + j],
          1,
          `${lat}°, column ${j}`,
        );
      }
    }
    assert.equal(count(mask), 4 * COLUMNS);
  });

  it('refuses an edge that wraps the antimeridian', () => {
    assert.throws(
      () => polygonMask([[box(170, 10, -170, 30)]], GRID),
      /wraps the antimeridian/,
    );
  });
});

describe('layersMask', () => {
  it('unions land with shelves and removes lakes', () => {
    const mask = layersMask(
      {
        land: [[box(0, 0, 20, 20)]],
        shelves: [[box(20, 0, 40, 20)]],
        lakes: [[box(6, 6, 14, 14)]],
      },
      GRID,
    );
    assert.equal(mask[nodeAt(12.5, 10)], 0);
    assert.equal(mask[nodeAt(2.5, 10)], 1);
    assert.equal(mask[nodeAt(2.5, 25)], 1);
    assert.equal(mask[nodeAt(2.5, 45)], 0);
  });
});
