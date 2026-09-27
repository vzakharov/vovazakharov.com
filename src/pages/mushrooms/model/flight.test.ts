import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DRINKING,
  firstFlight,
  type Flight,
  flightAway,
  flowerIndex,
  FLYING,
  isAloft,
  isLeaving,
  type Leg,
  nextFlight,
  RESTING,
} from './flight';

const CAPS = ['mushroom-1', 'mushroom-2', 'mushroom-3'];
const SEEDS = Array.from({ length: 200 }, (_, index) => index * 7919 + 1);

/** `legs` flights of the insect grown from `seed`, each departing as the last leaves. */
function journey(seed: number, legs: number, caps = CAPS): Leg[] {
  let flight: Flight = firstFlight({ seed }, caps, 0);
  const flown = [flight.leg];
  while (flown.length < legs) {
    flight = nextFlight({ seed, ...flight }, caps, flight.leg.leaves);
    flown.push(flight.leg);
  }
  return flown;
}

const within = (value: number, [min, max]: readonly [number, number]) =>
  value >= min && value <= max;

describe('firstFlight', () => {
  it('flies in from off screen, from either side, to a perch', () => {
    const sides = new Set<string>();
    for (const seed of SEEDS) {
      const { leg, legs } = firstFlight({ seed }, CAPS, 1000);
      assert.equal(legs, 1);
      assert.ok(leg.from.kind === 'away');
      sides.add(leg.from.side);
      assert.notEqual(leg.to.kind, 'away');
      assert.equal(leg.departs, 1000);
    }
    assert.deepEqual([...sides].toSorted(), ['left', 'right']);
  });

  it('is a pure function of the seed', () => {
    assert.deepEqual(
      firstFlight({ seed: 5 }, CAPS, 0),
      firstFlight({ seed: 5 }, CAPS, 0),
    );
  });
});

describe('nextFlight', () => {
  const legs = SEEDS.flatMap((seed) => journey(seed, 12));

  it('flies for FLYING, drinks for DRINKING, rests for RESTING', () => {
    for (const leg of legs) {
      assert.ok(within(leg.arrives - leg.departs, FLYING));
      const stay = leg.leaves - leg.arrives;
      if (leg.to.kind === 'flower') assert.ok(within(stay, DRINKING));
      if (leg.to.kind === 'cap') assert.ok(within(stay, RESTING));
    }
  });

  it('goes to a flower about three times in five, a cap otherwise', () => {
    const flowers = legs.filter(({ to }) => to.kind === 'flower').length;
    const caps = legs.filter(({ to }) => to.kind === 'cap').length;
    assert.equal(flowers + caps, legs.length);
    const share = flowers / legs.length;
    assert.ok(share > 0.55 && share < 0.7, `flower share ${String(share)}`);
  });

  it('never goes back to the perch it is leaving, on seven flowers', () => {
    for (const seed of SEEDS) {
      const flown = journey(seed, 12);
      for (const [index, leg] of flown.entries()) {
        const { from, to } = leg;
        if (index > 0) assert.deepEqual(from, flown[index - 1]?.to);
        if (from.kind === 'cap' && to.kind === 'cap') {
          assert.notEqual(to.id, from.id);
        }
        if (from.kind === 'flower' && to.kind === 'flower') {
          assert.notEqual(flowerIndex(to.pick, 7), flowerIndex(from.pick, 7));
        }
      }
    }
  });

  it('goes only to flowers on an empty meadow, and to the one cap otherwise', () => {
    for (const seed of SEEDS) {
      for (const { to } of journey(seed, 6, []))
        assert.equal(to.kind, 'flower');
      for (const { from, to } of journey(seed, 6, ['mushroom-1'])) {
        if (from.kind === 'cap') assert.equal(to.kind, 'flower');
      }
    }
  });

  it('keeps every flower pick in [0, 1)', () => {
    for (const { to } of legs) {
      if (to.kind === 'flower') assert.ok(to.pick >= 0 && to.pick < 1);
    }
  });

  it('is a pure function of the seed and the legs flown', () => {
    assert.deepEqual(journey(9, 8), journey(9, 8));
    assert.notDeepEqual(journey(9, 8), journey(10, 8));
  });
});

describe('flightAway', () => {
  it('leaves off screen from its perch, and is gone as it arrives', () => {
    const first = firstFlight({ seed: 3 }, CAPS, 0);
    const away = flightAway({ seed: 3, ...first }, 500);
    assert.ok(isLeaving(away));
    assert.ok(!isLeaving(first));
    assert.deepEqual(away.leg.from, first.leg.to);
    assert.equal(away.leg.departs, 500);
    assert.equal(away.leg.leaves, away.leg.arrives);
    assert.equal(away.legs, 2);
  });
});

describe('flowerIndex', () => {
  it('spreads picks evenly over the flowers, and stays in range', () => {
    assert.equal(flowerIndex(0, 7), 0);
    assert.equal(flowerIndex(0.999, 7), 6);
    assert.equal(flowerIndex(0.5, 2), 1);
    assert.equal(flowerIndex(1, 7), 6);
  });
});

describe('isAloft', () => {
  it('is true from departure up to arrival', () => {
    const { leg } = firstFlight({ seed: 1 }, CAPS, 100);
    const flight = { leg, legs: 1 };
    assert.ok(!isAloft(flight, 99));
    assert.ok(isAloft(flight, 100));
    assert.ok(isAloft(flight, leg.arrives - 1));
    assert.ok(!isAloft(flight, leg.arrives));
  });
});
