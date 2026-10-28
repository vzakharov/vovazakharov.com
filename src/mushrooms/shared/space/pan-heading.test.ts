import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  holdKey,
  leftAt,
  letGoKey,
  type Pan,
  restingAt,
  tick,
  TURN_CRUISE,
  turnOf,
  type View,
} from './pan';

const FRAME = 1 / 60;

/** A tablet held sideways, its heading seen at a focal length of 1243 px. */
const TABLET: View = { width: 1180, world: 2360, unit: 100 };
const TURN = turnOf(1243);

/** `pan` ticked a frame at a time for `seconds`. */
function ticked(pan: Pan, seconds: number): Pan {
  let turning = pan;
  for (let time = 0; time < seconds - 1e-9; time += FRAME) {
    turning = tick(turning, FRAME);
  }
  return turning;
}

describe("a heading's crop", () => {
  it('turns at TURN_CRUISE once eased in', () => {
    const turning = ticked(
      holdKey(restingAt({ ...TABLET, turn: TURN }, 0), 1, 0),
      0.5,
    );
    const later = ticked(turning, 1);
    const turned = (leftAt(later, 0) - leftAt(turning, 0)) / 1243;
    assert.ok(Math.abs(turned - TURN_CRUISE) < 1e-9);
  });

  it('has no ends, wrapping once round', () => {
    const start = restingAt({ ...TABLET, turn: TURN }, 10);
    const turning = ticked(holdKey(start, -1, 0), 1);
    const left = leftAt(turning, 0);
    assert.ok(left > TURN.around / 2 && left < TURN.around);
  });

  it('rests where it stood a moment after the key comes up', () => {
    const turning = ticked(
      holdKey(restingAt({ ...TABLET, turn: TURN }, 0), 1, 0),
      1,
    );
    const rested = ticked(letGoKey(turning, 1), 0.3);
    assert.equal(rested.motion.kind, 'rest');
  });
});
