import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstMushrooms,
  GENE_RANGES,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { capReach, splayed } from '../../model/mushroom-pose';
import { mulberry32 } from '../../model/random';
import {
  EDGE_MARGIN,
  FOOT_CLEARANCE,
  meadowLayout,
  SUN_GLOW_REACH,
} from './layout';

const VIEWPORTS = [
  ['tablet', 1180, 820],
  ['tablet portrait', 820, 1180],
  ['phone', 390, 844],
  ['small phone', 320, 568],
  ['desktop', 1920, 1080],
] as const;
const VISITS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);

describe('meadowLayout', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`keeps every opening cap on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      for (const seed of VISITS) {
        const mushrooms = firstMushrooms(mulberry32(seed));
        for (const [index, mushroom] of mushrooms.entries()) {
          const place = layout.mushrooms[index];
          assert.ok(place);
          const { genes, turn } = splayed(mushroomGenes(mushroom), place.splay);
          const { left, right } = capReach(genes, turn);
          assert.ok(
            place.x - left * place.size >= EDGE_MARGIN &&
              place.x + right * place.size <= width - EDGE_MARGIN,
            `visit ${seed}: ${mushroom.id} past the edge`,
          );
        }
      }
    });

    it(`keeps the sun's glow on a ${name} screen`, () => {
      const { sun } = meadowLayout(width, height, 1);
      const glow = sun.r * SUN_GLOW_REACH;
      assert.ok(sun.x + glow <= width + 1e-9 && sun.y - glow >= -1e-9);
    });

    it(`keeps every flower off the clump's feet on a ${name} screen`, () => {
      let placed = 0;
      for (const seed of VISITS) {
        const { flowers, mushrooms } = meadowLayout(width, height, seed);
        placed += flowers.length;
        for (const flower of flowers) {
          for (const mushroom of mushrooms) {
            const clear = mushroom.size * FOOT_CLEARANCE;
            for (const y of [flower.y, flower.y - flower.size]) {
              assert.ok(
                Math.hypot(flower.x - mushroom.x, y - mushroom.y) >= clear,
                `visit ${seed}: a flower on a mushroom's foot`,
              );
            }
          }
        }
      }
      // Moving flowers off the feet must not leave the meadow bare.
      assert.ok(placed / VISITS.length >= 4.5);
    });

    it(`keeps every flower shorter than a mushroom's stem on a ${name} screen`, () => {
      const { flowers, mushrooms } = meadowLayout(width, height, 1);
      const stem = Math.min(
        ...mushrooms.map(({ size }) => size * GENE_RANGES.stemHeight[0]),
      );
      for (const flower of flowers) assert.ok(flower.size < stem);
    });

    it(`keeps the flowers where they were across a resize on a ${name} screen`, () => {
      const before = meadowLayout(width, height, 7).flowers;
      const after = meadowLayout(width * 1.25, height * 1.25, 7).flowers;
      assert.equal(after.length, before.length);
      for (const [index, flower] of before.entries()) {
        assert.ok(Math.abs((after[index]?.x ?? 0) / 1.25 - flower.x) < 1e-6);
      }
    });
  }
});
