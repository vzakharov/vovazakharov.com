import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { nextLevel, pixelRatio, QUALITIES } from './quality';

describe('pixelRatio', () => {
  it('draws at the screen ratio at high', () => {
    assert.equal(pixelRatio('high', 2), 2);
  });

  it('draws three quarters and a half of it at medium and low', () => {
    assert.equal(pixelRatio('medium', 2), 1.5);
    assert.equal(pixelRatio('low', 2), 1);
  });
});

describe('nextLevel', () => {
  it('cycles high, medium, low and back', () => {
    assert.deepEqual(
      QUALITIES.map((level) => nextLevel(level)),
      ['medium', 'low', 'high'],
    );
  });
});
