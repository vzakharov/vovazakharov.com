import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeNormal } from './decode';
import { pathHash } from './hash';
import { legendreTable } from './legendre';
import {
  analyze,
  harmonicSlot,
  sphereTransform,
  synthesize,
} from './sphere-series';

/** Unit normal coefficients, reproducible. */
function randomSeries(degree: number) {
  const hash = pathHash('5');
  return Float64Array.from({ length: (degree + 1) ** 2 }, (_, i) =>
    decodeNormal(hash(`test/${i}`)),
  );
}

/** `f(θ, φ)` summed term by term. */
function direct(c: Float64Array, degree: number, x: number, phi: number) {
  const table = legendreTable(degree, x);
  let sum = 0;
  for (let l = 0; l <= degree; l += 1) {
    sum += (c[harmonicSlot(l, 0)] ?? 0) * (table[(l * (l + 1)) / 2] ?? 0);
    for (let m = 1; m <= l; m += 1) {
      const p = Math.SQRT2 * (table[(l * (l + 1)) / 2 + m] ?? 0);
      sum += (c[harmonicSlot(l, m)] ?? 0) * p * Math.cos(m * phi);
      sum += (c[harmonicSlot(l, -m)] ?? 0) * p * Math.sin(m * phi);
    }
  }
  return sum;
}

describe('synthesize', () => {
  it('matches the series summed term by term', () => {
    for (const degree of [7, 12]) {
      const transform = sphereTransform(degree);
      const { grid } = transform;
      const c = randomSeries(degree);
      const field = synthesize(transform, c);
      for (const ring of [0, 3, Math.floor(grid.rings / 2), grid.rings - 1]) {
        for (const j of [0, 1, 5, grid.columns - 1]) {
          const phi = (2 * Math.PI * j) / grid.columns;
          const expected = direct(c, degree, grid.x[ring] ?? 0, phi);
          const actual = field[ring * grid.columns + j] ?? Number.NaN;
          assert.ok(
            Math.abs(actual - expected) < 1e-12,
            `L ${degree}, ring ${ring}, column ${j}: ${actual} vs ${expected}`,
          );
        }
      }
    }
  });
});

describe('analyze', () => {
  it('returns every coefficient synthesize was given', () => {
    // An even degree has a ring on the equator, unpaired; an odd one has none.
    for (const degree of [16, 31, 128]) {
      const transform = sphereTransform(degree);
      const c = randomSeries(degree);
      const back = analyze(transform, synthesize(transform, c));
      const worst = Math.max(
        ...Array.from(c, (value, i) => Math.abs((back[i] ?? 0) - value)),
      );
      const largest = Math.max(...Array.from(c, Math.abs));
      assert.ok(worst / largest < 1e-11, `L ${degree}: ${worst / largest}`);
    }
  });
});
