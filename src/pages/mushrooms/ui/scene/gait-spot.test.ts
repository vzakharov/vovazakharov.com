import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowLayout } from './layout';
import { tapReach } from './tap-reach';

/**
 * Screens smaller than any the meadow is laid out for, whose sky holds no
 * spot for the gait button `BUTTON_INSET` off the sun's rays, though it
 * holds one clear of them.
 */
const CROWDED_SKIES = [
  [320, 280],
  [360, 240],
  [360, 280],
] as const;

/**
 * Phones upright and tablets either way, whose insects' buttons stand in a
 * row or a column with the map button.
 */
const LINED_SCREENS = [
  [360, 640],
  [375, 667],
  [375, 812],
  [390, 664],
  [390, 844],
  [430, 800],
  [768, 1024],
  [820, 1180],
  [1180, 820],
] as const;

describe('gaitSpot', () => {
  for (const [width, height] of LINED_SCREENS) {
    it(`stands the gait button touching the map button or an insect's on a ${String(width)}×${String(height)} screen`, () => {
      const { gait, map, releases } = meadowLayout(width, height, 1);
      assert.ok(
        [map, ...Object.values(releases)].some(
          (button) =>
            (button.x === gait.x || button.y === gait.y) &&
            Math.hypot(button.x - gait.x, button.y - gait.y) ===
              tapReach(button.r) + tapReach(gait.r),
        ),
        `gait at (${String(gait.x)}, ${String(gait.y)})`,
      );
    });
  }
  for (const [width, height] of CROWDED_SKIES) {
    it(`keeps the gait button in the sky, giving way, on a ${String(width)}×${String(height)} screen`, () => {
      const { gait, groundTop, yielding } = meadowLayout(width, height, 1);
      assert.ok(yielding.includes('gait'));
      assert.ok(gait.y + tapReach(gait.r) <= groundTop);
    });
  }
});
