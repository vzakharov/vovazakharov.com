import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { mulberry32 } from '../../model/random';
import { groundAt, RANGES } from './backdrop-tones';
import { grainStrips } from './grain';
import { seamGrass, seamShown } from './grass';
import { meadowLayout } from './layout';
import { crestAcross } from './panorama';
import { SEAM_REACH, SEAM_STEPS, seamCrest, seamReach } from './skyline';
import { viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';

/** How far across, as a share of the screen, the seam may run level at most. */
const LONGEST_LEVEL = 0.08;
/** How far a stretch of the seam may drift and still count as level, in CSS px. */
const LEVEL = 0.5;

/** How far apart two colours stand, in RGB. */
function distance(a: number, b: number): number {
  return Math.hypot(
    ...[16, 8, 0].map((shift) => ((a >> shift) & 0xff) - ((b >> shift) & 0xff)),
  );
}

describe('the seam between the near hills and the ground', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`wavers, never running level for long, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      const seam = crestAcross(
        seamCrest(layout),
        viewAt(layout.camera, OPENING_EYE),
        SEAM_STEPS,
      );
      const reach = (height - layout.groundTop) * SEAM_REACH;
      for (const { y } of seam) {
        assert.ok(Math.abs(y - layout.groundTop) <= reach + 1e-9);
      }
      let longest = 0;
      for (const [start, { x, y }] of seam.entries()) {
        const end = seam.findIndex(
          (point, index) => index > start && Math.abs(point.y - y) > LEVEL,
        );
        const last = seam[end === -1 ? seam.length - 1 : end - 1] ?? { x };
        longest = Math.max(longest, last.x - x);
      }
      assert.ok(
        longest <= width * LONGEST_LEVEL,
        `level for ${longest.toFixed(0)} px`,
      );
    });
  }

  it('draws no colour line: the ground holds the near range’s foot wherever the seam wanders', () => {
    for (const down of [0, SEAM_REACH / 2, SEAM_REACH]) {
      assert.equal(groundAt(down), RANGES.near.foot);
    }
  });

  it('lifts the ground toward its lit band gradually, never in one step', () => {
    // The ground's own bands, 32 down its depth.
    const bands = Array.from({ length: 32 }, (_, index) => index / 31);
    for (const [index, down] of bands.entries()) {
      if (index === 0) continue;
      const step = distance(groundAt(bands[index - 1] ?? 0), groundAt(down));
      assert.ok(step < 12, `a step of ${step.toFixed(1)} at ${down}`);
    }
  });

  it('fades the grain in over a band below the seam rather than along a line', () => {
    for (const [, width, height] of VIEWPORTS) {
      const layout = meadowLayout(width, height, 1);
      const top = layout.groundTop - seamReach(layout);
      const strips = grainStrips(layout, top);
      assert.equal(strips[0]?.top, top);
      assert.equal(strips.at(-1)?.bottom, height);
      assert.equal(strips.at(-1)?.share, 1);
      assert.ok(strips.every(({ share }) => share > 0));
      assert.ok(Math.min(...strips.map(({ share }) => share)) <= 0.1);
      for (const [index, strip] of strips.entries()) {
        const before = strips[index - 1];
        if (!before) continue;
        assert.ok(Math.abs(strip.top - before.bottom) < 1e-9);
        assert.ok(strip.share > before.share);
        assert.ok(strip.share - before.share <= 0.1);
      }
      const ramp = (strips.at(-1)?.top ?? top) - top;
      assert.ok(ramp >= (height - layout.groundTop) * 0.15);
    }
  });

  it('scatters the tufts along it rather than lining it in a row', () => {
    for (const [, width, height] of VIEWPORTS) {
      for (const seed of VISITS.slice(0, 20)) {
        const layout = meadowLayout(width, height, seed);
        const seam = seamCrest(layout);
        const depth = height - layout.groundTop;
        const back = seamGrass(layout, mulberry32(seed))
          .map(({ azimuth, y }) => (y - seam(azimuth)) / depth)
          .filter((below) => below < 0.1);
        for (const below of back) assert.ok(below >= 0);
        const mean = back.reduce((sum, v) => sum + v, 0) / back.length;
        const spread = Math.sqrt(
          back.reduce((sum, v) => sum + (v - mean) ** 2, 0) / back.length,
        );
        assert.ok(spread >= 0.008, `spread ${spread.toFixed(3)}`);
      }
    }
  });

  it('grows its tufts round the whole panorama, no heading’s screen bare', () => {
    const headings = Array.from(
      { length: 12 },
      (_, step) => (step * Math.PI) / 6,
    );
    for (const [name, width, height] of VIEWPORTS) {
      for (const seed of VISITS.slice(0, 20)) {
        const layout = meadowLayout(width, height, seed);
        const grass = seamGrass(layout, mulberry32(seed));
        const opening = seamShown(viewAt(layout.camera, OPENING_EYE), grass);
        for (const heading of headings) {
          const view = viewAt(layout.camera, { ...OPENING_EYE, heading });
          const shown = seamShown(view, grass);
          assert.ok(
            shown.length >= opening.length / 4,
            `${name}, seed ${seed}: ${shown.length} at ${heading.toFixed(2)}, ${opening.length} at the opening`,
          );
          for (const { x } of shown) assert.ok(Number.isFinite(x));
        }
      }
    }
  });

  it('turns its tufts with the eye and steps none of them', () => {
    // Tablet landscape.
    const layout = meadowLayout(1180, 820, 42);
    const grass = seamGrass(layout, mulberry32(42));
    const opening = seamShown(viewAt(layout.camera, OPENING_EYE), grass);
    const stepped = seamShown(
      viewAt(layout.camera, { ...OPENING_EYE, y: OPENING_EYE.y + 3 }),
      grass,
    );
    assert.deepEqual(stepped, opening);
    const round = seamShown(
      viewAt(layout.camera, { ...OPENING_EYE, heading: Math.PI * 2 }),
      grass,
    );
    assert.equal(round.length, opening.length);
    for (const [index, tuft] of round.entries()) {
      assert.ok(Math.abs(tuft.x - (opening[index]?.x ?? Number.NaN)) < 1e-6);
    }
  });
});
