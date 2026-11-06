import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { borderLoop, fillTile } from '@/island/entities/terrain';

import { colourHeights } from './colour-heights';

describe('colourHeights', () => {
  const key = { level: 12, x: 2048, y: 2048 };
  const grid = 5;

  it('hangs a skirt under its own border vertex, as the tile does', () => {
    const tile = fillTile(key, (x) => 500 + x, { grid, skirtDepth: 100 });
    for (const [n, top] of borderLoop(grid).entries()) {
      const skirt = tile.heights[grid * grid + n] ?? Number.NaN;
      assert.ok(Math.abs(skirt - ((tile.heights[top] ?? 0) - 100)) < 1e-3);
    }
  });

  it("colours every skirt by its border's height, upland, shore or floor", () => {
    for (const height of [500, 5, -3, -900]) {
      const tile = fillTile(key, () => height, { grid, skirtDepth: 100 });
      const heights = colourHeights(tile.heights, grid);
      assert.ok(heights.every((each) => each === height));
    }
  });
});
