import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Eye,
  EYE_HEIGHT,
  OPENING_EYE,
  project,
  viewOf,
} from '../../model/ground';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { speciesHeight } from '../../model/mushroom-pose';
import { OPENING_FEET } from '../../model/placement';
import { extremes, placeOf } from './clump-layout';
import { MEADOW_FRAME, meadowCamera } from './meadow-camera';
import {
  behindHills,
  cull,
  D_SEE,
  ofGround,
  ofLayout,
  onScreen,
  V_NEAR,
  viewAt,
} from './view';
import { VIEWPORTS } from './viewports';

/** Each screen's camera, upright and turned. */
const CAMERAS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, camera: meadowCamera(width, height) },
  { name: `${name} turned`, camera: meadowCamera(height, width) },
]);

/** Feet at the opening clump's and at the world frame's extremes. */
const FEET = [...OPENING_FEET, ...extremes(MEADOW_FRAME)];

/** Eyes about the glade, each looking its own way, every foot ahead of them. */
const EYES: Eye[] = [
  OPENING_EYE,
  { x: 0, y: 3, heading: 0 },
  { x: -1.5, y: 1, heading: 0.3 },
  { x: 2, y: -2, heading: -0.4 },
];

/** How near two screen positions count as one, in CSS px. */
const SAME_PX = 1e-9;

describe('the view', () => {
  for (const { name, camera } of CAMERAS) {
    const left = (camera.world - camera.width) / 2;

    it(`stands the ground's top row at D_SEE on the ${name} camera`, () => {
      const { y } = viewOf(camera, OPENING_EYE, { x: 0, y: D_SEE }, 0);
      assert.ok(Math.abs(y - camera.groundTop) < 1e-9, String(y));
    });

    it(`places every foot at the opening as the ${name} camera's opening crop shows it, at its own size`, () => {
      const view = viewAt(camera, OPENING_EYE);
      for (const foot of FEET) {
        const shown = project(camera, foot);
        const placed = ofGround(view, foot);
        assert.ok(Math.abs(placed.x - (shown.x - left)) < SAME_PX, 'across');
        assert.ok(Math.abs(placed.y - shown.y) < SAME_PX, 'down');
        assert.ok(Math.abs(placed.zoom - 1) < SAME_PX, 'zoom');
      }
    });

    it(`places a layout point at the opening where the ${name} camera's opening crop shows it`, () => {
      const view = viewAt(camera, OPENING_EYE);
      for (const foot of FEET) {
        const row = project(camera, foot).y;
        for (const point of [
          { x: left + 10, y: row - 40 },
          { x: camera.world / 2, y: row },
          { x: left + camera.width - 5, y: 30 },
        ]) {
          const placed = ofLayout(view, point, row);
          assert.ok(Math.abs(placed.x - (point.x - left)) < 1e-6, 'across');
          assert.ok(Math.abs(placed.y - point.y) < 1e-6, 'down');
          assert.ok(Math.abs(placed.zoom - 1) < SAME_PX, 'zoom');
        }
      }
    });

    it(`places a thing perched over a foot as the foot's own thing, from any eye, on the ${name} camera`, () => {
      const lift = 0.8;
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        for (const foot of FEET) {
          const { x, y, scale } = project(camera, foot);
          const perched = ofLayout(view, { x, y: y - lift * scale }, y);
          const stood = ofGround(view, foot, lift);
          const at = `eye ${JSON.stringify(eye)}, foot ${JSON.stringify(foot)}`;
          assert.ok(Math.abs(perched.x - stood.x) < 1e-6, `${at}: across`);
          assert.ok(Math.abs(perched.y - stood.y) < 1e-6, `${at}: down`);
          assert.ok(Math.abs(perched.zoom - stood.zoom) < 1e-9, `${at}: zoom`);
        }
      }
    });

    it(`hides every mushroom's tallest head below the ${name} screen's foot by the time the eye is V_NEAR from it`, () => {
      const largest = Math.max(
        ...FEET.map((foot) => {
          const { size } = placeOf(camera, foot);
          return size / project(camera, foot).scale;
        }),
      );
      for (const species of MUSHROOM_SPECIES) {
        const head = speciesHeight(species) * largest;
        assert.ok(head < EYE_HEIGHT, `${species}: taller than the eye`);
        const { y } = viewOf(camera, OPENING_EYE, { x: 0, y: V_NEAR }, head);
        assert.ok(y > camera.height, `${species}: head at ${String(y)}`);
      }
    });
  }

  it('culls only what is nearer the eye than V_NEAR', () => {
    assert.equal(cull({ ahead: V_NEAR - 1e-6 }), true);
    assert.equal(cull({ ahead: -3 }), true);
    assert.equal(cull({ ahead: V_NEAR }), false);
    assert.equal(cull({ ahead: D_SEE }), false);
  });

  it('puts behind the hills only what stands past D_SEE', () => {
    assert.equal(behindHills({ ahead: V_NEAR }), false);
    assert.equal(behindHills({ ahead: D_SEE }), false);
    assert.equal(behindHills({ ahead: D_SEE + 1e-6 }), true);
  });

  it('says what stands on the screen, inside or past its edges', () => {
    const [, width, height] = VIEWPORTS[0];
    const camera = meadowCamera(width, height);
    const view = viewAt(camera, OPENING_EYE);
    assert.equal(onScreen(view, { x: 0, y: 0 }), true);
    assert.equal(onScreen(view, { x: camera.width + 1, y: 10 }), false);
    assert.equal(onScreen(view, { x: 5, y: 10 }, 12), false);
    assert.equal(onScreen(view, { x: -5, y: 10 }, -12), true);
  });
});
