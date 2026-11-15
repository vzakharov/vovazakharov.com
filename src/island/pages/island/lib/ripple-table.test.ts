import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  HOUR_SECONDS,
  RIPPLE_BANDS,
  RIPPLE_PERIOD,
  RIPPLES,
  RIPPLES_PER_BAND,
} from './ripple-table';

/** The longest wave of `band`, metres. */
const longest = (band: number) =>
  Math.max(
    ...RIPPLES.filter((wave) => wave.band === band).map(
      ({ vector }) => RIPPLE_PERIOD / 2 ** band / Math.hypot(...vector),
    ),
  );

describe('RIPPLES', () => {
  it('repeats every wave over the period, on each axis', () => {
    assert.equal(RIPPLES.length, RIPPLE_BANDS * RIPPLES_PER_BAND);
    for (const { vector } of RIPPLES) {
      assert.ok(vector.every((turns) => Number.isInteger(turns)));
      assert.ok(Math.hypot(...vector) > 0);
    }
  });

  it('turns every wave a whole number of times an hour', () => {
    for (const { pace } of RIPPLES) {
      const turns = (pace * HOUR_SECONDS) / (2 * Math.PI);
      assert.ok(Math.abs(turns - Math.round(turns)) < 1e-6);
    }
  });

  it('runs from tens of metres down to under half a metre', () => {
    assert.ok(longest(0) < 60 && longest(0) > 20);
    assert.ok(longest(RIPPLE_BANDS - 1) < 0.5);
  });
});
