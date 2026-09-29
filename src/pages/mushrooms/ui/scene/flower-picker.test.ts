import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_SHAPES, PICKED_COLOURS } from '../../model/flower-sounds';
import type { Circle } from '../../model/geometry';
import { meadowLayout } from './layout';
import {
  flowerPicker,
  standingControls,
  TAP_RADIUS,
  tapReach,
} from './sky-layout';
import { FLOOR_HELD, VIEWPORTS } from './viewports';

/** The most buttons a stage of the picker shows: a six-year-old picks among five at most. */
const MOST_PER_STAGE = 5;

const reached = ({ x, y, r }: Circle): Circle => ({ x, y, r: tapReach(r) });
const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;
const onScreen = ({ x, y, r }: Circle, width: number, height: number) =>
  x - r >= 0 && x + r <= width && y - r >= 0 && y + r <= height;

describe('the flower picker', () => {
  for (const [name, width, height] of [...VIEWPORTS, FLOOR_HELD]) {
    it(`shows each stage whole, a finger's size, on screen and clear of every standing control on the ${name}`, () => {
      const layout = meadowLayout(width, height, 1);
      const { colours, shapes } = flowerPicker(layout);
      assert.equal(colours.length, PICKED_COLOURS.length);
      assert.equal(shapes.length, FLOWER_SHAPES.length);
      const { releases, yielding } = layout;
      // The fly and the bee give way to an open picker where they share its band.
      const standing = standingControls(layout).filter(
        (each) => !yielding || (each !== releases.fly && each !== releases.bee),
      );
      for (const stage of [colours, shapes]) {
        assert.ok(stage.length <= MOST_PER_STAGE);
        const buttons = stage.map((circle) => reached(circle));
        for (const [index, button] of buttons.entries()) {
          assert.ok(button.r >= TAP_RADIUS);
          assert.ok(onScreen(button, width, height), `button ${index} off`);
          for (const other of [
            ...buttons.slice(index + 1),
            ...standing.map((circle) => reached(circle)),
          ]) {
            assert.ok(apart(button, other), `button ${index} overlaps`);
          }
        }
      }
    });
  }
});
