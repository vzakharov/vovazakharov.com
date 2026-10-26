import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlight,
  type Flight,
  FLIGHT_HABITS,
  flowerFreed,
  givesWay,
  type Held,
  type Leg,
  nextFlight,
  type Perches,
} from './flight';
import { INSECT_KINDS, type InsectKind } from './insect-genes';

const CAPS = ['mushroom-1', 'mushroom-2', 'mushroom-3', 'mushroom-4'];
const FLOWERS = ['flower-1', 'flower-2', 'flower-3'];
const AIR = ['air-1', 'air-2', 'air-3'];
const PERCHES: Perches = {
  caps: CAPS,
  spotted: [],
  flowers: FLOWERS,
  air: AIR,
  crowded: [],
  room: [],
};
const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 1);

/** `legs` flights of a `kind` grown from `seed`, each departing as the last leaves. */
function journey(
  kind: InsectKind,
  seed: number,
  legs: number,
  perches = PERCHES,
): Leg[] {
  let flight: Flight = firstFlight({ seed, kind }, perches, 0);
  const flown = [flight.leg];
  while (flown.length < legs) {
    flight = nextFlight({ seed, kind, ...flight }, perches, flight.leg.leaves);
    flown.push(flight.leg);
  }
  return flown;
}

const within = (value: number, [min, max]: readonly [number, number]) =>
  value >= min && value <= max;

describe('FLIGHT_HABITS', () => {
  it('flies and stays for as long as each kind’s habits say', () => {
    for (const kind of INSECT_KINDS) {
      const { flying, drinking, resting } = FLIGHT_HABITS[kind];
      for (const leg of SEEDS.slice(0, 200).flatMap((seed) =>
        journey(kind, seed, 8),
      )) {
        assert.ok(within(leg.arrives - leg.departs, flying), kind);
        const stay = leg.leaves - leg.arrives;
        if (leg.to.kind === 'flower') assert.ok(within(stay, drinking), kind);
        if (leg.to.kind === 'cap') {
          assert.ok(resting && within(stay, resting), kind);
        }
      }
    }
  });

  it('sends a fly to a flower about one time in ten, a cap otherwise', () => {
    const perches = { ...PERCHES, spotted: [CAPS[0] ?? ''] };
    const firsts = SEEDS.map(
      (seed) => firstFlight({ seed, kind: 'fly' }, perches, 0).leg.to,
    );
    const flowers = firsts.filter(({ kind }) => kind === 'flower').length;
    assert.equal(firsts.filter(({ kind }) => kind === 'air').length, 0);
    const share = flowers / firsts.length;
    assert.ok(Math.abs(share - 0.1) < 0.03, `flower share ${String(share)}`);
  });

  it('mostly roams a fly with no spotted cap open, and looks again', () => {
    const firsts = SEEDS.map(
      (seed) => firstFlight({ seed, kind: 'fly' }, PERCHES, 0).leg.to,
    );
    const share =
      firsts.filter(({ kind }) => kind === 'air').length / firsts.length;
    const { fussy } = FLIGHT_HABITS.fly;
    assert.ok(Math.abs(share - fussy) < 0.03, `air share ${String(share)}`);
  });

  it('never sends a bee to a cap: flowers, else the air', () => {
    for (const seed of SEEDS.slice(0, 300)) {
      for (const { to } of journey('bee', seed, 8)) {
        assert.equal(to.kind, 'flower');
      }
      const capsOnly = { ...PERCHES, flowers: [] };
      for (const { to } of journey('bee', seed, 4, capsOnly)) {
        assert.equal(to.kind, 'air');
      }
      const nothing = { ...capsOnly, air: [] };
      assert.equal(journey('bee', seed, 1, nothing)[0]?.to.kind, 'away');
    }
  });

  it('never settles a bee back on the flower it leaves, where a butterfly would', () => {
    const taken = FLOWERS.slice(1).map((id) => ({
      kind: 'butterfly' as const,
      perch: { kind: 'flower', id } as const,
    }));
    const only = { kind: 'flower', id: 'flower-1' } as const;
    const flowersOnly = { ...PERCHES, caps: [] };
    for (const seed of SEEDS.slice(0, 300)) {
      for (const kind of ['bee', 'butterfly'] as const) {
        const onFlower = {
          ...firstFlight({ seed, kind }, flowersOnly, 0, taken),
          seed,
          kind,
        };
        assert.deepEqual(onFlower.leg.to, only);
        const { to } = nextFlight(
          onFlower,
          flowersOnly,
          onFlower.leg.leaves,
          taken,
        ).leg;
        if (kind === 'bee') assert.equal(to.kind, 'air');
        else assert.deepEqual(to, only);
      }
    }
  });

  it('draws a fly to a spotted cap eight times as often as to any other', () => {
    const [spotted = ''] = CAPS;
    const perches = { ...PERCHES, flowers: [], spotted: [spotted] };
    const firsts = SEEDS.map(
      (seed) => firstFlight({ seed, kind: 'fly' }, perches, 0).leg.to,
    );
    const share =
      firsts.filter((to) => to.kind === 'cap' && to.id === spotted).length /
      firsts.length;
    // One spotted cap weighed 8 against three plain ones weighed 1 each.
    assert.ok(
      Math.abs(share - 8 / 11) < 0.04,
      `spotted share ${String(share)}`,
    );
  });

  it('draws a butterfly to a spotted cap a quarter as often as to any other', () => {
    const [spotted = ''] = CAPS;
    const perches = { ...PERCHES, flowers: [], spotted: [spotted] };
    const firsts = SEEDS.map(
      (seed) => firstFlight({ seed, kind: 'butterfly' }, perches, 0).leg.to,
    );
    const share =
      firsts.filter((to) => to.kind === 'cap' && to.id === spotted).length /
      firsts.length;
    // One spotted cap weighed 0.25 against three plain ones weighed 1 each.
    const expected = 0.25 / 3.25;
    assert.ok(
      Math.abs(share - expected) < 0.02,
      `spotted share ${String(share)}`,
    );
  });
});

describe('the bees’ turn at the flowers', () => {
  const flower = { kind: 'flower', id: 'flower-1' } as const;
  const cap = { kind: 'cap', id: 'mushroom-1' } as const;
  const waiting: Held = { kind: 'bee', perch: { kind: 'air', id: 'air-1' } };
  const sipping: Held = { kind: 'bee', perch: { kind: 'flower', id: 'x' } };
  const perches = { flowers: ['flower-1'], crowded: [] };

  it('moves a seated butterfly off a bee’s flower while a bee waits in the air', () => {
    const butterfly: Held = { kind: 'butterfly', perch: flower };
    assert.ok(givesWay(butterfly, [waiting], perches));
    assert.ok(!givesWay(butterfly, [], perches));
    assert.ok(!givesWay(butterfly, [sipping], perches));
    assert.ok(!givesWay({ kind: 'bee', perch: flower }, [waiting], perches));
  });

  it('moves one off a cap only where it crowds a bee on that flower', () => {
    const resting: Held = { kind: 'butterfly', perch: cap };
    const crowdingFor = (pairing: readonly ['butterfly', 'bee' | 'fly']) => ({
      ...perches,
      crowded: [[cap, flower, [pairing]] as const],
    });
    assert.ok(givesWay(resting, [waiting], crowdingFor(['butterfly', 'bee'])));
    assert.ok(!givesWay(resting, [waiting], crowdingFor(['butterfly', 'fly'])));
    assert.ok(!givesWay(resting, [waiting], perches));
  });

  it('sends a hovering bee on at once when a flower is open to it', () => {
    const taken: Held[] = [{ kind: 'butterfly', perch: flower }];
    assert.ok(!flowerFreed(waiting, taken, perches));
    const two = { ...perches, flowers: ['flower-1', 'flower-2'] };
    assert.ok(flowerFreed(waiting, taken, two));
    const hovering: Held = { ...waiting, kind: 'butterfly' };
    assert.ok(!flowerFreed(hovering, taken, two));
  });
});
