import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatLength, formatPrice } from './figures';

describe('formatPrice', () => {
  it('spells millions short', () => {
    assert.equal(formatPrice(10_000_000), '$10M');
    assert.equal(formatPrice(1_250_000), '$1.25M');
  });

  it('spells whole dollars with separators and cents to two places', () => {
    assert.equal(formatPrice(156_250), '$156,250');
    assert.equal(formatPrice(19_531.25), '$19,531.25');
    assert.equal(formatPrice(38.146_972_656_25), '$38.15');
    assert.equal(formatPrice(0.6), '$0.60');
    assert.equal(formatPrice(0.01), '$0.01');
  });

  it('spells anything under a cent in scientific form', () => {
    assert.equal(formatPrice(0.009_313_225_746), '$9.31 × 10⁻³');
    assert.equal(formatPrice(1.578e-51), '$1.58 × 10⁻⁵¹');
    assert.equal(formatPrice(0.002), '$2 × 10⁻³');
  });

  it('carries a mantissa rounded up to 10 into the power', () => {
    assert.equal(formatPrice(0.000_999_9), '$1 × 10⁻³');
  });

  it('refuses what is no price', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => formatPrice(bad), RangeError);
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
