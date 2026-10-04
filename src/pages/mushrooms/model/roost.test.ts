import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Dusk, FULL_DAY, FULL_DUSK } from './dusk';
import { INSECT_KINDS, type InsectKind } from './insect-genes';
import { wingBeat } from './insect-motion';
import { type Flier, released, startled, type Swarm, ticked } from './insects';
import { roostedPerches, sitsOut, WAKE_MS, wingsShut } from './roost';

const SIGHT = {
  caps: ['mushroom-1', 'mushroom-2', 'mushroom-3', 'mushroom-4'],
  flowers: ['flower-1', 'flower-2', 'flower-3', 'flower-4'],
  air: ['air-1', 'air-2', 'air-3', 'air-4'],
  crowded: [],
  spotted: [],
  room: [],
};
const SEEDS = Array.from({ length: 24 }, (_, index) => index + 1);
const SIT_ON_FLOWER = { kind: 'flower', id: 'flower-1' } as const;
/** Long past any stay. */
const LATER = 600_000;

/** A swarm of one `kind` grown off `seed`, released at 0 in `dusk`, and its flier. */
function released1(kind: InsectKind, seed: number, dusk: Dusk) {
  const empty: Swarm & { dusk: Dusk } = { insects: [], planted: [], dusk };
  const swarm = released(empty, { id: `${kind}-1`, seed, kind }, SIGHT, 0);
  const [one] = swarm.insects;
  assert.ok(one);
  return { swarm: { ...swarm, dusk }, one };
}

/** The one flier of `swarm`. */
function only({ insects }: Swarm): Flier {
  const [one] = insects;
  assert.ok(one);
  return one;
}

describe('roostedPerches', () => {
  it('leaves the perches as they are by day, the same object', () => {
    assert.equal(roostedPerches(SIGHT, FULL_DAY, 0), SIGHT);
    assert.equal(roostedPerches(SIGHT, undefined, 0), SIGHT);
  });

  it('marks them dusky past half way to dusk', () => {
    const turning: Dusk = { toward: 'dusk', startedAt: 0, from: 0 };
    assert.equal(roostedPerches(SIGHT, turning, 1000), SIGHT);
    assert.equal(roostedPerches(SIGHT, turning, 3000).dusky, true);
  });
});

describe('sitsOut', () => {
  const { one } = released1('butterfly', 1, FULL_DUSK);
  const landed = one.leg.arrives + 1;

  it('holds a butterfly on its cap at dusk, never in flight nor by day', () => {
    assert.equal(one.leg.to.kind, 'cap');
    assert.ok(sitsOut(one, FULL_DUSK, landed));
    assert.ok(!sitsOut(one, FULL_DUSK, one.leg.arrives - 1));
    assert.ok(!sitsOut(one, FULL_DAY, landed));
  });

  it('holds a butterfly on a flower no longer than its stay', () => {
    const onFlower = { ...one, leg: { ...one.leg, to: SIT_ON_FLOWER } };
    assert.ok(!sitsOut(onFlower, FULL_DUSK, landed));
    for (const kind of ['fly', 'bee'] as const) {
      assert.ok(sitsOut({ ...onFlower, kind }, FULL_DUSK, landed));
    }
  });

  it('lets each go at its own wake after the moon’s tap', () => {
    const morning: Dusk = { toward: 'day', startedAt: LATER, from: 1 };
    const wakes = SEEDS.map((seed) => {
      const flier = { ...one, seed };
      assert.ok(sitsOut(flier, morning, LATER + WAKE_MS[0] - 1));
      assert.ok(!sitsOut(flier, morning, LATER + WAKE_MS[1]));
      let at = LATER + WAKE_MS[0];
      while (sitsOut(flier, morning, at)) at += 50;
      return at;
    });
    assert.ok(new Set(wakes).size > SEEDS.length / 2);
  });
});

/** Where a butterfly released in `dusk` flies first, for every seed. */
const firstPerches = (dusk: Dusk) =>
  SEEDS.map((seed) => released1('butterfly', seed, dusk).one.leg.to.kind);

describe('fliers at dusk', () => {
  it('a butterfly released at dusk flies in to a cap, where by day some drink first', () => {
    assert.ok(firstPerches(FULL_DUSK).every((kind) => kind === 'cap'));
    assert.ok(firstPerches(FULL_DAY).includes('flower'));
  });

  it('none settled takes off of its own accord, whatever its stay', () => {
    for (const kind of ['butterfly', 'fly', 'bee'] as const) {
      for (const seed of SEEDS) {
        const { swarm } = released1(kind, seed, FULL_DUSK);
        assert.equal(ticked(swarm, SIGHT, LATER), swarm);
      }
    }
  });

  it('one in the air settles on its next perch and stays', () => {
    let hovered = 0;
    for (const seed of SEEDS) {
      const { swarm, one } = released1('fly', seed, FULL_DAY);
      if (one.leg.to.kind !== 'air') continue;
      hovered += 1;
      const dusk = { ...swarm, dusk: FULL_DUSK };
      const settled = ticked(dusk, SIGHT, one.leg.leaves);
      const next = only(settled);
      assert.notEqual(next.leg.to.kind, 'air');
      const after = { ...settled, dusk: FULL_DUSK };
      assert.equal(ticked(after, SIGHT, LATER), after);
    }
    assert.ok(hovered > 0);
  });

  it('a butterfly drinking as dusk falls moves to a cap when its stay is over', () => {
    let drank = 0;
    for (const seed of SEEDS) {
      const { swarm, one } = released1('butterfly', seed, FULL_DAY);
      if (one.leg.to.kind !== 'flower') continue;
      drank += 1;
      const dusk = { ...swarm, dusk: FULL_DUSK };
      assert.equal(ticked(dusk, SIGHT, one.leg.leaves - 1), dusk);
      assert.equal(
        only(ticked(dusk, SIGHT, one.leg.leaves)).leg.to.kind,
        'cap',
      );
    }
    assert.ok(drank > 0);
  });

  it('a tap sends one off, and it settles again', () => {
    for (const seed of SEEDS) {
      const { swarm, one } = released1('butterfly', seed, FULL_DUSK);
      const tapped = startled(swarm, one.id, SIGHT, one.leg.arrives + 100);
      const next = only(tapped);
      assert.equal(next.legs, one.legs + 1);
      assert.equal(next.leg.to.kind, 'cap');
      const after = { ...tapped, dusk: FULL_DUSK };
      assert.equal(ticked(after, SIGHT, LATER), after);
    }
  });

  it('morning lets them go as before, each at its wake', () => {
    const morning: Dusk = { toward: 'day', startedAt: LATER, from: 1 };
    for (const seed of SEEDS) {
      const { swarm, one } = released1('butterfly', seed, FULL_DUSK);
      const woken = { ...swarm, dusk: morning };
      assert.equal(ticked(woken, SIGHT, LATER + WAKE_MS[0] - 1), woken);
      const gone = only(ticked(woken, SIGHT, LATER + WAKE_MS[1]));
      assert.equal(gone.legs, one.legs + 1);
    }
  });
});

describe('wingsShut', () => {
  it('leaves wings be by day, shuts them deep in dusk, and never jumps', () => {
    assert.equal(wingsShut(0), 0);
    assert.equal(wingsShut(0.5), 0);
    assert.equal(wingsShut(0.9), 1);
    assert.equal(wingsShut(1), 1);
    for (let level = 0; level < 1; level += 0.01) {
      const step = wingsShut(level + 0.01) - wingsShut(level);
      assert.ok(step >= 0 && step < 0.05);
    }
  });

  it('shut, holds every kind’s wings closed and still at rest', () => {
    for (const kind of INSECT_KINDS) {
      const { one } = released1(kind, 3, FULL_DUSK);
      const stay = { ...one.leg, launch: 0, speed: 0, drink: 0 };
      const { arrives } = one.leg;
      for (let now = arrives + 2000; now < arrives + 9000; now += 37) {
        const open = wingBeat(stay, now, { phase: 1, kind }, 1);
        assert.ok(Math.abs(open) < 1e-9, `${kind} at ${now}: ${open}`);
      }
    }
  });
});
