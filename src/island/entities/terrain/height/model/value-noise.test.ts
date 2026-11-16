import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { noiseSalt, valueNoise3 } from './value-noise';

/** A deterministic stream in `[0, 1)`, so a failure reproduces. */
function stream(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

/** The steepest the noise climbs per lattice step: 15/8 of 2, on three axes. */
const STEEPEST = 3.75 * Math.sqrt(3);

const SALT = noiseSalt(7, 3);

const PINNED = [
  0.263_591_548_640_031_76, 0.037_321_825_417_872_99, 0.479_051_574_327_407_1,
];

describe('valueNoise3', () => {
  it('pins its values, so no change to the hash goes unseen', () => {
    const pinned = [
      [0.5, 0.25, 0.125],
      [-3.7, 12.01, 1_040_000.5],
      [123_456.789, -98_765.4321, 5.5],
    ] as const;
    assert.deepEqual(
      pinned.map(([u, v, w]) => valueNoise3(SALT, u, v, w)),
      PINNED,
    );
  });

  it('stays in [-1, 1] and spreads over it', () => {
    const next = stream(1);
    let low = Infinity;
    let high = -Infinity;
    for (let k = 0; k < 20_000; k++) {
      const n = valueNoise3(
        SALT,
        (next() - 0.5) * 2e6,
        (next() - 0.5) * 2e6,
        (next() - 0.5) * 2e6,
      );
      low = Math.min(low, n);
      high = Math.max(high, n);
    }
    assert.ok(low >= -1 && high <= 1, `${low} … ${high}`);
    assert.ok(low < -0.9 && high > 0.9, `${low} … ${high}`);
  });

  it('is continuous: no pair a micro-step apart climbs past its steepest', () => {
    const next = stream(2);
    const step = 1e-6;
    for (let k = 0; k < 20_000; k++) {
      // Every third pair straddles a lattice plane on each axis.
      const near = (scale: number) =>
        k % 3 === 0
          ? Math.round((next() - 0.5) * scale) - step / 2
          : (next() - 0.5) * scale;
      const [u, v, w] = [near(2e6), near(2e6), near(2e6)];
      const a = valueNoise3(SALT, u, v, w);
      const b = valueNoise3(SALT, u + step, v + step, w + step);
      const bound = STEEPEST * step * Math.sqrt(3) + 1e-9;
      assert.ok(Math.abs(b - a) <= bound, `${u}, ${v}, ${w}: ${b - a}`);
    }
  });

  it('gives the same value for the same input and unrelated ones per salt', () => {
    const next = stream(3);
    let differing = 0;
    for (let k = 0; k < 200; k++) {
      const [u, v, w] = [next() * 1e5, next() * 1e5, next() * 1e5];
      const once = valueNoise3(SALT, u, v, w);
      assert.equal(valueNoise3(SALT, u, v, w), once);
      if (valueNoise3(noiseSalt(8, 3), u, v, w) !== once) differing += 1;
    }
    assert.equal(differing, 200);
  });
});
