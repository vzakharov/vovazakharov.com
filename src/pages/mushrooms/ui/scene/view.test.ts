import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import {
  type Eye,
  EYE_HEIGHT,
  OPENING_EYE,
  pinholeOf,
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
  browLowest,
  browRow,
  buried,
  cull,
  D_SEE,
  ofGround,
  ofLayout,
  onScreen,
  type Placed,
  SHOWN_LEAST,
  sunk,
  sunkAway,
  V_NEAR,
  type View,
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

/** A thing on the ground `distance` from `view`'s eye, `off` radians right of its heading, as the view places it. */
function standing(view: View, distance: number, off: number): Placed {
  const { eye } = view;
  const toward = eye.heading + off;
  const plane = {
    x: eye.x + distance * Math.sin(toward),
    y: eye.y + distance * Math.cos(toward),
  };
  return { ...viewOf(view, eye, plane, 0), zoom: 1, distance };
}

/**
 * Where the lens draws, at the opening eye, a point the opening crop lays out
 * at `layout` (world px): at the azimuth the crop's pinhole sees it at, its
 * height below the horizon bent as the brow is, and drawn `zoom` times its
 * laid-out size.
 */
function lensed(view: View, layout: Point): Point & { zoom: number } {
  const { x: middle, y: horizon, focal } = pinholeOf(view);
  const left = (view.world - view.width) / 2;
  const azimuth = Math.atan((layout.x - left - middle) / focal);
  const zoom = Math.cos(azimuth) * Math.hypot(1, azimuth);
  return {
    x: middle + focal * azimuth,
    y: horizon + (layout.y - horizon) * zoom,
    zoom,
  };
}

/** How near two screen positions count as one, in CSS px. */
const SAME_PX = 1e-9;

describe('the view', () => {
  for (const { name, camera } of CAMERAS) {
    const left = (camera.world - camera.width) / 2;

    it(`stands the ground's top row at D_SEE on the ${name} camera`, () => {
      const { y } = viewOf(camera, OPENING_EYE, { x: 0, y: D_SEE }, 0);
      assert.ok(Math.abs(y - camera.groundTop) < 1e-9, String(y));
    });

    it(`places every foot at the opening at the azimuth the ${name} camera's opening crop sees it at, bent`, () => {
      const view = viewAt(camera, OPENING_EYE);
      for (const foot of FEET) {
        const placed = ofGround(view, foot);
        const expected = lensed(view, project(camera, foot));
        const at = `foot ${JSON.stringify(foot)}`;
        assert.ok(Math.abs(placed.x - expected.x) < SAME_PX, `${at}: across`);
        assert.ok(Math.abs(placed.y - expected.y) < 1e-6, `${at}: down`);
        assert.ok(Math.abs(placed.zoom - expected.zoom) < 1e-9, `${at}: zoom`);
      }
    });

    it(`places a layout point at the opening at the azimuth the ${name} camera's opening crop sees it at, bent`, () => {
      const view = viewAt(camera, OPENING_EYE);
      for (const foot of FEET) {
        const row = project(camera, foot).y;
        for (const point of [
          { x: left + 10, y: row - 40 },
          { x: camera.world / 2, y: row },
          { x: left + camera.width - 5, y: 30 },
        ]) {
          const placed = ofLayout(view, point, row);
          const expected = lensed(view, point);
          const at = `foot ${JSON.stringify(foot)}, ${JSON.stringify(point)}`;
          assert.ok(Math.abs(placed.x - expected.x) < 1e-6, `${at}: across`);
          assert.ok(Math.abs(placed.y - expected.y) < 1e-6, `${at}: down`);
          assert.ok(
            Math.abs(placed.zoom - expected.zoom) < 1e-9,
            `${at}: zoom`,
          );
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

  it('puts behind the brow only what stands farther than D_SEE', () => {
    assert.equal(behindHills({ distance: V_NEAR }), false);
    assert.equal(behindHills({ distance: D_SEE }), false);
    assert.equal(behindHills({ distance: D_SEE + 1e-6 }), true);
  });

  for (const { name, camera } of CAMERAS) {
    it(`draws the brow along the D_SEE circle, highest at the middle, on the ${name} camera`, () => {
      const { width, groundTop } = camera;
      assert.ok(Math.abs(browRow(camera, width / 2) - groundTop) < 1e-9);
      assert.equal(browLowest(camera), browRow(camera, width));
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        for (const off of [-0.6, -0.3, 0, 0.2, 0.5]) {
          const { x, y } = standing(view, D_SEE, off);
          assert.ok(Math.abs(y - browRow(camera, x)) < 1e-6, String(off));
        }
      }
      let last = browRow(camera, width / 2);
      for (let x = width / 2; x <= width; x += 5) {
        assert.ok(browRow(camera, x) >= last, 'not lower toward the edge');
        last = browRow(camera, x);
      }
    });

    it(`sinks what stands farther than D_SEE below the brow at its x, with no jump, on the ${name} camera`, () => {
      for (const eye of EYES) {
        const view = viewAt(camera, eye);
        for (const off of [-0.5, 0, 0.3]) {
          const crossing = standing(view, D_SEE, off);
          assert.equal(sunk(view, crossing), crossing);
          const past = sunk(view, standing(view, D_SEE + 1e-6, off));
          assert.ok(Math.abs(past.y - crossing.y) < 1e-3, 'jumps at D_SEE');
          let last = crossing.y;
          for (const distance of [13.5, 15, 20, 40, 400]) {
            const drawn = sunk(view, standing(view, distance, off));
            const where = `${String(distance)} at ${String(off)}`;
            assert.ok(drawn.y > last, `${where}: does not sink as it recedes`);
            assert.ok(buried(view, drawn), `${where}: not buried`);
            last = drawn.y;
          }
          for (const distance of [V_NEAR, 9, D_SEE]) {
            const placed = standing(view, distance, off);
            assert.equal(sunk(view, placed), placed);
            assert.equal(buried(view, placed), false);
          }
        }
      }
    });

    it(`stands no drawn foot above the brow at its x, from any heading, on the ${name} camera`, () => {
      for (const eye of EYES) {
        for (let turn = 0; turn < 36; turn++) {
          const view = viewAt(camera, {
            ...eye,
            heading: (turn / 36) * Math.PI * 2,
          });
          for (let off = -0.7; off <= 0.7; off += 0.05) {
            for (const distance of [3, 8, 12, 13, 13.3, 13.4, 14, 16, 30]) {
              const placed = standing(view, distance, off);
              if (cull(placed) || !onScreen(view, placed, -1)) continue;
              const drawn = sunk(view, placed);
              const brow = browRow(view, drawn.x);
              const where = `turn ${String(turn)}, ${String(distance)} at ${off.toFixed(2)}`;
              assert.ok(drawn.y >= brow - 1e-6, `${where}: above the brow`);
            }
          }
        }
      }
    });
  }

  for (const { name, camera } of CAMERAS) {
    it(`stops drawing a sunk thing once less than SHOWN_LEAST of it shows over the brow, and only then, on the ${name} camera`, () => {
      const view = viewAt(camera, OPENING_EYE);
      for (const off of [0, 0.4]) {
        for (const tall of [0.3, 1, 2]) {
          let gone = false;
          for (let distance = V_NEAR; distance < 400; distance *= 1.01) {
            const placed = sunk(view, standing(view, distance, off));
            const cover = browRow(view, placed.x);
            const height = tall * placed.scale;
            const shows = Math.min(height, cover - (placed.y - height));
            const away = sunkAway(view, placed, height);
            const where = `${String(tall)} tall, ${distance.toFixed(2)} at ${String(off)}`;
            const sinking = distance > D_SEE;
            assert.equal(away, sinking && shows < SHOWN_LEAST * height, where);
            assert.ok(!gone || away, `${where}: comes back`);
            gone = away;
          }
          assert.ok(gone, `${String(tall)} tall: never sinks away`);
        }
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
