import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { FIELD_MUSHROOMS, MUSHROOM_SLOTS } from './crowding';
import { type Action, firstMeadow, type Meadow, reduce } from './game';
import { OPENING_EYE } from './ground';
import { type Footed, grownOn } from './placement';
import { mulberry32, type Seeded } from './random';
import {
  isOld,
  sowable,
  type Spore,
  SPORE_DWELL_MS,
  SPORE_SEATS,
  SPROUT_MS,
  SPROUT_START,
  SPROUT_WINDOW_MS,
  sproutedInRain,
  sproutMoment,
  sproutScale,
} from './sprouting';
import { darkAt, RAIN_MS } from './weather';

const SIGHT = { flowers: [], air: [], crowded: [], room: [] };

const opening = () => firstMeadow(mulberry32(1));
const rained = (meadow: Meadow, now = 0) =>
  reduce(meadow, { kind: 'rain', now });
const footedAt = (x: number, z: number): Footed =>
  grownOn(OPENING_EYE, { x, z });
/** A sprout from `seed` on the ground `x` across, a little in front of the clump. */
const sproutAt = (seed: number, x: number): Seeded & Footed => ({
  seed,
  ...footedAt(x, -0.3),
});
const tick = (now: number): Action => ({ kind: 'tick', now, ...SIGHT });
const speciesOf = (meadow: Meadow, id: string | undefined) =>
  meadow.mushrooms.find((mushroom) => mushroom.id === id)?.species;
const newOnes = (before: Meadow, after: Meadow) =>
  after.mushrooms.slice(before.mushrooms.length);

const SPROUT = { at: 1000, parent: 'mushroom-1' };
/** `SPROUT`'s scale `ms` after it comes up. */
const upFor = (ms: number) => sproutScale(SPROUT, SPROUT.at + ms);

describe('sproutScale', () => {
  const sprout = SPROUT;

  it('is 1 for a mushroom that never sprouted', () => {
    assert.equal(sproutScale(undefined, 0), 1);
  });

  it('shows a sprout at its start size from its first moment', () => {
    assert.equal(sproutScale(sprout, 1000), SPROUT_START);
  });

  it('grows quickest first, past half its growth by 20 s, full at the end and after', () => {
    const steps = [0, 10_000, 20_000, 60_000, SPROUT_MS].map((ms) => upFor(ms));
    for (const [index, scale] of steps.entries()) {
      if (index > 0) assert.ok(scale > (steps[index - 1] ?? 0));
    }
    assert.ok(Math.abs(upFor(20_000) - 0.58) < 0.01, String(upFor(20_000)));
    assert.equal(upFor(SPROUT_MS), 1);
    assert.equal(upFor(SPROUT_MS * 5), 1);
  });
});

describe('isOld', () => {
  it('holds every mushroom not still sprouting', () => {
    const sprout = { at: 0, parent: 'mushroom-1' };
    const grown = SPROUT_MS;
    assert.equal(isOld({}, 0), true);
    assert.equal(isOld({ sprout }, grown - 1), false);
    assert.equal(isOld({ sprout }, grown), true);
  });
});

/** A tap at `now` on the mushroom `id`, carrying a spore the scene found `x` across. */
const sowTap = (id: string, x: number, now = 0): Action => ({
  kind: 'select',
  id,
  spore: { ...footedAt(x, -0.3), now },
});
/** `meadow` after `count` taps on `id`, each spore on a foot of its own. */
const sownTimes = (meadow: Meadow, id: string, count: number, now = 0) => {
  let tapped = meadow;
  for (let index = 0; index < count; index++) {
    tapped = reduce(tapped, sowTap(id, (index - 2) * 0.3, now));
  }
  return tapped;
};
const sporeOf = (meadow: Meadow, index = 0): Spore =>
  meadow.spores[index] ?? assert.fail(`no spore ${String(index)}`);

describe('sowing', () => {
  it('settles one spore a tap, of the parent and its species, up to SPORE_SEATS, and selects as a tap does', () => {
    const meadow = opening();
    const one = reduce(meadow, sowTap('mushroom-1', 0.2));
    assert.equal(one.spores.length, 1);
    assert.equal(one.selected, 'mushroom-1');
    const spore = sporeOf(one);
    assert.equal(spore.parent, 'mushroom-1');
    assert.equal(spore.species, speciesOf(meadow, 'mushroom-1'));
    assert.deepEqual(spore.foot, footedAt(0.2, -0.3).foot);
    assert.equal(spore.at, 0);
    const full = sownTimes(meadow, 'mushroom-1', SPORE_SEATS + 2);
    assert.equal(full.spores.length, SPORE_SEATS);
    assert.deepEqual(
      full.spores.map(({ id }) => id),
      Array.from({ length: SPORE_SEATS }, (_, i) => `spore-${String(i + 1)}`),
    );
    assert.equal(full.scattered, SPORE_SEATS);
    assert.equal(sowable(full, 'mushroom-1', 0), undefined);
    assert.notEqual(sowable(full, 'mushroom-2', 0), undefined);
  });

  it('selects without a spore when the tap carries none', () => {
    const meadow = opening();
    const tapped = reduce(meadow, { kind: 'select', id: 'mushroom-1' });
    assert.equal(tapped.selected, 'mushroom-1');
    assert.equal(tapped.spores, meadow.spores);
  });

  it('sows none from an unknown id, a sprout still growing, or a full field', () => {
    const meadow = opening();
    assert.equal(sowable(meadow, 'mushroom-9', 0), undefined);
    const growing: Meadow = {
      ...meadow,
      mushrooms: meadow.mushrooms.map((mushroom) => ({
        ...mushroom,
        sprout: { at: 0, parent: 'mushroom-0' },
      })),
    };
    assert.equal(sowable(growing, 'mushroom-1', SPROUT_MS - 1), undefined);
    assert.equal(
      reduce(growing, sowTap('mushroom-1', 0, SPROUT_MS - 1)).spores.length,
      0,
    );
    const lying = sporeOf(reduce(meadow, sowTap('mushroom-2', 0)));
    const full: Meadow = {
      ...meadow,
      spores: Array.from(
        { length: FIELD_MUSHROOMS - meadow.mushrooms.length },
        (_, index) => ({ ...lying, ...footedAt(index * 3, 1) }),
      ),
    };
    assert.equal(sowable(full, 'mushroom-1', 0), undefined);
  });

  it('sows none on a foot its spores and mushrooms crowd, and grows none there either', () => {
    const meadow = opening();
    const lying = sporeOf(reduce(meadow, sowTap('mushroom-2', 0)));
    const crowded: Meadow = {
      ...meadow,
      spores: Array.from({ length: MUSHROOM_SLOTS }, () => lying),
    };
    const tapped = reduce(crowded, sowTap('mushroom-1', 0.1));
    assert.equal(tapped.spores, crowded.spores);
    assert.equal(tapped.selected, 'mushroom-1');
    const grown = reduce(crowded, {
      kind: 'grow',
      species: 'porcini',
      ...sproutAt(5, 0.1),
    });
    assert.equal(grown.mushrooms.length, meadow.mushrooms.length);
  });

  it('draws the same seed for one meadow and a new one each tap, a pick-up included', () => {
    const meadow = opening();
    const first = sowable(meadow, 'mushroom-1', 0);
    assert.deepEqual(sowable(meadow, 'mushroom-1', 0), first);
    const one = reduce(meadow, sowTap('mushroom-1', 0));
    assert.deepEqual(pick(sporeOf(one), 'seed'), first);
    const next = sowable(one, 'mushroom-1', 0);
    assert.notDeepEqual(next, first);
    const picked = reduce(one, { kind: 'unsow', ...pick(sporeOf(one), 'id') });
    assert.notDeepEqual(sowable(picked, 'mushroom-1', 0), first);
  });
});

describe('picking a spore up', () => {
  it('takes it off the ground, leaves the selection and pickers, and frees its seat', () => {
    const full = reduce(sownTimes(opening(), 'mushroom-1', SPORE_SEATS), {
      kind: 'pick',
    });
    const gone = sporeOf(full, 2).id;
    const picked = reduce(full, { kind: 'unsow', id: gone });
    assert.equal(picked.spores.length, SPORE_SEATS - 1);
    assert.ok(picked.spores.every(({ id }) => id !== gone));
    assert.equal(picked.selected, full.selected);
    assert.equal(picked.picking, full.picking);
    assert.notEqual(sowable(picked, 'mushroom-1', 0), undefined);
  });

  it('hands back the same meadow for a spore not lying there', () => {
    const meadow = sownTimes(opening(), 'mushroom-1', 2);
    assert.equal(reduce(meadow, { kind: 'unsow', id: 'spore-9' }), meadow);
  });
});

describe('sprouting in the rain', () => {
  const START = 1000;
  const sown = sownTimes(opening(), 'mushroom-1', 3);
  const wet = rained(sown, START);
  const rain = wet.rain ?? assert.fail('no rain');
  const moments = wet.spores.map((spore) => sproutMoment(spore, rain) ?? 0);

  it('picks each spore a moment in the window after the dark sets in, kept while a tap lengthens the shower', () => {
    for (const moment of moments) {
      assert.ok(moment >= darkAt(rain), String(moment));
      assert.ok(moment < darkAt(rain) + SPROUT_WINDOW_MS, String(moment));
    }
    assert.equal(new Set(moments).size, moments.length);
    const longer = rained(wet, START + 5000).rain ?? assert.fail('no rain');
    assert.deepEqual(
      wet.spores.map((spore) => sproutMoment(spore, longer)),
      moments,
    );
  });

  it('grows each spore at its moment into a sprout of its parent, where it lay, coming up as the spore goes', () => {
    const first = Math.min(...moments);
    assert.equal(reduce(wet, tick(first - 1)).spores, wet.spores);
    const one = reduce(wet, tick(first));
    assert.equal(one.spores.length, 2);
    const all = reduce(wet, tick(darkAt(rain) + SPROUT_WINDOW_MS));
    assert.equal(all.spores.length, 0);
    const sprouts = newOnes(wet, all);
    assert.equal(sprouts.length, 3);
    assert.equal(all.grown, wet.grown + 3);
    for (const sprout of sprouts) {
      const spore =
        wet.spores.find(({ seed }) => seed === sprout.seed) ??
        assert.fail('a sprout of no spore');
      const moment = sproutMoment(spore, rain) ?? 0;
      assert.equal(sprout.species, spore.species);
      assert.deepEqual(sprout.foot, spore.foot);
      assert.deepEqual(sprout.sprout, {
        at: moment,
        parent: 'mushroom-1',
      });
      assert.equal(sproutScale(sprout.sprout, moment), SPROUT_START);
    }
    assert.equal(all.selected, wet.selected);
  });

  it('grows a spore sown while it rains no sooner than SPORE_DWELL_MS after it settled, past the stop too', () => {
    const late = START + RAIN_MS - 500;
    const sowedLate = reduce(wet, sowTap('mushroom-2', 0.5, late));
    const spore = sporeOf(sowedLate, 3);
    assert.equal(sproutMoment(spore, rain), late + SPORE_DWELL_MS);
    const due = late + SPORE_DWELL_MS;
    const lying = reduce(sowedLate, tick(due - 1));
    assert.ok(lying.spores.some(({ id }) => id === spore.id));
    const up = reduce(sowedLate, tick(due));
    assert.ok(up.spores.every(({ id }) => id !== spore.id));
  });

  it('keeps a spore sown after the shower stopped for the next one', () => {
    const dry = rain.stopsAt + 2000;
    const after = reduce(wet, sowTap('mushroom-2', 0.5, dry));
    const spore = sporeOf(after, 3);
    assert.equal(sproutMoment(spore, rain), undefined);
    const waited = reduce(after, tick(dry + 60_000));
    assert.deepEqual(
      waited.spores.map(({ id }) => id),
      [spore.id],
    );
    const next = rained(waited, dry + 70_000);
    const sprung = reduce(next, tick(dry + 70_000 + RAIN_MS));
    assert.equal(sprung.spores.length, 0);
  });

  it('sprouts a spore far out of sight, and one whose parent was sunk since', () => {
    const far = reduce(sown, {
      kind: 'select',
      id: 'mushroom-2',
      spore: { ...footedAt(40, 30), now: 0 },
    });
    const sunk = reduce(reduce(far, { kind: 'select', id: 'mushroom-1' }), {
      kind: 'remove',
    });
    assert.ok(sunk.mushrooms.every(({ id }) => id !== 'mushroom-1'));
    const all = reduce(rained(sunk, START), tick(START + RAIN_MS));
    assert.equal(all.spores.length, 0);
    assert.deepEqual(
      newOnes(sunk, all).map(({ sprout }) => sprout?.parent),
      ['mushroom-1', 'mushroom-1', 'mushroom-1', 'mushroom-2'],
    );
  });

  it('hands back the same meadow with no spore lying, no shower yet, or none due', () => {
    const bare = rained(opening(), START);
    assert.equal(sproutedInRain(bare, START + RAIN_MS), bare);
    assert.equal(sproutedInRain(sown, START + RAIN_MS), sown);
    assert.equal(sproutedInRain(wet, START), wet);
  });
});
