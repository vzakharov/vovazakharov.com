import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { domeAt, domeOf, domeWords } from './dome';
import { worldWords } from './mask';

describe('dome', () => {
  it('builds the dome its words say, and back', () => {
    const words = worldWords('4');
    const dome = domeOf(words);
    assert.ok(Math.abs(dome.centreX) <= 0.04 && Math.abs(dome.centreY) <= 0.04);
    assert.ok(dome.radiusA >= 0.16 && dome.radiusA < 0.26);
    assert.ok(dome.turn >= 0 && dome.turn < Math.PI);
    assert.deepEqual(domeWords(dome), [...words.subarray(0, 5)]);
    assert.ok(
      Math.abs(domeAt(dome, 0.5 + dome.centreX, 0.5 + dome.centreY) - 1) <
        1e-12,
    );
  });

  it('falls to zero one radius out along each axis', () => {
    const dome = {
      centreX: 0.01,
      centreY: -0.02,
      radiusA: 0.2,
      radiusB: 0.25,
      turn: Math.PI / 2,
    };
    // Turned a quarter: axis a runs along y, axis b along x.
    assert.ok(Math.abs(domeAt(dome, 0.51, 0.48 + 0.2)) < 1e-12);
    assert.ok(Math.abs(domeAt(dome, 0.51 + 0.25, 0.48)) < 1e-12);
  });
});
