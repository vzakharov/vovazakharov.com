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
import { seamReach } from './skyline';
import {
  behindHills,
  buried,
  cull,
  D_SEE,
  ofGround,
  ofLayout,
  onScreen,
  SHOWN_LEAST,
  sunk,
  sunkAway,
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

  for (const { name, camera } of CAMERAS) {
    it(`sinks what stands past D_SEE below the ground's top row, with no jump, on the ${name} camera`, () => {
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        const foot = (ahead: number) => {
          const plane = {
            x: eye.x + ahead * Math.sin(eye.heading),
            y: eye.y + ahead * Math.cos(eye.heading),
          };
          const viewed = viewOf(view, eye, plane, 0);
          return { ...viewed, zoom: 1 };
        };
        const crossing = foot(D_SEE);
        assert.equal(sunk(view, crossing), crossing);
        assert.ok(Math.abs(crossing.y - camera.groundTop) < 1e-6);
        const past = sunk(view, foot(D_SEE + 1e-6));
        assert.ok(Math.abs(past.y - crossing.y) < 1e-3, 'jumps at D_SEE');
        let last = crossing.y;
        for (const ahead of [13.5, 15, 20, 40, 400]) {
          const drawn = sunk(view, foot(ahead));
          assert.ok(
            drawn.y > last,
            `${String(ahead)}: does not sink as it recedes`,
          );
          assert.ok(buried(view, drawn), `${String(ahead)}: not buried`);
          last = drawn.y;
        }
        for (const ahead of [V_NEAR, 9, D_SEE]) {
          const placed = foot(ahead);
          assert.equal(sunk(view, placed), placed);
          assert.equal(buried(view, placed), false);
        }
      }
    });
  }

  for (const { name, camera } of CAMERAS) {
    it(`stops drawing a sunk thing once less than SHOWN_LEAST of it shows, and only then, on the ${name} camera`, () => {
      const view = viewAt(camera, OPENING_EYE);
      const cover = camera.groundTop + seamReach(camera);
      for (const tall of [0.3, 1, 2]) {
        let gone = false;
        for (let ahead = V_NEAR; ahead < 400; ahead *= 1.01) {
          const placed = sunk(view, {
            ...viewOf(view, OPENING_EYE, { x: 0, y: ahead }, 0),
            zoom: 1,
          });
          const height = tall * placed.scale;
          const shows = Math.min(height, cover - (placed.y - height));
          const away = sunkAway(view, placed, height);
          const where = `${String(tall)} tall, ${ahead.toFixed(2)} ahead`;
          const sinking = ahead > D_SEE;
          assert.equal(away, sinking && shows < SHOWN_LEAST * height, where);
          assert.ok(!gone || away, `${where}: comes back`);
          gone = away;
        }
        assert.ok(gone, `${String(tall)} tall: never sinks away`);
      }
    });
  }

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
