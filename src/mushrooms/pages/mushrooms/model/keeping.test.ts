import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ALL_TEN, opened, play } from '../ui/scene/visit-play';
import { DUSK_MS, duskness, FULL_DAY, FULL_DUSK } from './dusk';
import { isAloft, isLeaving } from './flight';
import { type Meadow, reduce } from './game';
import { reopened, settled } from './keeping';
import { type Kept, RESTED_AT } from './kept-record';
import {
  isOld,
  SPORE_DWELL_MS,
  SPORE_FALL_MS,
  sproutedInRain,
  sproutMoment,
  sproutScale,
} from './sprouting';
import { RAIN_MS, rainbow, raining, wetness } from './weather';

/** A meadow and the moment it was played to. */
type Moment = { meadow: Meadow; now: number };

/** Moments of a visit with two showers behind it, all ten fliers released and a cloud tapped at 6 s. */
function playedMoments(): Moment[] {
  const stand = opened(5, 1180, 820, false, undefined, 2);
  const moments: Moment[] = [];
  const kept = new Set([3000, 6400, 9000, 14_000, 20_000]);
  const playing = {
    kinds: ALL_TEN,
    gap: 400,
    lasting: 20_000,
    tick: 100,
    rains: [6000],
  };
  play(stand, 5, playing, ({ meadow, now }) => {
    if (kept.has(now)) moments.push({ meadow, now });
  });
  return moments;
}

/** Every number in `value`, however deep. */
function numbersIn(value: unknown): number[] {
  if (typeof value === 'number') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap((each) => numbersIn(each));
}

/** Asserts that every rule reads `kept`, opened, as at rest from the load's first frame. */
function assertAtRest(kept: Kept['meadow']): void {
  const meadow = reopened(kept);
  for (const { sprout } of meadow.mushrooms) {
    assert.equal(sprout, undefined);
  }
  for (const mushroom of meadow.mushrooms) {
    assert.ok(isOld(mushroom, 0));
    assert.equal(sproutScale(mushroom.sprout, 0), 1);
  }
  assert.equal(raining(meadow.rain, 0), false);
  assert.equal(wetness(meadow.rain, 0), 0);
  assert.equal(rainbow(meadow.rain, 0), 0);
  assert.ok([0, 1].includes(duskness(meadow.dusk, 0)));
  for (const flier of meadow.insects) {
    assert.equal(isAloft(flier, 0), false);
    assert.equal(isLeaving(flier), false);
  }
  assert.equal(sproutedInRain(meadow, 0), meadow);
  assert.equal(meadow.nightRuns.due, undefined);
  assert.equal(meadow.nightRuns.last, undefined);
  assert.ok(numbersIn(kept).every((number) => Number.isFinite(number)));
}

describe('a meadow settled at rest', () => {
  const moments = playedMoments();

  it('plays fliers in the air, under the caps and on their perches before it settles', () => {
    const legs = moments.flatMap(({ meadow, now }) =>
      meadow.insects.map((flier) => ({ flier, now })),
    );
    assert.ok(legs.some(({ flier, now }) => isAloft(flier, now)));
    assert.ok(legs.some(({ flier }) => flier.leg.to.kind === 'shelter'));
    assert.ok(legs.some(({ flier }) => flier.leg.to.kind === 'flower'));
  });

  it('reads at rest by every rule, wherever the visit was', () => {
    for (const { meadow, now } of moments) assertAtRest(settled(meadow, now));
  });

  it('settles to itself once opened again at the load start', () => {
    for (const { meadow, now } of moments) {
      const kept = settled(meadow, now);
      assert.deepEqual(settled(reopened(kept), 0), kept);
    }
  });

  it('keeps what the child made: every mushroom, flower and count', () => {
    for (const { meadow, now } of moments) {
      const kept = settled(meadow, now);
      assert.deepEqual(
        kept.mushrooms.map(({ id }) => id),
        meadow.mushrooms.map(({ id }) => id),
      );
      assert.equal(kept.planted, meadow.planted);
      assert.equal(kept.pulled, meadow.pulled);
      assert.equal(kept.released, meadow.released);
    }
  });

  it('opens with nothing selected and every picker shut', () => {
    const [first] = moments;
    assert.ok(first);
    const picking = reduce(first.meadow, { kind: 'pick' });
    assert.equal(picking.picking, true);
    const meadow = reopened(settled(picking, first.now));
    assert.equal(meadow.picking, false);
    assert.equal(meadow.furnishing, false);
    assert.equal(meadow.planting, undefined);
    assert.equal(meadow.selected, undefined);
    assert.equal(meadow.rain, undefined);
  });

  it('turns a dusk under way all the way it was going', () => {
    const [first] = moments;
    assert.ok(first);
    const falling = reduce(first.meadow, { kind: 'dusk', now: 0 });
    assert.deepEqual(settled(falling, DUSK_MS / 2).dusk, FULL_DUSK);
    const lifting = reduce(falling, { kind: 'dusk', now: DUSK_MS / 2 });
    assert.deepEqual(settled(lifting, DUSK_MS * 0.6).dusk, FULL_DAY);
  });

  it('raises every spore lying in a shower under way', () => {
    const { sowed } = opened(1, 1180, 820, false, undefined, 1);
    assert.ok(sowed.spores.length > 0);
    const showering = reduce(sowed, { kind: 'rain', now: 0 });
    const kept = settled(showering, 100);
    assert.equal(kept.spores.length, 0);
    assert.equal(
      kept.mushrooms.length,
      sowed.mushrooms.length + sowed.spores.length,
    );
    assert.equal(kept.grown, sowed.grown + sowed.spores.length);
    assertAtRest(kept);
  });

  it('leaves a lying spore to sprout in the next shower, long fallen', () => {
    const { sowed } = opened(1, 1180, 820, false, undefined, 1);
    const kept = settled(sowed, 3000);
    const rain = { startedAt: 0, stopsAt: RAIN_MS };
    assert.ok(kept.spores.length > 0);
    for (const spore of kept.spores) {
      assert.equal(spore.at, RESTED_AT);
      assert.equal(
        sproutMoment(spore, rain),
        sproutMoment({ ...spore, at: -Infinity }, rain),
      );
    }
    assert.ok(-RESTED_AT > Math.max(SPORE_FALL_MS, SPORE_DWELL_MS, DUSK_MS));
  });
});
