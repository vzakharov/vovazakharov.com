import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { type Ground, OPENING_EYE } from '../../model/ground';
import { bedPlace } from './bed-place';
import { placeIn } from './clump-layout';
import { standingFlowers } from './flower-plots';
import { viewAt } from './view';
import { VIEWPORTS } from './viewports';
import { opened } from './visit-play';

/** How near the opening placement stands to the layout's, in CSS px. */
const SAME_PX = 0.5;

const SEEDS = [1, 42];

/** Every screen, upright and turned. */
const SCREENS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, width, height },
  { name: `${name} turned`, width: height, height: width },
]);

describe('a bed object at the opening eye', () => {
  for (const { name, width, height } of SCREENS) {
    it(`stands where the layout stands it, less the opening crop's left, on a ${name} screen`, () => {
      for (const seed of SEEDS) {
        const { meadow, layout, flowers } = opened(seed, width, height, true);
        const { camera, mushrooms: ground } = layout;
        const view = viewAt(camera, OPENING_EYE);
        const left = (camera.world - camera.width) / 2;
        const laid: Array<{ what: string; foot: Ground; at: Point }> = [
          ...meadow.mushrooms.flatMap(({ id, foot }) => {
            const at = placeIn(ground, { foot });
            return at ? [{ what: id, foot, at }] : [];
          }),
          ...standingFlowers(layout, flowers, [], meadow.mushrooms).map(
            ({ id, foot, place }) => ({ what: id, foot, at: place }),
          ),
        ];
        assert.ok(laid.length > 14, `visit ${String(seed)}: too few laid`);
        for (const { what, foot, at } of laid) {
          const place = bedPlace(view, foot);
          const where = `visit ${String(seed)}: ${what}`;
          assert.ok(Math.abs(place.x - (at.x - left)) < SAME_PX, where);
          assert.ok(Math.abs(place.y - at.y) < SAME_PX, where);
          assert.ok(Math.abs(place.zoom - 1) < 1e-6, where);
          assert.equal(place.depth, place.y, where);
          assert.ok(place.drawn, where);
        }
      }
    });
  }
});
