import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { foldRing, ringGap } from './sequence.test-kit.ts';

describe('relaxSequence, the same ring with its flap laid on top', () => {
  it('springs open once let go', () => {
    const ring = foldRing('plain');
    assert.ok(ringGap(ring) > 0.6, `opened only to ${ringGap(ring)}`);
    assert.equal(ring.crossings, 0);
    assert.ok(ring.phases.every((p) => p.settled));
  });
});
