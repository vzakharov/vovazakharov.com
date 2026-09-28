import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { firstFlowers } from '../../model/flower-genes';
import { firstMeadow, reduce } from '../../model/game';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { FLOWER_LIMIT, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import {
  clearOfFeet,
  FLOWER_ACROSS,
  FLOWER_DOWN,
  FLOWERS_APART,
  widestHead,
} from './flower-layout';
import { downOf, standingFlowers } from './flower-plots';
import type { Stand } from './flower-sight';
import { type MeadowLayout, meadowLayout } from './layout';
import { perchSight } from './perch-sight';
import { VIEWPORTS, VISITS } from './viewports';

/** The least number of flowers the bees plant in the median visit, on every screen. */
const LEAST_PLANTED = 4;

/**
 * A visit's meadow as the scene stands it on a screen `width` by `height`,
 * with the opening clump or a full forest, and as many flowers planted as
 * the sight offers room for, each in the first slot it offers, as a bee
 * leaving each flower in turn would plant them; with the same visit's
 * layout on the screen turned.
 */
function plantedOut(
  seed: number,
  [width, height]: readonly [number, number],
  forest: boolean,
): Stand & { turned: MeadowLayout } {
  const random = mulberry32(seed);
  let meadow = firstMeadow(random);
  const flowers = firstFlowers(random, 7);
  const visit = seed ^ 0xf1_0e_25;
  const opening = {
    screen: { width, height },
    openers: meadow.mushrooms,
  };
  const layout = meadowLayout(width, height, visit, opening);
  const growing = mulberry32(seed ^ 0x9e_0a);
  const grown = forest ? layout.mushrooms.length - meadow.mushrooms.length : 0;
  for (const index of Array.from({ length: grown }).keys()) {
    const species =
      MUSHROOM_SPECIES[index % MUSHROOM_SPECIES.length] ?? 'fly-agaric';
    meadow = reduce(meadow, { kind: 'grow', species, seed: nextSeed(growing) });
  }
  const { mushrooms } = meadow;
  const planted: Sown[] = [];
  const stand = { layout, flowers, mushrooms, planted };
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
  return { ...stand, turned: meadowLayout(height, width, visit, opening) };
}

/** The middle of `counts`, the upper one of an even count's two. */
function median(counts: readonly number[]): number {
  const sorted = counts.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Asserts that every planted flower of `stand` that stands on `screen` has
 * ground there: on the meadow's ground, off every foot, and its head apart
 * from every other flower's standing there.
 */
function assertGrounded(
  seed: number,
  stand: Stand,
  screen: MeadowLayout,
): void {
  const placed = standingFlowers(screen, stand.flowers, stand.planted);
  for (const { id } of stand.planted) {
    const flower = placed.find((each) => each.id === id);
    if (!flower) continue;
    const { place } = flower;
    const across = place.x / screen.width;
    const down = downOf(screen, place.y);
    assert.ok(
      across >= FLOWER_ACROSS[0] &&
        across <= FLOWER_ACROSS[1] &&
        down >= FLOWER_DOWN[0] &&
        down <= FLOWER_DOWN[1],
      `visit ${String(seed)}: ${id} off the ground`,
    );
    assert.ok(
      clearOfFeet(place, screen.mushrooms),
      `visit ${String(seed)}: ${id} on a foot`,
    );
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
    for (const forest of [false, true]) {
      const standing = forest ? 'a full forest' : 'the opening clump';
      it(`stands in sight where it was planted, on the ground and off every foot and flower wherever it stands, on a ${name} screen with ${standing}`, () => {
        const counts = VISITS.slice(0, 150).map((seed) => {
          const stand = plantedOut(seed, [width, height], forest);
          const { layout, turned, planted, flowers } = stand;
          const shown = new Set(perchSight(stand).flowers);
          const placed = standingFlowers(layout, flowers, planted);
          for (const { id } of planted) {
            assert.ok(
              placed.some((each) => each.id === id),
              `visit ${String(seed)}: ${id} stands nowhere`,
            );
            assert.ok(
              shown.has(id),
              `visit ${String(seed)}: ${id} out of sight`,
            );
          }
          assertGrounded(seed, stand, layout);
          assertGrounded(seed, stand, turned);
          return planted.length;
        });
        assert.ok(
          median(counts) >= LEAST_PLANTED,
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
    for (const forest of [false, true]) {
      const standing = forest ? 'a full forest' : 'the opening clump';
      it(`has room for the bees to plant a bed, over every visit, on a ${name} screen with ${standing}`, () => {
        const counts = VISITS.map(
          (seed) => plantedOut(seed, [width, height], forest).planted.length,
        );
        assert.ok(
          median(counts) >= LEAST_PLANTED,
          `median ${String(median(counts))} planted`,
        );
      });
    }
  }
});
