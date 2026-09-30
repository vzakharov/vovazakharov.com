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
import type { Flier } from '../../model/insects';
import { phaseOf } from '../../model/motion';
import { blockedFor, type Held } from '../../model/perch-room';
import type { MeadowLayout } from './layout';
import {
  airSpots,
  EVERY_ONE,
  MOST_OVERLAP,
  perchSight,
  perchSpot,
  seatAt,
} from './perch-sight';
import { tapReach } from './tap-reach';
import { VIEWPORTS, VISITS } from './viewports';
import {
  ALL_TEN,
  type Opened,
  opened,
  overlap,
  play,
  type Playing,
} from './visit-play';

/** How long each visit is played and how often ticked, and how far apart its fliers fly in, in ms. */
const LASTING = 5 * 60_000;
const TICK = 250;
const GAP = 300;
const SEEDS = VISITS.slice(0, 3);
/** `kinds` played `GAP` apart, over `LASTING`, ticked every `TICK`. */
const playingOf = (kinds: readonly InsectKind[]): Playing => ({
  kinds,
  gap: GAP,
  lasting: LASTING,
  tick: TICK,
});
/** Enough visits that the flies' share of landings on spotted caps holds steady on every screen. */
const LANDING_SEEDS = VISITS.slice(0, 20);
/**
 * The screens that fall short of the air's promise, a spot for every insect
 * clear of the others, and by how much, as measured; their tests run as todo
 * there.
 */
const AIR_UNMET: Partial<Record<(typeof VIEWPORTS)[number][0], string>> = {
  'small phone':
    'its grid seats eight of the ten apart, and over these three visits two fliers hold overlapping spots on 33% of ticks with the opening clump, 0.28% with a full forest',
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

/** Each flier's wingspan in units of its own size, by kind and seed, measured once. */
const wingspans = new Map<string, number>();

/** How wide a flier's wings span on `layout`, in CSS px. */
function spanOn(layout: MeadowLayout, flier: Flier): number {
  const key = `${flier.kind} ${String(flier.seed)}`;
  const span = wingspans.get(key) ?? wingspan(insectGenes(flier));
  wingspans.set(key, span);
  return span * layout.insectSizes[flier.kind];
}

/** The share of `part` in `whole`, 0 for none. */
const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

/** Every two of `items`. */
const pairsOf = <Item>(items: readonly Item[]): Array<readonly [Item, Item]> =>
  items.flatMap((item, index) =>
    items.slice(index + 1).map((other) => [item, other] as const),
  );

/** Each layout's spots in the air by id, found once a layout. */
const spotted = new WeakMap<MeadowLayout, Map<string, Point>>();
function spotsOn(layout: MeadowLayout): Map<string, Point> {
  const spots =
    spotted.get(layout) ??
    new Map(airSpots(layout).map((spot) => [spot.id, spot]));
  spotted.set(layout, spots);
  return spots;
}

/**
 * Whether two of `fliers` hold spots in the air (sit there or are heading
 * there) on which their own wings would overlap.
 */
function overlapAloft({ layout }: Opened, fliers: readonly Flier[]): boolean {
  const air = spotsOn(layout);
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
 * How, at `now`, two of `fliers` sitting share a perch or cover more than
 * `MOST_OVERLAP` of the narrower's wings, each seated as its kind sits there;
 * `undefined` where none do.
 */
function seatedClash(
  stand: Opened,
  fliers: readonly Flier[],
  now: number,
  seats: Map<string, Point | undefined>,
): string | undefined {
  const { layout, planted } = stand;
  const sitting = fliers.flatMap((flier) => {
    const { to, arrives } = flier.leg;
    if (now < arrives || !isSeat(to)) return [];
    const name = perchName(to);
    // A perch stands still once it stands, so a seat is found once.
    const key = `${flier.id} ${name} ${String(planted.length)}`;
    const seat = seats.has(key)
      ? seats.get(key)
      : seatAt(stand, to, perchSpot(flier), flier.kind);
    seats.set(key, seat);
    return seat ? [{ flier, seat, name }] : [];
  });
  for (const [a, b] of pairsOf(sitting)) {
    if (a.name === b.name) return `${a.name} shared at ${String(now)}`;
    const apart = Math.hypot(a.seat.x - b.seat.x, a.seat.y - b.seat.y);
    const covered = overlap(
      spanOn(layout, a.flier),
      spanOn(layout, b.flier),
      apart,
    );
    if (covered > MOST_OVERLAP) {
      return `${a.flier.kind} on ${a.name} and ${b.flier.kind} on ${b.name} at ${String(now)}`;
    }
  }
  return undefined;
}

/**
 * What all ten fliers of a visit did over `LASTING`: the first time one
 * headed off screen or two sat crowded (`seatedClash`), if ever, and how many
 * ticks it was played for, and on how many two held spots in the air whose
 * wings overlap (`overlapAloft`).
 */
type Visited = { broken: string | undefined; ticks: number; aloft: number };

/** Each visit played once, however many tests read it. */
const visits = new Map<string, Visited>();

/** All ten fliers of the visit `seed` on a screen `width` by `height`, with a full forest or the opening clump. */
function allTen(
  seed: number,
  width: number,
  height: number,
  forest: boolean,
): Visited {
  const key = [seed, width, height, forest].join(' ');
  const known = visits.get(key);
  if (known) return known;
  const stand = opened(seed, width, height, forest);
  const playing = playingOf(ALL_TEN);
  const visited: Visited = { broken: undefined, ticks: 0, aloft: 0 };
  const seats = new Map<string, Point | undefined>();
  play(stand, seed, playing, ({ meadow, now }) => {
    const standing = { ...stand, ...pick(meadow, 'planted') };
    const leaving = meadow.insects.some(({ leg }) => leg.to.kind === 'away');
    visited.broken ??= leaving
      ? `one leaving at ${String(now)}`
      : seatedClash(standing, meadow.insects, now, seats);
    visited.ticks++;
    if (overlapAloft(standing, meadow.insects)) visited.aloft++;
  });
  visits.set(key, visited);
  return visited;
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
      const grown = forest ? 'a full forest' : 'the opening clump';
      it(`never leave and never crowd each other's perches, over five minutes on a ${name} screen with ${grown}`, () => {
        for (const seed of SEEDS) {
          const { broken } = allTen(seed, width, height, forest);
          assert.equal(broken, undefined, `visit ${String(seed)}`);
        }
      });

      it(
        `hold spots in the air apart, over five minutes on a ${name} screen with ${grown}`,
        { todo: AIR_UNMET[name] },
        () => {
          const count = { ticks: 0, aloft: 0 };
          for (const seed of SEEDS) {
            const { ticks, aloft } = allTen(seed, width, height, forest);
            count.ticks += ticks;
            count.aloft += aloft;
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
        const playing = playingOf(BEES_AMONG_BUTTERFLIES);
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
            .filter(({ species }) => species === 'fly-agaric')
            .map(({ id }) => id),
        );
        const flown = new Map<string, Flight['leg']>();
        const playing = playingOf(ALL_TEN);
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
          ...playingOf(ALL_TEN),
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
