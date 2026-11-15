import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertAudible,
  brightness,
  loudness,
  TEST_RATE,
} from '../../dsp/index.test-only';
import { splash } from './splash';

describe('splash', () => {
  it('is finite and inside ±1 at any strength and rate', () => {
    for (const strength of [-1, 0, 0.15, 0.5, 1, 7]) {
      for (const rate of [TEST_RATE, 44_100, 22_050]) {
        assertAudible(splash(strength, 1, rate));
      }
    }
  });

  it('is the same for the same seed and another splash for another', () => {
    assert.deepEqual(splash(0.5, 42, TEST_RATE), splash(0.5, 42, TEST_RATE));
    assert.notDeepEqual(splash(0.5, 42, TEST_RATE), splash(0.5, 43, TEST_RATE));
  });

  it('is longer, louder and lower the harder the body meets the water', () => {
    const trailed = splash(0.1, 3, TEST_RATE);
    const fell = splash(1, 3, TEST_RATE);
    assert.ok(fell.length > 1.5 * trailed.length);
    assert.ok(loudness(fell) > 2 * loudness(trailed));
    assert.ok(brightness(fell, 1500) < brightness(trailed, 1500));
  });

  it('is water and not a thud: most of it is above the voice', () => {
    assert.ok(brightness(splash(0.5, 9, TEST_RATE), 1500) > 0.4);
  });

  it('ends at nothing, so it cannot click', () => {
    for (const strength of [0, 0.5, 1]) {
      assert.equal(Math.abs(splash(strength, 5, TEST_RATE).at(-1) ?? 1), 0);
    }
  });
});
