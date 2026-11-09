import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dipAt } from './look';
import { lookHint, upHintPitch } from './look-hint';
import { fovFor } from './pose';

const LANDSCAPE = 16 / 9;
const PORTRAIT = 1 / 2;

/**
 * How far below the level the ray through a side edge's middle runs, on a
 * screen `aspect` wide pitched down by `pitch`: the camera's forward turned
 * by half the horizontal field about its up.
 */
function edgeRayDip(pitch: number, aspect: number): number {
  const across = 2 * Math.atan(Math.tan(fovFor(aspect) / 2) * aspect);
  return Math.asin(Math.sin(pitch) * Math.cos(across / 2));
}

describe('upHintPitch', () => {
  for (const aspect of [LANDSCAPE, PORTRAIT]) {
    for (const height of [100, 10_000, 1_000_000]) {
      it(`grazes the horizon at the side edges from ${String(height)} m on ${aspect.toFixed(2)}`, () => {
        const pitch = upHintPitch(height, aspect);
        assert.ok(Math.abs(edgeRayDip(pitch, aspect) - dipAt(height)) < 1e-12);
      });
    }
  }

  it('is straight down where the side edges miss the planet at every pitch', () => {
    assert.equal(upHintPitch(20_000_000, LANDSCAPE), Math.PI / 2);
    assert.ok(edgeRayDip(Math.PI / 2, LANDSCAPE) < dipAt(20_000_000));
  });

  it('lies below the dip on a portrait screen less than on a landscape one', () => {
    assert.ok(upHintPitch(10_000, PORTRAIT) < upHintPitch(10_000, LANDSCAPE));
    assert.ok(upHintPitch(10_000, PORTRAIT) > dipAt(10_000));
  });
});

describe('lookHint', () => {
  it('says look down once the pitch the height gives reaches its floor', () => {
    for (const height of [2, 20]) {
      assert.equal(lookHint({ height, look: 0 }, LANDSCAPE), 'down');
    }
  });

  it('says look up at 20,000 km, the side edges past the planet', () => {
    assert.equal(lookHint({ height: 20_000_000, look: 0 }, LANDSCAPE), 'up');
    assert.equal(lookHint({ height: 20_000_000, look: 0 }, PORTRAIT), 'up');
  });

  it('says nothing where the pitch the height gives stands over the horizon', () => {
    for (const height of [100, 10_000, 1_000_000]) {
      assert.equal(lookHint({ height, look: 0 }, LANDSCAPE), undefined);
    }
  });

  it('says nothing once the look is moved', () => {
    assert.equal(lookHint({ height: 2, look: 0.1 }, LANDSCAPE), undefined);
    assert.equal(lookHint({ height: 2, look: -0.1 }, LANDSCAPE), undefined);
    assert.equal(
      lookHint({ height: 20_000_000, look: -0.1 }, LANDSCAPE),
      undefined,
    );
  });
});
