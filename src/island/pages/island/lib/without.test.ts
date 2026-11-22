import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { withoutOf } from './without';

describe('withoutOf', () => {
  it('drops nothing unless asked', () => {
    assert.deepEqual(withoutOf(''), new Set());
    assert.deepEqual(withoutOf('?play'), new Set());
    assert.deepEqual(withoutOf('?without='), new Set());
  });

  it('reads the names beside other parameters', () => {
    assert.deepEqual(
      withoutOf('?play&without=air, trees'),
      new Set(['air', 'trees']),
    );
  });

  it('names what it does not know, and what it does', () => {
    assert.throws(
      () => withoutOf('?without=air,fog'),
      /without=fog: known are clouds, cloud-shadow/,
    );
  });
});
