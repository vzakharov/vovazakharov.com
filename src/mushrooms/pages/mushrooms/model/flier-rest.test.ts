import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ALL_TEN, opened, play } from '../ui/scene/visit-play';
import { restedFliers } from './flier-rest';
import { isAloft, isLeaving } from './flight';
import type { Flier } from './insects';
import { RESTED_AT } from './kept-record';

/** A flier as it was at `now`, and as it was kept then. */
type Settling = { flier: Flier; now: number; rested: Flier | undefined };

/**
 * Every flier of a visit at every tick, beside how it settles then: all ten
 * released, then a fifth butterfly sending the first away, a cloud tapped
 * at 6 s.
 */
function settlings(): Settling[] {
  const stand = opened(7, 1180, 820, false);
  const playing = {
    kinds: [...ALL_TEN, 'butterfly' as const],
    gap: 400,
    lasting: 16_000,
    tick: 200,
    rains: [6000],
  };
  const found: Settling[] = [];
  play(stand, 7, playing, ({ meadow, now }) => {
    const rested = restedFliers(meadow.insects, now);
    for (const flier of meadow.insects) {
      const kept = rested.find(({ id }) => id === flier.id);
      found.push({ flier, now, rested: kept });
    }
  });
  return found;
}

describe('fliers settled at rest', () => {
  const all = settlings();
  const where = (kind: Flier['leg']['to']['kind']) =>
    all.filter(({ flier }) => flier.leg.to.kind === kind);

  it('drops a flier leaving the meadow', () => {
    const leaving = where('away');
    assert.ok(leaving.length > 0);
    for (const { rested } of leaving) assert.equal(rested, undefined);
  });

  it('seats every other flier on the perch its leg goes to, long landed', () => {
    for (const { flier, rested } of all) {
      if (isLeaving(flier)) continue;
      assert.ok(rested);
      const { leg, legs } = rested;
      assert.deepEqual(leg.from, flier.leg.to);
      assert.deepEqual(leg.to, flier.leg.to);
      assert.equal(leg.departs, RESTED_AT);
      assert.equal(leg.arrives, RESTED_AT);
      assert.equal(isAloft(rested, 0), false);
      assert.equal(legs, flier.legs);
    }
  });

  it('gives a flier in flight its whole stay, and a seated one what was left of it', () => {
    const open = all.filter(
      ({ flier }) => !['away', 'shelter'].includes(flier.leg.to.kind),
    );
    const aloft = open.filter(({ flier, now }) => isAloft(flier, now));
    const seated = open.filter(({ flier, now }) => now >= flier.leg.arrives);
    assert.ok(aloft.length > 0 && seated.length > 0);
    for (const { flier, rested } of aloft) {
      const { leaves, arrives } = flier.leg;
      assert.equal(rested?.leg.leaves, leaves - arrives);
    }
    for (const { flier, now, rested } of seated) {
      assert.equal(rested?.leg.leaves, Math.max(0, flier.leg.leaves - now));
    }
  });

  it('leaves a flier under a cap no stay, so it comes out with no shower', () => {
    const sheltering = where('shelter');
    assert.ok(sheltering.length > 0);
    for (const { rested } of sheltering) assert.equal(rested?.leg.leaves, 0);
  });

  it('keeps no dart and nothing of a flight but how it holds a spot in the air', () => {
    for (const { flier, rested } of all) {
      if (!rested) continue;
      assert.equal('shied' in rested, false);
      for (const gone of ['dash', 'pivots', 'out']) {
        assert.equal(gone in rested.leg, false);
      }
      assert.deepEqual(rested.leg.hops, flier.leg.hops);
    }
  });
});
