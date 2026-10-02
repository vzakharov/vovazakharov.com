import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CLUMP_DISTANCE, OPENING_EYE } from '../../model/ground';
import { shadowOf } from './insect-shadow';
import { meadowCamera } from './meadow-camera';
import { D_SEE, type Placed, placedAt, type View, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** An insect's open wings, in CSS px at its own size. */
const SPAN = 40;
/** The depths of `paint-backdrop.ts`'s near hills and ground, which what sinks stands between. */
const [NEAR_HILLS, GROUND] = [-4, -3];

/** The ground `distance` straight ahead of `view`'s eye, a little off the middle. */
function groundOf(view: View, distance: number): Placed {
  return placedAt(view, { x: 0.3, y: distance }, 0, CLUMP_DISTANCE);
}

describe('an insect’s shadow', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const view = viewAt(meadowCamera(width, height), OPENING_EYE);
    it(`${name}: a flat ellipse, smaller, flatter and fainter the farther, sorted on its row`, () => {
      const near = shadowOf(
        view,
        groundOf(view, 0.9 * CLUMP_DISTANCE),
        SPAN,
        1,
      );
      const far = shadowOf(view, groundOf(view, 0.9 * D_SEE), SPAN, 1);
      assert.ok(near && far);
      for (const shadow of [near, far]) {
        assert.ok(shadow.tall < shadow.across);
        assert.ok(shadow.depth > 0);
      }
      assert.ok(far.across < near.across);
      assert.ok(far.tall / far.across < near.tall / near.across);
      assert.ok(far.alpha < near.alpha);
      assert.ok(far.depth < near.depth);
    });

    it(`${name}: sinks behind the brow with the beds, and is none once under it`, () => {
      const past = shadowOf(view, groundOf(view, D_SEE + 0.02), SPAN, 1);
      assert.ok(past);
      assert.ok(past.depth > NEAR_HILLS && past.depth < GROUND);
      assert.equal(
        shadowOf(view, groundOf(view, D_SEE + 3), SPAN, 1),
        undefined,
      );
    });

    it(`${name}: fades with its insect’s landing, and is none once it sits`, () => {
      const ground = groundOf(view, CLUMP_DISTANCE);
      const full = shadowOf(view, ground, SPAN, 1);
      const half = shadowOf(view, ground, SPAN, 0.5);
      assert.ok(full && half);
      assert.ok(Math.abs(half.alpha - full.alpha / 2) < 1e-12);
      assert.equal(shadowOf(view, ground, SPAN, 0), undefined);
    });
  }
});
