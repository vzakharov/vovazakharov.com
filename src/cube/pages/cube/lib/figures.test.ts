import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatLength, formatPrice } from './figures';

describe('formatPrice', () => {
  it('tags whole dollars one dollar under, from $100 up', () => {
    assert.equal(formatPrice(10_000_000), '$9,999,999');
    assert.equal(formatPrice(1_250_000), '$1,249,999');
    assert.equal(formatPrice(156_250), '$156,249');
    assert.equal(formatPrice(19_531.25), '$19,531');
  });

  it('tags cents one cent under, below $100', () => {
    assert.equal(formatPrice(100), '$99.99');
    assert.equal(formatPrice(38.146_972_656_25), '$38.14');
    assert.equal(formatPrice(0.6), '$0.59');
  });

  it('tags anything from a cent down a hundredth under in scientific form', () => {
    assert.equal(formatPrice(0.009_313_225_746), '$9.31 × 10⁻³');
    assert.equal(formatPrice(1.578e-51), '$1.57 × 10⁻⁵¹');
    assert.equal(formatPrice(0.002), '$1.99 × 10⁻³');
    assert.equal(formatPrice(0.01), '$9.99 × 10⁻³');
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
