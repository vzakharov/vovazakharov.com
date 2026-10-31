import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { priceParts } from './price';

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
