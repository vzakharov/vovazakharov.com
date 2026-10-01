import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlight,
  type Flight,
  FLIGHT_HABITS,
  flightAway,
  type Held,
  isAloft,
  isLeaving,
  type Leg,
  nextFlight,
  type Perch,
  type Perches,
  perchName,
} from './flight';
import { CLUMP_DISTANCE } from './ground';
import { INSECT_KINDS, type InsectKind } from './insect-genes';

const kind = 'butterfly' as const;
const {
  flying: FLYING,
  drinking: DRINKING,
  resting: RESTING,
  hovering: HOVERING,
} = FLIGHT_HABITS[kind];
/** No spotted caps, and nowhere to plant: what the butterfly's legs never read. */
const BARE = { spotted: [], room: [] } as const;

const CAPS = ['mushroom-1', 'mushroom-2', 'mushroom-3'];
const FLOWERS = Array.from({ length: 7 }, (_, index) => `flower-${index + 1}`);
const PERCHES: Perches = {
  caps: CAPS,
  flowers: FLOWERS,
  air: [],
  crowded: [],
  ...BARE,
};
const AIR = Array.from({ length: 6 }, (_, index) => `air-${index + 1}`);
const AIRY: Perches = { ...PERCHES, air: AIR };
const SEEDS = Array.from({ length: 200 }, (_, index) => index * 7919 + 1);

/** `legs` flights of the insect grown from `seed`, each departing as the last leaves. */
function journey(seed: number, legs: number, perches = PERCHES): Leg[] {
  let flight: Flight = firstFlight({ seed, kind }, perches, 0);
  const flown = [flight.leg];
  while (flown.length < legs) {
    flight = nextFlight({ seed, kind, ...flight }, perches, flight.leg.leaves);
    flown.push(flight.leg);
  }
  return flown;
}

/** `perch`, taken by another butterfly. */
const held = (perch: Perch): Held => ({ kind, perch });
/** Two perches crowding each other for two butterflies. */
const BUTTERFLIES = [[kind, kind]] as const;

const within = (value: number, [min, max]: readonly [number, number]) =>
  value >= min && value <= max;

describe('firstFlight', () => {
  it('flies in from off screen, from either side, to a perch', () => {
    const sides = new Set<string>();
    for (const seed of SEEDS) {
      const { leg, legs } = firstFlight({ seed, kind }, PERCHES, 1000);
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
      firstFlight({ seed: 5, kind }, PERCHES, 0),
      firstFlight({ seed: 5, kind }, PERCHES, 0),
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

  it('never goes back to the perch it is leaving while another is open', () => {
    for (const seed of SEEDS) {
      const flown = journey(seed, 12);
      for (const [index, leg] of flown.entries()) {
        const { from, to } = leg;
        if (index > 0) assert.deepEqual(from, flown[index - 1]?.to);
        assert.notDeepEqual(to, from);
      }
    }
  });

  it('goes only to perches offered, the other kind when one has none', () => {
    for (const { to } of legs) {
      if (to.kind === 'flower') assert.ok(FLOWERS.includes(to.id));
      if (to.kind === 'cap') assert.ok(CAPS.includes(to.id));
    }
    for (const seed of SEEDS) {
      for (const { to } of journey(seed, 6, { ...PERCHES, caps: [] }))
        assert.equal(to.kind, 'flower');
      for (const { to } of journey(seed, 6, { ...PERCHES, flowers: [] }))
        assert.equal(to.kind, 'cap');
      const lone = {
        caps: ['mushroom-1'],
        flowers: [],
        air: [],
        crowded: [],
        ...BARE,
      };
      const [first, second] = journey(seed, 2, lone);
      assert.deepEqual(first?.to, { kind: 'cap', id: 'mushroom-1' });
      assert.deepEqual(second?.to, first.to);
    }
  });

  it('never goes to a perch another insect sits on or is heading to', () => {
    const taken = [
      ...CAPS.slice(1).map((id) => ({ kind: 'cap', id }) as const),
      ...FLOWERS.slice(2).map((id) => ({ kind: 'flower', id }) as const),
    ].map((perch) => held(perch));
    const free = new Set([
      'cap mushroom-1',
      'flower flower-1',
      'flower flower-2',
    ]);
    for (const seed of SEEDS) {
      const { leg } = firstFlight({ seed, kind }, PERCHES, 0, taken);
      const { to } = nextFlight(
        { seed, kind, leg, legs: 1 },
        PERCHES,
        0,
        taken,
      ).leg;
      for (const perch of [leg.to, to]) {
        assert.ok(perch.kind !== 'away');
        assert.ok(free.has(`${perch.kind} ${perch.id}`));
      }
    }
  });

  it('never goes to a perch crowded by one another insect has taken', () => {
    const cap = { kind: 'cap', id: 'mushroom-1' } as const;
    const crowded = FLOWERS.map(
      (id) => [cap, { kind: 'flower', id }, BUTTERFLIES] as const,
    );
    const perches = { ...PERCHES, crowded };
    for (const seed of SEEDS) {
      const { to } = firstFlight({ seed, kind }, perches, 0, [held(cap)]).leg;
      assert.equal(to.kind, 'cap');
      assert.notDeepEqual(to, cap);
    }
  });

  it('settles again where it was when every other perch is taken', () => {
    const taken = [
      ...CAPS.slice(1).map((id) => ({ kind: 'cap', id }) as const),
      ...FLOWERS.map((id) => ({ kind: 'flower', id }) as const),
    ].map((perch) => held(perch));
    for (const seed of SEEDS) {
      const { leg } = firstFlight({ seed, kind }, PERCHES, 0, taken);
      assert.deepEqual(leg.to, { kind: 'cap', id: 'mushroom-1' });
      const next = nextFlight({ seed, kind, leg, legs: 1 }, AIRY, 0, taken).leg;
      assert.deepEqual(next.to, leg.to);
      const gone = { ...AIRY, caps: CAPS.slice(1) };
      const roaming = nextFlight(
        { seed, kind, leg, legs: 1 },
        gone,
        0,
        taken,
      ).leg;
      assert.equal(roaming.to.kind, 'air');
    }
  });

  it('roams the air when every perch is taken or none is offered', () => {
    const none = { caps: [], flowers: [], air: AIR, crowded: [], ...BARE };
    const everything = [
      ...CAPS.map((id) => ({ kind: 'cap', id }) as const),
      ...FLOWERS.map((id) => ({ kind: 'flower', id }) as const),
    ].map((perch) => held(perch));
    for (const seed of SEEDS) {
      assert.equal(firstFlight({ seed, kind }, none, 0).leg.to.kind, 'air');
      const { leg } = firstFlight({ seed, kind }, AIRY, 0, everything);
      assert.equal(leg.to.kind, 'air');
      assert.ok(within(leg.leaves - leg.arrives, HOVERING));
      assert.ok(within(leg.arrives - leg.departs, FLYING));
    }
  });

  it('roams from spot to spot, never one another has taken, and perches once one is open', () => {
    const everything = [
      ...CAPS.map((id) => ({ kind: 'cap', id }) as const),
      ...FLOWERS.map((id) => ({ kind: 'flower', id }) as const),
    ].map((perch) => held(perch));
    const spot = { kind: 'air', id: 'air-1' } as const;
    for (const seed of SEEDS) {
      let flight = firstFlight({ seed, kind }, AIRY, 0, [
        ...everything,
        held(spot),
      ]);
      for (const _ of Array.from({ length: 6 })) {
        const { leg } = flight;
        assert.equal(leg.to.kind, 'air');
        assert.notDeepEqual(leg.to, spot);
        const next = nextFlight({ seed, kind, ...flight }, AIRY, leg.leaves, [
          ...everything,
          held(spot),
        ]);
        assert.notDeepEqual(next.leg.to, leg.to);
        flight = next;
      }
      const freed = nextFlight(
        { seed, kind, ...flight },
        AIRY,
        flight.leg.leaves,
        everything.slice(1),
      );
      assert.deepEqual(freed.leg.to, everything[0]?.perch);
    }
  });

  it('roams to a spot only crowded, not taken, where the air has none uncrowded', () => {
    const spot = { kind: 'air', id: 'air-1' } as const;
    const crowded = AIR.slice(1).map(
      (id) => [spot, { kind: 'air', id }, BUTTERFLIES] as const,
    );
    const air = { ...AIRY, caps: [], flowers: [], crowded };
    for (const seed of SEEDS) {
      const { leg } = firstFlight({ seed, kind }, air, 0, [held(spot)]);
      assert.equal(leg.to.kind, 'air');
      assert.notDeepEqual(leg.to, spot);
    }
  });

  it('flies away only when neither a perch nor a spot in the air is open', () => {
    const none = { caps: [], flowers: [], air: [], crowded: [], ...BARE };
    for (const seed of SEEDS) {
      assert.equal(firstFlight({ seed, kind }, none, 0).leg.to.kind, 'away');
    }
  });

  it('is a pure function of the seed and the legs flown', () => {
    assert.deepEqual(journey(9, 8), journey(9, 8));
    assert.notDeepEqual(journey(9, 8), journey(10, 8));
  });
});

describe('flightAway', () => {
  it('leaves off screen from its perch, and is gone as it arrives', () => {
    const first = firstFlight({ seed: 3, kind }, PERCHES, 0);
    const away = flightAway({ seed: 3, kind, ...first }, 500);
    assert.ok(isLeaving(away));
    assert.ok(!isLeaving(first));
    assert.deepEqual(away.leg.from, first.leg.to);
    assert.equal(away.leg.departs, 500);
    assert.equal(away.leg.leaves, away.leg.arrives);
    assert.equal(away.legs, 2);
  });
});

/**
 * Both edges `apart` butterfly sizes across the layout from the perch `to`,
 * the perch `q` from the eye and the edges `edge` (`Place`).
 */
const placesAt = (to: Perch, apart: number, q: number, edge: number) => {
  const far = { x: apart, y: 0, fromEye: edge };
  return {
    [perchName(to)]: { x: 0, y: 0, fromEye: q },
    'away left': far,
    'away right': far,
  };
};

/**
 * `kinded`'s leg out to the edges `apart` butterfly sizes away, seeded
 * `seed`, from a perch `q` from the eye to edges `edge` from it; both at
 * the clump's distance, where the layout draws an insect its own size,
 * unless given.
 */
const legOver = (
  kinded: InsectKind,
  apart: number,
  seed = 3,
  q = CLUMP_DISTANCE,
  edge = q,
) => {
  const first = firstFlight({ seed, kind: kinded }, PERCHES, 0);
  const places = placesAt(first.leg.to, apart, q, edge);
  const insect = { seed, kind: kinded, ...first };
  return flightAway(insect, 0, { places }).leg;
};

/** How far apart the edges stand in `legOver`'s legs, in butterfly sizes: from a hop to past any screen's world. */
const APARTS = [0.2, 1, 3, 6, 11, 25, 45, 120];

describe('a flight across the screen', () => {
  it('takes its length at its cruise, however long, never quicker than its flying time, every kind', () => {
    for (const kinded of INSECT_KINDS) {
      const { flying, cruising: cruise } = FLIGHT_HABITS[kinded];
      for (const apart of APARTS) {
        const atCruise = (1000 * apart) / cruise;
        for (const seed of SEEDS.slice(0, 20)) {
          const { departs, arrives } = legOver(kinded, apart, seed);
          const taken = arrives - departs;
          const at = `${kinded} over ${String(apart)} takes ${String(taken)}`;
          if (atCruise >= flying[1]) {
            assert.ok(Math.abs(taken - atCruise) < 1e-9 * atCruise, at);
          } else {
            assert.ok(
              within(taken, [Math.max(flying[0], atCruise), flying[1]]),
              at,
            );
          }
        }
      }
    }
  });

  it('takes twice as long over twice the way, past its flying time, every kind', () => {
    for (const kinded of INSECT_KINDS) {
      const { flying, cruising: cruise } = FLIGHT_HABITS[kinded];
      const least = (flying[1] * cruise) / 1000;
      for (const apart of [least, 2 * least, 11, 25]) {
        for (const seed of SEEDS.slice(0, 20)) {
          const once = legOver(kinded, apart, seed);
          const twice = legOver(kinded, 2 * apart, seed);
          const ratio =
            (twice.arrives - twice.departs) / (once.arrives - once.departs);
          assert.ok(Math.abs(ratio - 2) < 1e-9, `${kinded} ${String(apart)}`);
        }
      }
    }
  });

  it('darts the same share of every flight whatever its length, for a kind that dashes', () => {
    for (const kinded of INSECT_KINDS) {
      const { dashing } = FLIGHT_HABITS[kinded];
      for (const apart of APARTS) {
        assert.deepEqual(legOver(kinded, apart).dash, dashing, kinded);
      }
    }
  });

  it('flies at its cruise as drawn where it is over a straight way at one depth, and a little under it between the depths perches stand at, every kind', () => {
    // The perches' distances from the opening eye run 0.9 to 1.5 of the clump's.
    const depths = [0.9, 1, 1.2, 1.5].map((share) => share * CLUMP_DISTANCE);
    const [apart, steps] = [60, 1000];
    for (const kinded of INSECT_KINDS) {
      const { cruising: cruise } = FLIGHT_HABITS[kinded];
      for (const q of depths) {
        for (const edge of depths) {
          // Drawn `CLUMP_DISTANCE / q` its size, with `1 / q` going evenly
          // along the way, as a straight way across the ground's rows does.
          let seen = 0;
          for (let step = 0; step < steps; step++) {
            const t = (step + 0.5) / steps;
            seen += apart / steps / ((1 - t) / q + t / edge) / CLUMP_DISTANCE;
          }
          const { departs, arrives } = legOver(kinded, apart, 3, q, edge);
          const share = seen / ((arrives - departs) / 1000) / cruise;
          const at = `${kinded} from ${q.toFixed(1)} to ${edge.toFixed(1)}: ${share.toFixed(4)}`;
          if (q === edge) assert.ok(Math.abs(share - 1) < 1e-6, at);
          else assert.ok(share > 0.97 && share < 1, at);
        }
      }
    }
  });

  it('takes its flying time where it has no length to go by', () => {
    for (const kinded of INSECT_KINDS) {
      const first = firstFlight({ seed: 3, kind: kinded }, PERCHES, 0);
      const { departs, arrives, dash } = first.leg;
      assert.ok(within(arrives - departs, FLIGHT_HABITS[kinded].flying));
      assert.equal(dash, undefined, kinded);
    }
  });
});

describe('isAloft', () => {
  it('is true from departure up to arrival', () => {
    const { leg } = firstFlight({ seed: 1, kind }, PERCHES, 100);
    const flight = { leg, legs: 1 };
    assert.ok(!isAloft(flight, 99));
    assert.ok(isAloft(flight, 100));
    assert.ok(isAloft(flight, leg.arrives - 1));
    assert.ok(!isAloft(flight, leg.arrives));
  });
});
