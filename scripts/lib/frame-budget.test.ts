import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { median, overBudget } from './frame-budget.ts';

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
});

describe('overBudget', () => {
  it('passes a screen whose median frame is under the bound, however slow its worst frames', () => {
    assert.equal(overBudget([5, 6, 7, 80, 90], 10), undefined);
  });

  it('fails a screen whose median frame is past the bound, saying by how much', () => {
    const verdict = overBudget([12, 30, 31, 32, 40], 16);
    assert.match(verdict ?? '', /31\.0 ms/);
    assert.match(verdict ?? '', /16 ms/);
  });

  it('fails a screen that timed no frame, rather than passing it', () => {
    assert.notEqual(overBudget([], 16), undefined);
  });
});
