import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EYE_HEIGHT, OPENING_EYE } from '../../model/ground';
import { sinkingAloft } from './insect-frame';
import { sinkingOf } from './insect-sink';
import { meadowCamera } from './meadow-camera';
import { browRow, buried, D_SEE, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** Where the insects are drawn this side of the brow. */
const ABOVE = 1.5e5;
/** The depths of `paint-backdrop.ts`'s near hills and ground, which what sinks stands between. */
const [NEAR_HILLS, GROUND] = [-4, -3];
/** An insect's open wings, in CSS px at its own size. */
const SPAN = 40;

/** Distances from the eye, in the clump's size, from this side of the brow out past where everything has sunk. */
const DISTANCES = Array.from(
  { length: 400 },
  (_, index) => D_SEE - 1 + index * 0.1,
);

describe('an insect behind the brow', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const view = viewAt(meadowCamera(width, height), OPENING_EYE);
    for (const h of [0.05, 0.3, 0.6].map((share) => share * EYE_HEIGHT)) {
      it(`${name} at ${h.toFixed(2)} up: goes down behind the brow by its distance, then is hidden for good`, () => {
        let wasShown = true;
        let lastBelow = -Infinity;
        let sunkShown = 0;
        for (const distance of DISTANCES) {
          const sinking = sinkingAloft(view, { x: 0.4, y: distance, h });
          assert.ok(sinking);
          const { drawn, ground } = sinking;
          const tall = SPAN * drawn.zoom;
          const under = { ...ground, depth: ground.y };
          const sunk = sinkingOf(view, drawn, tall, under, ABOVE);
          if (ground.distance <= D_SEE) {
            assert.deepEqual(sunk, { depth: ABOVE, alpha: 1, shown: true });
            continue;
          }
          assert.ok(sunk.depth > NEAR_HILLS && sunk.depth < GROUND);
          assert.ok(sunk.alpha < 1 && sunk.alpha >= 0.8);
          // Lower against the brow the farther it stands.
          const below = drawn.y - browRow(view, drawn.x);
          assert.ok(below > lastBelow, `${distance}`);
          lastBelow = below;
          if (sunk.shown) {
            assert.ok(wasShown, `shown again at ${distance}`);
            if (buried(view, drawn)) sunkShown++;
          }
          wasShown = sunk.shown;
        }
        assert.equal(wasShown, false);
        // Shown while its middle is under the brow, where the cull hid it.
        assert.ok(sunkShown > 0);
      });
    }
  }
});
