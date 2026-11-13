import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pixelRatio } from './quality';

describe('pixelRatio', () => {
  it('draws one canvas pixel per CSS pixel at low on a dense screen', () => {
    assert.equal(pixelRatio('low', 2), 1);
  });

  it('keeps a sparser screen its own ratio at low', () => {
    assert.equal(pixelRatio('low', 0.75), 0.75);
  });

  it('draws at the screen ratio at full', () => {
    assert.equal(pixelRatio('full', 2), 2);
  });
});
