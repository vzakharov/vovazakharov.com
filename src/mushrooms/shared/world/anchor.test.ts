import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ANCHOR_STEP, ANCHOR_TURN, anchorOf, sameAnchor } from './anchor';
import { OPENING_EYE } from './ground';

describe('anchorOf', () => {
  it('is the opening eye at the opening eye', () => {
    assert.ok(sameAnchor(anchorOf(OPENING_EYE), OPENING_EYE));
  });

  it('is its own anchor', () => {
    for (const eye of [
      { x: 3.17, y: -8.4, heading: 2.9 },
      { x: -0.26, y: 0.24, heading: -1.03 },
      { x: 120.7, y: 55.1, heading: 0.019 },
    ]) {
      const anchor = anchorOf(eye);
      assert.ok(sameAnchor(anchorOf(anchor), anchor));
    }
  });

  it('stays put under a small step or turn, and moves past one', () => {
    const at = { x: 1, y: 2, heading: 0.4 };
    const anchor = anchorOf(at);
    const nudged = { x: 1.2, y: 1.8, heading: 0.4 + ANCHOR_TURN / 3 };
    assert.ok(sameAnchor(anchorOf(nudged), anchor));
    assert.ok(!sameAnchor(anchorOf({ ...at, x: at.x + ANCHOR_STEP }), anchor));
    assert.ok(
      !sameAnchor(
        anchorOf({ ...at, heading: at.heading + ANCHOR_TURN }),
        anchor,
      ),
    );
  });

  it('turns by about 0.04 rad', () => {
    assert.ok(ANCHOR_TURN > 0.03 && ANCHOR_TURN < 0.05, String(ANCHOR_TURN));
  });
});
