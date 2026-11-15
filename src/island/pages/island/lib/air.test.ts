import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { R } from '@/island/shared/globe';

import {
  adaptedTo,
  airAtEye,
  airColumn,
  GAS,
  HAZE,
  lightThrough,
  tintOf,
} from './air';

const near = (actual: number, expected: number, share: number) => {
  assert.ok(
    Math.abs(actual - expected) <= Math.abs(expected) * share,
    `${String(actual)} is not within ${String(share)} of ${String(expected)}`,
  );
};

describe('airAtEye', () => {
  it('is the real air on the ground, with no excess', () => {
    assert.deepEqual(airAtEye(0), { air: 1, excess: 0 });
    near(airAtEye(2).air, 1, 1e-3);
  });

  it('has none at orbit and above', () => {
    for (const height of [20_000_000, 40_000_000]) {
      const { air, excess } = airAtEye(height);
      near(air, 0, 0);
      near(excess, 0, 0);
    }
  });

  it('keeps the same air from the real air`s end to 100 km', () => {
    assert.equal(airAtEye(30_000).air, airAtEye(100_000).air);
    assert.ok(airAtEye(100_000).air > 0.1);
  });

  it('never thickens on the way up, and never jumps', () => {
    let below = airAtEye(1).air;
    for (let height = 1; height <= 20_000_000; height *= 1.05) {
      const { air, excess } = airAtEye(height);
      assert.ok(air <= below, `${String(height)} m`);
      assert.ok(below - air < 0.05, `${String(height)} m`);
      assert.ok(excess >= 0);
      below = air;
    }
  });
});

describe('airColumn', () => {
  it('is one scale height straight up from the sea', () => {
    near(airColumn(1, 0, GAS), GAS.scale, 0.01);
    near(airColumn(1, 0, HAZE), HAZE.scale, 0.01);
  });

  it('is Chapman`s √(πR/2H) scale heights along the horizon', () => {
    near(airColumn(0, 0, GAS) / GAS.scale, 35.4, 0.01);
  });

  it('grows as the ray lowers, with no step at the level', () => {
    let column = airColumn(1, 0, GAS);
    for (let cosine = 0.99; cosine >= 0; cosine -= 0.01) {
      const lower = airColumn(cosine, 0, GAS);
      assert.ok(lower > column, String(cosine));
      column = lower;
    }
    near(airColumn(-1e-9, 2, GAS), airColumn(0, 2, GAS), 1e-6);
  });

  it('crosses the air twice on a ray from orbit past the limb', () => {
    const height = 20_000_000;
    // A ray whose lowest point is at sea level.
    const cosine = -Math.sqrt(1 - (R / (R + height)) ** 2);
    near(airColumn(cosine, height, GAS), 2 * airColumn(0, 0, GAS), 1e-3);
    // One passing 100 km over the sea meets almost none.
    const high = -Math.sqrt(1 - ((R + 100_000) / (R + height)) ** 2);
    assert.ok(airColumn(high, height, GAS) < 10);
  });

  it('thins with height, and takes the eye`s excess', () => {
    assert.ok(airColumn(0.5, 8000, GAS) < airColumn(0.5, 0, GAS) * 0.4);
    near(airColumn(1, 1e9, GAS, 0.1), GAS.scale * 0.1, 0.01);
  });
});

describe('lightThrough', () => {
  const NOON = 1;
  const LOW = 0.05;

  it('keeps most of a high sun and reddens a low one', () => {
    const [r, g, b] = lightThrough(NOON, 0);
    assert.ok(r > 0.9 && b > 0.7 && r > g && g > b);
    const [lowR, lowG, lowB] = lightThrough(LOW, 0);
    assert.ok(lowR > 2 * lowG && lowG > 2 * lowB);
  });

  it('is nothing in the planet`s shadow', () => {
    for (const channel of lightThrough(-0.2, 0)) assert.ok(channel < 1e-6);
  });

  it('still lights the air high over ground the sun has set on', () => {
    const [red] = lightThrough(-0.05, 24_000);
    assert.ok(red > 0.5);
  });

  it('is whole above the air', () => {
    for (const channel of lightThrough(LOW, 20_000_000)) near(channel, 1, 0);
  });
});

describe('the eye`s adapting and the sun`s tint', () => {
  it('opens to a low sun and no further than to the dimmest', () => {
    assert.equal(adaptedTo([1, 1, 1]), 1);
    assert.ok(adaptedTo(lightThrough(0.05, 0)) > 1.2);
    assert.equal(adaptedTo([0, 0, 0]), adaptedTo([0.05, 0, 0]));
  });

  it('tints a low sun warm at full strength and puts a set one out', () => {
    const [r, g, b] = tintOf(lightThrough(0.05, 0));
    assert.equal(r, 1);
    assert.ok(g < 0.6 && b < g);
    for (const channel of tintOf(lightThrough(-0.2, 0))) {
      assert.ok(channel < 1e-4);
    }
  });
});
