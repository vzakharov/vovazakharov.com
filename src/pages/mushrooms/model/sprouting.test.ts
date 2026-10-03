import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FIELD_MUSHROOMS, MUSHROOM_SLOTS } from './crowding';
import { type Action, firstMeadow, type Meadow, reduce } from './game';
import { D_SEE, OPENING_EYE } from './ground';
import { type Footed, grownOn } from './placement';
import { mulberry32, type Seeded } from './random';
import {
  isOld,
  SHED_WINDOW_MS,
  type Shedding,
  shedding,
  SPORE_FALL_MS,
  SPROUT_MS,
  SPROUT_START,
  SPROUTS,
  sproutScale,
} from './sprouting';
import { RAIN_MS } from './weather';

/** The shower these tests start at 0 stops here. */
const STOP = RAIN_MS;
const SIGHT = { flowers: [], air: [], crowded: [], room: [] };
const everyone = () => true;

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
const tick = (now: number, shed?: Shedding['shed']): Action => ({
  kind: 'tick',
  now,
  ...SIGHT,
  ...(shed && { shed }),
});
/** A tick at `now` carrying `count` sprouts round `parent`, each on its own foot. */
const shedTick = (now: number, parent: string, count = SPROUTS): Action =>
  tick(now, {
    parent,
    sprouts: Array.from({ length: count }, (_, index) =>
      sproutAt(index + 7, (index - 1) * 0.4),
    ),
  });
const speciesOf = (meadow: Meadow, id: string | undefined) =>
  meadow.mushrooms.find((mushroom) => mushroom.id === id)?.species;
const newOnes = (before: Meadow, after: Meadow) =>
  after.mushrooms.slice(before.mushrooms.length);

const SPROUT = { at: 1000, parent: 'mushroom-1' };
/** `SPROUT`'s scale `ms` after it comes up. */
const upFor = (ms: number) =>
  sproutScale(SPROUT, SPROUT.at + SPORE_FALL_MS + ms);

describe('sproutScale', () => {
  const sprout = SPROUT;

  it('is 1 for a mushroom that never sprouted', () => {
    assert.equal(sproutScale(undefined, 0), 1);
  });

  it('hides a sprout while its spores fall, then shows it at its start size', () => {
    assert.equal(sproutScale(sprout, 1000), 0);
    assert.equal(sproutScale(sprout, 1000 + SPORE_FALL_MS - 1), 0);
    assert.equal(sproutScale(sprout, 1000 + SPORE_FALL_MS), SPROUT_START);
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
    const grown = SPORE_FALL_MS + SPROUT_MS;
    assert.equal(isOld({}, 0), true);
    assert.equal(isOld({ sprout }, grown - 1), false);
    assert.equal(isOld({ sprout }, grown), true);
  });
});

describe('shedding', () => {
  const wet = rained(opening());

  it('is due only after the stop, inside the window', () => {
    assert.equal(shedding(opening(), STOP, everyone), undefined);
    assert.equal(shedding(wet, STOP - 1, everyone), undefined);
    assert.ok(shedding(wet, STOP, everyone));
    assert.ok(shedding(wet, STOP + SHED_WINDOW_MS - 1, everyone));
    assert.equal(shedding(wet, STOP + SHED_WINDOW_MS, everyone), undefined);
  });

  const porcini = reduce(wet, {
    kind: 'grow',
    species: 'porcini',
    seed: 5,
    ...footedAt(1, 1),
  });

  it('names two old ones in sight at most, each with its seeds, the same for one meadow', () => {
    const all = shedding(porcini, STOP, everyone);
    assert.ok(all);
    assert.equal(all.length, 2);
    assert.equal(new Set(all.map(({ id }) => id)).size, 2);
    const back = shedding(porcini, STOP, (id) => id !== 'mushroom-1');
    assert.ok(back);
    assert.ok(back.every(({ id }) => id !== 'mushroom-1'));
    for (const { seeds } of all) {
      assert.equal(seeds.length, SPROUTS);
      assert.equal(new Set(seeds).size, SPROUTS);
    }
    assert.notDeepEqual(all[0]?.seeds, all[1]?.seeds);
    assert.deepEqual(shedding(porcini, STOP, everyone), all);
  });

  it('orders them by the shower: not always the oldest first', () => {
    const firsts = new Set(
      Array.from({ length: 10 }, (_, index) => {
        const meadow = rained(opening(), index * 1000);
        const stop = meadow.rain?.stopsAt ?? Number.NaN;
        return shedding(meadow, stop, everyone)?.[0]?.id;
      }),
    );
    assert.ok(firsts.size > 1, [...firsts].join(', '));
  });

  it('puts first a species the last shed did not grow', () => {
    for (const [parent, other] of [
      ['mushroom-1', 'porcini'],
      ['mushroom-3', 'fly-agaric'],
    ] as const) {
      const shed = reduce(porcini, shedTick(STOP, parent, 1));
      const next = rained(shed, STOP + 1000);
      const stop = next.rain?.stopsAt ?? Number.NaN;
      const [first] = shedding(next, stop, everyone) ?? [];
      assert.equal(speciesOf(next, first?.id), other);
    }
  });

  it('lets an old porcini and fly agaric in sight both shed across showers', () => {
    let meadow = porcini;
    const shedFrom = new Set<string | undefined>();
    for (const index of Array.from({ length: 6 }).keys()) {
      meadow = rained(meadow, index * 1000 * RAIN_MS);
      const stop = meadow.rain?.stopsAt ?? Number.NaN;
      const [first] = shedding(meadow, stop, everyone) ?? [];
      shedFrom.add(speciesOf(meadow, first?.id));
      meadow = reduce(
        meadow,
        tick(stop, {
          parent: first?.id ?? assert.fail('no shedder'),
          sprouts: [sproutAt(index, (index - 3) * 0.6)],
        }),
      );
    }
    assert.deepEqual(shedFrom, new Set(['fly-agaric', 'porcini']));
  });

  it('waits while no old mushroom is in sight', () => {
    assert.equal(
      shedding(wet, STOP, () => false),
      undefined,
    );
  });

  it('never names a sprout still growing', () => {
    const shed = reduce(wet, shedTick(STOP, 'mushroom-1'));
    const sprouts = new Set(newOnes(wet, shed).map(({ id }) => id));
    const next = rained(shed, STOP + 1000);
    const later = next.rain?.stopsAt ?? Number.NaN;
    assert.equal(
      shedding(next, later, (id) => sprouts.has(id)),
      undefined,
    );
    const named = shedding(next, later, everyone)?.map(({ id }) => id);
    assert.ok(named);
    assert.notEqual(named.length, 0);
    assert.ok(named.every((id) => !sprouts.has(id)));
  });
});

describe('a tick carrying a shed', () => {
  const wet = rained(opening());

  it('grows the sprouts round the parent, of its species, unselected, the pickers as they were', () => {
    const porcini = reduce(wet, {
      kind: 'grow',
      species: 'porcini',
      seed: 5,
      ...footedAt(1, 1),
    });
    const before = reduce(reduce(porcini, { kind: 'deselect' }), {
      kind: 'pick',
    });
    const after = reduce(before, shedTick(STOP, 'mushroom-3'));
    const sprouts = newOnes(before, after);
    assert.equal(sprouts.length, SPROUTS);
    assert.deepEqual(
      sprouts.map(({ id }) => id),
      ['mushroom-4', 'mushroom-5', 'mushroom-6'],
    );
    for (const sprout of sprouts) {
      assert.equal(sprout.species, 'porcini');
      assert.deepEqual(sprout.sprout, { at: STOP, parent: 'mushroom-3' });
    }
    assert.equal(after.grown, before.grown + SPROUTS);
    assert.equal(after.selected, undefined);
    assert.equal(after.picking, true);
    assert.equal(after.shed, STOP);
  });

  it('sheds once a shower, and a new shower sheds again', () => {
    const shed = reduce(wet, shedTick(STOP, 'mushroom-1'));
    const again = reduce(shed, shedTick(STOP + 100, 'mushroom-1'));
    assert.equal(again, shed);
    const next = rained(shed, STOP + 1000);
    const stop = next.rain?.stopsAt ?? Number.NaN;
    const reshed = reduce(next, shedTick(stop, 'mushroom-1', 1));
    assert.equal(newOnes(next, reshed).length, 1);
    assert.equal(reshed.shed, stop);
  });

  it('hands back the same meadow when nothing is shed', () => {
    assert.equal(reduce(wet, tick(STOP)), wet);
    assert.equal(reduce(wet, shedTick(STOP - 1, 'mushroom-1')), wet);
    assert.equal(
      reduce(wet, shedTick(STOP + SHED_WINDOW_MS, 'mushroom-1')),
      wet,
    );
    const shed = reduce(wet, shedTick(STOP, 'mushroom-1'));
    assert.equal(reduce(shed, tick(STOP + 1)), shed);
  });

  it('counts the shower shed even where no sprout grows', () => {
    const none = reduce(wet, shedTick(STOP, 'mushroom-1', 0));
    assert.deepEqual(none.mushrooms, wet.mushrooms);
    assert.equal(none.shed, STOP);
    const unknown = reduce(wet, shedTick(STOP, 'mushroom-9'));
    assert.deepEqual(unknown.mushrooms, wet.mushrooms);
    assert.equal(unknown.shed, STOP);
  });

  it('grows nothing from a sprout still growing', () => {
    const shed = reduce(wet, shedTick(STOP, 'mushroom-1'));
    const next = rained(shed, STOP + 1000);
    const stop = next.rain?.stopsAt ?? Number.NaN;
    const after = reduce(next, shedTick(stop, 'mushroom-3'));
    assert.equal(newOnes(next, after).length, 0);
    assert.equal(after.shed, stop);
  });

  it('keeps to the caps: none on a full field, none on a crowded foot', () => {
    const full: Meadow = {
      ...wet,
      mushrooms: Array.from({ length: FIELD_MUSHROOMS }, (_, index) => ({
        ...(wet.mushrooms[0] ?? assert.fail('no clump')),
        id: `mushroom-${String(index + 1)}`,
        ...footedAt(index * 3, 1),
      })),
    };
    const after = reduce(full, shedTick(STOP, 'mushroom-1'));
    assert.equal(after.mushrooms.length, FIELD_MUSHROOMS);
    assert.equal(after.shed, STOP);

    const crowd = sproutAt(1, -1);
    const crowded: Meadow = {
      ...wet,
      mushrooms: [
        ...wet.mushrooms,
        ...Array.from({ length: MUSHROOM_SLOTS }, (_, index) => ({
          ...(wet.mushrooms[0] ?? assert.fail('no clump')),
          id: `crowd-${String(index)}`,
          ...crowd,
        })),
      ],
    };
    const spared = reduce(
      crowded,
      tick(STOP, {
        parent: 'mushroom-1',
        sprouts: [crowd, { seed: 2, foot: { x: 3 * D_SEE, y: 0 }, lean: 1 }],
      }),
    );
    assert.deepEqual(
      newOnes(crowded, spared).map(({ seed }) => seed),
      [2],
    );
  });
});
