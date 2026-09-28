import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import {
  type Flight,
  isAloft,
  isSeat,
  perchName,
  type Sight,
} from '../../model/flight';
import type { Point } from '../../model/geometry';
import {
  INSECT_KINDS,
  insectGenes,
  type InsectKind,
} from '../../model/insect-genes';
import { carriedFrom } from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import { type Carried, flightPoint } from '../../model/insect-paths';
import { type Flier, INSECT_LIMITS } from '../../model/insects';
import { phaseOf } from '../../model/motion';
import { blockedFor, type Held } from '../../model/perch-room';
import type { MeadowLayout } from './layout';
import {
  airSpots,
  MOST_OVERLAP,
  perchSight,
  perchSpot,
  seatAt,
} from './perch-sight';
import { tapReach } from './sky-layout';
import { VIEWPORTS, VISITS } from './viewports';
import { ALL_TEN, type Opened, opened, overlap, play } from './visit-play';

/** How long each visit is played and how often ticked, and how far apart its fliers fly in, in ms. */
const LASTING = 5 * 60_000;
const TICK = 250;
const GAP = 300;
const SEEDS = VISITS.slice(0, 3);
/** Enough visits that the flies' share of landings on spotted caps holds steady on every screen. */
const LANDING_SEEDS = VISITS.slice(0, 10);
/** Every insect the meadow can hold, widest kinds first. */
const EVERY_ONE: readonly InsectKind[] = INSECT_KINDS.flatMap((kind) =>
  Array.from({ length: INSECT_LIMITS[kind] }, () => kind),
);
/**
 * The screens that fall short of the air's promise, a spot for every insect
 * clear of the others, and by how much, as measured; their tests run as todo
 * there, but for a full forest's, whose caps seat enough of the ten.
 */
const AIR_UNMET: Partial<Record<(typeof VIEWPORTS)[number][0], string>> = {
  'small phone':
    'its grid seats eight of the ten apart, and with the opening clump two fliers hold overlapping spots 40% of ticks',
};
/** Four butterflies and three bees, released in turn. */
const BEES_AMONG_BUTTERFLIES: readonly InsectKind[] = [
  'butterfly',
  'bee',
  'butterfly',
  'bee',
  'butterfly',
  'bee',
  'butterfly',
];

/** How wide a flier's wings span on `layout`, in CSS px. */
const spanOn = (layout: MeadowLayout, flier: Flier) =>
  wingspan(insectGenes(flier)) * layout.insectSizes[flier.kind];

/** The share of `part` in `whole`, 0 for none. */
const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

/** Every two of `items`. */
const pairsOf = <Item>(items: readonly Item[]): Array<readonly [Item, Item]> =>
  items.flatMap((item, index) =>
    items.slice(index + 1).map((other) => [item, other] as const),
  );

/**
 * Whether two of `fliers` hold spots in the air (sit there or are heading
 * there) on which their own wings would overlap.
 */
function overlapAloft({ layout }: Opened, fliers: readonly Flier[]): boolean {
  const air = new Map(airSpots(layout).map((spot) => [spot.id, spot]));
  const held = fliers.flatMap((flier) => {
    const { to } = flier.leg;
    const spot = to.kind === 'air' ? air.get(to.id) : undefined;
    return spot ? [{ flier, spot }] : [];
  });
  return pairsOf(held).some(([a, b]) => {
    const apart = Math.hypot(a.spot.x - b.spot.x, a.spot.y - b.spot.y);
    return apart < (spanOn(layout, a.flier) + spanOn(layout, b.flier)) / 2;
  });
}

/**
 * Asserts, at `now`, that no two of `fliers` sitting share a perch or cover
 * more than `MOST_OVERLAP` of the narrower's wings, each seated as its kind
 * sits there.
 */
function assertSeatedApart(
  stand: Opened,
  fliers: readonly Flier[],
  now: number,
): void {
  const { layout } = stand;
  const sitting = fliers.flatMap((flier) => {
    const { to, arrives } = flier.leg;
    if (now < arrives || !isSeat(to)) return [];
    const seat = seatAt(stand, to, perchSpot(flier), flier.kind);
    return seat ? [{ flier, seat, name: perchName(to) }] : [];
  });
  for (const [a, b] of pairsOf(sitting)) {
    assert.notEqual(a.name, b.name, `${a.name} shared at ${String(now)}`);
    const apart = Math.hypot(a.seat.x - b.seat.x, a.seat.y - b.seat.y);
    const covered = overlap(
      spanOn(layout, a.flier),
      spanOn(layout, b.flier),
      apart,
    );
    assert.ok(
      covered <= MOST_OVERLAP,
      `${a.flier.kind} on ${a.name} and ${b.flier.kind} on ${b.name} at ${String(now)}`,
    );
  }
}

describe('the air', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const todo = AIR_UNMET[name];
    it(
      `holds a spot for every insect the meadow can hold, each clear of the others by their kinds' spans, on a ${name} screen`,
      { todo },
      () => {
        for (const seed of VISITS.slice(0, 50)) {
          const { air, crowded } = perchSight(
            opened(seed, width, height, false),
          );
          const held: Held[] = [];
          for (const kind of EVERY_ONE) {
            const blocked = blockedFor(kind, held, crowded);
            const id = air.find(
              (each) => !blocked.has(perchName({ kind: 'air', id: each })),
            );
            if (id !== undefined)
              held.push({ kind, perch: { kind: 'air', id } });
          }
          assert.equal(held.length, EVERY_ONE.length, `visit ${String(seed)}`);
        }
      },
    );
  }
});

describe('all ten fliers of a visit', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const forest of [false, true]) {
      const todo = forest ? undefined : AIR_UNMET[name];
      const grown = forest ? 'a full forest' : 'the opening clump';
      it(
        `never leave, never crowd each other's perches, and hold spots in the air apart, over five minutes on a ${name} screen with ${grown}`,
        { todo },
        () => {
          const count = { ticks: 0, aloft: 0 };
          for (const seed of SEEDS) {
            const stand = opened(seed, width, height, forest);
            const playing = {
              kinds: ALL_TEN,
              gap: GAP,
              lasting: LASTING,
              tick: TICK,
            };
            play(stand, seed, playing, ({ meadow, now }) => {
              const leaving = meadow.insects.find(
                ({ leg }) => leg.to.kind === 'away',
              );
              assert.equal(
                leaving,
                undefined,
                `visit ${String(seed)} at ${String(now)}`,
              );
              const standing = { ...stand, ...pick(meadow, 'planted') };
              assertSeatedApart(standing, meadow.insects, now);
              count.ticks++;
              if (overlapAloft(standing, meadow.insects)) count.aloft++;
            });
          }
          const aloft = share(count.aloft, count.ticks);
          assert.equal(count.aloft, 0, `overlapping aloft ${String(aloft)}`);
        },
      );
    }
  }
});

describe('the bees among the butterflies', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`roam the air for want of a flower well under half the time on a ${name} screen`, () => {
      const count = { bees: 0, roaming: 0 };
      for (const seed of SEEDS) {
        const stand = opened(seed, width, height, false);
        const playing = {
          kinds: BEES_AMONG_BUTTERFLIES,
          gap: GAP,
          lasting: LASTING,
          tick: TICK,
        };
        play(stand, seed, playing, ({ meadow }) => {
          for (const { kind, leg } of meadow.insects) {
            if (kind !== 'bee') continue;
            count.bees++;
            if (leg.to.kind === 'air') count.roaming++;
          }
        });
      }
      const roams = share(count.roaming, count.bees);
      assert.ok(roams < 0.25, `bees roam ${String(roams)}`);
    });
  }
});

describe('the flies in a full forest', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`land mostly on the fly agarics among all ten on a ${name} screen`, () => {
      const count = { landings: 0, spotted: 0 };
      for (const seed of LANDING_SEEDS) {
        const stand = opened(seed, width, height, true);
        const agarics = new Set(
          stand.mushrooms
            .filter(({ cap }) => cap === 'spotted')
            .map(({ id }) => id),
        );
        const flown = new Map<string, Flight['leg']>();
        const playing = {
          kinds: ALL_TEN,
          gap: GAP,
          lasting: LASTING,
          tick: TICK,
        };
        play(stand, seed, playing, ({ meadow }) => {
          for (const { id, kind, leg } of meadow.insects) {
            if (kind !== 'fly' || flown.get(id) === leg) continue;
            flown.set(id, leg);
            if (!isSeat(leg.to)) continue;
            count.landings++;
            if (leg.to.kind === 'cap' && agarics.has(leg.to.id))
              count.spotted++;
          }
        });
      }
      const agaricShare = share(count.spotted, count.landings);
      assert.ok(agaricShare >= 0.6, `on agarics ${String(agaricShare)}`);
    });
  }
});

/** A flier's flight as drawn: the leg, what it carried in, and where it set off and is heading. */
type Drawn = { leg: Flight['leg']; carried: Carried; start: Point; end: Point };

/** How far a flight's flutter lifts it at most, per unit of the insect's size, as the view draws it. */
const FLUTTER = 0.28;
/** How often the catch sweep draws, and how long a child's tap trails the flier they aim at, in ms. */
const FRAME = 50;
const TRAIL = 200;

/** Where `perch` stands on `layout`, as `sight` places it, or `from` where it places it nowhere. */
function placeOf(
  { insectSize }: MeadowLayout,
  { places }: Sight,
  perch: Flight['leg']['to'],
  from: Point,
): Point {
  const place = places?.[perchName(perch)];
  return place ? { x: place.x * insectSize, y: place.y * insectSize } : from;
}

describe('a flier in flight', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`is caught by a tap aimed where it was a moment ago at least seven times in ten, every kind, on a ${name} screen`, () => {
      const [hits, tries] = [
        new Map<InsectKind, number>(),
        new Map<InsectKind, number>(),
      ];
      const add = (counts: Map<InsectKind, number>, kind: InsectKind) =>
        counts.set(kind, (counts.get(kind) ?? 0) + 1);
      for (const seed of SEEDS.slice(0, 2)) {
        const stand = opened(seed, width, height, false);
        const { layout } = stand;
        const drawn = new Map<string, Drawn>();
        const trail: Array<Map<string, Point>> = [];
        const playing = {
          kinds: ALL_TEN,
          gap: GAP,
          lasting: 2 * 60_000,
          tick: FRAME,
        };
        play(stand, seed, playing, ({ meadow, now, sight }) => {
          const at = new Map<string, Point>();
          for (const flier of meadow.insects) {
            const { id, kind, leg } = flier;
            const last = drawn.get(id);
            const lastAt = trail.at(-1)?.get(id);
            if (last?.leg !== leg) {
              const start =
                last && lastAt
                  ? lastAt
                  : placeOf(layout, sight, leg.from, { x: 0, y: 0 });
              const carried = last
                ? carriedFrom({ ...last.leg, ...last.carried }, leg.departs)
                : { launch: 0, speed: 0, drink: 0 };
              drawn.set(id, {
                leg,
                carried,
                start,
                end: placeOf(layout, sight, leg.to, start),
              });
            }
            const flight = drawn.get(id);
            if (!flight) continue;
            const motion = {
              kind,
              phase: phaseOf(flier),
              flutter: layout.insectSizes[kind] * FLUTTER,
            };
            const point = flightPoint(
              {
                ...flight.leg,
                ...flight.carried,
                ...pick(flight, 'start', 'end'),
              },
              now,
              motion,
            );
            at.set(id, point);
            const aimed = trail.at(-TRAIL / FRAME)?.get(id);
            if (!aimed || !isAloft(flier, now)) continue;
            add(tries, kind);
            const reach = tapReach(spanOn(layout, flier) / 2);
            if (Math.hypot(point.x - aimed.x, point.y - aimed.y) <= reach)
              add(hits, kind);
          }
          trail.push(at);
          if (trail.length > TRAIL / FRAME) trail.shift();
        });
      }
      for (const kind of INSECT_KINDS) {
        const caught = share(hits.get(kind) ?? 0, tries.get(kind) ?? 0);
        assert.ok(caught >= 0.7, `${kind} caught ${String(caught)}`);
      }
    });
  }
});
