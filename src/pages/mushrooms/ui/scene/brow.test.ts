import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE, pinholeOf } from '../../model/ground';
import { browBlades, browShown, type ShownBlade } from './brow';
import { meadowCamera } from './meadow-camera';
import { seamReach } from './skyline';
import { browRow, viewAt } from './view';
import { CAMERAS } from './viewports';

/** How tall a shown blade stands, root to tip, in CSS px. */
const standing = ({ root, tip }: ShownBlade) => root - tip.y;

/** Headings round the circle, off the round numbers. */
const HEADINGS = Array.from(
  { length: 18 },
  (_, index) => (index / 18) * Math.PI * 2 + 0.07,
);

describe('the brow', () => {
  for (const { name, camera } of CAMERAS) {
    const blades = browBlades(camera);

    it(`${name}: every blade is rooted on the brow at its own x, the fringe lower toward the screen's edges`, () => {
      const reach = seamReach(camera);
      for (const heading of HEADINGS) {
        const view = viewAt(camera, { ...OPENING_EYE, heading });
        for (const blade of browShown(view, blades)) {
          const brow = browRow(view, blade.x);
          assert.ok(blade.root >= brow && blade.root < brow + reach * 0.2);
          assert.ok(blade.tip.y >= blade.root - reach, `${blade.tip.y}`);
        }
      }
      const middle = browRow(camera, camera.width / 2);
      assert.ok(browRow(camera, 0) > middle);
      assert.ok(browRow(camera, camera.width) > middle);
    });

    it(`${name}: every heading shows clumps of blades with bare brow between them, none bare for long`, () => {
      const reach = seamReach(camera);
      for (const heading of HEADINGS) {
        const view = viewAt(camera, { ...OPENING_EYE, heading });
        const xs = browShown(view, blades)
          .map(({ x }) => x)
          .filter((x) => x > view.width / 4 && x < (view.width * 3) / 4)
          .toSorted((one, other) => one - other);
        assert.ok(xs.length > 0);
        const gaps = xs.slice(1).map((x, index) => x - (xs[index] ?? x));
        assert.ok(Math.max(...gaps) < reach * 3, `${heading}`);
      }
      // Each blade's distance from the one before it, in CSS px at the screen's middle.
      const { arc } = pinholeOf(camera);
      const gaps = blades
        .slice(1)
        .map(
          ({ azimuth }, index) =>
            (azimuth - (blades[index]?.azimuth ?? azimuth)) * arc,
        );
      const close = gaps.filter(
        (gap) => gap < Math.max(reach * 0.3, 2.1),
      ).length;
      const apart = gaps.filter((gap) => gap > reach).length;
      assert.ok(close > gaps.length * 0.75, `${close} of ${gaps.length}`);
      assert.ok(apart > gaps.length / 40, `${apart} of ${gaps.length}`);
    });

    it(`${name}: the blades stand at many heights, a few tufts over the rest`, () => {
      const talls = blades.map(({ tall }) => tall);
      assert.ok(Math.min(...talls) < 0.2);
      assert.ok(Math.max(...talls) > 0.85);
      const tufts = talls.filter((tall) => tall > 0.8).length;
      assert.ok(tufts > 0 && tufts < talls.length / 10, `${tufts}`);
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
      const after = (to ?? []).find(
        (blade) => Math.abs(standing(blade) - standing(before)) < 1e-9,
      );
      assert.ok(after);
      assert.ok(after.x < before.x - 1, `${before.x} → ${after.x}`);
    });
  }

  it('grows the same blades for the same camera', () => {
    const camera = meadowCamera(1180, 820);
    assert.deepEqual(browBlades(camera), browBlades(camera));
  });
});
