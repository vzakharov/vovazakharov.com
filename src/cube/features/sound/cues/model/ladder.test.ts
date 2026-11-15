import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Ladder, LADDERS, type Limb } from '@/cube/shared/lib/acoustics';

import {
  assertAllDiffer,
  assertAudible,
  brightness,
  loudness,
  TEST_RATE,
} from '../../dsp/index.test-only';
import { rung } from './ladder';

const LIMBS: readonly Limb[] = ['hand', 'foot'];

/** How loud a rung still is a fifth of a second after it was touched. */
const late = (ladder: Ladder) =>
  loudness(rung(ladder, 'foot', 4, TEST_RATE).subarray(0.2 * TEST_RATE));

describe('rung', () => {
  it('is finite and inside ±1 for every ladder and limb, at any rate', () => {
    for (const ladder of LADDERS) {
      for (const limb of LIMBS) {
        for (const rate of [TEST_RATE, 44_100, 22_050]) {
          assertAudible(rung(ladder, limb, 1, rate));
        }
      }
    }
  });

  it('is the same for the same seed and another rung for another', () => {
    for (const ladder of LADDERS) {
      assert.deepEqual(
        rung(ladder, 'foot', 42, TEST_RATE),
        rung(ladder, 'foot', 42, TEST_RATE),
      );
      assert.notDeepEqual(
        rung(ladder, 'foot', 42, TEST_RATE),
        rung(ladder, 'foot', 43, TEST_RATE),
      );
    }
  });

  it('differs between every ladder and limb', () => {
    assertAllDiffer(
      LADDERS.flatMap((ladder) =>
        LIMBS.map((limb) => rung(ladder, limb, 7, TEST_RATE)),
      ),
    );
  });

  it('takes a foot harder than a hand', () => {
    for (const ladder of LADDERS) {
      const hand = rung(ladder, 'hand', 3, TEST_RATE);
      const foot = rung(ladder, 'foot', 3, TEST_RATE);
      assert.ok(loudness(foot) > 1.5 * loudness(hand), ladder);
    }
  });

  it('rings on in aluminium and knocks in wood', () => {
    assert.ok(late('aluminium') > 6 * late('wood'));
    assert.ok(
      brightness(rung('aluminium', 'foot', 4, TEST_RATE), 1500) >
        brightness(rung('wood', 'foot', 4, TEST_RATE), 1500),
    );
  });

  it('ends at nothing, so it cannot click', () => {
    for (const ladder of LADDERS) {
      assert.equal(Math.abs(rung(ladder, 'foot', 5, TEST_RATE).at(-1) ?? 1), 0);
    }
  });
});
