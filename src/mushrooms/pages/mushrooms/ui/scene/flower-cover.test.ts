import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { containsPoint, type Point } from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
import { bedPlace } from './bed-place';
import { coversShown, inSightPast, type ShownCover } from './flower-cover';
import { viewAt } from './view';
import { VIEWPORTS } from './viewports';
import { opened } from './visit-play';

const SQUARE: readonly Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

/** A square cover standing `distance` from the eye. */
const squareAt = (distance: number): ShownCover => ({
  distance,
  drawn: [{ outline: SQUARE, box: { left: 0, right: 10, top: 0, bottom: 10 } }],
});

describe('a thing on the ground past the mushrooms', () => {
  it('is hidden where a nearer mushroom is drawn over it', () => {
    assert.equal(inSightPast([squareAt(5)], { x: 5, y: 5 }, 8), false);
  });

  it('shows where the mushroom drawn there stands farther off, or as far', () => {
    assert.equal(inSightPast([squareAt(9)], { x: 5, y: 5 }, 8), true);
    assert.equal(inSightPast([squareAt(8)], { x: 5, y: 5 }, 8), true);
  });

  it('shows beside a nearer mushroom', () => {
    assert.equal(inSightPast([squareAt(5)], { x: 15, y: 5 }, 8), true);
  });
});

describe('the mushrooms a frame draws', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`cover what stands behind them where the bed draws them, on a ${name} screen`, () => {
      for (const seed of [1, 42]) {
        const { meadow, layout } = opened(seed, width, height, true);
        const view = viewAt(layout.camera, OPENING_EYE);
        const covers = coversShown(view, layout, meadow.mushrooms);
        const drawn = meadow.mushrooms.filter(
          ({ foot }) => bedPlace(view, foot).drawn,
        );
        assert.ok(covers.length > 0, `visit ${String(seed)}: none drawn`);
        assert.ok(covers.length <= drawn.length, `visit ${String(seed)}`);
        for (const cover of covers) {
          const inside = cover.drawn
            .map(({ outline }) => ({
              x: outline.reduce((sum, { x }) => sum + x, 0) / outline.length,
              y: outline.reduce((sum, { y }) => sum + y, 0) / outline.length,
            }))
            .find((point) =>
              cover.drawn.some(({ outline }) => containsPoint(outline, point)),
            );
          assert.ok(inside, `visit ${String(seed)}: an outline round nothing`);
          assert.equal(
            inSightPast([cover], inside, cover.distance + 1),
            false,
            `visit ${String(seed)}: hides nothing behind it`,
          );
          assert.equal(
            inSightPast([cover], inside, cover.distance),
            true,
            `visit ${String(seed)}: hides what stands as near`,
          );
        }
      }
    });
  }
});
