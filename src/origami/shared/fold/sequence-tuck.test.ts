import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { foldRing, ringGap } from './sequence.test-kit.ts';

// At the default mesh: every coarser one tried (1/20 to 1/10 of the sheet)
// leaves the tucked flap through its lid, tens of edges crossing and let-go
// stopped at its cap.
describe('relaxSequence, a ring locked by a tuck', () => {
  it('stays closed once let go', () => {
    const ring = foldRing('tuck');
    assert.ok(ringGap(ring) < 0.25, `opened to ${ringGap(ring)}`);
    assert.ok(ring.crossings <= 1, `${ring.crossings} edges cross`);
    const letGo = ring.phases.at(-1);
    assert.equal(letGo?.stage, 'let go');
    assert.ok(letGo.settled, 'let-go hit its cap');
    // The tuck itself runs to its cap, the lid held up all through it.
    assert.deepEqual(
      ring.phases.map((p) => [p.stage, p.settled]),
      [
        ['step 1', true],
        ['step 2', true],
        ['step 3', false],
        ['step 3 seat', true],
        ['let go', true],
      ],
    );
  });
});
