import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parsePricing, priceParts } from './prices';

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

describe('priceParts', () => {
  it('gives one rounded price where renewal costs the same', () => {
    assert.deepEqual(priceParts({ registration: 11.08, renewal: 11.08 }), {
      first: 11,
      after: undefined,
    });
  });

  it('gives both where the first year is cheaper', () => {
    assert.deepEqual(priceParts({ registration: 2.04, renewal: 14.21 }), {
      first: 2,
      after: 14,
    });
  });
});
