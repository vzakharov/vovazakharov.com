import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { contourOf } from './contour';

const grid = {
  columns: 64,
  rows: 64,
  originX: -32,
  originY: -32,
  cellMetres: 1,
};

/** `f(x, y)` sampled on `grid`'s nodes. */
function sampled(f: (x: number, y: number) => number) {
  const values = new Float64Array(grid.columns * grid.rows);
  for (let j = 0; j < grid.rows; j += 1) {
    for (let i = 0; i < grid.columns; i += 1) {
      values[j * grid.columns + i] = f(grid.originX + i, grid.originY + j);
    }
  }
  return values;
}

/** Every segment's two ends, as `[x, y]` pairs. */
function ends(segments: Float64Array) {
  const points: Array<[number, number]> = [];
  for (let k = 0; k + 1 < segments.length; k += 2) {
    points.push([segments[k] ?? Number.NaN, segments[k + 1] ?? Number.NaN]);
  }
  return points;
}

const key = ([x, y]: [number, number]) => `${x.toFixed(9)},${y.toFixed(9)}`;

describe('contourOf', () => {
  it('draws a disc’s rim as a closed ring of segments on its circle', () => {
    const radius = 20.3;
    const segments = contourOf(
      sampled((x, y) => radius - Math.hypot(x, y)),
      grid,
    );
    assert.equal(segments.length % 4, 0);
    // A linear crossing of a cone lies on its circle within a cell's sag.
    for (const [x, y] of ends(segments)) {
      assert.ok(Math.abs(Math.hypot(x, y) - radius) < 0.05, `${x}, ${y}`);
    }
    // Closed: every end is some other segment's end too.
    const counts = new Map<string, number>();
    for (const p of ends(segments))
      counts.set(key(p), (counts.get(key(p)) ?? 0) + 1);
    for (const [p, count] of counts) assert.equal(count, 2, p);
  });

  it('draws nothing where the field keeps one sign', () => {
    assert.equal(
      contourOf(
        sampled(() => 1),
        grid,
      ).length,
      0,
    );
    assert.equal(
      contourOf(
        sampled(() => -1),
        grid,
      ).length,
      0,
    );
  });

  it('splits a saddle cell by the sign of its centre', () => {
    const one = { columns: 2, rows: 2, originX: 0, originY: 0, cellMetres: 1 };
    // Row-major nodes a (0, 0), b (1, 0), d (0, 1), c (1, 1); a and c are land.
    const landCentre = contourOf(Float64Array.from([2, -1, -1, 2]), one);
    const waterCentre = contourOf(Float64Array.from([1, -2, -2, 1]), one);
    assert.equal(landCentre.length, 8);
    assert.equal(waterCentre.length, 8);
    // Land through the centre cuts off b at (1, 0): a segment joins the
    // bottom edge to the right edge.
    const [bx0, by0, bx1, by1] = landCentre;
    assert.deepEqual([by0, bx1], [0, 1]);
    assert.ok((bx0 ?? 0) > 0.5 && (by1 ?? 0) < 0.5);
    // Water through the centre cuts off a: left edge to bottom edge.
    assert.deepEqual([waterCentre[0], waterCentre[3]], [0, 0]);
  });
});
