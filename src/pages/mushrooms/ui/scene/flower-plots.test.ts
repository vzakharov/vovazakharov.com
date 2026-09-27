import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { firstFlowers } from '../../model/flower-genes';
import { firstMeadow, reduce } from '../../model/game';
import { CAP_KINDS } from '../../model/mushroom-genes';
import { FLOWER_LIMIT, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { standingFlowers } from './flower-plots';
import type { Stand } from './flower-sight';
import { clearOfFeet, FLOWER_DOWN, meadowLayout } from './layout';
import { perchSight } from './perch-sight';
import { VIEWPORTS, VISITS } from './viewports';

/**
 * A visit's meadow as the scene stands it on a screen `width` by `height`,
 * with the opening clump or a full forest, and as many flowers planted as
 * the sight offers room for, each in the first slot it offers, as a bee
 * leaving each flower in turn would plant them.
 */
function plantedOut(
  seed: number,
  [width, height]: readonly [number, number],
  forest: boolean,
): Stand {
  const random = mulberry32(seed);
  let meadow = firstMeadow(random);
  const flowers = firstFlowers(random, 7);
  const visit = seed ^ 0xf1_0e_25;
  const layout = meadowLayout(width, height, visit);
  const turned = meadowLayout(height, width, visit);
  const growing = mulberry32(seed ^ 0x9e_0a);
  const grown = forest ? layout.mushrooms.length - meadow.mushrooms.length : 0;
  for (const index of Array.from({ length: grown }).keys()) {
    const cap = CAP_KINDS[index % CAP_KINDS.length] ?? 'spotted';
    meadow = reduce(meadow, { kind: 'grow', cap, seed: nextSeed(growing) });
  }
  const { mushrooms } = meadow;
  const planted: Sown[] = [];
  const stand = () => ({ layout, turned, flowers, mushrooms, planted });
  for (;;) {
    const { room, seededFlowers } = perchSight(stand());
    const [slot] = room;
    if (!slot || seededFlowers + planted.length >= FLOWER_LIMIT) break;
    planted.push({
      id: `planted-${String(planted.length + 1)}`,
      seed: nextSeed(random),
      parent: slot.flower,
      ...pick(slot, 'ring'),
    });
  }
  return stand();
}

describe('a planted flower', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const forest of [false, true]) {
      const standing = forest ? 'a full forest' : 'the opening clump';
      it(`stands on the ground, off every foot and in sight, this way up and turned, on a ${name} screen with ${standing}`, () => {
        let count = 0;
        for (const seed of VISITS.slice(0, 150)) {
          const stand = plantedOut(seed, [width, height], forest);
          const { layout, turned, planted, flowers } = stand;
          count += planted.length;
          for (const [screen, other] of [
            [layout, turned],
            [turned, layout],
          ] as const) {
            const here = { ...stand, layout: screen, turned: other };
            const shown = new Set(perchSight(here).flowers);
            const placed = standingFlowers(screen, flowers, planted);
            for (const { id } of planted) {
              const flower = placed.find((each) => each.id === id);
              assert.ok(flower, `visit ${seed}: ${id} stands nowhere`);
              const { place } = flower;
              const down =
                (place.y - screen.groundTop) /
                (screen.height - screen.groundTop);
              assert.ok(
                down >= FLOWER_DOWN[0] && down <= FLOWER_DOWN[1],
                `visit ${seed}: ${id} off the ground`,
              );
              assert.ok(
                clearOfFeet(place, screen.mushrooms),
                `visit ${seed}: ${id} on a foot`,
              );
              assert.ok(shown.has(id), `visit ${seed}: ${id} out of sight`);
            }
          }
        }
        // The sweep has to plant something to prove anything.
        assert.ok(count > 0, 'nothing planted');
      });
    }
  }
});
