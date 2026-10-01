import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlight,
  type Flight,
  nextFlight,
  type Perch,
  type Perches,
  perchName,
  type Places,
} from './flight';
import { isShown, nearerSide, type Onscreen, shownOf } from './flight-in';
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
        { x: ((index + 0.5) / count) * WORLD, y: 10 },
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
  ['away left', { x: -2, y: 8 }],
  ['away right', { x: WORLD + 2, y: 8 }],
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

  it('is timed in from just past the screen edge, not the world edge', () => {
    const places = shownOf(PERCHES, ONSCREEN).places ?? {};
    assert.deepEqual(places['away left'], { x: 29, y: 8 });
    assert.deepEqual(places['away right'], { x: 61, y: 8 });
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

  it('still finds a perch in the world where the screen shows none', () => {
    const narrow: Onscreen = { left: 0, right: 1, inset: 1 };
    for (const seed of SEEDS.slice(0, 50)) {
      const { to } = firstFlight(
        { seed, kind: 'butterfly' },
        PERCHES,
        0,
        [],
        narrow,
      ).leg;
      assert.notEqual(to.kind, 'away');
    }
  });

  it('takes its later perches anywhere in the world', () => {
    let outOfView = 0;
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
        if (!isShown(ONSCREEN, placeOf(flight.leg.to))) outOfView++;
      }
    }
    assert.ok(outOfView > 0);
  });
});
