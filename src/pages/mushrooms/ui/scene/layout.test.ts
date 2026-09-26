import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMushrooms, mushroomGenes } from '../../model/mushroom-genes';
import { capReach, splayed } from '../../model/mushroom-pose';
import { mulberry32 } from '../../model/random';
import { EDGE_MARGIN, meadowLayout, SUN_GLOW_REACH } from './layout';

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
      const layout = meadowLayout(width, height);
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
      const { sun } = meadowLayout(width, height);
      const glow = sun.r * SUN_GLOW_REACH;
      assert.ok(sun.x + glow <= width + 1e-9 && sun.y - glow >= -1e-9);
    });
  }
});
