import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { WithId } from '@/shared/typings';

import { isSeat } from '../../model/flight';
import {
  firstFlowers,
  flowerGenes,
  flowerHead,
} from '../../model/flower-genes';
import { firstMeadow, type Meadow, reduce } from '../../model/game';
import { containsPoint, type Point } from '../../model/geometry';
import { insectGenes } from '../../model/insect-genes';
import { wingspan } from '../../model/insect-outline';
import { type Flier, INSECT_LIMITS } from '../../model/insects';
import { CAP_KINDS } from '../../model/mushroom-genes';
import { mulberry32, nextSeed } from '../../model/random';
import { standingAt } from './door-sight';
import { meadowLayout } from './layout';
import {
  airSpots,
  MOST_OVERLAP,
  perchSight,
  perchSpot,
  seatAt,
  type Stand,
  WIDEST_SPAN,
} from './perch-sight';
import { tapReach } from './sky-layout';
import { VIEWPORTS, VISITS } from './viewports';

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
 * A meadow as the scene opens it for the visit `seed`, drawing from the
 * scene's own streams, with the opening clump or a full forest standing.
 */
function opened(
  seed: number,
  width: number,
  height: number,
  forest: boolean,
): Stand & { meadow: Meadow } {
  const random = mulberry32(seed);
  let meadow = firstMeadow(random);
  const flowers = firstFlowers(random, 7);
  const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25);
  const growing = mulberry32(seed ^ 0x9e_0a);
  const grown = forest ? layout.mushrooms.length - meadow.mushrooms.length : 0;
  for (const index of Array.from({ length: grown }).keys()) {
    const cap = CAP_KINDS[index % CAP_KINDS.length] ?? 'spotted';
    meadow = reduce(meadow, { kind: 'grow', cap, seed: nextSeed(growing) });
  }
  const { mushrooms } = meadow;
  return { meadow, layout, flowers, mushrooms };
}

/** How much of the narrower of two spans, centred `apart` px from each other, the other covers. */
function overlap(a: number, b: number, apart: number): number {
  return Math.max(0, (a + b) / 2 - apart) / Math.min(a, b);
}

/**
 * What a sweep counts: looks with two perched, and at a flower, and what each
 * found; ticks with a butterfly heading off screen, and with one roaming.
 */
const COUNTS = [
  'looks',
  'left',
  'roaming',
  'shared',
  'covered',
  'drinks',
  'underControl',
  'offEdge',
  'behindCap',
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
  underControl: 0,
  offEdge: 0,
  behindCap: 0,
};

/** A butterfly drinking: at the flower `id`, sitting at `seat`, its wings `span` px wide. */
type Drink = WithId & { seat: Point; span: number };

/** Every standing mushroom as drawn, measured once a visit. */
type Covers = ReadonlyArray<ReturnType<typeof standingAt>>;

/**
 * How a butterfly `span` px wide drinking at `seat` on the flower `id`
 * cannot be seen: its wings reaching into a control's tap circle or past the
 * screen's edge, or the flower's head centre inside a nearer mushroom of
 * `covers` as drawn.
 */
function hiddenHow(
  stand: Stand,
  covers: Covers,
  { id, seat, span }: Drink,
): Count[] {
  const { layout, flowers } = stand;
  const { width, height } = layout;
  const index = flowers.findIndex((flower) => flower.id === id);
  const place = layout.flowers[index];
  const flower = flowers[index];
  if (!place || !flower) return [];
  const top = flowerHead(flowerGenes(flower), place.size);
  const head = { x: place.x + top.x, y: place.y + top.y };
  const half = span / 2;
  const { mute, plus, minus, house, butterfly, picker, housePicker } = layout;
  const controls = [
    mute,
    plus,
    minus,
    house,
    butterfly,
    ...picker,
    ...housePicker,
  ];
  const how: Count[] = [];
  if (
    controls.some(
      ({ x, y, r }) => Math.hypot(seat.x - x, seat.y - y) < tapReach(r) + half,
    )
  ) {
    how.push('underControl');
  }
  if (
    seat.x - half < 0 ||
    seat.x + half > width ||
    seat.y - half < 0 ||
    seat.y + half > height
  ) {
    how.push('offEdge');
  }
  const behind = covers.some(
    ({ depth, drawn }) =>
      depth > place.y && drawn.some((outline) => containsPoint(outline, head)),
  );
  if (behind) how.push('behindCap');
  return how;
}

/**
 * Plays a visit's butterflies for `VISIT` ms, counting every tick with one
 * heading off screen or roaming the air, and at every `LOOK` whether two
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
  const { layout, meadow: opening, mushrooms } = stand;
  const covers = mushrooms.flatMap((mushroom) => {
    const place = layout.mushrooms[mushroom.slot];
    return place ? [standingAt(place, mushroom)] : [];
  });
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
      const how =
        hidden.get(key) ?? hiddenHow(stand, covers, { id: to, seat, span });
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
    it(`offers a spot for every butterfly and one more on a ${name} screen, inside it and clear of the controls`, () => {
      for (const seed of VISITS.slice(0, 200)) {
        const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25);
        const spots = airSpots(layout);
        assert.ok(spots.length > INSECT_LIMITS.butterfly);
        const { mute, plus, minus, house, butterfly, picker } = layout;
        const { insectSize, groundTop } = layout;
        const span = WIDEST_SPAN * insectSize;
        const controls = [mute, plus, minus, house, butterfly, ...picker];
        for (const { x, y } of spots) {
          assert.ok(x >= span && x <= width - span + 1e-9 && y >= span);
          assert.ok(y <= Math.max(span, groundTop) + 1e-9);
          for (const control of controls) {
            const apart = Math.hypot(x - control.x, y - control.y);
            assert.ok(apart >= tapReach(control.r) + span / 2);
          }
        }
      }
    });
  }
});

describe('the butterflies of a visit', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const forest of [false, true]) {
      const standing = forest ? 'a full forest' : 'the opening clump';
      it(`never leave, share a perch, cover each other or drink out of sight on a ${name} screen, with ${standing}`, () => {
        const tally = { ...NOTHING };
        for (const seed of VISITS) {
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
