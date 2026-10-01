import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlight,
  type Flight,
  FLIGHT_HABITS,
  nextFlight,
  type Perch,
  type Perches,
  perchName,
  type Places,
} from './flight';
import {
  isShown,
  nearerSide,
  type Onscreen,
  outFirst,
  outOfView,
  outWay,
  shownOf,
} from './flight-in';
import { CLUMP_DISTANCE } from './ground';
import { INSECT_KINDS } from './insect-genes';

/** A world 100 units across, the screen showing 30 to 60 of it. */
const WORLD = 100;
const ONSCREEN: Onscreen = { left: 30, right: 60, inset: 1 };
const SEEDS = Array.from({ length: 200 }, (_, index) => index * 7919 + 1);

/** `count` ids of `kind`, spread evenly across the world, and where each stands. */
function spread(kind: 'flower' | 'cap' | 'air', count: number) {
  const ids = Array.from({ length: count }, (_, index) => `${kind}-${index}`);
  const places = ids.map(
    (id, index) =>
      [
        perchName({ kind, id }),
        { x: ((index + 0.5) / count) * WORLD, y: 10, q: CLUMP_DISTANCE },
      ] as const,
  );
  return { ids, places };
}

const [FLOWERS, CAPS, AIR] = [
  spread('flower', 20),
  spread('cap', 10),
  spread('air', 25),
];
const PLACES: Places = Object.fromEntries([
  ...FLOWERS.places,
  ...CAPS.places,
  ...AIR.places,
  ['away left', { x: -2, y: 8, q: CLUMP_DISTANCE }],
  ['away right', { x: WORLD + 2, y: 8, q: CLUMP_DISTANCE }],
]);
const PERCHES: Perches = {
  flowers: FLOWERS.ids,
  caps: CAPS.ids,
  spotted: CAPS.ids.slice(0, 3),
  air: AIR.ids,
  crowded: [],
  room: [],
  places: PLACES,
};

const placeOf = (perch: Perch) => PLACES[perchName(perch)];

describe('a released insect', () => {
  for (const kind of INSECT_KINDS) {
    it(`takes its first perch in view, a ${kind}`, () => {
      for (const seed of SEEDS) {
        const { to } = firstFlight(
          { seed, kind },
          PERCHES,
          0,
          [],
          ONSCREEN,
        ).leg;
        assert.ok(
          isShown(ONSCREEN, placeOf(to)),
          `${String(seed)} ${perchName(to)}`,
        );
      }
    });
  }

  it('flies in from the screen edge nearer its first perch', () => {
    const sides = new Set<string>();
    for (const seed of SEEDS) {
      const { from, to } = firstFlight(
        { seed, kind: 'butterfly' },
        PERCHES,
        0,
        [],
        ONSCREEN,
      ).leg;
      const place = placeOf(to);
      assert.ok(from.kind === 'away' && place);
      assert.equal(from.side, nearerSide(ONSCREEN, place), String(seed));
      sides.add(from.side);
    }
    assert.equal(sides.size, 2);
  });

  it('is timed in from the screen edge, not the world edge', () => {
    const places = shownOf(PERCHES, ONSCREEN).places ?? {};
    assert.deepEqual(places['away left'], { x: 30, y: 8, q: CLUMP_DISTANCE });
    assert.deepEqual(places['away right'], { x: 60, y: 8, q: CLUMP_DISTANCE });
  });

  for (const kind of INSECT_KINDS) {
    it(`flies in to its first perch in view at its cruise, staying as long as its habits say, a ${kind}`, () => {
      const habits = FLIGHT_HABITS[kind];
      const edges = shownOf(PERCHES, ONSCREEN).places ?? {};
      for (const seed of SEEDS) {
        const { leg } = firstFlight({ seed, kind }, PERCHES, 0, [], ONSCREEN);
        const [from, to] = [edges[perchName(leg.from)], placeOf(leg.to)];
        assert.ok(from && to);
        const apart = Math.hypot(to.x - from.x, to.y - from.y);
        const atCruise = (1000 * apart) / habits.cruise;
        const flown = leg.arrives - leg.departs;
        assert.equal(leg.out, undefined);
        assert.ok(flown >= atCruise - 1e-9, `${String(seed)} ${flown}`);
        if (atCruise > habits.flying[1]) {
          assert.ok(Math.abs(flown - atCruise) < 1e-9 * atCruise);
        }
        const stays = {
          flower: habits.drinking,
          cap: habits.resting ?? [0, 0],
          air: habits.hovering,
          away: [0, 0],
        } as const;
        const [least, most] = stays[leg.to.kind];
        const stay = leg.leaves - leg.arrives;
        assert.ok(stay >= least - 1e-6 && stay <= most + 1e-6, String(seed));
      }
    });
  }

  it('flies out of view as long as `outFirst` lengthened its leg by, and half a leg it did not', () => {
    const leg = {
      from: { kind: 'away', side: 'left' },
      to: { kind: 'flower', id: 'flower-0' },
      departs: 1000,
      arrives: 2000,
      leaves: 5000,
    } as const;
    assert.equal(outOfView(outFirst(leg, 700)), 700);
    assert.equal(outOfView(leg), 500);
  });

  it('flies the rest of a first leg out of view first as long as the leg took', () => {
    for (const arrives of [1200, 2000, 2500, 9000]) {
      const leg = {
        from: { kind: 'away', side: 'left' },
        to: { kind: 'flower', id: 'flower-0' },
        departs: 1000,
        arrives,
        leaves: arrives + 3000,
      } as const;
      const lengthened = outFirst(leg, 4000);
      const rest =
        lengthened.arrives - lengthened.departs - outOfView(lengthened);
      assert.equal(rest, arrives - 1000, String(arrives));
      assert.equal(lengthened.leaves - lengthened.arrives, 3000);
    }
  });

  it('roams the air in view while every seat in view is taken', () => {
    const taken = [...FLOWERS.ids, ...CAPS.ids].flatMap((id) =>
      (['flower', 'cap'] as const).map((perchKind) => ({
        kind: 'butterfly' as const,
        perch: { kind: perchKind, id },
      })),
    );
    for (const seed of SEEDS.slice(0, 50)) {
      const { to } = firstFlight(
        { seed, kind: 'butterfly' },
        PERCHES,
        0,
        taken,
        ONSCREEN,
      ).leg;
      assert.equal(to.kind, 'air');
      assert.ok(isShown(ONSCREEN, placeOf(to)));
    }
  });

  for (const kind of INSECT_KINDS) {
    it(`still finds a perch in the world where the screen shows none, flying out of view first at its cruise, a ${kind}`, () => {
      const narrow: Onscreen = { left: 0, right: 6, inset: 4 };
      const out = (1000 * outWay(narrow)) / FLIGHT_HABITS[kind].cruise;
      for (const seed of SEEDS.slice(0, 50)) {
        const { leg } = firstFlight({ seed, kind }, PERCHES, 0, [], narrow);
        assert.notEqual(leg.to.kind, 'away');
        assert.equal(leg.out, out, String(seed));
        assert.ok(leg.arrives - leg.departs > out, String(seed));
      }
    });
  }

  it('takes its later perches anywhere in the world', () => {
    let unseen = 0;
    for (const seed of SEEDS.slice(0, 50)) {
      let flight: Flight = firstFlight(
        { seed, kind: 'butterfly' },
        PERCHES,
        0,
        [],
        ONSCREEN,
      );
      for (let legs = 1; legs < 6; legs++) {
        flight = nextFlight(
          { seed, kind: 'butterfly', ...flight },
          PERCHES,
          flight.leg.leaves,
        );
        if (!isShown(ONSCREEN, placeOf(flight.leg.to))) unseen++;
      }
    }
    assert.ok(unseen > 0);
  });
});
