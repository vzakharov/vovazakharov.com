import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Footing, FOOTINGS } from '@/cube/entities/theme';

import { footstep, stepSeconds } from './footstep';
import {
  assertAudible,
  brightness,
  loudness,
  peak,
  RATE,
} from './sound.test-kit';

const bright = (footing: Footing) =>
  brightness(footstep(footing, 0.7, 9, RATE), 1500);

const late = (footing: Footing) =>
  loudness(footstep(footing, 0.7, 9, RATE).subarray(0.12 * RATE));

describe('footstep', () => {
  it('is finite, inside ±1 and as long as its footing lasts, at any rate', () => {
    for (const footing of FOOTINGS) {
      for (const rate of [RATE, 44_100, 22_050]) {
        for (const strength of [0, 0.5, 1, 7]) {
          const samples = footstep(footing, strength, 1, rate);
          assertAudible(samples);
          assert.equal(samples.length, Math.round(stepSeconds(footing) * rate));
        }
      }
    }
  });

  it('is the same for the same seed and another step for another', () => {
    for (const footing of FOOTINGS) {
      assert.deepEqual(
        footstep(footing, 0.6, 42, RATE),
        footstep(footing, 0.6, 42, RATE),
      );
      assert.notDeepEqual(
        footstep(footing, 0.6, 42, RATE),
        footstep(footing, 0.6, 43, RATE),
      );
    }
  });

  it('differs between any two footings', () => {
    const steps = FOOTINGS.map((footing) => footstep(footing, 0.6, 7, RATE));
    for (const [index, step] of steps.entries()) {
      for (const other of steps.slice(index + 1)) {
        assert.notDeepEqual(step, other);
      }
    }
  });

  it('is louder the harder the step', () => {
    for (const footing of FOOTINGS) {
      const soft = footstep(footing, 0.1, 3, RATE);
      const hard = footstep(footing, 1, 3, RATE);
      assert.ok(loudness(hard) > 1.5 * loudness(soft), footing);
    }
  });

  it('starts and ends at nothing, so it cannot click', () => {
    for (const footing of FOOTINGS) {
      const samples = footstep(footing, 1, 5, RATE);
      assert.ok(Math.abs(samples[0] ?? 1) < 0.2 * peak(samples), footing);
      assert.equal(Math.abs(samples.at(-1) ?? 1), 0);
    }
  });

  it('sounds like what is underfoot: tile is bright, carpet dull, metal rings', () => {
    assert.ok(bright('tile') > 2 * bright('carpet'));
    assert.ok(bright('concrete') > bright('soft'));
    assert.ok(late('metal') > 4 * late('wood'));
    assert.ok(stepSeconds('metal') > stepSeconds('tile'));
  });
});
