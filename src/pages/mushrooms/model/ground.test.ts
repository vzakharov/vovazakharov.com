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
import { type Frame, type Ground, project, scaleAt } from './ground';
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

/**
 * The screens whose camera is held at the zoom floor while their frame is
 * held at its least across: the small phone upright, 320 px wide, where a
 * cap of the widest genes on the frame's near corners would stand 20 px past
 * the edge margin. Every foot there still stands inside the margin, and the
 * room check turns away a foot whose cap would not (`roomFor`).
 */
const FLOOR_HELD: ReadonlySet<string> = new Set(['small phone']);

describe('the frame', () => {
  for (const { name, width, height } of SCREENS) {
    const held = FLOOR_HELD.has(name);
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
