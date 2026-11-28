import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { R, scaled } from '@/island/shared/globe';

import { planeToDegrees, planeToUnit, worldToPlane } from './azimuthal';

describe('the plane on the sphere', () => {
  it('puts the origin at the island centre, 10° N on Greenwich', () => {
    const { lat, lon } = planeToDegrees(0, 0);
    assert.ok(Math.abs(lat - 10) < 1e-12);
    assert.ok(Math.abs(lon) < 1e-12);
  });

  it('maps planeToUnit back through worldToPlane', () => {
    for (const [x, y] of [
      [515_000, 1_750_000],
      [-2_000_000, 300_000],
      [10, -10],
    ] as const) {
      const back = worldToPlane(scaled(planeToUnit(x, y), R));
      assert.ok(Math.abs(back.x - x) < 1e-6, `x ${String(back.x)}`);
      assert.ok(Math.abs(back.y - y) < 1e-6, `y ${String(back.y)}`);
      assert.ok(Math.abs(back.h) < 1e-6);
    }
  });

  it('makes a degree of arc north a degree of latitude', () => {
    // One degree of arc on R is 111,194.9 m.
    const { lat } = planeToDegrees(0, (R * Math.PI) / 180);
    assert.ok(Math.abs(lat - 11) < 1e-9, String(lat));
  });
});
