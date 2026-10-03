import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { onscreenOf } from '../ui/scene/perch-sight';
import { Perches as ScenePerches } from '../ui/scene/perches';
import { viewAt } from '../ui/scene/view';
import { opened } from '../ui/scene/visit-play';
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
  entryOf,
  isShown,
  nearerSide,
  type Onscreen,
  outFirst,
  outOf,
  outOfView,
  outWay,
  shownOf,
} from './flight-in';
import { apartIn, apartOf } from './flight-timing';
import { alongAzimuth } from './geometry';
import { CLUMP_DISTANCE, D_SEE, OPENING_EYE } from './ground';
import { INSECT_KINDS } from './insect-genes';

/** A world 100 units across, the screen showing 30 to 60 of it. */
const WORLD = 100;
/** A release's way out of view: over the brow at 45, out past either edge, deeper than the clump. */
const WAY_OUT = {
  brow: { x: 45, y: 6, fromEye: 2 * CLUMP_DISTANCE },
  outs: {
    left: { x: 28, y: 7, fromEye: 1.2 * CLUMP_DISTANCE },
    right: { x: 62, y: 7, fromEye: 1.2 * CLUMP_DISTANCE },
  },
};
/** The screen's foot, and the brow, past every perch in `PLACES`. */
const DOWN_TO = { downTo: 20, far: 2 * CLUMP_DISTANCE };
const ONSCREEN: Onscreen = {
  left: 30,
  right: 60,
  inset: 1,
  ...DOWN_TO,
  ...WAY_OUT,
};
const SEEDS = Array.from({ length: 200 }, (_, index) => index * 7919 + 1);

/** `count` ids of `kind`, spread evenly across the world, and where each stands. */
function spread(kind: 'flower' | 'cap' | 'air', count: number) {
  const ids = Array.from({ length: count }, (_, index) => `${kind}-${index}`);
  const places = ids.map(
    (id, index) =>
      [
        perchName({ kind, id }),
        { x: ((index + 0.5) / count) * WORLD, y: 10, fromEye: CLUMP_DISTANCE },
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
  ['away left', { x: -2, y: 8, fromEye: CLUMP_DISTANCE }],
  ['away right', { x: WORLD + 2, y: 8, fromEye: CLUMP_DISTANCE }],
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

describe('isShown', () => {
  const inView = { x: 45, y: 10, fromEye: CLUMP_DISTANCE };
  it('shows a perch inside the edges, above the foot and nearer than the brow', () => {
    assert.ok(isShown(ONSCREEN, inView));
    assert.ok(
      isShown(ONSCREEN, { ...inView, y: 19, fromEye: 2 * CLUMP_DISTANCE }),
    );
  });

  it('shows no perch past an edge, the brow or under the foot, nor one placed nowhere', () => {
    for (const place of [
      { ...inView, x: 30.5 },
      { ...inView, x: 59.5 },
      { ...inView, y: 19.5 },
      { ...inView, y: 30 },
      { ...inView, fromEye: 2 * CLUMP_DISTANCE + 0.01 },
      undefined,
    ]) {
      assert.equal(isShown(ONSCREEN, place), false, JSON.stringify(place));
    }
  });

  it('shows no cap on a stand past the brow off the heading, though its forward distance is inside it, on a tablet screen', () => {
    const stand = opened(3, 1180, 820, true);
    const [first] = stand.mushrooms;
    assert.ok(first);
    const foot = alongAzimuth(OPENING_EYE, 0.75, 14.25);
    const perches = new ScenePerches(() => ({
      bed: undefined,
      flowers: undefined,
    }));
    perches.see(
      {
        ...stand,
        mushrooms: [
          ...stand.mushrooms,
          { ...first, id: 'lone', foot: { ...first.foot, ...foot } },
        ],
      },
      OPENING_EYE,
    );
    const view = viewAt(stand.layout.camera, OPENING_EYE);
    const onscreen = onscreenOf(stand.layout, view);
    const place =
      perches.sightFrom(view).places?.[perchName({ kind: 'cap', id: 'lone' })];
    assert.ok(onscreen && place);
    // Inside the edges, and in front of the brow by its forward distance alone.
    assert.ok(isShown({ ...onscreen, far: Infinity }, place));
    assert.ok(place.fromEye <= D_SEE, String(place.fromEye));
    assert.equal(isShown(onscreen, place), false);
  });
});

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

  it('weighs its first perch from the screen edge, not the world edge', () => {
    const places = shownOf(PERCHES, ONSCREEN).places ?? {};
    assert.deepEqual(places['away left'], {
      x: 30,
      y: 8,
      fromEye: CLUMP_DISTANCE,
    });
    assert.deepEqual(places['away right'], {
      x: 60,
      y: 8,
      fromEye: CLUMP_DISTANCE,
    });
  });

  it('is timed in from over the brow, halfway across from the screen middle to its perch', () => {
    const cap: Perch = { kind: 'cap', id: 'cap-4' };
    const there = placeOf(cap);
    assert.ok(there);
    for (const side of ['left', 'right'] as const) {
      const name = perchName({ kind: 'away', side });
      assert.deepEqual(entryOf(PLACES, WAY_OUT, side, cap)[name], {
        ...WAY_OUT.brow,
        x: (WAY_OUT.brow.x + there.x) / 2,
      });
      const nowhere: Perch = { kind: 'cap', id: 'gone' };
      assert.deepEqual(
        entryOf(PLACES, WAY_OUT, side, nowhere)[name],
        WAY_OUT.brow,
      );
    }
  });

  for (const kind of INSECT_KINDS) {
    it(`flies in to its first perch in view at its cruise, staying as long as its habits say, a ${kind}`, () => {
      const habits = FLIGHT_HABITS[kind];
      for (const seed of SEEDS) {
        const { leg } = firstFlight({ seed, kind }, PERCHES, 0, [], ONSCREEN);
        assert.ok(leg.from.kind === 'away');
        const entry = entryOf(PLACES, WAY_OUT, leg.from.side, leg.to);
        const [from, to] = [entry[perchName(leg.from)], placeOf(leg.to)];
        assert.ok(from && to);
        const atCruise = (1000 * apartOf(from, to)) / habits.cruising;
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
      const narrow: Onscreen = {
        left: 0,
        right: 6,
        inset: 4,
        ...DOWN_TO,
        ...WAY_OUT,
      };
      const { cruising } = FLIGHT_HABITS[kind];
      for (const seed of SEEDS.slice(0, 50)) {
        const { leg } = firstFlight({ seed, kind }, PERCHES, 0, [], narrow);
        assert.ok(leg.from.kind === 'away' && leg.to.kind !== 'away');
        const out = (1000 * outWay(narrow, leg.from.side)) / cruising;
        assert.equal(leg.out, out, String(seed));
        // The rest of the way is timed from the out point it flies out by.
        const places = outOf(PLACES, narrow, leg.from.side);
        const rest = apartIn(places, leg.from, leg.to) ?? 0;
        const flown = leg.arrives - leg.departs - out;
        assert.ok(flown >= (1000 * rest) / cruising - 1e-6, String(seed));
      }
    });
  }

  it('flies out of view first where every perch between the edges stands past the brow or under the foot', () => {
    for (const hidden of [
      { ...ONSCREEN, far: CLUMP_DISTANCE - 1 },
      { ...ONSCREEN, downTo: 5 },
    ]) {
      for (const seed of SEEDS.slice(0, 50)) {
        const { leg } = firstFlight(
          { seed, kind: 'butterfly' },
          PERCHES,
          0,
          [],
          hidden,
        );
        assert.equal(leg.from.kind, 'away', String(seed));
      }
    }
  });

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

  it('flies out of view between the brow and the out point it leaves by, at their depths', () => {
    for (const side of ['left', 'right'] as const) {
      assert.equal(
        outWay(WAY_OUT, side),
        apartOf(WAY_OUT.brow, WAY_OUT.outs[side]),
      );
    }
  });
});
