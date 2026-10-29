import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parsePricing, priceText } from './prices';

describe('parsePricing', () => {
  it('reads the shown zones’ prices as numbers, dropping the rest', () => {
    const prices = parsePricing({
      status: 'SUCCESS',
      pricing: {
        xyz: { registration: '2.04', renewal: '14.21', transfer: '14.21' },
        ws: { registration: '22.97', renewal: '22.97', transfer: '22.97' },
      },
    });

    assert.deepEqual(prices, { xyz: { registration: 2.04, renewal: 14.21 } });
  });

  it('refuses a list of another shape', () => {
    assert.throws(() => parsePricing({ pricing: 'none' }));
  });
});

describe('priceText', () => {
  it('gives one rounded price where renewal costs the same', () => {
    assert.equal(priceText({ registration: 11.08, renewal: 11.08 }), '$11/yr');
  });

  it('gives both where the first year is cheaper', () => {
    assert.equal(
      priceText({ registration: 2.04, renewal: 14.21 }),
      '$2, then $14/yr',
    );
  });
});
