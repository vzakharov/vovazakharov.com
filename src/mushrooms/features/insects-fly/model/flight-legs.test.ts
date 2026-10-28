import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mulberry32 } from '@/mushrooms/shared/lib/random';
import {
  type Flight,
  FLIGHT_HABITS,
  INSECT_KINDS,
  type InsectKind,
  isAloft,
  type Leg,
  legTo,
  type Perch,
} from '@/mushrooms/entities/insect/index.node-safe';

import { firstFlight, nextFlight, type Perches } from './flight';
import {
  BARE,
  CAPS,
  FLOWERS,
  kind,
  PERCHES,
  SEEDS,
  within,
} from './flight.test-kit';
import type { Held } from './perch-room';

const {
  flying: FLYING,
  drinking: DRINKING,
  resting: RESTING,
  hovering: HOVERING,
} = FLIGHT_HABITS[kind];

const AIR = Array.from({ length: 6 }, (_, index) => `air-${index + 1}`);
const AIRY: Perches = { ...PERCHES, air: AIR };

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

describe('a leg to a spot in the air', () => {
  it('hops about it for a kind that never hangs still, and only to the air', () => {
    const cap = { kind: 'cap', id: 'cap' } as const;
    const air = { kind: 'air', id: 'air-1' } as const;
    const legFor = (kinded: InsectKind, to: typeof cap | typeof air) =>
      legTo(
        mulberry32(5),
        FLIGHT_HABITS[kinded],
        { from: cap, to },
        { now: 0 },
      );
    for (const kinded of INSECT_KINDS) {
      assert.deepEqual(
        legFor(kinded, air).hops,
        FLIGHT_HABITS[kinded].hopping,
        kinded,
      );
    }
    assert.equal(legFor('fly', cap).hops, undefined);
  });
});
