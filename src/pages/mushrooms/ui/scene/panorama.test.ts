import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { meadowLayout } from './layout';
import {
  azimuthAt,
  driftedAzimuth,
  screenAt,
  shiftOf,
  shownAzimuths,
  wrapAngle,
} from './panorama';
import { viewAt } from './view';
import { VIEWPORTS } from './viewports';

describe('the panorama', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, 1);
    const { camera, sun, clouds } = layout;
    const opening = viewAt(camera, OPENING_EYE);

    it(`shows the sun and the opening clouds where the opening screen always has, on a ${name} screen`, () => {
      assert.ok(
        Math.abs(
          (screenAt(opening, azimuthAt(camera, sun.x)) ?? Number.NaN) - sun.x,
        ) < 1e-9,
      );
      assert.ok(Math.abs(shiftOf(opening, sun.x) ?? Number.NaN) < 1e-9);
      for (const [index, across] of [0.16, 0.5, 0.68].entries()) {
        const cloud = clouds[index];
        assert.ok(cloud);
        const x = screenAt(opening, driftedAzimuth(camera, cloud, index, 0));
        assert.ok(Math.abs((x ?? Number.NaN) - width * across) < 1e-9);
      }
    });

    it(`keeps the clouds round the sky off the opening screen, on a ${name} screen`, () => {
      assert.equal(clouds.length, 8);
      const { from, to } = shownAzimuths(opening);
      for (const { azimuth } of clouds.slice(3)) {
        assert.ok(azimuth < from || azimuth > to);
      }
    });

    it(`carries the sun off the screen and back over a full turn, on a ${name} screen`, () => {
      const half = viewAt(camera, { ...OPENING_EYE, heading: Math.PI });
      assert.equal(shiftOf(half, sun.x), undefined);
      const full = viewAt(camera, { ...OPENING_EYE, heading: Math.PI * 2 });
      assert.ok(Math.abs(shiftOf(full, sun.x) ?? Number.NaN) < 1e-6);
    });
  }

  it('wraps an angle into a half turn either way', () => {
    assert.ok(Math.abs(wrapAngle(Math.PI * 3.5) + Math.PI / 2) < 1e-12);
    assert.equal(wrapAngle(0), 0);
  });
});
