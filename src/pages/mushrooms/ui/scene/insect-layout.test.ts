import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { BEE_RANGES, type BeeGenes, beeGenes } from '../../model/bee-genes';
import { beeOutline } from '../../model/bee-outline';
import { crawl, CRAWL_REACH } from '../../model/buzz-rest';
import { FLOWER_RANGES, flowerGenes } from '../../model/flower-genes';
import {
  boxAround,
  containsPoint,
  placedAt,
  type Point,
} from '../../model/geometry';
import {
  INSECT_KINDS,
  insectGenes,
  type InsectKind,
} from '../../model/insect-genes';
import {
  LANDING,
  REST_LEAN,
  type Stay,
  wingBeat,
} from '../../model/insect-motion';
import { buzzWing, wingspan } from '../../model/insect-outline';
import { FLOWER_SWAY } from './flower-layout';
import { standingFlowers } from './flower-plots';
import {
  flowerLift,
  type HeadReach,
  PERCH_SPREAD,
  sightingOf,
} from './flower-sight';
import { LEAST_SPANS, meadowLayout } from './layout';
import { FLOOR_HELD, VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

describe('the insects’ size', () => {
  for (const [name, width, height] of [...VIEWPORTS, FLOOR_HELD]) {
    it(`draws every kind at least its least span, and a fly and a bee smaller than any butterfly, on a ${name} screen`, () => {
      const { insectSizes } = meadowLayout(width, height, 1);
      const spanOf = (kind: InsectKind, seed: number) =>
        wingspan(insectGenes({ seed, kind })) * insectSizes[kind];
      const narrowestButterfly = Math.min(
        ...VISITS.map((seed) => spanOf('butterfly', seed)),
      );
      for (const kind of INSECT_KINDS) {
        for (const seed of VISITS) {
          const span = spanOf(kind, seed);
          assert.ok(
            span >= LEAST_SPANS[kind],
            `a ${kind} ${span.toFixed(1)} px`,
          );
          if (kind !== 'butterfly') {
            assert.ok(
              span < narrowestButterfly,
              `a ${kind} ${span.toFixed(0)} px`,
            );
          }
        }
      }
    });
  }
});

/** The most of a flower's head a bee sitting on it may cover. */
const MOST_COVERED = 0.5;
/** A bee's stay on a flower: landing at 1000 ms, due to leave at 9000. */
const STAY: Stay = {
  departs: 0,
  arrives: 1000,
  leaves: 9000,
  to: { kind: 'flower', id: 'flower' },
  launch: 0,
  speed: 0,
  drink: 0,
};
/** Every 100 ms of one round of its flutter, once its landing's bob is over. */
const SETTLED = Array.from(
  { length: 18 },
  (_, index) => STAY.arrives + LANDING + index * 100,
);
/** How far a settled bee is turned off its flower, its rest facing's lean and the flower's sway together. */
const TURNS = [-1, 0, 1].map((side) => side * (REST_LEAN + FLOWER_SWAY));
/** How many points across a head's disc the covered share is read at. */
const GRID = 28;

/**
 * A screen's flower heads, as the scene stands its seeded flowers over many
 * visits: the median one, its reach and its centre's, and the least the
 * petal genes allow on the smallest flower standing.
 */
function headsOn(width: number, height: number) {
  const standing = VISITS.slice(0, 200).flatMap((seed) => {
    const { layout, flowers, mushrooms } = opened(seed, width, height, false);
    return standingFlowers(layout, flowers, [], mushrooms, []).map(
      (flower) => ({
        ...pick(flower.place, 'size'),
        head: {
          ...pick(sightingOf(flower, layout).head, 'r'),
          disc: flowerGenes(flower).centre * flower.place.size,
        },
      }),
    );
  });
  const sorted = standing.toSorted((a, b) => a.head.r - b.head.r);
  const middle = sorted[Math.floor(sorted.length / 2)];
  assert.ok(middle, 'no flower stands');
  const least = Math.min(...standing.map(({ size }) => size));
  return {
    median: middle.head,
    least: {
      r: FLOWER_RANGES.petalLength[0] * least,
      disc: FLOWER_RANGES.centre[0] * least,
    },
  };
}

/** How much of a head of reach `r`, its middle at the origin, the closed outlines of `parts` cover. */
function coveredShare(
  r: number,
  parts: ReadonlyArray<readonly Point[]>,
): number {
  const drawn = parts.map((points) => ({ points, box: boxAround(points) }));
  let inside = 0;
  let covered = 0;
  for (const across of Array.from({ length: GRID }).keys()) {
    for (const down of Array.from({ length: GRID }).keys()) {
      const point = {
        x: (((across + 0.5) / GRID) * 2 - 1) * r,
        y: (((down + 0.5) / GRID) * 2 - 1) * r,
      };
      if (Math.hypot(point.x, point.y) > r) continue;
      inside += 1;
      const under = drawn.some(
        ({ points, box }) =>
          point.x >= box.left &&
          point.x <= box.right &&
          point.y >= box.top &&
          point.y <= box.bottom &&
          containsPoint(points, point),
      );
      if (under) covered += 1;
    }
  }
  return covered / inside;
}

/** A few visits' bees. */
const BEES = VISITS.slice(0, 6).map((seed) => beeGenes(seed));
/** The bee whose face reaches farthest (`FACE_REACH`) and whose wings are the biggest. */
const BIGGEST_BEE: BeeGenes = (() => {
  const genes = beeGenes(0);
  return {
    ...genes,
    bodyLength: BEE_RANGES.bodyLength[1],
    bodyWidth: BEE_RANGES.bodyWidth[1],
    headRadius: BEE_RANGES.headRadius[1],
    wing: {
      ...genes.wing,
      length: BEE_RANGES.wingLength[1],
      breadth: BEE_RANGES.wingBreadth[1],
    },
  };
})();

/**
 * The most of `head` a bee `size` to its unit covers, sitting on it as
 * `flowerLift` has it, over each of `bees`, a few phases, spots and turns,
 * with its crawl at `now` wherever `crawled` puts it.
 */
function mostCovered(
  head: HeadReach,
  size: number,
  bees: readonly BeeGenes[],
  crawled: (now: number, phase: number) => readonly Point[],
): number {
  const lift = flowerLift(head, size, 'bee');
  let most = 0;
  for (const genes of bees) {
    const { sting, abdomen, chest, head: face } = beeOutline(genes);
    for (const phase of [0, 2.1, 4.4]) {
      for (const now of SETTLED) {
        const spread = wingBeat(STAY, now, { phase, kind: 'bee' });
        const wings = [-1, 1] as const;
        const parts = [
          sting,
          abdomen,
          chest,
          face,
          ...wings.map((side) => buzzWing(genes, side, spread)),
        ];
        for (const away of crawled(now, phase)) {
          for (const spot of [-PERCH_SPREAD, 0, PERCH_SPREAD]) {
            const middle = {
              x: spot * head.r + away.x * size,
              y: -lift + away.y * size,
            };
            // Each part drawn about the bee's middle, turned and sized as
            // the view draws it.
            for (const turn of TURNS) {
              const drawn = parts.map((outline) =>
                outline.map((point) =>
                  placedAt(middle, turn, {
                    x: point.x * size,
                    y: point.y * size,
                  }),
                ),
              );
              most = Math.max(most, coveredShare(head.r, drawn));
            }
          }
        }
      }
    }
  }
  return most;
}

/** How small beside the least head a speck of one is. */
const SPECK = 0.1;

/** Every extreme of a bee's crawl, across, down and both. */
const CRAWL_EXTREMES = [-1, 0, 1].flatMap((across) =>
  [-1, 0, 1].map((down) => ({
    x: across * CRAWL_REACH.x,
    y: down * CRAWL_REACH.y,
  })),
);

describe('a bee on a flower', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`leaves at least half of the median head, and of the least and a speck at the crawl's every extreme, in sight under its body and wings, on a ${name} screen`, () => {
      const { median, least } = headsOn(width, height);
      const size = meadowLayout(width, height, 1).insectSizes.bee;
      for (const [head, bees, crawled] of [
        [median, BEES, (now, phase) => [crawl(STAY, now, { phase })]],
        [least, [...BEES, BIGGEST_BEE], () => CRAWL_EXTREMES],
        // A head far smaller than any flower grows: the rule holds at any size.
        [
          { r: least.r * SPECK, disc: least.disc * SPECK },
          [BIGGEST_BEE],
          () => CRAWL_EXTREMES,
        ],
      ] as const satisfies ReadonlyArray<
        readonly [
          HeadReach,
          readonly BeeGenes[],
          Parameters<typeof mostCovered>[3],
        ]
      >) {
        const most = mostCovered(head, size, bees, crawled);
        assert.ok(
          most <= MOST_COVERED,
          `covers ${(most * 100).toFixed(0)}% of a ${(head.r * 2).toFixed(0)} px head`,
        );
      }
    });
  }
});
