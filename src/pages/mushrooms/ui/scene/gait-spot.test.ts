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
  [320, 360],
  [360, 240],
  [360, 280],
] as const;

describe('gaitSpot', () => {
  for (const [width, height] of CROWDED_SKIES) {
    it(`keeps the gait button in the sky, giving way, on a ${String(width)}×${String(height)} screen`, () => {
      const { gait, groundTop, yielding } = meadowLayout(width, height, 1);
      assert.ok(yielding.includes('gait'));
      assert.ok(gait.y + tapReach(gait.r) <= groundTop);
    });
  }
});
