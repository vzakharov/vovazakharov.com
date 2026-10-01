import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { WithId } from '@/shared/typings';

import { isSeat, perchName } from '../../model/flight';
import { type Meadow, reduce } from '../../model/game';
import type { Point } from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
import { insectGenes } from '../../model/insect-genes';
import { wingspan } from '../../model/insect-outline';
import { type Flier, INSECT_LIMITS } from '../../model/insects';
import { mulberry32, nextSeed } from '../../model/random';
import { type Stand, WIDEST_SPAN } from './flower-sight';
import { meadowLayout } from './layout';
import {
  AIR_BELOW,
  airSpots,
  clumpRow,
  footRows,
  MOST_OVERLAP,
  onscreenOf,
  perchSight,
  perchSpot,
  seatAt,
} from './perch-sight';
import { ofLayout, viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';
import { opened, overlap } from './visit-play';

/** How long each visit is watched, how often the model ticks, and how often perches are read, in ms. */
const VISIT = 40_000;
const TICK = 250;
const LOOK = 500;
/** How many butterflies each visit releases, and how far apart in ms. */
const BUTTERFLIES = 4;
const RELEASE_GAP = 500;

/** Each butterfly's wingspan in units of its size, by seed, measured once. */
const spans = new Map<number, number>();
function spanOf({ seed, kind }: Flier): number {
  const known = spans.get(seed) ?? wingspan(insectGenes({ seed, kind }));
  spans.set(seed, known);
  return known;
}

/**
 * What a sweep counts: looks with two perched, and at a flower, and what each
 * found; ticks with a butterfly leaving the meadow, and with one roaming.
 */
const COUNTS = [
  'looks',
  'left',
  'roaming',
  'shared',
  'covered',
  'drinks',
  'offEdge',
] as const;
type Count = (typeof COUNTS)[number];
type Tally = Record<Count, number>;
const NOTHING: Tally = {
  looks: 0,
  left: 0,
  roaming: 0,
  shared: 0,
  covered: 0,
  drinks: 0,
  offEdge: 0,
};

/** A butterfly drinking: at the flower `id`, sitting at `seat`, its wings `span` px wide. */
type Drink = WithId & { seat: Point; span: number };

/**
 * How a butterfly `span` px wide drinking at `seat` cannot be seen: its
 * wings reaching past the world's edge.
 */
function hiddenHow({ layout }: Stand, { seat, span }: Drink): Count[] {
  const { camera, height } = layout;
  const half = span / 2;
  return seat.x - half < 0 ||
    seat.x + half > camera.world ||
    seat.y - half < 0 ||
    seat.y + half > height
    ? ['offEdge']
    : [];
}

/**
 * Plays a visit's butterflies for `VISIT` ms, counting every tick with one
 * leaving the meadow or roaming the air, and at every `LOOK` whether two
 * perched share a perch or cover more than `MOST_OVERLAP` of each other, and
 * how each drinking at a flower cannot be seen there.
 */
function watch(stand: Stand & { meadow: Meadow }, seed: number): Tally {
  const tally = { ...NOTHING };
  const releasing = mulberry32(seed ^ 0xb7_7e_f1);
  const sight = perchSight(stand);
  // A seat stands still through a visit, and is costly to measure.
  const seats = new Map<string, ReturnType<typeof seatAt>>();
  const seatOf = (insect: Flier, to: string) => {
    const key = `${insect.id} ${to}`;
    const seat = seats.has(key)
      ? seats.get(key)
      : seatAt(stand, insect.leg.to, perchSpot(insect));
    seats.set(key, seat);
    return seat;
  };
  const hidden = new Map<string, Count[]>();
  const { layout, meadow: opening } = stand;
  let meadow = opening;
  for (let now = 0; now <= VISIT; now += TICK) {
    if (now % RELEASE_GAP === 0 && now / RELEASE_GAP < BUTTERFLIES) {
      const released = nextSeed(releasing);
      meadow = reduce(meadow, {
        kind: 'release',
        insect: 'butterfly',
        seed: released,
        now,
        ...sight,
      });
    }
    meadow = reduce(meadow, { kind: 'tick', now, ...sight });
    const heading = new Set(meadow.insects.map(({ leg }) => leg.to.kind));
    if (heading.has('away')) tally.left++;
    if (heading.has('air')) tally.roaming++;
    if (now % LOOK !== 0) continue;
    const perched = meadow.insects.flatMap((insect) => {
      const { to: perch, arrives } = insect.leg;
      if (now < arrives || !isSeat(perch)) return [];
      const to = perch.id;
      const seat = seatOf(insect, to);
      const span = spanOf(insect) * layout.insectSize;
      return seat ? [{ insect, to, seat, span }] : [];
    });
    for (const { insect, to, seat, span } of perched) {
      if (insect.leg.to.kind !== 'flower') continue;
      tally.drinks++;
      const key = `${insect.id} ${to}`;
      const how = hidden.get(key) ?? hiddenHow(stand, { id: to, seat, span });
      hidden.set(key, how);
      for (const each of how) tally[each]++;
    }
    if (perched.length < 2) continue;
    tally.looks++;
    if (new Set(perched.map(({ to }) => to)).size < perched.length) {
      tally.shared++;
    }
    const covering = perched.some((a, index) =>
      perched.slice(index + 1).some((b) => {
        const apart = Math.hypot(a.seat.x - b.seat.x, a.seat.y - b.seat.y);
        return overlap(a.span, b.span, apart) > MOST_OVERLAP;
      }),
    );
    if (covering) tally.covered++;
  }
  return tally;
}

describe('WIDEST_SPAN', () => {
  it('spans every butterfly the visits release', () => {
    for (const seed of VISITS) {
      assert.ok(
        wingspan(insectGenes({ seed, kind: 'butterfly' })) <= WIDEST_SPAN,
      );
    }
  });
});

describe('airSpots', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`offers a spot for every butterfly and one more on a ${name} screen, inside the world by half a wingspan and across the whole of it`, () => {
      for (const seed of VISITS.slice(0, 200)) {
        const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25);
        const spots = airSpots(layout);
        assert.ok(spots.length > INSECT_LIMITS.butterfly);
        const { insectSize, groundTop, camera } = layout;
        const half = (WIDEST_SPAN * insectSize) / 2;
        const bottom = groundTop + AIR_BELOW * (height - groundTop);
        for (const { x, y } of spots) {
          assert.ok(x >= half && x <= camera.world - half + 1e-9 && y >= half);
          assert.ok(y <= Math.max(half, bottom) + 1e-9);
        }
        const across = spots.map(({ x }) => x);
        assert.ok(Math.min(...across) < half + 1e-9);
        assert.ok(Math.max(...across) > camera.world - half - 1e-9);
      }
    });
  }
});

describe('the air', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`crowds every two spots nearer than the widest wingspan, so no two hovering fliers overlap, on a ${name} screen`, () => {
      const stand = opened(3, width, height, true);
      const { crowded } = perchSight(stand);
      const span = WIDEST_SPAN * stand.layout.insectSize;
      const spots = airSpots(stand.layout);
      for (const [index, spot] of spots.entries()) {
        for (const other of spots.slice(index + 1)) {
          const near = Math.hypot(spot.x - other.x, spot.y - other.y) < span;
          const paired = crowded.some(
            ([a, b]) =>
              a.kind === 'air' &&
              b.kind === 'air' &&
              ((a.id === spot.id && b.id === other.id) ||
                (a.id === other.id && b.id === spot.id)),
          );
          assert.equal(paired, near, `${spot.id} and ${other.id}`);
        }
      }
    });
  }
});

/**
 * The visits the butterflies are watched in, spread over `VISITS`: a
 * quarter of them with the opening clump, and one in twenty-five with a full
 * forest, whose growing costs forty times a visit's watch.
 */
const WITH_THE_CLUMP = VISITS.filter((_, index) => index % 4 === 0);
const IN_A_FOREST = VISITS.filter((_, index) => index % 25 === 0);

describe('the butterflies of a visit', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const forest of [false, true]) {
      const standing = forest ? 'a full forest' : 'the opening clump';
      it(`never leave, share a perch, cover each other or drink past the world's edge on a ${name} screen, with ${standing}`, () => {
        const tally = { ...NOTHING };
        for (const seed of forest ? IN_A_FOREST : WITH_THE_CLUMP) {
          const visit = watch(opened(seed, width, height, forest), seed);
          for (const count of COUNTS) tally[count] += visit[count];
        }
        assert.ok(tally.looks > 0 && tally.drinks > 0);
        assert.deepEqual(
          { ...tally, looks: 0, drinks: 0, roaming: 0 },
          NOTHING,
          `${String(tally.looks)} looks, ${String(tally.drinks)} drinks`,
        );
      });
    }
  }
});

describe('onscreenOf', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`shows the opening crop at the opening eye, a turned stretch turned, and nothing facing away, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 7);
      const { camera, insectSize: unit } = layout;
      const left = (camera.world - width) / 2;
      const opening = onscreenOf(layout, viewAt(camera, OPENING_EYE));
      assert.ok(opening);
      assert.ok(Math.abs(opening.left - left / unit) < 1e-6);
      assert.ok(Math.abs(opening.right - (left + width) / unit) < 1e-6);
      const turned = onscreenOf(
        layout,
        viewAt(camera, { ...OPENING_EYE, heading: -0.3 }),
      );
      assert.ok(turned && turned.right < opening.right);
      const away = viewAt(camera, { ...OPENING_EYE, heading: Math.PI });
      assert.equal(onscreenOf(layout, away), undefined);
    });

    it(`counts a perch shown only where the view draws its seat on the screen, stepped in and turned, on a ${name} screen`, () => {
      const stand = opened(3, width, height, true);
      const { layout } = stand;
      const rows = footRows(stand);
      const { places } = perchSight(stand);
      for (const eye of [
        { x: 0, y: 3, heading: 0 },
        { x: 1.5, y: 2, heading: 0.35 },
      ]) {
        const view = viewAt(layout.camera, eye);
        const onscreen = onscreenOf(layout, view);
        assert.ok(onscreen);
        for (const [perch, row] of rows) {
          const place = places?.[perch];
          if (!place) continue;
          const x = place.x * layout.insectSize;
          const shown =
            place.x >= onscreen.left + onscreen.inset &&
            place.x <= onscreen.right - onscreen.inset;
          if (!shown) continue;
          const drawn = ofLayout(view, { x, y: row }, row);
          assert.ok(drawn.x >= 0 && drawn.x <= width, perch);
        }
      }
    });
  }
});

describe('footRows', () => {
  it('stands every cap and flower over its own foot, and the air over the clump', () => {
    const stand = opened(3, 1180, 820, true);
    const rows = footRows(stand);
    const { layout, mushrooms } = stand;
    for (const { id } of airSpots(layout)) {
      const name = perchName({ kind: 'air', id });
      assert.equal(rows.get(name), clumpRow(layout));
    }
    const grounded = [...rows.entries()].filter(
      ([name]) => !name.startsWith('air'),
    );
    assert.ok(grounded.length > mushrooms.length);
    for (const [, row] of grounded) {
      assert.ok(row >= layout.groundTop && row <= layout.height);
    }
  });
});
