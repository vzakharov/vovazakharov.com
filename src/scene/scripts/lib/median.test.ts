import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { median } from './median.ts';

describe('median', () => {
  it('takes the middle of an odd count, whatever the order', () => {
    assert.equal(median([9, 1, 5]), 5);
  });

  it('takes the mean of the two middles of an even count', () => {
    assert.equal(median([4, 1, 10, 2]), 3);
  });

  it('is not a number for no values', () => {
    assert.ok(Number.isNaN(median([])));
  });

  it('leaves the values it is given in their order', () => {
    const values = [3, 1, 2];
    median(values);
    assert.deepEqual(values, [3, 1, 2]);
  });
});
