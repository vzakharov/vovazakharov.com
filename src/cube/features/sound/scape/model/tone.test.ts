import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertAudible,
  brightness,
  loudness,
  TEST_RATE,
} from '../../dsp/index.test-only';
import { air, hum, impulse } from './tone';

/** The biggest jump between neighbouring samples, the loop's seam included. */
function roughest(samples: Float32Array): number {
  let most = 0;
  for (const [index, sample] of samples.entries()) {
    most = Math.max(most, Math.abs(sample - (samples.at(index - 1) ?? 0)));
  }
  return most;
}

/** How strongly `samples` holds a sine of `hz`. */
function held(samples: Float32Array, hz: number): number {
  let cos = 0;
  let sin = 0;
  for (const [index, sample] of samples.entries()) {
    const turn = (2 * Math.PI * hz * index) / TEST_RATE;
    cos += sample * Math.cos(turn);
    sin += sample * Math.sin(turn);
  }
  return Math.hypot(cos, sin) / samples.length;
}

describe('hum', () => {
  it('is finite, inside ±1, about two seconds, the same from the same seed', () => {
    for (const hz of [50, 100, 120, 59.94, 400]) {
      const samples = hum(hz, 3, TEST_RATE);
      assertAudible(samples);
      assert.ok(Math.abs(samples.length / TEST_RATE - 2) < 0.02);
      assert.deepEqual(samples, hum(hz, 3, TEST_RATE));
      assert.notDeepEqual(samples, hum(hz, 4, TEST_RATE));
    }
  });

  it('hums at the pitch asked for, with harmonics over it', () => {
    const samples = hum(100, 3, TEST_RATE);
    assert.ok(held(samples, 100) > 20 * held(samples, 130));
    assert.ok(held(samples, 300) > 5 * held(samples, 130));
  });

  it('loops with no seam', () => {
    for (const hz of [100, 120, 59.94]) {
      const samples = hum(hz, 3, TEST_RATE);
      const seam = Math.abs((samples[0] ?? 0) - (samples.at(-1) ?? 0));
      assert.ok(seam <= roughest(samples.subarray(1)) * 1.01, `${hz}`);
    }
  });

  it('is silence where the lamps make none', () => {
    assert.deepEqual(hum(0, 3, TEST_RATE), new Float32Array(1));
  });
});

describe('air', () => {
  it('is four seconds of dull noise, the same from the same seed', () => {
    const samples = air(8, TEST_RATE);
    assertAudible(samples);
    assert.equal(samples.length, 4 * TEST_RATE);
    assert.deepEqual(samples, air(8, TEST_RATE));
    assert.notDeepEqual(samples, air(9, TEST_RATE));
    assert.ok(brightness(samples, 3000) < 0.1);
  });

  it('loops with no seam and no dip where its tail is folded in', () => {
    const samples = air(8, TEST_RATE);
    const seam = Math.abs((samples[0] ?? 0) - (samples.at(-1) ?? 0));
    assert.ok(seam <= roughest(samples.subarray(1)));
    const folded = loudness(samples.subarray(0, TEST_RATE / 2));
    const rest = loudness(samples.subarray(TEST_RATE));
    assert.ok(folded > 0.6 * rest && folded < 1.6 * rest);
  });
});

describe('impulse', () => {
  it('lasts the echo asked for, with unit energy whatever its length', () => {
    for (const echo of [0.3, 1.2, 4]) {
      const samples = impulse(echo, 5, TEST_RATE);
      assert.equal(samples.length, Math.round(echo * TEST_RATE));
      assert.ok(samples.every((sample) => Math.abs(sample) <= 1));
      const energy = samples.reduce((sum, sample) => sum + sample * sample, 0);
      assert.ok(Math.abs(energy - 1) < 1e-3);
      assert.deepEqual(samples, impulse(echo, 5, TEST_RATE));
      assert.notDeepEqual(samples, impulse(echo, 6, TEST_RATE));
    }
  });

  it('dies away: its last tenth is 50 dB under its first', () => {
    const samples = impulse(2, 5, TEST_RATE);
    const tenth = samples.length / 10;
    assert.ok(
      loudness(samples.subarray(-tenth)) <
        loudness(samples.subarray(0, tenth)) / 300,
    );
  });

  it('gives a dead room a short tail all the same', () => {
    assert.equal(impulse(0, 5, TEST_RATE).length, Math.round(0.08 * TEST_RATE));
  });
});
