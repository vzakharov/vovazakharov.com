import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCubes, formatLength } from './figures';

describe('formatCubes', () => {
  it('groups a count in thousands', () => {
    assert.equal(formatCubes(10_000_000), '10,000,000');
    assert.equal(formatCubes(2440), '2,440');
    assert.equal(formatCubes(38), '38');
    assert.equal(formatCubes(0), '0');
  });

  it('refuses what is no count of whole кубики', () => {
    for (const bad of [0.5, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => formatCubes(bad), RangeError);
    }
  });
});

describe('formatLength', () => {
  it('spells lengths in three significant figures', () => {
    assert.equal(formatLength(2.5), '2.5');
    assert.equal(formatLength(5 / 2 ** 7), '0.0391');
    assert.equal(formatLength(0.001), '0.001');
  });

  it('spells anything under a millimetre in scientific form', () => {
    assert.equal(formatLength(5 / 2 ** 65), '1.36 × 10⁻¹⁹');
  });
});
