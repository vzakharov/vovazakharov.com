import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { LiveLawn, type Sprout } from './lawn';
import { TEND_SLICE, tendedIn, Tending, tendTufts } from './tending';
import { viewAt } from './view';
import { opened } from './visit-play';

/** Steps `tending` until it hands back its tufts, and how many steps that took. */
function drained(tending: Tending): [Sprout[], number] {
  for (let steps = 1; ; steps++) {
    const standing = tending.step();
    if (standing) return [standing, steps];
  }
}

describe('Tending', () => {
  for (const [seed, forest] of [
    [3, true],
    [11, false],
  ] as const) {
    it(`stands, spread over frames, exactly the tufts tendTufts stands at once (visit ${String(seed)})`, () => {
      const stand = opened(seed, 1180, 820, forest);
      const { layout } = stand;
      const lawn = new LiveLawn({ seed: seed * 31, layout });
      for (const eye of [
        OPENING_EYE,
        { x: 6, y: 9, heading: 0.7 },
        { x: -30, y: -45, heading: Math.PI },
      ]) {
        const grown = lawn
          .round(eye)
          .filter(tendedIn(viewAt(layout.camera, eye)));
        assert.ok(grown.length > 2 * TEND_SLICE, JSON.stringify(eye));
        const [standing, steps] = drained(new Tending(stand, grown, eye));
        assert.deepEqual(standing, tendTufts(stand, grown, eye));
        // The rules on the first step, then `TEND_SLICE` tufts a step.
        assert.equal(steps, 1 + Math.ceil(grown.length / TEND_SLICE));
      }
    });
  }

  it('stands nothing, a step after reading the rules, when nothing is grown', () => {
    const stand = opened(3, 1180, 820, false);
    const tending = new Tending(stand, [], OPENING_EYE);
    assert.equal(tending.step(), undefined);
    assert.deepEqual(tending.step(), []);
  });
});
