import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertAudible,
  brightness,
  loudness,
  peak,
  TEST_RATE,
} from '../../dsp/index.test-only';
import {
  knock,
  lever,
  pill,
  ring,
  shrinking,
  stepsAway,
  thud,
} from './fixture';

const ONCE = { lever, pill, ring, knock, thud };

describe('what the building does', () => {
  it('is finite and inside ±1, the same from the same seed', () => {
    for (const [name, sound] of Object.entries(ONCE)) {
      for (const seed of [0, 9, 0xff_ff_ff_ff]) {
        assertAudible(sound(seed, TEST_RATE));
      }
      assert.deepEqual(sound(4, TEST_RATE), sound(4, TEST_RATE), name);
      assert.notDeepEqual(sound(4, TEST_RATE), sound(5, TEST_RATE), name);
    }
  });

  it('shrinks for as long as it is asked to, swelling from nothing and back', () => {
    for (const seconds of [2, 3, 4.5]) {
      const samples = shrinking(seconds, 2, TEST_RATE);
      assertAudible(samples);
      assert.equal(samples.length, Math.round(seconds * TEST_RATE));
      const tenth = Math.round(samples.length / 10);
      const middle = samples.subarray(4 * tenth, 6 * tenth);
      assert.ok(loudness(middle) > 4 * loudness(samples.subarray(0, tenth)));
      assert.ok(loudness(middle) > 2 * loudness(samples.subarray(-tenth)));
    }
    assert.deepEqual(shrinking(3, 2, TEST_RATE), shrinking(3, 2, TEST_RATE));
  });

  it('climbs as the body shrinks', () => {
    const samples = shrinking(3, 2, TEST_RATE);
    const third = Math.round(samples.length / 3);
    assert.ok(
      brightness(samples.subarray(-third), 1000) >
        2 * brightness(samples.subarray(0, third), 1000),
    );
  });

  it('lifts the pill off its ledge small, short and bright', () => {
    const samples = pill(1, TEST_RATE);
    assert.ok(samples.length < 0.3 * TEST_RATE);
    assert.ok(brightness(samples, 1500) > 0.5);
  });

  it('clanks the lever after its creak', () => {
    const samples = lever(1, TEST_RATE);
    const swing = Math.round(0.25 * TEST_RATE);
    assert.ok(
      peak(samples.subarray(swing)) > 2 * peak(samples.subarray(0, swing)),
    );
  });

  it('rings twice with a gap between', () => {
    const samples = ring(1, TEST_RATE);
    const at = (seconds: number) =>
      loudness(
        samples.subarray(seconds * TEST_RATE, (seconds + 0.08) * TEST_RATE),
      );
    assert.ok(at(0.2) > 0.05);
    assert.ok(at(0.52) < 0.001);
    assert.ok(at(0.85) > 0.05);
  });

  it('knocks two to four times, by the seed', () => {
    const lengths = new Set(
      Array.from({ length: 40 }, (_, seed) => knock(seed, TEST_RATE).length),
    );
    assert.equal(lengths.size, 3);
  });

  it('hears steps go away: each quieter than the first, on any footing', () => {
    for (const footing of ['tile', 'carpet', 'metal'] as const) {
      const samples = stepsAway(footing, 6, TEST_RATE);
      assertAudible(samples);
      assert.deepEqual(samples, stepsAway(footing, 6, TEST_RATE));
      const half = Math.round(samples.length / 2);
      assert.ok(
        loudness(samples.subarray(0, half)) >
          2 * loudness(samples.subarray(half)),
        footing,
      );
    }
    assert.notDeepEqual(
      stepsAway('tile', 6, TEST_RATE),
      stepsAway('wood', 6, TEST_RATE),
    );
  });
});
