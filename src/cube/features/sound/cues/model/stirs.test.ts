import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertAudible,
  brightness,
  loudness,
  TEST_RATE,
} from '../../dsp/index.test-only';
import { creak, mew, pop, rustle, scrape } from './stirs';

const STIRS = { creak, mew, pop, rustle, scrape };

/** The loudness of `samples` over the tenth of them starting at `from`. */
const tenthAt = (samples: Float32Array, from: number): number => {
  const tenth = Math.round(samples.length / 10);
  const start = Math.round(from * samples.length);
  return loudness(samples.subarray(start, start + tenth));
};

describe('what stirs in a room', () => {
  it('is finite and inside ±1, the same from the same seed', () => {
    for (const [name, sound] of Object.entries(STIRS)) {
      for (const seed of [0, 9, 0xff_ff_ff_ff]) {
        assertAudible(sound(seed, TEST_RATE));
      }
      assert.deepEqual(sound(4, TEST_RATE), sound(4, TEST_RATE), name);
      assert.notDeepEqual(sound(4, TEST_RATE), sound(5, TEST_RATE), name);
    }
  });

  it('pops at once and is over', () => {
    const samples = pop(1, TEST_RATE);
    assert.ok(tenthAt(samples, 0) > 10 * tenthAt(samples, 0.8));
  });

  it('swells into a creak, a scrape and a mew rather than starting on them', () => {
    for (const sound of [creak, scrape, mew]) {
      const samples = sound(2, TEST_RATE);
      assert.ok(tenthAt(samples, 0.45) > 2 * tenthAt(samples, 0), sound.name);
    }
  });

  it('rustles brighter than it scrapes', () => {
    assert.ok(
      brightness(rustle(3, TEST_RATE), 2000) >
        2 * brightness(scrape(3, TEST_RATE), 2000),
    );
  });
});
