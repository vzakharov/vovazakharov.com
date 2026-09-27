import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlight,
  type Flight,
  FLIGHT_HABITS,
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
  seededFlowers: FLOWERS.length,
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

  it('sends a fly to a cap about four times in five', () => {
    const legs = SEEDS.slice(0, 400).flatMap((seed) => journey('fly', seed, 6));
    const caps = legs.filter(({ to }) => to.kind === 'cap').length;
    const share = caps / legs.length;
    assert.ok(share > 0.74 && share < 0.86, `cap share ${String(share)}`);
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

  it('draws a fly to a spotted cap three times as often as to any other', () => {
    const [spotted = ''] = CAPS;
    const perches = { ...PERCHES, flowers: [], spotted: [spotted] };
    const firsts = SEEDS.map(
      (seed) => firstFlight({ seed, kind: 'fly' }, perches, 0).leg.to,
    );
    const share =
      firsts.filter((to) => to.kind === 'cap' && to.id === spotted).length /
      firsts.length;
    // One spotted cap weighed 3 against three plain ones weighed 1 each.
    assert.ok(Math.abs(share - 3 / 6) < 0.04, `spotted share ${String(share)}`);
  });

  it('draws a butterfly to every cap alike, spotted or not', () => {
    const [spotted = ''] = CAPS;
    const perches = { ...PERCHES, flowers: [], spotted: [spotted] };
    const firsts = SEEDS.map(
      (seed) => firstFlight({ seed, kind: 'butterfly' }, perches, 0).leg.to,
    );
    const share =
      firsts.filter((to) => to.kind === 'cap' && to.id === spotted).length /
      firsts.length;
    assert.ok(Math.abs(share - 1 / 4) < 0.04, `spotted share ${String(share)}`);
  });
});
