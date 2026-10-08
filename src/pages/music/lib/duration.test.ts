import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatDuration, totalDuration } from './duration';

describe('formatDuration', () => {
  it('writes a track as m:ss', () => {
    assert.equal(formatDuration(0), '0:00');
    assert.equal(formatDuration(65.9), '1:05');
    assert.equal(formatDuration(3599), '59:59');
  });

  it('writes an hour and up as h:mm:ss', () => {
    assert.equal(formatDuration(3600), '1:00:00');
    assert.equal(formatDuration(3725), '1:02:05');
  });
});

describe('totalDuration', () => {
  it('sums the tracks before formatting', () => {
    assert.equal(totalDuration([200, 185, 241]), '10:26');
    assert.equal(totalDuration([1800, 1800, 61]), '1:01:01');
  });

  it('is zero for no tracks', () => {
    assert.equal(totalDuration([]), '0:00');
  });
});
