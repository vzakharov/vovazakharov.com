import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowLayout } from '../ui/scene/layout';
import { type Screen, VIEWPORTS } from '../ui/scene/viewports';
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

/** Both edges `strides` of `kinded`'s strides from the perch `to`. */
const placesAt = (to: Perch, kinded: InsectKind, strides: number) => {
  const far = { x: strides * FLIGHT_HABITS[kinded].stride, y: 0 };
  return {
    [perchName(to)]: { x: 0, y: 0 },
    'away left': far,
    'away right': far,
  };
};

/** How far each of `VIEWPORTS` shows across, in butterfly sizes (`Places`), by its name. */
const ACROSS = new Map(
  VIEWPORTS.map(([name, width, height]) => {
    const layout = meadowLayout(width, height, 1);
    return [name, layout.width / layout.insectSize] as const;
  }),
);

/** How far the screen `name` shows across. */
const acrossOn = (name: Screen) => {
  const across = ACROSS.get(name);
  assert.ok(across !== undefined, name);
  return across;
};

/**
 * `kinded`'s leg out to the edges `apart` butterfly sizes away, on a screen
 * `across` butterfly sizes wide, seeded `seed`.
 */
const legOver = (
  kinded: InsectKind,
  apart: number,
  across: number,
  seed = 3,
) => {
  const first = firstFlight({ seed, kind: kinded }, PERCHES, 0);
  const places = placesAt(
    first.leg.to,
    kinded,
    apart / FLIGHT_HABITS[kinded].stride,
  );
  const insect = { seed, kind: kinded, ...first };
  return flightAway(insect, 0, { places, across }).leg;
};

/** How fast `leg`, `apart` butterfly sizes long, dashes, in sizes a ms. */
const dashSpeed = ({ departs, arrives, dash }: Leg, apart: number) => {
  assert.ok(dash);
  return (dash.way * apart) / (dash.time * (arrives - departs));
};

describe('a flight across the screen', () => {
  it('takes its pace to a stride, longer in proportion past it, and never past its slowest up to the screen across, every kind on every screen', () => {
    for (const [name, across] of ACROSS) {
      for (const kinded of INSECT_KINDS) {
        const { flying, slowest, stride, dashing } = FLIGHT_HABITS[kinded];
        const farthest = dashing === undefined ? 40 : across / stride;
        for (const strides of [
          0.5,
          1,
          (1 + slowest) / 2,
          slowest,
          3,
          farthest,
        ]) {
          const stretch = Math.min(slowest, Math.max(1, strides));
          for (const seed of SEEDS.slice(0, 20)) {
            const leg = legOver(kinded, strides * stride, across, seed);
            const taken = leg.arrives - leg.departs;
            assert.ok(
              within(taken / stretch, flying),
              `${kinded} over ${String(strides)} strides on the ${name} takes ${String(taken)}`,
            );
          }
        }
      }
    }
  });

  it('dashes past its slowest, the rest flown at its pace, for a kind that dashes, on every screen', () => {
    for (const [name, across] of ACROSS) {
      for (const kinded of INSECT_KINDS) {
        const { slowest, dashing, stride, flying } = FLIGHT_HABITS[kinded];
        for (const strides of [slowest, 3, across / stride, 40]) {
          const leg = legOver(kinded, strides * stride, across);
          const { dash, departs, arrives } = leg;
          if (dashing === undefined || strides <= slowest) {
            assert.equal(dash, undefined, kinded);
            continue;
          }
          assert.ok(dash, `${kinded} on the ${name}`);
          const rest = (1 - dash.way) * strides;
          assert.ok(Math.abs(rest - (1 - dashing) * slowest) < 1e-9, kinded);
          assert.ok(
            within(((1 - dash.time) * (arrives - departs)) / rest, flying),
          );
          if (strides <= across / stride) {
            assert.ok(Math.abs(dash.time - dashing) < 1e-12, kinded);
          }
        }
      }
    }
  });

  it('dashes no faster across the world than across its screen, and takes the longer for it, on every screen', () => {
    for (const [name, across] of ACROSS) {
      for (const kinded of INSECT_KINDS) {
        if (FLIGHT_HABITS[kinded].dashing === undefined) continue;
        for (const seed of SEEDS.slice(0, 20)) {
          const screenwide = legOver(kinded, across, across, seed);
          const fastest = dashSpeed(screenwide, across);
          let longest = screenwide.arrives - screenwide.departs;
          for (const apart of [1.5, 2, 3].map((n) => n * across)) {
            const leg = legOver(kinded, apart, across, seed);
            const { departs, arrives } = leg;
            const speed = dashSpeed(leg, apart);
            const at = `${kinded} on the ${name}`;
            assert.ok(Math.abs(speed - fastest) < 1e-9 * fastest, at);
            assert.ok(arrives - departs > longest, at);
            longest = arrives - departs;
          }
        }
      }
    }
  });

  it("caps a phone's dash at its own width, slower than a tablet's over the same way", () => {
    const [phone, tablet] = [acrossOn('phone'), acrossOn('tablet')];
    assert.ok(phone < tablet);
    for (const kinded of INSECT_KINDS) {
      if (FLIGHT_HABITS[kinded].dashing === undefined) continue;
      for (const seed of SEEDS.slice(0, 20)) {
        const own = dashSpeed(legOver(kinded, phone, phone, seed), phone);
        const onPhone = dashSpeed(legOver(kinded, tablet, phone, seed), tablet);
        const onTablet = legOver(kinded, tablet, tablet, seed);
        assert.ok(Math.abs(onPhone - own) < 1e-9 * own, kinded);
        assert.ok(onPhone < dashSpeed(onTablet, tablet), kinded);
      }
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
