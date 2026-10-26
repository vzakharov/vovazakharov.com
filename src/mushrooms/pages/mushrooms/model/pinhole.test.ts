import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MEADOW_FRAME, meadowCamera } from '../ui/scene/meadow-camera';
import { EITHER_WAY, VIEWPORTS } from '../ui/scene/viewports';
import { walking } from './eye-height';
import {
  anchored,
  type Eye,
  EYE_HEIGHT,
  OPENING_EYE,
  planeOf,
  project,
  unanchored,
} from './ground';
import { feetOver } from './ground-grid';
import { MUSHROOM_SPECIES } from './mushroom-genes';
import { speciesHeight } from './mushroom-pose';
import { leftAt, openingPan } from './pan';
import { bendAt, pinholeOf, planeSeen, type Viewed, viewOf } from './pinhole';

/** How near two views count as one, in px and in the clump's size. */
const SAME_VIEW = 1e-9;

/** Heights over the ground, in the clump's size, up to the tallest mushroom and past it. */
const HEIGHTS = [
  0,
  0.3,
  Math.max(...MUSHROOM_SPECIES.map((species) => speciesHeight(species))),
  EYE_HEIGHT / 2,
];

/** Where `a` and `b` differ, by name, past `SAME_VIEW` relative to their size. */
function apart(a: Viewed, b: Viewed): string[] {
  return (['x', 'y', 'scale', 'ahead'] as const).filter(
    (key) =>
      Math.abs(a[key] - b[key]) > SAME_VIEW * Math.max(1, Math.abs(b[key])),
  );
}

/** Eyes about the glade, each looking its own way. */
const EYES: Eye[] = [
  OPENING_EYE,
  { x: 0, y: 3, heading: 0 },
  { x: -2.5, y: 1, heading: 0.6 },
  { x: 3, y: -2, heading: -1.1 },
];

describe('the eye', () => {
  for (const [name, width, height] of EITHER_WAY) {
    const camera = meadowCamera(width, height);
    const left = leftAt(openingPan(camera), 0);

    it(`at the opening shows every foot, at every height, at the azimuth the ${name} camera's opening crop sees it at, bent`, () => {
      const pinhole = pinholeOf(camera);
      const past: string[] = [];
      for (const foot of feetOver(MEADOW_FRAME)) {
        for (const lift of HEIGHTS) {
          const shown = project(camera, foot);
          const azimuth = Math.atan(
            (shown.x - left - pinhole.x) / pinhole.focal,
          );
          const bend = Math.hypot(1, azimuth);
          const scale = shown.scale * Math.cos(azimuth) * bend;
          const expected = {
            x: pinhole.x + pinhole.focal * azimuth,
            y: pinhole.y + (EYE_HEIGHT - lift) * scale,
            scale,
            ahead: Math.hypot(planeOf(foot).x, planeOf(foot).y) / bend,
          };
          const off = apart(
            viewOf(walking(camera), OPENING_EYE, planeOf(foot), lift),
            expected,
          );
          if (off.length > 0) {
            past.push(
              `foot ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)} at ${String(lift)}: ${off.join(', ')}`,
            );
          }
        }
      }
      assert.deepEqual(past, []);
    });

    it(`comes back to every point after a full turn, on the ${name} camera`, () => {
      for (const eye of EYES) {
        const turned = { ...eye, heading: eye.heading + 2 * Math.PI };
        for (const foot of feetOver(MEADOW_FRAME)) {
          const point = planeOf(foot);
          const off = apart(
            viewOf(walking(camera), turned, point, 1),
            viewOf(walking(camera), eye, point, 1),
          );
          assert.deepEqual(
            off,
            [],
            `eye ${JSON.stringify(eye)}, foot ${JSON.stringify(foot)}`,
          );
        }
      }
    });

    it(`scales a point straight ahead by its distance over the nearer one after a step ahead, on the ${name} camera`, () => {
      const step = 1.5;
      const { x: middle } = pinholeOf(camera);
      for (const eye of EYES) {
        const stepped = {
          ...eye,
          x: eye.x + step * Math.sin(eye.heading),
          y: eye.y + step * Math.cos(eye.heading),
        };
        for (const distance of [step + 1, 4, 9, 20]) {
          const point = {
            x: eye.x + distance * Math.sin(eye.heading),
            y: eye.y + distance * Math.cos(eye.heading),
          };
          const before = viewOf(walking(camera), eye, point, 0);
          const after = viewOf(walking(camera), stepped, point, 0);
          const k = distance / (distance - step);
          const at = `eye ${JSON.stringify(eye)}, ${String(distance)} ahead`;
          assert.ok(Math.abs(before.x - middle) < 1e-6, `${at}: across`);
          assert.ok(Math.abs(after.x - middle) < 1e-6, `${at}: across after`);
          assert.ok(
            Math.abs(after.ahead - (before.ahead - step)) < SAME_VIEW,
            `${at}: ahead`,
          );
          assert.ok(
            Math.abs(after.scale - before.scale * k) < SAME_VIEW * after.scale,
            `${at}: scale`,
          );
        }
      }
    });

    it(`after a step ahead, on the ${name} camera, draws every point in front of the eye bigger and no nearer the screen's middle`, () => {
      const step = 0.5;
      const pinhole = pinholeOf(camera);
      for (const eye of EYES) {
        const stepped = {
          ...eye,
          x: eye.x + step * Math.sin(eye.heading),
          y: eye.y + step * Math.cos(eye.heading),
        };
        for (const foot of feetOver(MEADOW_FRAME)) {
          const point = planeOf(foot);
          const before = viewOf(walking(camera), eye, point, 0);
          // In front of the eye, far enough for a step to bring it nearer.
          const off = (before.x - pinhole.x) / pinhole.arc;
          const distance = before.ahead * bendAt(pinhole, before.x);
          if (Math.cos(off) <= step / distance) continue;
          const after = viewOf(walking(camera), stepped, point, 0);
          const at = `eye ${JSON.stringify(eye)}, foot ${JSON.stringify(foot)}`;
          assert.ok(after.scale > before.scale, `${at}: scale`);
          assert.ok(
            Math.abs(after.x - pinhole.x) >=
              Math.abs(before.x - pinhole.x) - 1e-9,
            `${at}: across`,
          );
        }
      }
    });
  }
});

describe('the lens', () => {
  it('turns once round in four screens of a tablet held sideways', () => {
    const [, width, height] = VIEWPORTS[0];
    const { arc } = pinholeOf(meadowCamera(width, height));
    assert.ok(Math.abs((2 * Math.PI * arc) / width - 4) < 1e-3);
  });

  for (const [name, width, height] of EITHER_WAY) {
    it(`anchors every point where the opening eye sees it as the eye does, and back, on the ${name} camera`, () => {
      const camera = meadowCamera(width, height);
      for (const eye of EYES) {
        for (const foot of feetOver(MEADOW_FRAME)) {
          const point = planeOf(foot);
          const moved = anchored(eye, point);
          const back = unanchored(eye, moved);
          const at = `eye ${JSON.stringify(eye)}, foot ${JSON.stringify(foot)}`;
          assert.deepEqual(
            apart(
              viewOf(walking(camera), OPENING_EYE, moved, 1),
              viewOf(walking(camera), eye, point, 1),
            ),
            [],
            at,
          );
          assert.ok(
            Math.hypot(back.x - point.x, back.y - point.y) < 1e-9,
            `${at}: back`,
          );
        }
      }
    });
  }

  for (const [name, width, height] of EITHER_WAY) {
    it(`finds the ground under every point it shows on the ground, on the ${name} camera`, () => {
      const camera = meadowCamera(width, height);
      for (const eye of EYES) {
        for (const foot of feetOver(MEADOW_FRAME)) {
          const point = planeOf(foot);
          const shown = viewOf(walking(camera), eye, point, 0);
          const under = planeSeen(walking(camera), eye, shown);
          const at = `eye ${JSON.stringify(eye)}, foot ${JSON.stringify(foot)}`;
          assert.ok(
            under !== undefined &&
              Math.hypot(under.x - point.x, under.y - point.y) < 1e-9,
            at,
          );
        }
      }
    });
  }
});
