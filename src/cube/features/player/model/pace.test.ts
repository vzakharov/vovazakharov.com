import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pressedShift, WALKING } from './pace';

/** The standing pace after Shift presses at `times` seconds, from a walk. */
function runsAfter(...times: number[]): boolean {
  let pace = WALKING;
  for (const at of times) pace = pressedShift(pace, at);
  return pace.running;
}

describe('pressedShift', () => {
  it('keeps the walk through single presses far apart', () => {
    assert.equal(runsAfter(), false);
    assert.equal(runsAfter(1), false);
    assert.equal(runsAfter(1, 2, 3.5), false);
  });

  it('turns the standing pace over on two presses within the window', () => {
    assert.equal(runsAfter(1, 1.2), true);
    assert.equal(runsAfter(1, 1.29), true);
    assert.equal(runsAfter(1, 1.31), false);
  });

  it('turns it back on a second double press', () => {
    assert.equal(runsAfter(1, 1.2, 5, 5.1), false);
  });

  it('starts a fresh pair after a double press', () => {
    assert.equal(runsAfter(1, 1.1, 1.2), true);
    assert.equal(runsAfter(1, 1.1, 1.2, 1.3), false);
  });

  it('pairs a late press with the one after it, not the one before', () => {
    assert.equal(runsAfter(1, 2, 2.2), true);
  });
});
