import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chordFingers } from './chord-fingers';

describe('chordFingers', () => {
  it('leaves one finger alone to Phaser', () => {
    assert.deepEqual(chordFingers([4], 4), []);
  });

  it('plays every finger past the first landing together', () => {
    assert.deepEqual(chordFingers([4, 5, 6], 4), [5, 6]);
  });

  it('plays every finger landing while Phaser holds another', () => {
    assert.deepEqual(chordFingers([7], 4), [7]);
    assert.deepEqual(chordFingers([7, 8], 4), [7, 8]);
  });

  it('never plays the finger Phaser takes once the first has lifted', () => {
    // A (4) down, B (7) down, A lifts, C (9) lands: Phaser's pointer, free
    // again, takes C, while B still holds the glass.
    assert.deepEqual(chordFingers([9], 9), []);
  });
});
