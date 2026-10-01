import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { browBlades, browShown } from './brow';
import { meadowCamera } from './meadow-camera';
import { coverRow, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** Each screen's camera, upright and turned. */
const CAMERAS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, camera: meadowCamera(width, height) },
  { name: `${name} turned`, camera: meadowCamera(height, width) },
]);

/** Headings round the circle, off the round numbers. */
const HEADINGS = Array.from(
  { length: 18 },
  (_, index) => (index / 18) * Math.PI * 2 + 0.07,
);

describe('the brow', () => {
  for (const { name, camera } of CAMERAS) {
    const blades = browBlades(camera);

    it(`${name}: no blade reaches the ground's top row, where a thing crossing the seam has its foot`, () => {
      for (const heading of HEADINGS) {
        const view = viewAt(camera, { ...OPENING_EYE, heading });
        for (const blade of browShown(view, blades)) {
          assert.ok(blade.tip.y > view.groundTop, `${blade.tip.y}`);
          assert.ok(blade.root >= coverRow(view));
        }
      }
    });

    it(`${name}: every heading shows the brow's blades at one density`, () => {
      const counts = HEADINGS.map(
        (heading) =>
          browShown(viewAt(camera, { ...OPENING_EYE, heading }), blades).length,
      );
      const least = Math.min(...counts);
      assert.ok(least > 0);
      assert.ok(Math.max(...counts) <= least * 1.15, counts.join(' '));
    });

    it(`${name}: a turn slides the blades with the hills`, () => {
      const [from, to] = [0.3, 0.32].map((heading) =>
        browShown(viewAt(camera, { ...OPENING_EYE, heading }), blades),
      );
      const middle = camera.width / 2;
      const before = (from ?? []).toSorted(
        (one, other) => Math.abs(one.x - middle) - Math.abs(other.x - middle),
      )[0];
      assert.ok(before);
      const after = (to ?? []).find((blade) => blade.tip.y === before.tip.y);
      assert.ok(after);
      assert.ok(after.x < before.x - 1, `${before.x} → ${after.x}`);
    });
  }

  it('grows the same blades for the same camera', () => {
    const camera = meadowCamera(1180, 820);
    assert.deepEqual(browBlades(camera), browBlades(camera));
  });
});
