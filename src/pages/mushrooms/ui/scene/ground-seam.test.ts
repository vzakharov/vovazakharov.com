import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { alongAzimuth, distanceBetween } from '../../model/geometry';
import { D_SEE, type Eye, OPENING_EYE } from '../../model/ground';
import { hasGround } from './anchored-stand';
import { groundAt, RANGES } from './backdrop-tones';
import { grainStrips } from './grain';
import { turfAt } from './grass';
import { cellOf, LiveLawn } from './lawn';
import { type MeadowLayout, meadowLayout } from './layout';
import { crestAcross } from './panorama';
import { PALE_SPAN } from './repaint-queue';
import { SEAM_REACH, SEAM_STEPS, seamCrest, seamTop } from './skyline';
import {
  crossesSeam,
  SEAM_BAND,
  seamFaded,
  seamPatches,
  shownSeam,
  shownSprouts,
} from './tufts';
import { browRow, viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';

/** How far across, as a share of the screen, the seam may run level at most. */
const LONGEST_LEVEL = 0.08;
/** How far a stretch of the seam may drift and still count as level, in CSS px. */
const LEVEL = 0.5;

/** The seam's grass `view`ed from `eye` on `layout`, the lawn grown off `seed`. */
function seamOf(layout: MeadowLayout, seed: number, eye: Eye) {
  const lawn = new LiveLawn({ seed, layout });
  lawn.round(eye);
  return shownSeam(
    viewAt(layout.camera, eye),
    seamPatches(lawn.seam),
    turfAt(0),
  );
}

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
      const top = seamTop(layout);
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

  it('scatters the tufts down a band under the brow rather than lining it in a row', () => {
    for (const [name, width, height] of VIEWPORTS) {
      for (const seed of VISITS.slice(0, 5)) {
        const layout = meadowLayout(width, height, seed);
        const view = viewAt(layout.camera, OPENING_EYE);
        const below = seamOf(layout, seed, OPENING_EYE).near.map(
          ({ tuft }) => tuft.y - browRow(view, tuft.x),
        );
        const mean = below.reduce((sum, v) => sum + v, 0) / below.length;
        const spread = Math.sqrt(
          below.reduce((sum, v) => sum + (v - mean) ** 2, 0) / below.length,
        );
        assert.ok(spread >= 1, `${name}: spread ${spread.toFixed(2)} px`);
      }
    }
  });

  it('roots every tuft under the brow at its x, on every heading and after a walk, so none stands on the hills beyond it', () => {
    for (const [name, width, height] of VIEWPORTS) {
      const layout = meadowLayout(width, height, 7);
      for (let step = 0; step < 12; step++) {
        const eye = {
          x: step * 1.7,
          y: OPENING_EYE.y - step * 2.3,
          heading: (step * Math.PI) / 6 + 0.07,
        };
        const view = viewAt(layout.camera, eye);
        const { near, behind } = seamOf(layout, 7, eye);
        for (const { tuft } of [...near, ...behind]) {
          assert.ok(
            tuft.y > browRow(view, tuft.x),
            `${name}: ${tuft.y} over the brow`,
          );
        }
      }
    }
  });

  it('grows its tufts round the whole panorama, no heading’s screen bare', () => {
    for (const [name, width, height] of VIEWPORTS) {
      for (const seed of VISITS.slice(0, 5)) {
        const layout = meadowLayout(width, height, seed);
        const opening = seamOf(layout, seed, OPENING_EYE).near.length;
        for (let step = 0; step < 12; step++) {
          const heading = (step * Math.PI) / 6;
          const shown = seamOf(layout, seed, { ...OPENING_EYE, heading });
          assert.ok(
            shown.near.length >= opening / 4,
            `${name}, seed ${seed}: ${shown.near.length} at ${heading.toFixed(2)}, ${opening} at the opening`,
          );
        }
      }
    }
  });

  it('moves its tufts with the ground as the eye steps: each comes nearer, lower on the screen', () => {
    // Tablet landscape.
    const layout = meadowLayout(1180, 820, 42);
    const opening = seamOf(layout, 42, OPENING_EYE).near;
    const stepped = seamOf(layout, 42, {
      ...OPENING_EYE,
      y: OPENING_EYE.y + 0.3,
    }).near;
    let shared = 0;
    for (const { sprout, tuft } of stepped) {
      const was = opening.find(
        ({ sprout: { foot } }) =>
          foot.x === sprout.foot.x && foot.y === sprout.foot.y,
      );
      if (!was) continue;
      shared++;
      assert.ok(tuft.y > was.tuft.y, `${tuft.y} not below ${was.tuft.y}`);
    }
    assert.ok(shared >= opening.length / 2, `${shared} of ${opening.length}`);
  });

  it('fades a tuft into the ground as a step brings it to the band’s near edge, so none goes in one frame', () => {
    assert.equal(seamFaded(D_SEE - SEAM_BAND), 1);
    assert.equal(seamFaded(D_SEE - SEAM_BAND / 2), 0);
    for (let at = 0; at < 20; at++) {
      const away = D_SEE - SEAM_BAND + (at * SEAM_BAND) / 40;
      assert.ok(seamFaded(away + SEAM_BAND / 40) <= seamFaded(away));
    }
  });
});

describe('the seam’s grass by cell', () => {
  /** Eyes over a walk: stepping, turning, and standing on a cell's edge. */
  const EYES: Eye[] = [
    OPENING_EYE,
    { x: 4, y: -8, heading: 1.3 },
    ...Array.from({ length: 12 }, (_, step) => ({
      x: step * 1.7 - 3.1,
      y: OPENING_EYE.y - step * 2.3,
      heading: (step * Math.PI) / 6 + 0.07,
    })),
  ];

  it('cuts the seam into one-cell runs that laid end to end are the seam again', () => {
    const lawn = new LiveLawn({ seed: 7, layout: meadowLayout(1180, 820, 7) });
    lawn.round(OPENING_EYE);
    const patches = seamPatches(lawn.seam);
    assert.deepEqual(
      patches.flatMap(({ seam }) => seam),
      lawn.seam,
    );
    for (const { cell, seam } of patches) {
      for (const { foot } of seam) assert.deepEqual(cellOf(foot), cell);
    }
  });

  it('draws what looking into every live tuft draws, looking into only the cells the band crosses', () => {
    let every = 0;
    let crossed = 0;
    for (const [name, width, height] of VIEWPORTS) {
      const layout = meadowLayout(width, height, 7);
      for (const eye of EYES) {
        const lawn = new LiveLawn({ seed: 7, layout });
        lawn.round(eye);
        const view = viewAt(layout.camera, eye);
        const banded = lawn.seam.filter(({ foot }) => {
          const away = distanceBetween(eye, foot);
          return away > D_SEE - SEAM_BAND && away < D_SEE + PALE_SPAN;
        });
        const patches = seamPatches(lawn.seam);
        assert.deepEqual(
          shownSeam(view, patches, turfAt(0.5)),
          shownSprouts(view, banded, turfAt(0.5), seamFaded),
          `${name} at ${JSON.stringify(eye)}`,
        );
        every += lawn.seam.length;
        for (const { cell, seam } of patches) {
          if (crossesSeam(eye, cell)) crossed += seam.length;
        }
      }
    }
    // A frame looks into about 1,350 of the 2,835 live tufts: the band, 2.2
    // units deep, crosses about 44 of the 81 live cells, each 4 wide.
    const frames = VIEWPORTS.length * EYES.length;
    assert.ok(
      crossed <= every * 0.55,
      `${crossed / frames} of ${every / frames}`,
    );
  });
});

describe('the seam behind the opening eye', () => {
  it('has ground round the opening eye to 3.08 rad off its heading either way, and none from 3.09, near and far', () => {
    for (const away of [0.5, 3, D_SEE, 40]) {
      for (const side of [1, -1]) {
        const at = (off: number) =>
          hasGround(alongAzimuth(OPENING_EYE, side * off, away));
        assert.ok(at(0) && at(1.5) && at(3.08), `${away}, ${side}`);
        assert.ok(!at(3.09) && !at(Math.PI), `${away}, ${side}`);
      }
    }
  });
});
