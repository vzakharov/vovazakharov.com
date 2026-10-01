import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { type Ground, OPENING_EYE, zAt } from '../../model/ground';
import { bedPlace, depthOf } from './bed-place';
import { placeIn } from './clump-layout';
import { standingFlowers } from './flower-plots';
import { browRow, D_SEE, viewAt } from './view';
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
          ...standingFlowers(layout, flowers, [], meadow.mushrooms, []).map(
            ({ id, foot, place }) => ({ what: id, foot, at: place }),
          ),
        ];
        assert.ok(laid.length > 14, `visit ${String(seed)}: too few laid`);
        for (const { what, foot, at } of laid) {
          const place = bedPlace(view, foot);
          const where = `visit ${String(seed)}: ${what}`;
          // Past the brow, which curves below the ground's top row toward
          // the screen's edges, a thing laid by the screen's side, or off
          // it, sinks under the brow from the opening on.
          if (place.distance > D_SEE) {
            assert.ok(place.behind, where);
            assert.ok(place.y >= browRow(view, place.x) - 1e-6, where);
            continue;
          }
          assert.ok(Math.abs(place.x - (at.x - left)) < SAME_PX, where);
          assert.ok(Math.abs(place.y - at.y) < SAME_PX, where);
          assert.ok(Math.abs(place.zoom - 1) < 1e-6, where);
          assert.equal(place.depth, place.y, where);
          assert.ok(place.drawn, where);
          assert.equal(place.behind, false, where);
        }
      }
    });
  }
});

describe("a bed object past the ground's top row", () => {
  for (const { name, width, height } of SCREENS) {
    it(`stands its foot below that row, under the ground and over the near hills, the farther behind, its parts in order, on a ${name} screen`, () => {
      const { layout } = opened(1, width, height, false);
      const view = viewAt(layout.camera, OPENING_EYE);
      const near = bedPlace(view, { x: 0, z: zAt(0.02) });
      assert.equal(near.behind, false);
      let farther = Infinity;
      for (const down of [-0.02, -0.3, -0.6, -1]) {
        const place = bedPlace(view, { x: 0.4, z: zAt(down) });
        const where = `down ${String(down)}`;
        assert.ok(place.drawn && place.behind, where);
        assert.ok(place.y > layout.camera.groundTop, where);
        const [shadow, body, house] = [-0.5, 0, 0.1].map((nearer) =>
          depthOf(place, nearer),
        );
        for (const depth of [shadow, body, house]) {
          assert.ok(depth !== undefined && depth > -4 && depth < -3, where);
        }
        assert.ok(
          shadow !== undefined && body !== undefined && house !== undefined,
        );
        assert.ok(shadow < body && body < house, where);
        assert.ok(body < farther, `${where}: sorts before a nearer one`);
        farther = body;
      }
    });

    it(`stops drawing a thing of a given height once it has sunk away, and never one of none given, on a ${name} screen`, () => {
      const { layout } = opened(1, width, height, false);
      const view = viewAt(layout.camera, OPENING_EYE);
      const tall = layout.camera.unit * 0.3;
      assert.ok(bedPlace(view, { x: 0, z: zAt(-0.02) }, tall).drawn);
      const far = { x: 0, z: zAt(-1) };
      assert.equal(bedPlace(view, far, tall).drawn, false);
      assert.ok(bedPlace(view, far).drawn);
    });
  }
});
