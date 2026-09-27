import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { beeGenes } from '../../model/bee-genes';
import { beeOutline } from '../../model/bee-outline';
import { crawl } from '../../model/buzz-rest';
import { firstFlowers, flowerGenes } from '../../model/flower-genes';
import { firstMeadow } from '../../model/game';
import {
  boxAround,
  containsPoint,
  placedAt,
  type Point,
} from '../../model/geometry';
import { insectGenes } from '../../model/insect-genes';
import {
  LANDING,
  REST_LEAN,
  type Stay,
  wingBeat,
} from '../../model/insect-motion';
import { buzzWing, wingspan } from '../../model/insect-outline';
import { GENE_RANGES } from '../../model/mushroom-genes';
import { mulberry32 } from '../../model/random';
import { standingFlowers } from './flower-plots';
import {
  FLOWER_SWAY,
  flowerLift,
  PERCH_SPREAD,
  sightingOf,
} from './flower-sight';
import { meadowLayout } from './layout';
import { VIEWPORTS, VISITS } from './viewports';

const SPANS = VISITS.map((seed) =>
  wingspan(insectGenes({ seed, kind: 'butterfly' })),
);
/** The least a fly's or a bee's open wings span on screen, in CSS px, to read on a phone. */
const LEAST_BUZZER = 30;
/** The least a butterfly's open wings span on screen, in CSS px, to read as one on a phone. */
const LEAST_SPAN = 52;

describe('the butterflies’ size', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`spans a butterfly wide enough to read, and narrower than any clump cap, on a ${name} screen`, () => {
      const { insectSize, mushrooms } = meadowLayout(width, height, 1);
      const narrowestCap = Math.min(
        ...mushrooms
          .slice(0, 2)
          .map(({ size }) => size * GENE_RANGES.capWidth[0]),
      );
      for (const span of SPANS) {
        assert.ok(
          span * insectSize >= LEAST_SPAN,
          `${(span * insectSize).toFixed(0)} px`,
        );
        assert.ok(span * insectSize < narrowestCap);
      }
    });
  }
});

describe('the flies’ and the bees’ size', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`draws a fly and a bee big enough to read, and smaller than any butterfly, on a ${name} screen`, () => {
      const { insectSize, insectSizes } = meadowLayout(width, height, 1);
      const narrowestButterfly = Math.min(...SPANS) * insectSize;
      for (const kind of ['fly', 'bee'] as const) {
        for (const seed of VISITS) {
          const span =
            wingspan(insectGenes({ seed, kind })) * insectSizes[kind];
          assert.ok(span >= LEAST_BUZZER, `a ${kind} ${span.toFixed(0)} px`);
          assert.ok(
            span < narrowestButterfly,
            `a ${kind} ${span.toFixed(0)} px`,
          );
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

/** A screen's median flower head, as the scene stands its seeded flowers over many visits: its reach and its centre's. */
function medianHead(width: number, height: number) {
  const heads = VISITS.slice(0, 200).flatMap((seed) => {
    const random = mulberry32(seed);
    firstMeadow(random);
    const flowers = firstFlowers(random, 7);
    const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25);
    return standingFlowers(layout, flowers, []).map((flower) => ({
      ...pick(sightingOf(flower, layout).head, 'r'),
      disc: flowerGenes(flower).centre * flower.place.size,
    }));
  });
  const sorted = heads.toSorted((a, b) => a.r - b.r);
  const middle = sorted[Math.floor(sorted.length / 2)];
  assert.ok(middle, 'no flower stands');
  return middle;
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

describe('a bee on a flower', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`leaves at least half of the median head in sight under its body and wings, on a ${name} screen`, () => {
      const head = medianHead(width, height);
      const size = meadowLayout(width, height, 1).insectSizes.bee;
      const lift = flowerLift(head, size, 'bee');
      let most = 0;
      for (const seed of VISITS.slice(0, 6)) {
        const genes = beeGenes(seed);
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
            const crawled = crawl(STAY, now, { phase });
            for (const spot of [-PERCH_SPREAD, 0, PERCH_SPREAD]) {
              const middle = {
                x: spot * head.r + crawled.x * size,
                y: -lift + crawled.y * size,
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
      assert.ok(
        most <= MOST_COVERED,
        `covers ${(most * 100).toFixed(0)}% of a ${(head.r * 2).toFixed(0)} px head`,
      );
    });
  }
});
