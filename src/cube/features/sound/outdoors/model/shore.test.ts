import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FALLING, PERIOD, RADIUS, RISING, seaOf } from './outdoors.test-kit';
import { coastOf, shoreOf, surfAt } from './shore';

describe('shoreOf', () => {
  it('finds the still waterline all round the island, and the bar past it', () => {
    const shore = shoreOf(seaOf(), [0, 0], 12);
    assert.equal(shore.length, 12);
    for (const { shore: at, breaks } of shore) {
      assert.ok(Math.abs(Math.hypot(...at) - RADIUS) <= 0.5);
      assert.ok(Math.hypot(...breaks) > Math.hypot(...at));
    }
  });

  it('gives no stretch where there is no shore', () => {
    const endless = { ...seaOf(), islandHeight: () => 1 };
    assert.deepEqual(shoreOf(endless, [0, 0]), []);
  });
});

describe('surfAt', () => {
  const coast = coastOf(seaOf(), [0, 0]);
  const [stretch] = coast.shore;
  assert.ok(stretch);

  it('runs and breaks while the water climbs, drains while it falls', () => {
    const rising = surfAt(coast, stretch, RISING);
    assert.ok(rising.running > 0.95);
    assert.ok(rising.breaking > 0.9);
    const falling = surfAt(coast, stretch, FALLING);
    assert.ok(falling.draining > 0.95);
    assert.ok(falling.running < 0.1);
  });

  it('lets each sound die away after the water has stopped making it', () => {
    const justAfter = surfAt(coast, stretch, PERIOD / 4 + 0.3);
    assert.ok(justAfter.breaking > 0.01 && justAfter.breaking < 0.5);
    const longAfter = surfAt(coast, stretch, FALLING + 1);
    assert.ok(longAfter.breaking < 0.001);
  });

  it('stays between 0 and 1 and comes round with the sea', () => {
    for (let seconds = 0; seconds < PERIOD; seconds += 0.37) {
      const surf = surfAt(coast, stretch, seconds);
      for (const part of Object.values(surf)) assert.ok(part >= 0 && part <= 1);
      const next = surfAt(coast, stretch, seconds + PERIOD);
      assert.ok(Math.abs(surf.running - next.running) < 1e-9);
    }
  });

  it('is as loud for a small sea as for a big one: the sea sets its own scale', () => {
    const big = coastOf(seaOf(0.6), [0, 0]);
    const [bigStretch] = big.shore;
    assert.ok(bigStretch);
    const small = surfAt(coast, stretch, 1.3);
    const large = surfAt(big, bigStretch, 1.3);
    assert.ok(Math.abs(small.running - large.running) < 1e-6);
    assert.ok(Math.abs(small.breaking - large.breaking) < 1e-6);
  });
});
