import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatLength, formatPrice } from './figures';

describe('formatPrice', () => {
  it('ends whole dollars in the nearest 99, above or below', () => {
    assert.equal(formatPrice(10_000_000), '$9,999,999');
    assert.equal(formatPrice(1_250_000), '$1,249,999');
    assert.equal(formatPrice(156_250), '$156,299');
    assert.equal(formatPrice(19_531.25), '$19,499');
    assert.equal(formatPrice(2441.406_25), '$2,399');
    assert.equal(formatPrice(305.175_781_25), '$299');
    assert.equal(formatPrice(199), '$199');
    assert.equal(formatPrice(150), '$199');
  });

  it('ends cents in the nearest 9.99 where whole dollars would fall under $100', () => {
    assert.equal(formatPrice(120), '$119.99');
    assert.equal(formatPrice(100), '$99.99');
    assert.equal(formatPrice(38.146_972_656_25), '$39.99');
    assert.equal(formatPrice(10.5), '$9.99');
  });

  it('ends cents under $10 in the nearest .99', () => {
    assert.equal(formatPrice(4.768_371_582), '$4.99');
    assert.equal(formatPrice(5), '$4.99');
    assert.equal(formatPrice(4.99), '$4.99');
    assert.equal(formatPrice(1.2), '$0.99');
  });

  it('refuses what is no price', () => {
    for (const bad of [0, 0.6, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
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
