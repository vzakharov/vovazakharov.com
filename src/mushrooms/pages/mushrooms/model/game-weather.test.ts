import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DUSK_MS,
  duskness,
  FULL_DAY,
  FULL_DUSK,
  planeFootOf,
  RAIN_MS,
} from '@/mushrooms/shared/world';

import type { Meadow } from '../shape/meadow';
import { type Action, reduce } from './game';
import { FLOWERS, opening, run, SIGHT } from './game.test-kit';

/** A tap on a cloud at `now`. */
const rain = (now: number): Action => ({ kind: 'rain', now });

describe('the rain', () => {
  it('opens dry', () => {
    assert.equal(opening().rain, undefined);
  });

  it('starts a shower lasting RAIN_MS at the tap', () => {
    assert.deepEqual(reduce(opening(), rain(2000)).rain, {
      startedAt: 2000,
      stopsAt: 2000 + RAIN_MS,
    });
  });

  it('restarts the time of a falling shower, keeping its start', () => {
    const meadow = run(opening(), [rain(2000), rain(6000)]);
    assert.deepEqual(meadow.rain, { startedAt: 2000, stopsAt: 6000 + RAIN_MS });
  });

  it('starts a fresh shower once the last has stopped', () => {
    const stopped = 2000 + RAIN_MS;
    const meadow = run(opening(), [rain(2000), rain(stopped + 3000)]);
    assert.deepEqual(meadow.rain, {
      startedAt: stopped + 3000,
      stopsAt: stopped + 3000 + RAIN_MS,
    });
  });

  it('shuts the flower picker and changes nothing else', () => {
    const meadow = run(opening(), [
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'tuft', foot: planeFootOf({ x: 0.4, z: 1.3, size: 0.28 }) },
    ]);
    assert.ok(meadow.planting);
    const { rain: shower, ...after } = reduce(meadow, rain(1000));
    assert.ok(shower);
    const { rain: dry, ...before } = meadow;
    assert.equal(dry, undefined);
    assert.deepEqual(after, { ...before, planting: undefined });
  });
});

/** A tap on the sun or the moon at `now`. */
const dusk = (now: number): Action => ({ kind: 'dusk', now });

/** `from` with the flower picker open on a fresh tuft. */
const picking = (from: Meadow): Meadow =>
  run(from, [
    { kind: 'select', id: 'mushroom-1' },
    { kind: 'tuft', foot: planeFootOf({ x: 0.4, z: 1.3, size: 0.28 }) },
  ]);

/**
 * Bees left a minute among flowers each with room beside it, each tapped off
 * its perch every two seconds, and the flowers they planted. The taps reach
 * the take-offs a dusk's roost would otherwise forestall, where a bee plants.
 */
const plantedBy = (from: Meadow): number => {
  const sight = {
    ...SIGHT,
    beeFlowers: FLOWERS,
    room: FLOWERS.map((flower) => ({ flower, ring: 0 })),
  };
  const bees = [1, 2, 3].map(
    (seed): Action => ({
      kind: 'release',
      insect: 'bee',
      seed,
      now: 0,
      ...sight,
    }),
  );
  let meadow = run(from, bees);
  for (let index = 0; index < 600; index++) {
    const now = index * 100;
    meadow = reduce(meadow, { kind: 'tick', now, ...sight });
    if (index % 20 !== 19) continue;
    for (const { id } of meadow.insects) {
      meadow = reduce(meadow, { kind: 'startle', id, now, ...sight });
    }
  }
  return meadow.planted.length;
};

describe('the dusk', () => {
  it('opens in full day', () => {
    assert.deepEqual(opening().dusk, FULL_DAY);
  });

  it('turns toward dusk at a tap, and back at the next, changing nothing else', () => {
    const meadow = opening();
    const { dusk: turning, ...after } = reduce(meadow, dusk(2000));
    const { dusk: _day, ...before } = meadow;
    assert.deepEqual(after, before);
    assert.equal(turning.toward, 'dusk');
    assert.equal(duskness(turning, 2000 + DUSK_MS), 1);
    const back = run(meadow, [dusk(2000), dusk(2000 + DUSK_MS * 2)]).dusk;
    assert.equal(back.toward, 'day');
    assert.equal(duskness(back, 2000 + DUSK_MS * 3), 0);
  });

  it('shuts the flower picker toward dusk, as the rain does, and leaves it toward day', () => {
    const day = picking(opening());
    assert.ok(day.planting);
    assert.equal(reduce(day, dusk(1000)).planting, undefined);
    const night = picking({ ...opening(), dusk: FULL_DUSK });
    assert.ok(night.planting);
    assert.equal(reduce(night, dusk(1000)).planting, night.planting);
  });

  it('keeps the bees from planting, where by day they plant', () => {
    assert.ok(plantedBy(opening()) > 0);
    assert.equal(plantedBy({ ...opening(), dusk: FULL_DUSK }), 0);
  });
});
