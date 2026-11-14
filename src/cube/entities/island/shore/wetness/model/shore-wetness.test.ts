import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble, scalarWgsl } from '@/cube/shared/shader';

import { turnsAt } from '../../../sea';
import { sheetDepth } from '../../level/index.test-only';
import { dampAfter, drySince, filmAfter } from './shore-wetness';
import { SHORE_WETNESS } from './shore-wetness.shader';
import { NEVER_WET } from './shore-wetness-numbers';

const shader = scalarWgsl(assemble([SHORE_WETNESS]));

describe('how long the sand has been dry', () => {
  it('is in WGSL what it is in the script', () => {
    for (const tau of [0, 3.7, 211.25, 1799.9, 3333.3]) {
      for (const bed of [-0.3, 0, 0.02, 0.08, 0.15, 0.3, 0.8]) {
        for (const shelter of [0.3, 1]) {
          const expected = drySince(tau, bed, shelter);
          const got = shader('drySince', tau, bed, shelter);
          assert.ok(
            Math.abs(got - expected) < 1e-9,
            `${String(tau)} ${String(bed)}`,
          );
        }
      }
    }
    for (const dry of [0, 0.3, 2, 30, NEVER_WET]) {
      assert.ok(Math.abs(shader('dampAfter', dry) - dampAfter(dry)) < 1e-12);
      assert.ok(Math.abs(shader('filmAfter', dry) - filmAfter(dry)) < 1e-12);
    }
  });

  it('is nothing while a sheet lies on the sand, and counts up once it has gone', () => {
    const bed = 0.08;
    let last = 0;
    let wetSteps = 0;
    for (let tau = 100; tau < 400; tau += 0.05) {
      const n = Math.floor(turnsAt(tau));
      const under =
        Math.max(sheetDepth(n, tau, bed, 1), sheetDepth(n - 1, tau, bed, 1)) >
        0;
      const dry = drySince(tau, bed, 1);
      if (under) {
        wetSteps += 1;
        assert.equal(dry, 0, `under a sheet at ${String(tau)}`);
      } else if (last > 0 && dry > 0) {
        assert.ok(Math.abs(dry - last - 0.05) < 1e-6, `at ${String(tau)}`);
      }
      last = dry;
    }
    assert.ok(wetSteps > 500, String(wetSteps));
  });

  it('never was wet above the reach of every wave, and always is below the sea', () => {
    for (let tau = 0; tau < 600; tau += 1.3) {
      assert.equal(drySince(tau, 0.7, 1), NEVER_WET);
      assert.equal(drySince(tau, -0.1, 1), 0);
    }
  });
});
