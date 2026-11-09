import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { harmonicSlot, sphereTransform, synthesize } from '../../series';
import { landShare } from './land-measure';
import {
  fieldDeviation,
  kneeEnvelope,
  landSeries,
  PROBE_ENVELOPE,
  SEA_MEAN,
  SEA_SPREAD,
} from './land-series';
import { rollWorld } from './world-schema';

describe('landSeries', () => {
  it('scales each harmonic by its degree’s envelope', () => {
    const degree = 6;
    const world = rollWorld('4', degree);
    const c = landSeries(world.land, degree, PROBE_ENVELOPE);
    assert.equal(c.length, 49);
    assert.equal(
      c[harmonicSlot(5, -3)],
      (36 + 25) ** -1 * world.land.harmonic.at({ l: 5, m: -3 }),
    );
    assert.equal(
      c[0],
      Math.sqrt(4 * Math.PI) *
        fieldDeviation(PROBE_ENVELOPE, degree) *
        (SEA_MEAN + SEA_SPREAD * world.land.sea),
    );
  });

  it('measures σ as the field’s expected deviation', () => {
    const flat = kneeEnvelope(0, 0);
    // Σ_{l=1}^{L} (2l + 1) = (L + 1)² − 1.
    assert.equal(fieldDeviation(flat, 9), Math.sqrt(99 / (4 * Math.PI)));
  });

  it('pins the sea so random worlds average Earth’s 29% land', () => {
    assert.deepEqual([SEA_MEAN, SEA_SPREAD], [-0.556, 0.1]);
    // The share is set by the low degrees, so a degree of 48 stands in for
    // 511 (worlds 1–50 average 29.0% at 511).
    const degree = 48;
    const transform = sphereTransform(degree);
    const worlds = 100;
    let total = 0;
    for (let n = 1; n <= worlds; n += 1) {
      const c = landSeries(
        rollWorld(String(n), degree).land,
        degree,
        PROBE_ENVELOPE,
      );
      total += landShare(transform.grid, synthesize(transform, c));
    }
    const mean = total / worlds;
    assert.ok(Math.abs(mean - 0.29) < 0.01, `mean land share ${mean}`);
  });
});
