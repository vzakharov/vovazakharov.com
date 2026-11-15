import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FOOTINGS } from '@/cube/shared/lib/acoustics';

import { assertAudible, loudness, TEST_RATE } from '../../dsp/index.test-only';
import { breath, grunt, jump, landing, swallow } from './body';
import { footstep } from './footstep';

describe('the body', () => {
  it('breathes, grunts, jumps and lands finite and inside ±1', () => {
    for (const seed of [0, 1, 0xff_ff_ff_ff]) {
      for (const effort of [0, 0.5, 1, 3]) {
        assertAudible(breath(effort, seed, TEST_RATE));
      }
      assertAudible(grunt(seed, TEST_RATE));
      assertAudible(jump(seed, TEST_RATE));
      assertAudible(swallow(seed, TEST_RATE));
      for (const footing of FOOTINGS) {
        assertAudible(landing(0.8, footing, seed, TEST_RATE));
      }
    }
  });

  it('makes the same sound from the same seed', () => {
    assert.deepEqual(breath(0.4, 11, TEST_RATE), breath(0.4, 11, TEST_RATE));
    assert.notDeepEqual(breath(0.4, 11, TEST_RATE), breath(0.4, 12, TEST_RATE));
    assert.deepEqual(grunt(11, TEST_RATE), grunt(11, TEST_RATE));
    assert.notDeepEqual(grunt(11, TEST_RATE), grunt(12, TEST_RATE));
    assert.deepEqual(jump(11, TEST_RATE), jump(11, TEST_RATE));
    assert.deepEqual(swallow(11, TEST_RATE), swallow(11, TEST_RATE));
    assert.notDeepEqual(swallow(11, TEST_RATE), swallow(12, TEST_RATE));
    assert.deepEqual(
      landing(1, 'wood', 11, TEST_RATE),
      landing(1, 'wood', 11, TEST_RATE),
    );
  });

  it('breathes faster and louder with effort', () => {
    const resting = breath(0, 5, TEST_RATE);
    const winded = breath(1, 5, TEST_RATE);
    assert.ok(winded.length < 0.7 * resting.length);
    assert.ok(loudness(winded) > 2 * loudness(resting));
  });

  it('lands harder the faster it falls, and heavier than a step', () => {
    for (const footing of FOOTINGS) {
      const light = landing(0.2, footing, 5, TEST_RATE);
      const heavy = landing(1.5, footing, 5, TEST_RATE);
      assert.ok(loudness(heavy) > 1.5 * loudness(light), footing);
      assert.ok(
        heavy.length >= footstep(footing, 1, 5, TEST_RATE).length,
        footing,
      );
    }
  });

  it('lands differently on each footing', () => {
    assert.notDeepEqual(
      landing(1, 'carpet', 5, TEST_RATE),
      landing(1, 'metal', 5, TEST_RATE),
    );
  });
});
