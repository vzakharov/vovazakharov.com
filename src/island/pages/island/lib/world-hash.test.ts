import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OUR_WORLD, worldOfHash } from './world-hash';

describe('worldOfHash', () => {
  it('opens the number a hash names', () => {
    assert.equal(worldOfHash('#2'), '2');
    assert.equal(worldOfHash('#1'), '1');
    assert.equal(worldOfHash('#12345678901234567890'), '12345678901234567890');
    assert.equal(worldOfHash('7'), '7');
  });

  it('opens ours for no hash or an invalid one', () => {
    for (const hash of ['', '#', '#0', '#07', '#-3', '#2.5', '#abc', '# 2']) {
      assert.equal(worldOfHash(hash), OUR_WORLD, JSON.stringify(hash));
    }
  });
});
