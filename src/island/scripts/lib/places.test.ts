import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { planeToDegrees } from './azimuthal';
import { INLET, INLET_BEACH, INLET_HEAD } from './places';

/** About 0.1 m on the ground: the six decimals the places are written to. */
const WITHIN = 1e-6;

describe('places', () => {
  for (const [name, place, x, y] of [
    ['INLET', INLET, 515_000, 1_750_000],
    ['INLET_HEAD', INLET_HEAD, 510_000, 1_250_000],
    ['INLET_BEACH', INLET_BEACH, 499_000, 1_113_200],
  ] as const) {
    it(`puts ${name} where the trace's plane point maps`, () => {
      const want = planeToDegrees(x, y);
      assert.ok(Math.abs(place.lat - want.lat) < WITHIN, `${want.lat}`);
      assert.ok(Math.abs(place.lon - want.lon) < WITHIN, `${want.lon}`);
    });
  }
});
