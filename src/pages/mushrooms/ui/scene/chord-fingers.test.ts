import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chordFingers } from './chord-fingers';

describe('chordFingers', () => {
  it('leaves one finger alone to Phaser', () => {
    assert.deepEqual(chordFingers([4], [4]), []);
  });

  it('plays every finger past the first landing together', () => {
    assert.deepEqual(chordFingers([4, 5, 6], [4, 5, 6]), [5, 6]);
  });

  it('plays every finger landing while another is down', () => {
    assert.deepEqual(chordFingers([7], [4, 7]), [7]);
    assert.deepEqual(chordFingers([7, 8], [4, 7, 8]), [7, 8]);
  });
});
