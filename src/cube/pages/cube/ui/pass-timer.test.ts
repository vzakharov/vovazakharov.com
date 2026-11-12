import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { spansOf, timesLine } from './pass-timer';

describe('timesLine', () => {
  it('names every stage in frame order', () => {
    assert.equal(
      timesLine({ scene: 4, mirrors: 2.5, glow: 0.5, lens: 1.25 }),
      'GPU ms: scene 4.00 · mirrors 2.50 · glow 0.50 · lens 1.25',
    );
  });
});

describe('spansOf', () => {
  it('reads each stage between its stamps, in milliseconds', () => {
    const stamps = BigInt64Array.from([
      1_000_000n,
      5_000_000n,
      7_500_000n,
      8_000_000n,
      9_250_000n,
    ]);
    assert.deepEqual(spansOf(stamps), {
      scene: 4,
      mirrors: 2.5,
      glow: 0.5,
      lens: 1.25,
    });
  });

  it('reads a stamp that ran backwards as no time', () => {
    const stamps = BigInt64Array.from([5n, 1n, 1n, 1n, 1n]);
    assert.equal(spansOf(stamps).scene, 0);
  });
});
