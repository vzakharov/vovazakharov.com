import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { capBox } from '../ui/scene/cap-cover';
import { placeIn, placeOf } from '../ui/scene/clump-layout';
import { standingAt } from '../ui/scene/door-sight';
import { groundOf } from '../ui/scene/flower-layout';
import { flowerFeet } from '../ui/scene/flower-plots';
import {
  EDGE_MARGIN,
  meadowCamera,
  meadowFrame,
} from '../ui/scene/meadow-camera';
import { VIEWPORTS, VISITS } from '../ui/scene/viewports';
import { opened, relaidOn } from '../ui/scene/visit-play';
import { type Frame, type Ground, project, scaleAt, seen } from './ground';
import { maxReach } from './mushroom-pose';
import { OPENING_FEET } from './placement';

/** How many steps across and into the distance the frame is walked in. */
const STEPS = 12;

/** The opening feet, and a grid of feet over `frame` from edge to edge. */
function feetOver({ across, near, far }: Frame): Ground[] {
  const steps = Array.from({ length: STEPS + 1 }, (_, step) => step / STEPS);
  return [
    ...OPENING_FEET,
    ...steps.flatMap((down) =>
      steps.map((side) => {
        const z = near + down * (far - near);
        return { x: ((side * 2 - 1) * across) / scaleAt(z), z };
      }),
    ),
  ];
}

/** Each screen as its name and size, and turned. */
const SCREENS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, width, height },
  { name: `${name} turned`, width: height, height: width },
]);

/** How near, in CSS px, two points on the screen count as one. */
const SAME_PX = 1e-6;

describe('seen', () => {
  // A tall phone none of `VIEWPORTS` is, and its turn.
  const screens = [
    ...SCREENS,
    { name: '412×915', width: 412, height: 915 },
    { name: '412×915 turned', width: 915, height: 412 },
  ];
  for (const { name, width, height } of screens) {
    it(`times the clump's size is where the ${name} camera shows a foot from the clump's front foot, fitted or turned into`, () => {
      const [seed = 0] = VISITS;
      const grownTurned = opened(seed, height, width, true);
      const cameras = {
        fitted: meadowCamera(width, height),
        'turned into': relaidOn(grownTurned, seed, width, height).camera,
      };
      for (const [how, camera] of Object.entries(cameras)) {
        const front = project(camera, { x: 0, z: 0 });
        for (const foot of feetOver(meadowFrame({ width, height }))) {
          const shown = project(camera, foot);
          const { x, y } = seen(foot);
          const at = `${how}, foot ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)}`;
          assert.ok(
            Math.abs(shown.x - front.x - x * camera.unit) < SAME_PX,
            `${at}: across`,
          );
          assert.ok(
            Math.abs(front.y - shown.y - y * camera.unit) < SAME_PX,
            `${at}: up`,
          );
        }
      }
    });
  }
});

/**
 * A phone narrower than any of `VIEWPORTS`, whose camera the zoom floor holds
 * while its frame is held at its least across: a cap of the widest genes on
 * the frame's near corners stands past the edge margin there. Every foot
 * still stands inside the margin, and the room check turns away a foot whose
 * cap would not (`roomFor`).
 */
const FLOOR_HELD = { name: '280×600', width: 280, height: 600 };

describe('the frame', () => {
  for (const { name, width, height, held } of [
    ...SCREENS.map((screen) => ({ ...screen, held: false })),
    { ...FLOOR_HELD, held: true },
  ]) {
    it(`stands on a ${name} screen, every ${held ? 'foot' : 'cap'} on it inside the edge margin`, () => {
      const camera = meadowCamera(width, height);
      const frame = meadowFrame({ width, height });
      const past: string[] = [];
      for (const foot of feetOver(frame)) {
        const { x, y, size, splay } = placeOf(camera, foot);
        const { toward, away } = maxReach(splay);
        const [left, right] = splay < 0 ? [toward, away] : [away, toward];
        const at = `foot ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)}`;
        assert.ok(
          y >= camera.groundTop && y <= height,
          `${at}: off the ground`,
        );
        assert.ok(
          x >= EDGE_MARGIN && x <= width - EDGE_MARGIN,
          `${at}: past the edge margin`,
        );
        if (
          x - left * size < EDGE_MARGIN - 1e-9 ||
          x + right * size > width - EDGE_MARGIN + 1e-9
        ) {
          past.push(`${at}: its cap past the edge margin`);
        }
      }
      if (held) assert.notDeepEqual(past, [], 'no longer held at the floor');
      else assert.deepEqual(past, []);
    });
  }
});

/** The visits a meadow is grown in and turned. */
const TURNED_VISITS = VISITS.slice(0, 12);
/** How near a foot read back off a screen counts as the foot, in the clump's size. */
const SAME_GROUND = 1e-9;

/** Whether `a` and `b` are the same foot, but for a float's rounding. */
const same = (a: Ground, b: Ground) =>
  Math.abs(a.x - b.x) < SAME_GROUND && Math.abs(a.z - b.z) < SAME_GROUND;

describe('a turn', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`leaves every mushroom and every flower on its foot on the ground, grown on a ${name} screen`, () => {
      for (const seed of TURNED_VISITS) {
        const stand = opened(seed, width, height, true);
        const turned = relaidOn(stand, seed, height, width);
        const at = `visit ${String(seed)}`;
        for (const { id, foot } of stand.mushrooms) {
          const place = placeIn(turned.mushrooms, { foot });
          assert.ok(place, `${at}: ${id} off the turned screen`);
          assert.ok(
            same(groundOf(turned.camera, place), foot),
            `${at}: ${id} moved`,
          );
        }
        const feet = flowerFeet(stand);
        const moved = flowerFeet({ ...stand, layout: turned });
        assert.equal(moved.length, feet.length, `${at}: a flower lost`);
        for (const [index, foot] of moved.entries()) {
          const own = feet[index];
          assert.ok(
            own && same(foot, own),
            `${at}: flower ${String(index)} moved`,
          );
        }
      }
    });

    it(`keeps every foot a meadow grown on a ${name} screen used in view once turned, every cap inside the edge margin`, () => {
      for (const seed of TURNED_VISITS) {
        const stand = opened(seed, width, height, true);
        const turned = relaidOn(stand, seed, height, width);
        const { camera } = turned;
        const at = `visit ${String(seed)}`;
        for (const mushroom of stand.mushrooms) {
          const place = placeOf(camera, mushroom.foot);
          const cap = capBox(standingAt(place, mushroom));
          assert.ok(
            cap.left >= EDGE_MARGIN - 1e-9 &&
              cap.right <= camera.width - EDGE_MARGIN + 1e-9 &&
              place.y >= camera.groundTop &&
              place.y <= camera.height,
            `${at}: ${mushroom.id} out of view`,
          );
        }
        for (const foot of flowerFeet(stand)) {
          const { x, y } = project(camera, foot);
          assert.ok(
            x >= 0 &&
              x <= camera.width &&
              y >= camera.groundTop &&
              y <= camera.height,
            `${at}: a flower at ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)} out of view`,
          );
        }
      }
    });
  }
});
