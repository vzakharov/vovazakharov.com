import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bandpass, type Filter, noise, resonator } from './filter';
import { powerIn } from './spectrum.test-kit';

const RATE = 16_000;

const through = (filter: Filter, seed: number): Float32Array => {
  const random = noise(seed);
  return Float32Array.from({ length: RATE }, () => filter.run(random()));
};

describe('noise', () => {
  it('is the same for the same seed and stays within ±1', () => {
    const one = noise(7);
    const other = noise(7);
    for (let n = 0; n < 1000; n += 1) {
      const sample = one();
      assert.equal(sample, other());
      assert.ok(sample >= -1 && sample < 1);
    }
  });

  it('differs wholeBetween seeds, zero included', () => {
    assert.notEqual(noise(1)(), noise(2)());
    assert.notEqual(noise(0)(), 0);
  });
});

describe('resonator', () => {
  it('rings where it is tuned', () => {
    const filter = resonator(RATE);
    filter.tune(1500, 80);
    const rung = through(filter, 3);
    const near = powerIn(rung, RATE, 1400, 1600);
    assert.ok(near > 10 * powerIn(rung, RATE, 3400, 3600));
    assert.ok(near > 10 * powerIn(rung, RATE, 400, 600));
  });

  it('passes a sample as it came when tuned out of reach', () => {
    const filter = resonator(RATE);
    filter.tune(9000, 100);
    assert.equal(filter.run(0.5), 0.5);
    assert.equal(filter.run(-0.25), -0.25);
  });
});

describe('bandpass', () => {
  it('keeps its band and loses the rest', () => {
    const filter = bandpass(RATE);
    filter.tune(5000, 1000);
    const hissed = through(filter, 5);
    assert.ok(
      powerIn(hissed, RATE, 4800, 5200) > 20 * powerIn(hissed, RATE, 800, 1200),
    );
  });
});
