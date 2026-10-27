import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FLOWER_SHAPES,
  PICKED_COLOURS,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  FLOOR_HELD,
  TURNED_SMALL,
  VIEWPORTS,
} from '@/mushrooms/entities/mushroom/index.node-safe';

import { meadowLayout } from './layout';
import { flowerPicker } from './sky-layout';

/** The most buttons a stage of the picker shows: a six-year-old picks among five at most. */
const MOST_PER_STAGE = 5;

// Where each stage stands, and how far from every other control, is swept
// with the other pickers in layout.test.ts.
describe('the flower picker', () => {
  for (const [name, width, height] of [
    ...VIEWPORTS,
    FLOOR_HELD,
    ...TURNED_SMALL,
  ]) {
    it(`shows each stage whole, at most ${String(MOST_PER_STAGE)} to pick among, on the ${name}`, () => {
      const { colours, shapes } = flowerPicker(meadowLayout(width, height, 1));
      assert.equal(colours.length, PICKED_COLOURS.length);
      assert.equal(shapes.length, FLOWER_SHAPES.length);
      for (const stage of [colours, shapes]) {
        assert.ok(stage.length <= MOST_PER_STAGE);
      }
    });
  }
});
