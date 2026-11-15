import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dipAt, pitchAt } from './look';
import { grazingPitch, lookHint, upHintPitch } from './look-hint';
import { fovFor } from './pose';

const LANDSCAPE = 16 / 9;
const SQUARE = 1;
const PORTRAIT = 1 / 2;

/**
 * How far below the level the ray through a top corner runs, on a screen
 * `aspect` wide pitched down by `pitch`: forward, up and right as the camera
 * holds them over level ground (x ahead, y right, z the sky), the corner at
 * the half fields' tangents along up and right.
 */
function cornerRayDip(pitch: number, aspect: number): number {
  const up = Math.tan(fovFor(aspect) / 2);
  const across = up * aspect;
  const ray = [
    Math.cos(pitch) + up * Math.sin(pitch),
    across,
    -Math.sin(pitch) + up * Math.cos(pitch),
  ] as const;
  return Math.asin(-ray[2] / Math.hypot(...ray));
}

describe('upHintPitch', () => {
  for (const aspect of [LANDSCAPE, SQUARE, PORTRAIT]) {
    for (const height of [100, 1000, 10_000, 100_000, 1_000_000]) {
      it(`puts a top corner's ray on the horizon from ${String(height)} m on ${aspect.toFixed(2)}`, () => {
        const pitch = upHintPitch(height, aspect);
        assert.ok(pitch !== undefined);
        assert.ok(
          Math.abs(cornerRayDip(pitch, aspect) - dipAt(height)) < 1e-12,
        );
      });
    }
  }

  it('is undefined where no pitch puts a corner ray on the horizon', () => {
    for (const aspect of [LANDSCAPE, SQUARE, PORTRAIT]) {
      assert.equal(upHintPitch(20_000_000, aspect), undefined);
      // The corner ray dips furthest a quarter turn past the vertical field.
      const deepest = fovFor(aspect) / 2 + Math.PI / 2;
      assert.ok(cornerRayDip(deepest, aspect) < dipAt(20_000_000));
    }
  });
});

describe('grazingPitch', () => {
  it('is the side-edge pitch asin(sin δ / cos θh) with no vertical field', () => {
    for (const dip of [0.001, 0.1, 0.5]) {
      for (const across of [0.2, 0.6, 1]) {
        const pitch = grazingPitch(dip, 0, across);
        const side = Math.asin(Math.sin(dip) / Math.cos(across));
        assert.ok(pitch !== undefined);
        assert.ok(Math.abs(pitch - side) < 1e-12);
      }
    }
  });
});

describe('lookHint', () => {
  it('says look down once the pitch the height gives reaches its floor', () => {
    for (const height of [2, 20]) {
      assert.equal(lookHint({ height, look: 0 }, LANDSCAPE), 'down');
    }
  });

  it('says look up where the horizon shows at the top corners', () => {
    for (const height of [100, 1000]) {
      for (const aspect of [LANDSCAPE, SQUARE]) {
        assert.equal(lookHint({ height, look: 0 }, aspect), 'up');
      }
    }
  });

  it('says nothing where the pitch the height gives hides the horizon', () => {
    for (const height of [10_000, 100_000, 1_000_000]) {
      const threshold = upHintPitch(height, LANDSCAPE);
      assert.ok(threshold !== undefined && pitchAt(height) > threshold);
      assert.equal(lookHint({ height, look: 0 }, LANDSCAPE), undefined);
    }
  });

  it('says nothing from orbit', () => {
    for (const aspect of [LANDSCAPE, SQUARE, PORTRAIT]) {
      assert.equal(
        lookHint({ height: 20_000_000, look: 0 }, aspect),
        undefined,
      );
    }
  });

  it('says nothing where a corner ray would graze only past straight down', () => {
    for (const [height, aspect] of [
      [3_000_000, LANDSCAPE],
      [6_000_000, SQUARE],
    ] as const) {
      assert.equal(upHintPitch(height, aspect), undefined);
      assert.equal(lookHint({ height, look: 0 }, aspect), undefined);
    }
  });

  it('says nothing once the look is moved', () => {
    assert.equal(lookHint({ height: 2, look: 0.1 }, LANDSCAPE), undefined);
    assert.equal(lookHint({ height: 100, look: -0.1 }, LANDSCAPE), undefined);
  });
});
