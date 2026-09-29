import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { reduce } from '../../model/game';
import { openingIndex } from '../../model/placement';
import { FLOWER_LIMIT, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { standingPlaces } from './clump-layout';
import {
  FLOWER_DOWN,
  FLOWERS_APART,
  FOOT_CLEARANCE,
  widestHead,
} from './flower-layout';
import { flowerFeet, standingFlowers, usedIn } from './flower-plots';
import type { Stand } from './flower-sight';
import { type MeadowLayout, meadowLayout } from './layout';
import { perchSight } from './perch-sight';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** The least number of flowers the bees plant in the median visit, on every screen. */
const LEAST_PLANTED = 4;
/**
 * The least the bees plant in the median visit with a full forest standing,
 * where it falls short of `LEAST_PLANTED`: the small phone, 320 px wide,
 * grows six mushrooms in every visit, and six leave its flowers' band ground
 * for about one planting beside the flower a bee drinks from.
 */
const LEAST_IN_A_FOREST: Partial<Record<Screen, number>> = {
  'small phone': 1,
};
/** A screen's name, as the sweeps know it. */
type Screen = (typeof VIEWPORTS)[number][0];
/** How near two ground points count as the same one, in the clump's size. */
const SAME_GROUND = 1e-9;

/** What stands in the meadow while the bees plant. */
const STANDINGS = {
  clump: 'the opening clump',
  forest: 'a full forest',
  thinned: 'the clump thinned to its front mushroom',
} as const;
type Standing = keyof typeof STANDINGS;

/** How many visits each screen and standing plants out. */
const PLANTED_VISITS = 20;
/** How many visits a tablet plants out for the median bed. */
const BED_VISITS = 200;

/** A planted-out visit, and how to lay it out on another screen. */
type PlantedOut = Stand & {
  on: (width: number, height: number) => MeadowLayout;
};

/**
 * A visit's meadow as the scene stands it on a screen `width` by `height`,
 * with `standing` in it, and as many flowers planted as the sight offers
 * room for, each in the first slot it offers, as a bee leaving each flower
 * in turn would plant them.
 */
function plantedOut(
  seed: number,
  [width, height]: readonly [number, number],
  standing: Standing,
): PlantedOut {
  const visit = opened(seed, width, height, standing === 'forest');
  let { meadow } = visit;
  const back = meadow.mushrooms[0];
  if (standing === 'thinned' && back) {
    meadow = reduce(meadow, { kind: 'select', ...pick(back, 'id') });
    meadow = reduce(meadow, { kind: 'remove' });
  }
  const { mushrooms } = meadow;
  const { layout, flowers } = visit;
  const planted: Sown[] = [];
  const stand = { layout, flowers, mushrooms, planted };
  const random = mulberry32(seed ^ 0x50_1d);
  for (;;) {
    const { room, seededFlowers } = perchSight(stand);
    const [slot] = room;
    if (!slot || seededFlowers + planted.length >= FLOWER_LIMIT) break;
    planted.push({
      id: `planted-${String(planted.length + 1)}`,
      seed: nextSeed(random),
      parent: slot.flower,
      ...pick(slot, 'ring'),
    });
  }
  const opening = {
    screen: { width, height },
    openers: visit.meadow.mushrooms.filter(
      ({ foot }) => openingIndex(foot) !== undefined,
    ),
  };
  return {
    ...stand,
    on: (across, down) =>
      meadowLayout(across, down, seed ^ 0xf1_0e_25, opening, usedIn(stand)),
  };
}

/** The middle of `counts`, the upper one of an even count's two. */
function median(counts: readonly number[]): number {
  const sorted = counts.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Asserts that every planted flower of `stand` stands on `screen` where it
 * stands on the ground, in the flowers' band of the ground, off every
 * standing mushroom's foot and its head apart from every other flower's.
 */
function assertGrounded(
  seed: number,
  stand: Stand,
  screen: MeadowLayout,
): void {
  const placed = standingFlowers(
    screen,
    stand.flowers,
    stand.planted,
    stand.mushrooms,
  );
  const feet = standingPlaces(screen.mushrooms, stand.mushrooms);
  const depth = screen.height - screen.groundTop;
  for (const { id } of stand.planted) {
    const flower = placed.find((each) => each.id === id);
    assert.ok(flower, `visit ${String(seed)}: ${id} hidden on a turn`);
    const { place } = flower;
    assert.ok(
      place.x >= 0 && place.x <= screen.width,
      `visit ${String(seed)}: ${id} out of view`,
    );
    const down = (place.y - screen.groundTop) / depth;
    assert.ok(
      down >= FLOWER_DOWN[0] - SAME_GROUND &&
        down <= FLOWER_DOWN[1] + SAME_GROUND,
      `visit ${String(seed)}: ${id} off the ground`,
    );
    for (const foot of feet) {
      const nearestY = Math.min(
        place.y,
        Math.max(place.y - place.size, foot.y),
      );
      assert.ok(
        Math.hypot(foot.x - place.x, foot.y - nearestY) >=
          foot.size * FOOT_CLEARANCE + widestHead(place).r,
        `visit ${String(seed)}: ${id} on a foot`,
      );
    }
    const head = widestHead(place);
    for (const other of placed) {
      if (other.id === id) continue;
      const near = widestHead(other.place);
      assert.ok(
        Math.hypot(head.x - near.x, head.y - near.y) >=
          FLOWERS_APART * (head.r + near.r),
        `visit ${String(seed)}: ${id} on ${other.id}`,
      );
    }
  }
}

describe('a planted flower', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const standing of ['clump', 'forest', 'thinned'] as const) {
      it(`stands in sight where it was planted, and on its ground on the screen and on it turned, off every foot and flower, on a ${name} screen with ${STANDINGS[standing]}`, () => {
        const counts = VISITS.slice(0, PLANTED_VISITS).map((seed) => {
          const stand = plantedOut(seed, [width, height], standing);
          const shown = new Set(perchSight(stand).flowers);
          const feet = flowerFeet(stand);
          for (const { id } of stand.planted) {
            assert.ok(
              shown.has(id),
              `visit ${String(seed)}: ${id} out of sight`,
            );
          }
          for (const [across, down] of [
            [width, height],
            [height, width],
          ] as const) {
            const there = stand.on(across, down);
            assertGrounded(seed, stand, there);
            const moved = flowerFeet({ ...stand, layout: there });
            assert.equal(moved.length, feet.length);
            for (const [at, foot] of moved.entries()) {
              const own = feet[at];
              assert.ok(
                own &&
                  Math.abs(foot.x - own.x) < SAME_GROUND &&
                  Math.abs(foot.z - own.z) < SAME_GROUND,
                `visit ${String(seed)}: flower ${String(at)} moved on the ground`,
              );
            }
          }
          return stand.planted.length;
        });
        const least =
          (standing === 'forest' ? LEAST_IN_A_FOREST[name] : undefined) ??
          LEAST_PLANTED;
        assert.ok(
          median(counts) >= least,
          `median ${String(median(counts))} planted`,
        );
      });
    }
  }
});

describe('a tablet’s meadow', () => {
  for (const [name, width, height] of VIEWPORTS.filter(([screen]) =>
    screen.startsWith('tablet'),
  )) {
    for (const standing of ['clump', 'forest'] as const) {
      it(`has room for the bees to plant a bed, over the first visits, on a ${name} screen with ${STANDINGS[standing]}`, (t) => {
        const counts = VISITS.slice(0, BED_VISITS).map(
          (seed) => plantedOut(seed, [width, height], standing).planted.length,
        );
        t.diagnostic(`median ${String(median(counts))} planted`);
        assert.ok(
          median(counts) >= LEAST_PLANTED,
          `median ${String(median(counts))} planted`,
        );
      });
    }
  }
});
