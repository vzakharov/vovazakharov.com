import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { coordinateSearch } from './fit-search';

describe('coordinateSearch', () => {
  it('walks to a separable minimum, within each range', () => {
    const found = coordinateSearch({
      keys: ['a', 'b'],
      start: { a: 0, b: 0 },
      steps: { a: 1, b: 1 },
      ranges: { a: [-10, 10], b: [-1, 1] },
      score: ({ a, b }) => (a - 3.25) ** 2 + (b - 5) ** 2,
      rounds: 6,
    });
    assert.ok(Math.abs(found.best.a - 3.25) < 1e-9, String(found.best.a));
    assert.equal(found.best.b, 1);
    assert.ok(found.evaluations > 1);
  });

  it('keeps the start when nothing beats it', () => {
    const found = coordinateSearch({
      keys: ['a'],
      start: { a: 2 },
      steps: { a: 0.5 },
      ranges: { a: [0, 4] },
      score: ({ a }) => Math.abs(a - 2),
      rounds: 3,
    });
    assert.deepEqual(found.best, { a: 2 });
    assert.equal(found.score, 0);
  });
});
