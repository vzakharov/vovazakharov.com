import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distanceBetween } from '@/mushrooms/shared/lib/geometry';
import {
  behindHills,
  browDistance,
  cull,
  D_SEE,
  type Eye,
  gaitHeight,
  ofGround,
  OPENING_EYE,
  PALE_SPAN,
  pinholeOf,
  planeOf,
  viewAt,
  zAt,
} from '@/mushrooms/shared/space';
import { FLOWER_DOWN } from '@/mushrooms/entities/flower/index.node-safe';
import {
  LiveLawn,
  tuftSizeAt,
  turfAt,
} from '@/mushrooms/entities/landscape/index.node-safe';
import { VIEWPORTS } from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  SEAM_BAND,
  seamFaded,
  seamPatches,
  shownSeam,
  shownSprouts,
} from '@/mushrooms/features/plant-flower/index.node-safe';
import {
  seamReachOf,
  tuftAt,
} from '@/mushrooms/features/plant-flower/index.test-only';

import { meadowLayout } from './layout';
import { lawnOf, seedOf } from './tufts.test-kit';

describe('shownSprouts', () => {
  /** The opening eye, and one stepped 3 units in. */
  const EYES: ReadonlyArray<[string, Eye]> = [
    ['the opening eye', OPENING_EYE],
    ['an eye stepped in', { ...OPENING_EYE, y: OPENING_EYE.y + 3 }],
  ];

  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, seedOf(1));
    const grown = [
      ...new LiveLawn(lawnOf(layout, seedOf(1))).round(OPENING_EYE),
    ];
    const left = (layout.camera.world - width) / 2;

    it(`draws every tuft at the opening at the azimuth its layout is seen at, bent, on a ${name} screen`, () => {
      const view = viewAt(layout.camera, OPENING_EYE);
      const { near, behind } = shownSprouts(view, grown);
      // Only what is laid past the brow, which curves below the ground's top
      // row toward the screen's sides, sinks at the opening.
      for (const { sprout: sunk } of behind) {
        assert.ok(behindHills(view, ofGround(view, sunk.foot)));
      }
      assert.ok(near.length > 0);
      // The lens shows the layout's ground at the azimuth the opening crop's
      // pinhole sees it at, its row bent as the brow is.
      const { x: middle, y: horizon, focal } = pinholeOf(view);
      for (const {
        tuft,
        sprout: { tuft: laid },
      } of near) {
        const azimuth = Math.atan((laid.x - left - middle) / focal);
        const bend = Math.cos(azimuth) * Math.hypot(1, azimuth);
        assert.ok(Math.abs(tuft.x - (middle + focal * azimuth)) < 0.5);
        assert.ok(
          Math.abs(tuft.y - (horizon + (laid.y - horizon) * bend)) < 0.5,
        );
      }
    });

    for (const [eyeName, eye] of EYES) {
      it(`draws each tuft where ${eyeName} places its foot, and takes a tap there, on a ${name} screen`, () => {
        const view = viewAt(layout.camera, eye);
        const { near } = shownSprouts(view, grown);
        for (const {
          tuft,
          sprout: { foot },
        } of near) {
          const placed = ofGround(view, foot);
          assert.ok(!cull(placed));
          assert.ok(Math.abs(tuft.x - placed.x) < 1e-6);
          assert.ok(Math.abs(tuft.y - placed.y) < 1e-6);
          // Sized by the row its foot stands on, wherever on the plane.
          assert.ok(Math.abs(tuft.size - tuftSizeAt(view, placed.y)) < 1e-6);
          // The nearest drawn tuft takes it, this one or one drawn over it.
          const { x, y, size } = tuft;
          assert.ok(tuftAt(near, { x, y: y - size }));
        }
      });
    }
  }
});

describe('the seam in flight', () => {
  const risen = viewAt(
    meadowLayout(390, 844, 7).camera,
    OPENING_EYE,
    gaitHeight('flight'),
  );
  const flightBrow = browDistance(risen);
  /** How far straight ahead the flowers' band, and with it the lawn's standing tufts, reaches. */
  const bandEnd = planeOf({ x: 0, z: zAt(FLOWER_DOWN[0]) }).y;

  it("reaches from the flowers' band's end to past the risen brow, as near as in steps", () => {
    const steps = seamReachOf(D_SEE);
    assert.deepEqual(steps, {
      near: D_SEE - SEAM_BAND,
      far: D_SEE + PALE_SPAN,
    });
    const flight = seamReachOf(flightBrow);
    assert.equal(flight.near, steps.near);
    assert.ok(flight.far >= flightBrow + PALE_SPAN);
    // No ground between the band's end and the seam bar the seam's own fade.
    assert.ok(flight.near - bandEnd < SEAM_BAND / 2);
  });

  it("draws, risen, every live seam tuft from the seam's near edge to past the brow, the strip under the brow included", () => {
    for (const [name, width, height] of VIEWPORTS) {
      const layout = meadowLayout(width, height, 7);
      for (const eye of [OPENING_EYE, { x: 6, y: 9, heading: 0.7 }]) {
        const lawn = new LiveLawn({ seed: 7, layout });
        lawn.round(eye);
        const view = viewAt(layout.camera, eye, gaitHeight('flight'));
        const { near, far } = seamReachOf(flightBrow);
        const banded = lawn.seam.filter(({ foot }) => {
          const away = distanceBetween(eye, foot);
          return away > near && away < far;
        });
        const shown = shownSeam(view, seamPatches(lawn.seam), turfAt(0));
        assert.deepEqual(
          shown,
          shownSprouts(view, banded, turfAt(0), seamFaded),
          `${name} at ${JSON.stringify(eye)}`,
        );
        const inStrip = shown.near.filter(({ sprout }) => {
          const away = distanceBetween(eye, sprout.foot);
          return away > D_SEE && away < flightBrow - SEAM_BAND;
        });
        assert.ok(inStrip.length > 0, name);
      }
    }
  });
});
