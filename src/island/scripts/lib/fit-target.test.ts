import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { coast } from '@/island/entities/coast';
import { DOME_RANGES, SQUARE } from '@/island/entities/terrain';

import {
  assertInside,
  domeFromBounds,
  reachOf,
  ringBounds,
  targetOf,
} from './fit-target';

const { centreX, centreY, side } = SQUARE;

describe('ringBounds', () => {
  it('spans every ring, in metres', () => {
    const bounds = ringBounds({
      kmPerPixel: 1,
      rings: [
        [
          [0, 0],
          [2, 0],
          [0, 1],
        ],
        [
          [-3, 5],
          [-1, 5],
          [-1, 4],
        ],
      ],
    });
    assert.deepEqual(bounds, { minX: -3000, maxX: 2000, minY: 0, maxY: 5000 });
  });
});

describe('assertInside', () => {
  it('holds the drawn rings inside the waves’ window, 0.40 of the side out', () => {
    const bounds = ringBounds(coast);
    assert.doesNotThrow(() => {
      assertInside(bounds, 0.4);
    });
    const { x, y } = reachOf(bounds);
    assert.ok(x > 0.3 && y > 0.2, `${String(x)}, ${String(y)}`);
  });

  it('throws for a box reaching past the limit', () => {
    const bounds = {
      minX: centreX - 0.1 * side,
      maxX: centreX + 0.45 * side,
      minY: centreY,
      maxY: centreY,
    };
    assert.deepEqual(reachOf(bounds), { x: 0.45, y: 0 });
    assert.throws(() => {
      assertInside(bounds, 0.4);
    }, /0\.450/);
  });
});

describe('domeFromBounds', () => {
  it('takes the half-extents as radii, centred and unturned', () => {
    const dome = domeFromBounds({
      minX: centreX - 0.2 * side,
      maxX: centreX + 0.2 * side,
      minY: centreY - 0.17 * side,
      maxY: centreY + 0.17 * side,
    });
    assert.equal(dome.centreX, 0);
    assert.equal(dome.centreY, 0);
    assert.equal(dome.turn, 0);
    assert.ok(Math.abs(dome.radiusA - 0.2) < 1e-12);
    assert.ok(Math.abs(dome.radiusB - 0.17) < 1e-12);
  });

  it('clamps the radii into range', () => {
    const dome = domeFromBounds({
      minX: centreX - 0.4 * side,
      maxX: centreX + 0.4 * side,
      minY: centreY - 0.01 * side,
      maxY: centreY + 0.01 * side,
    });
    assert.equal(dome.radiusA, DOME_RANGES.radiusA[1]);
    assert.equal(dome.radiusB, DOME_RANGES.radiusB[0]);
  });
});

describe('targetOf', () => {
  it('clips the distance, then scales it', () => {
    const target = targetOf(Float64Array.from([-5000, -1000, 0, 700, 9000]), {
      clipMetres: 2000,
      scale: 1 / 1024,
    });
    assert.deepEqual(
      [...target],
      [-2000, -1000, 0, 700, 2000].map((d) => d / 1024),
    );
  });
});
