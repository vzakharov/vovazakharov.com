import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Eye, OPENING_EYE, project } from '../../model/ground';
import { OPENING_FEET } from '../../model/placement';
import { meadowCamera } from './meadow-camera';
import { ofLayout, viewAt } from './view';
import {
  groundOfLayout,
  groundUnder,
  layoutUnder,
  planeUnder,
} from './view-inverse';
import { VIEWPORTS } from './viewports';

const CAMERAS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, camera: meadowCamera(width, height) },
  { name: `${name} turned`, camera: meadowCamera(height, width) },
]);

const EYES: Eye[] = [
  OPENING_EYE,
  { x: 0, y: 3, heading: 0 },
  { x: -1.5, y: 1, heading: 0.3 },
  { x: 2, y: -2, heading: -0.4 },
];

const SAME = 1e-6;

describe('the view run backwards', () => {
  for (const { name, camera } of CAMERAS) {
    it(`brings a screen point on the ground back to itself through the layout on ${name}`, () => {
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        for (const share of [0, 0.3, 0.5, 0.8, 1]) {
          for (const down of [0.02, 0.4, 1]) {
            const screen = {
              x: camera.width * share,
              y: camera.groundTop + camera.ground * down,
            };
            const layout = layoutUnder(view, screen);
            assert.ok(layout, `${name} ${share} ${down}`);
            const back = ofLayout(view, layout, layout.y);
            assert.ok(Math.abs(back.x - screen.x) < SAME, name);
            assert.ok(Math.abs(back.y - screen.y) < SAME, name);
          }
        }
      }
    });

    it(`finds each opening foot where the opening crop shows it on ${name}`, () => {
      const view = viewAt(camera, OPENING_EYE);
      const left = (camera.world - camera.width) / 2;
      for (const foot of OPENING_FEET) {
        const shown = project(camera, foot);
        const ground = groundUnder(view, { ...shown, x: shown.x - left });
        assert.ok(ground);
        assert.ok(Math.abs(ground.x - foot.x) < SAME, name);
        assert.ok(Math.abs(ground.z - foot.z) < SAME, name);
        const laid = groundOfLayout(camera, shown);
        assert.ok(Math.abs(laid.z - foot.z) < SAME, name);
      }
    });
  }

  it('finds no ground at or above the horizon, and no layout behind the opening eye', () => {
    const camera = meadowCamera(1180, 820);
    const view = viewAt(camera, OPENING_EYE);
    assert.equal(planeUnder(view, { x: 0, y: -1e6 }), undefined);
    const turned = viewAt(camera, { x: 0, y: 0, heading: Math.PI });
    assert.equal(
      layoutUnder(turned, { x: camera.width / 2, y: camera.height }),
      undefined,
    );
  });
});
