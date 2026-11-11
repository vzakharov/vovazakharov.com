import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FOOTINGS } from '@/cube/entities/theme';

import { breath, grunt, jump, landing } from './body';
import { footstep } from './footstep';
import { assertAudible, loudness, RATE } from './sound.test-kit';

describe('the body', () => {
  it('breathes, grunts, jumps and lands finite and inside ±1', () => {
    for (const seed of [0, 1, 0xff_ff_ff_ff]) {
      for (const effort of [0, 0.5, 1, 3]) {
        assertAudible(breath(effort, seed, RATE));
      }
      assertAudible(grunt(seed, RATE));
      assertAudible(jump(seed, RATE));
      for (const footing of FOOTINGS) {
        assertAudible(landing(0.8, footing, seed, RATE));
      }
    }
  });

  it('makes the same sound from the same seed', () => {
    assert.deepEqual(breath(0.4, 11, RATE), breath(0.4, 11, RATE));
    assert.notDeepEqual(breath(0.4, 11, RATE), breath(0.4, 12, RATE));
    assert.deepEqual(grunt(11, RATE), grunt(11, RATE));
    assert.notDeepEqual(grunt(11, RATE), grunt(12, RATE));
    assert.deepEqual(jump(11, RATE), jump(11, RATE));
    assert.deepEqual(
      landing(1, 'wood', 11, RATE),
      landing(1, 'wood', 11, RATE),
    );
  });

  it('breathes faster and louder with effort', () => {
    const resting = breath(0, 5, RATE);
    const winded = breath(1, 5, RATE);
    assert.ok(winded.length < 0.7 * resting.length);
    assert.ok(loudness(winded) > 2 * loudness(resting));
  });

  it('lands harder the faster it falls, and heavier than a step', () => {
    for (const footing of FOOTINGS) {
      const light = landing(0.2, footing, 5, RATE);
      const heavy = landing(1.5, footing, 5, RATE);
      assert.ok(loudness(heavy) > 1.5 * loudness(light), footing);
      assert.ok(heavy.length >= footstep(footing, 1, 5, RATE).length, footing);
    }
  });

  it('lands differently on each footing', () => {
    assert.notDeepEqual(
      landing(1, 'carpet', 5, RATE),
      landing(1, 'metal', 5, RATE),
    );
  });
});
