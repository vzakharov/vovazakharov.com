import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import { phaseOf } from '@/mushrooms/shared/lib/motion';
import { tapReach } from '@/mushrooms/shared/lib/tap-reach';
import {
  type Carried,
  carriedFrom,
  type Flight,
  flightPoint,
  INSECT_KINDS,
  type InsectKind,
  isAloft,
  perchName,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  VIEWPORTS,
  VISITS,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  isSeat,
  type Sight,
} from '@/mushrooms/features/insects-fly/index.node-safe';

import { playingOf, SEEDS, share, spanOn } from './fliers.test-kit';
import type { MeadowLayout } from './layout';
import { ALL_TEN, opened, play } from './visit-play';

/** Enough visits that the share of taps catching a fly, the hardest kind to catch, holds steady on every screen. */
const TAP_SEEDS = VISITS.slice(0, 8);
/** Enough visits that the flies' share of landings on spotted caps holds steady on every screen. */
const LANDING_SEEDS = VISITS.slice(0, 20);
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
      for (const seed of TAP_SEEDS) {
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
