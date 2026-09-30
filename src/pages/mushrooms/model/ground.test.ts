import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { placeIn, placeOf } from '../ui/scene/clump-layout';
import { groundOf } from '../ui/scene/flower-layout';
import { flowerFeet } from '../ui/scene/flower-plots';
import {
  EDGE_MARGIN,
  MEADOW_FRAME,
  meadowCamera,
  WORLD_ACROSS,
} from '../ui/scene/meadow-camera';
import { FLOOR_HELD, VIEWPORTS, VISITS } from '../ui/scene/viewports';
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
        for (const foot of feetOver(MEADOW_FRAME)) {
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

describe('the world', () => {
  const screens = [
    ...SCREENS,
    { name: FLOOR_HELD[0], width: FLOOR_HELD[1], height: FLOOR_HELD[2] },
  ];
  for (const { name, width, height } of screens) {
    it(`stands on a ${name} screen's world, every cap on its frame inside the world's edge margin`, () => {
      const camera = meadowCamera(width, height);
      const past: string[] = [];
      for (const foot of feetOver(MEADOW_FRAME)) {
        const { x, y, size, splay } = placeOf(camera, foot);
        const { toward, away } = maxReach(splay);
        const [left, right] = splay < 0 ? [toward, away] : [away, toward];
        const at = `foot ${foot.x.toFixed(2)}, ${foot.z.toFixed(2)}`;
        assert.ok(
          y >= camera.groundTop && y <= height,
          `${at}: off the ground`,
        );
        if (
          x - left * size < EDGE_MARGIN - 1e-9 ||
          x + right * size > camera.world - EDGE_MARGIN + 1e-9
        ) {
          past.push(`${at}: its cap past the edge margin`);
        }
      }
      assert.deepEqual(past, []);
    });
  }

  it('is as wide on the ground on every screen, its middle the ground’s', () => {
    const across = screens.map(({ width, height }) => {
      const { world, midline, unit } = meadowCamera(width, height);
      assert.equal(midline, world / 2);
      return (world - 2 * EDGE_MARGIN) / unit;
    });
    for (const each of across) {
      assert.ok(Math.abs(each - (across[0] ?? 0)) < 1e-9, String(each));
    }
  });

  it('reaches twice as far across as a tablet held sideways shows', () => {
    const [, width, height] = VIEWPORTS[0];
    const { world, unit } = meadowCamera(width, height);
    const beyond = (world / 2 - EDGE_MARGIN) / unit - WORLD_ACROSS;
    const shown = (width / 2 - EDGE_MARGIN) / unit - beyond;
    assert.ok(Math.abs(2 * shown - WORLD_ACROSS) < 1e-3, String(2 * shown));
  });
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
    it(`changes the zoom and the crop and leaves every mushroom and every flower on its foot on the ground, grown on a ${name} screen`, () => {
      for (const seed of TURNED_VISITS) {
        const stand = opened(seed, width, height, true);
        const turned = relaidOn(stand, seed, height, width);
        const at = `visit ${String(seed)}`;
        for (const { id, foot } of stand.mushrooms) {
          const place = placeIn(turned.mushrooms, { foot });
          assert.ok(place, `${at}: ${id} off the turned world`);
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

    it(`zooms a meadow grown on a ${name} screen as the turned screen composes it, whatever it used`, () => {
      for (const seed of TURNED_VISITS) {
        const stand = opened(seed, width, height, true);
        const turned = relaidOn(stand, seed, height, width);
        assert.deepEqual(turned.camera, meadowCamera(height, width));
        const bare = relaidOn(
          opened(seed, width, height, false),
          seed,
          height,
          width,
        );
        assert.deepEqual(turned.flowers, bare.flowers, `visit ${String(seed)}`);
      }
    });
  }
});
