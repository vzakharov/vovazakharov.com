import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ringGrid } from '../../grid';
import { landmasses, landShare } from './land-measure';

const grid = ringGrid(63);

/** The grid's values of `f(cos θ, φ)`. */
const fieldOf = (f: (x: number, phi: number) => number) =>
  Float64Array.from({ length: grid.rows * grid.columns }, (_, cell) => {
    const ring = Math.floor(cell / grid.columns);
    const phi = (2 * Math.PI * (cell % grid.columns)) / grid.columns;
    return f(grid.x[ring] ?? 0, phi);
  });

describe('landShare', () => {
  it('measures a polar cap by its area', () => {
    // The cap `x > 0.5` holds a quarter of the sphere.
    const share = landShare(
      grid,
      fieldOf((x) => x - 0.5),
    );
    assert.ok(Math.abs(share - 0.25) < 0.01, `${share}`);
  });
});

describe('landmasses', () => {
  it('splits two caps and joins land across the seam and a pole', () => {
    const caps = landmasses(
      grid,
      fieldOf((x) => Math.abs(x) - 0.8),
    );
    assert.equal(caps.length, 2);
    assert.ok(Math.abs((caps[0] ?? 0) - 0.5) < 0.02);
    // A band through φ = 0 over the north pole: one landmass.
    const band = landmasses(
      grid,
      fieldOf((x, phi) => (x > 0 && Math.abs(Math.sin(phi)) < 0.1 ? 1 : -1)),
    );
    assert.deepEqual(band, [1]);
  });
});
