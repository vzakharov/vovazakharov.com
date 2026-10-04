import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstSteering } from '../../model/insect-steering';
import { legSetOff } from './insect-shown';

/**
 * A butterfly last drawn facing up the screen, then flown off it, where its
 * body turned round to 3 rad unseen: its container still holds 0, the turn
 * it was last shown at, which `InsectView` sets only on a frame it is drawn.
 */
const hidden = {
  drawn: { x: 0, y: 0, h: 1 },
  bob: 0,
  steering: { ...firstSteering({ facing: 0, turn: 3 }), heldAt: 1000 },
};

describe('a new leg', () => {
  it('sets off turned as the flier holds its body, not as it was last drawn before it went off the screen', () => {
    const set = legSetOff(hidden, {
      from: { kind: 'cap', id: 'mushroom-1' },
      departs: 2000,
    });
    assert.equal(set.turnedFrom, 3);
    assert.equal(set.steering.turn, 3);
  });

  it('in from away sets off turned no way of its own', () => {
    const set = legSetOff(hidden, {
      from: { kind: 'away', side: 'left' },
      departs: 2000,
    });
    assert.equal(set.turnedFrom, undefined);
    assert.equal(set.entering, true);
  });
});
