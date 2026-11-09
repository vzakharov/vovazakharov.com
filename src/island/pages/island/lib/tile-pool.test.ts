import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { poolSize } from './tile-pool';

describe('poolSize', () => {
  it('takes 2 where the browser does not say', () => {
    assert.equal(poolSize(undefined), 2);
  });

  it('leaves the main thread a core, and keeps at least one worker', () => {
    assert.equal(poolSize(1), 1);
    assert.equal(poolSize(2), 1);
    assert.equal(poolSize(4), 3);
  });

  it('stops at 4', () => {
    assert.equal(poolSize(8), 4);
  });
});
