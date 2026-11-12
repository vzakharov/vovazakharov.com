import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FOOTINGS, GROUNDS, type Underfoot } from '@/cube/shared/lib/acoustics';

import {
  assertAllDiffer,
  assertAudible,
  brightness,
  loudness,
  peak,
  TEST_RATE,
} from '../../dsp/index.test-only';
import { footstep, stepSeconds } from './footstep';

const UNDERFOOT = [...FOOTINGS, ...GROUNDS] as const;

const bright = (footing: Underfoot) =>
  brightness(footstep(footing, 0.7, 9, TEST_RATE), 1500);

const late = (footing: Underfoot) =>
  loudness(footstep(footing, 0.7, 9, TEST_RATE).subarray(0.12 * TEST_RATE));

describe('footstep', () => {
  it('is finite, inside ±1 and as long as its footing lasts, at any rate', () => {
    for (const footing of UNDERFOOT) {
      for (const rate of [TEST_RATE, 44_100, 22_050]) {
        for (const strength of [0, 0.5, 1, 7]) {
          const samples = footstep(footing, strength, 1, rate);
          assertAudible(samples);
          assert.equal(samples.length, Math.round(stepSeconds(footing) * rate));
        }
      }
    }
  });

  it('is the same for the same seed and another step for another', () => {
    for (const footing of UNDERFOOT) {
      assert.deepEqual(
        footstep(footing, 0.6, 42, TEST_RATE),
        footstep(footing, 0.6, 42, TEST_RATE),
      );
      assert.notDeepEqual(
        footstep(footing, 0.6, 42, TEST_RATE),
        footstep(footing, 0.6, 43, TEST_RATE),
      );
    }
  });

  it('differs between any two footings', () => {
    assertAllDiffer(
      UNDERFOOT.map((footing) => footstep(footing, 0.6, 7, TEST_RATE)),
    );
  });

  it('is louder the harder the step', () => {
    for (const footing of UNDERFOOT) {
      const soft = footstep(footing, 0.1, 3, TEST_RATE);
      const hard = footstep(footing, 1, 3, TEST_RATE);
      assert.ok(loudness(hard) > 1.5 * loudness(soft), footing);
    }
  });

  it('starts and ends at nothing, so it cannot click', () => {
    for (const footing of UNDERFOOT) {
      const samples = footstep(footing, 1, 5, TEST_RATE);
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

  it('gives on dry sand, packs when wet, and sloshes in the shallows', () => {
    assert.ok(bright('sand') > bright('wet-sand'));
    assert.ok(late('shallows') > 2 * late('wet-sand'));
    assert.ok(stepSeconds('shallows') > stepSeconds('sand'));
  });
});
