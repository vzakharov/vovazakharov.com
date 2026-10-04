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
import {
  anchored,
  CLUMP_DISTANCE,
  type Frame,
  gathered,
  type Ground,
  groundOfPlane,
  OPENING_EYE,
  planeOf,
  project,
  scaleAt,
  seen,
  spread,
  unanchored,
} from './ground';
import { feetOver, gridOver } from './ground-grid';
import { maxReach } from './mushroom-pose';
import { type Footed, grownOn, OPENING_FOOTING } from './placement';

/** `feetOver` as mushrooms stand on them, grown at the opening eye. */
const footedOver = (frame: Frame): Footed[] => [
  ...OPENING_FOOTING,
  ...gridOver(frame).map((ground) => grownOn(OPENING_EYE, ground)),
];

/** Each screen as its name and size, and turned. */
const SCREENS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, width, height },
  { name: `${name} turned`, width: height, height: width },
]);

/** How near two points on the plane count as one, in the clump's size. */
const SAME_VIEW = 1e-9;

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
      for (const footed of footedOver(MEADOW_FRAME)) {
        const foot = groundOfPlane(footed.foot);
        const { x, y, size, splay } = placeOf(camera, footed);
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

describe('the lens', () => {
  it('spreads every point round the opening eye and gathers it back, its distance kept', () => {
    for (const foot of feetOver(MEADOW_FRAME)) {
      const { x, z } = foot;
      const pinholed = { x, y: CLUMP_DISTANCE / scaleAt(z) };
      const plane = spread(pinholed);
      const back = gathered(plane);
      const at = `foot ${JSON.stringify(foot)}`;
      assert.ok(
        Math.abs(
          Math.hypot(plane.x, plane.y) - Math.hypot(pinholed.x, pinholed.y),
        ) < SAME_VIEW,
        `${at}: distance`,
      );
      assert.ok(
        Math.abs(back.x - pinholed.x) < SAME_VIEW &&
          Math.abs(back.y - pinholed.y) < SAME_VIEW,
        `${at}: back`,
      );
    }
  });

  it('lays every foot it stands on the plane back out on the same ground', () => {
    for (const foot of feetOver(MEADOW_FRAME)) {
      const back = groundOfPlane(planeOf(foot));
      assert.ok(
        Math.abs(back.x - foot.x) < 1e-9 && Math.abs(back.z - foot.z) < 1e-9,
        `foot ${JSON.stringify(foot)}: ${JSON.stringify(back)}`,
      );
    }
  });

  it('anchors at the opening eye on the point itself, bit for bit', () => {
    for (const foot of feetOver(MEADOW_FRAME)) {
      const point = planeOf(foot);
      assert.deepEqual(anchored(OPENING_EYE, point), point);
      assert.deepEqual(unanchored(OPENING_EYE, point), point);
    }
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
        for (const mushroom of stand.mushrooms) {
          const { id, foot } = mushroom;
          const place = placeIn(turned.mushrooms, mushroom);
          assert.ok(place, `${at}: ${id} off the turned world`);
          assert.ok(
            same(groundOf(turned.camera, place), groundOfPlane(foot)),
            `${at}: ${id} moved`,
          );
        }
        const feet = flowerFeet(stand);
        const moved = flowerFeet({ ...stand, layout: turned });
        assert.equal(moved.length, feet.length, `${at}: a flower lost`);
        for (const [index, foot] of moved.entries()) {
          const own = feet[index];
          assert.ok(
            own && same(groundOfPlane(foot), groundOfPlane(own)),
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
