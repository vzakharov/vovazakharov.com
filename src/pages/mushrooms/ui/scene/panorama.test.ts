import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE, pinholeOf } from '../../model/ground';
import { haloReach, litSkyAt, skyAt } from './backdrop-tones';
import { meadowLayout } from './layout';
import {
  azimuthAt,
  type Cloud,
  driftedAzimuth,
  OPENING_CLOUD_COUNT,
  placedLeft,
  screenAt,
  shiftOf,
  shownAzimuths,
} from './panorama';
import { type View, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** How many of `clouds`, drifted by `t`, `view` shows the middle of. */
function cloudsShown(view: View, clouds: readonly Cloud[], t: number): number {
  return clouds.filter((cloud) => {
    const x = screenAt(view, driftedAzimuth(cloud, t));
    return x >= 0 && x <= view.width;
  }).length;
}

describe('the panorama', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, 1);
    const { camera, sun, clouds, nearHills } = layout;
    const opening = viewAt(camera, OPENING_EYE);

    it(`shows the sun and the opening clouds at the opening where the layout lays them, on a ${name} screen`, () => {
      assert.ok(
        Math.abs(screenAt(opening, azimuthAt(camera, sun.x)) - sun.x) < 1e-9,
      );
      assert.ok(Math.abs(shiftOf(opening, sun.x)) < 1e-9);
      for (const [index, across] of [0.16, 0.5, 0.68].entries()) {
        const cloud = clouds[index];
        assert.ok(cloud);
        const x = screenAt(opening, driftedAzimuth(cloud, 0));
        assert.ok(Math.abs(x - width * across) < 1e-9);
      }
    });

    it(`keeps the clouds round the sky off the opening screen, on a ${name} screen`, () => {
      const { from, to } = shownAzimuths(opening);
      for (const { azimuth } of clouds.slice(OPENING_CLOUD_COUNT)) {
        assert.ok(azimuth < from || azimuth > to);
      }
    });

    it(`never leaves a view with fewer than one cloud short of the opening's, on a ${name} screen`, () => {
      const opened = cloudsShown(opening, clouds, 0);
      assert.equal(opened, OPENING_CLOUD_COUNT);
      let least = Infinity;
      for (let turn = 0; turn < 360; turn += 1) {
        const view = viewAt(camera, {
          ...OPENING_EYE,
          heading: (turn * Math.PI) / 180,
        });
        for (let t = 0; t <= 3600; t += 37) {
          least = Math.min(least, cloudsShown(view, clouds, t));
        }
      }
      assert.ok(least >= opened - 1, `only ${String(least)} in view`);
    });

    it(`draws the sun's pictures where they were baked at the opening, slid with the sun as it turns, on a ${name} screen`, () => {
      const reach = haloReach(layout);
      const home = { left: sun.x - reach, across: 2 * reach };
      const opened = placedLeft(opening, sun.x, home);
      assert.ok(Math.abs((opened ?? Number.NaN) - home.left) < 1e-9);
      const turned = viewAt(camera, { ...OPENING_EYE, heading: -0.05 });
      const sunAt = screenAt(turned, azimuthAt(camera, sun.x));
      const left = placedLeft(turned, sun.x, home);
      assert.ok(
        Math.abs((left ?? Number.NaN) - (home.left + sunAt - sun.x)) < 1e-9,
      );
      // Turned right by a screen and the picture's width, the picture is
      // past the screen's left edge.
      const away = viewAt(camera, {
        ...OPENING_EYE,
        heading: (width + home.across) / pinholeOf(camera).arc,
      });
      assert.equal(placedLeft(away, sun.x, home), undefined);
      const behind = viewAt(camera, { ...OPENING_EYE, heading: Math.PI });
      assert.equal(placedLeft(behind, sun.x, home), undefined);
    });

    it(`lights the sky round the sun no farther than its glow's picture runs, on a ${name} screen`, () => {
      const reach = haloReach(layout);
      for (let y = 0; y <= nearHills; y += nearHills / 40) {
        for (const x of [sun.x - reach, sun.x + reach, sun.x + reach * 1.5]) {
          assert.equal(litSkyAt(layout, x, y), skyAt(y / nearHills));
        }
      }
    });

    it(`carries the sun off the screen and back over a full turn, on a ${name} screen`, () => {
      const half = viewAt(camera, { ...OPENING_EYE, heading: Math.PI });
      const away = screenAt(half, azimuthAt(camera, sun.x));
      assert.ok(away < -sun.r || away > width + sun.r, String(away));
      const full = viewAt(camera, { ...OPENING_EYE, heading: Math.PI * 2 });
      assert.ok(Math.abs(shiftOf(full, sun.x)) < 1e-6);
    });
  }
});
