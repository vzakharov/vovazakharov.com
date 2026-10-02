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
  bendAt,
  CLUMP_DISTANCE,
  type Eye,
  EYE_HEIGHT,
  type Frame,
  gathered,
  type Ground,
  groundOfPlane,
  OPENING_EYE,
  pinholeOf,
  planeOf,
  planeSeen,
  project,
  scaleAt,
  seen,
  spread,
  unanchored,
  type Viewed,
  viewOf,
} from './ground';
import { MUSHROOM_SPECIES } from './mushroom-genes';
import { maxReach, speciesHeight } from './mushroom-pose';
import { leftAt, openingPan } from './pan';
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
  for (const { name, width, height } of SCREENS) {
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
            viewOf(camera, OPENING_EYE, planeOf(foot), lift),
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
            viewOf(camera, turned, point, 1),
            viewOf(camera, eye, point, 1),
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
          const before = viewOf(camera, eye, point, 0);
          const after = viewOf(camera, stepped, point, 0);
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
          const before = viewOf(camera, eye, point, 0);
          // In front of the eye, far enough for a step to bring it nearer.
          const off = (before.x - pinhole.x) / pinhole.arc;
          const distance = before.ahead * bendAt(pinhole, before.x);
          if (Math.cos(off) <= step / distance) continue;
          const after = viewOf(camera, stepped, point, 0);
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

  for (const { name, width, height } of SCREENS) {
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
              viewOf(camera, OPENING_EYE, moved, 1),
              viewOf(camera, eye, point, 1),
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

  for (const { name, width, height } of SCREENS) {
    it(`finds the ground under every point it shows on the ground, on the ${name} camera`, () => {
      const camera = meadowCamera(width, height);
      for (const eye of EYES) {
        for (const foot of feetOver(MEADOW_FRAME)) {
          const point = planeOf(foot);
          const shown = viewOf(camera, eye, point, 0);
          const under = planeSeen(camera, eye, shown);
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
