import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { layoutAtRow } from './eye-crop';
import { meadowLayout } from './layout';
import { ofLayout, viewAt } from './view';
import { VIEWPORTS } from './viewports';

/** The eyes the inverse is checked from: the opening's, turned both ways, stepped in, and stepped aside and turned. */
const EYES = [
  OPENING_EYE,
  { ...OPENING_EYE, heading: 0.4 },
  { ...OPENING_EYE, heading: -0.9 },
  { x: 0, y: 3, heading: 0 },
  { x: -2, y: 5, heading: 0.7 },
];

describe('layoutAtRow', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`runs ofLayout backwards over every row of the ground on a ${name} screen`, () => {
      const { camera } = meadowLayout(width, height, 7);
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        for (const share of [0.1, 0.5, 0.9]) {
          const row = camera.groundTop + share * camera.ground;
          for (const point of [
            { x: camera.world / 2, y: row },
            { x: camera.world / 3, y: row - 120 },
            { x: (camera.world * 2) / 3, y: 40 },
          ]) {
            const placed = ofLayout(view, point, row);
            if (placed.ahead <= 0) continue;
            const back = layoutAtRow(view, placed, row);
            assert.ok(back, `${JSON.stringify(eye)} ${String(row)}`);
            assert.ok(Math.abs(back.x - point.x) < 1e-6);
            assert.ok(Math.abs(back.y - point.y) < 1e-6);
          }
        }
      }
    });
  }

  it('meets no point for a row above the horizon, or one the eye has walked past', () => {
    const { camera } = meadowLayout(1024, 768, 7);
    const centre = { x: camera.width / 2, y: camera.height / 2 };
    const opening = viewAt(camera, OPENING_EYE);
    assert.equal(layoutAtRow(opening, centre, 0), undefined);
    const past = viewAt(camera, { x: 0, y: 30, heading: 0 });
    assert.equal(layoutAtRow(past, centre, camera.height), undefined);
  });
});
