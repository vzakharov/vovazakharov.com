import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Circle, Point } from '../../model/geometry';
import { OPENING_EYE, pinholeOf } from '../../model/ground';
import { mulberry32 } from '../../model/random';
import { clumpCrowns, everyPlace } from './clump-layout';
import { meadowLayout } from './layout';
import { azimuthAt, crestAcross, crestAt, screenAt } from './panorama';
import { PICK_CLEAR } from './picker-rows';
import { flowerPicker, shownOverPickers, standingControls } from './sky-layout';
import {
  farSkyline,
  farthestSkyline,
  HILL_STEPS,
  nearSkyline,
} from './skyline';
import {
  raysClear,
  SUN_GLOW_REACH,
  SUN_RAY_REACH,
  WASH_FOOT_CLEAR,
} from './sun-layout';
import { tapReach } from './tap-reach';
import { browRow, viewAt } from './view';
import { VIEWPORTS, VISITS } from './viewports';

/** How many points across a disc its showing share is measured at. */
const SUN_GRID = 40;

/**
 * The share of `disc` above `skyline`, a line of points left to right, of
 * the part of the disc over the line's run: past either end nothing is
 * drawn to hide it.
 */
function shownAbove(disc: Circle, skyline: readonly Point[]): number {
  const [first, last] = [skyline[0]?.x ?? 0, skyline.at(-1)?.x ?? 0];
  const lineAt = (x: number) => {
    const next = skyline.findIndex((point) => point.x >= x);
    const right = skyline[Math.max(next, 1)] ?? { x, y: Infinity };
    const left = skyline[Math.max(next, 1) - 1] ?? right;
    const t = right.x === left.x ? 0 : (x - left.x) / (right.x - left.x);
    return left.y + (right.y - left.y) * t;
  };
  let inside = 0;
  let shown = 0;
  for (let row = 0; row <= SUN_GRID; row++) {
    for (let column = 0; column <= SUN_GRID; column++) {
      const x = disc.x + disc.r * ((2 * column) / SUN_GRID - 1);
      const y = disc.y + disc.r * ((2 * row) / SUN_GRID - 1);
      if (Math.hypot(x - disc.x, y - disc.y) > disc.r) continue;
      if (x < first || x > last) continue;
      inside++;
      if (y < lineAt(x)) shown++;
    }
  }
  return shown / inside;
}

/** Headings round the whole circle, an eighteenth of a turn apart. */
const HEADINGS = Array.from(
  { length: 18 },
  (_, index) => (index * Math.PI * 2) / 18,
);

const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;

/** Whether `button`'s reach keeps `PICK_CLEAR` off every one of `others`'. */
const clearOf = (button: Circle, others: readonly Circle[]) =>
  others.every((other) =>
    apart(
      { ...button, r: tapReach(button.r) },
      { ...other, r: tapReach(other.r) + PICK_CLEAR },
    ),
  );

/** Every screen from 300 to 2600 px wide and 300 to 1600 px tall, this many px apart each way. */
const GRID_STEP = 20;

describe('the sun on every screen size', () => {
  it('stands whole above the horizon, its glow on the screen and its rays off every crown and control', () => {
    for (let width = 300; width <= 2600; width += GRID_STEP) {
      for (let height = 300; height <= 1600; height += GRID_STEP) {
        const layout = meadowLayout(width, height, 1);
        const { sun, horizon, camera, picker, housePicker } = layout;
        const screen = `${String(width)}×${String(height)}`;
        const glow = sun.r * SUN_GLOW_REACH;
        assert.ok(sun.y + sun.r <= horizon + 1e-9, `${screen}: the horizon`);
        assert.ok(
          sun.x + glow <= width + 1e-9 && sun.y - glow >= -1e-9,
          `${screen}: the glow off the screen`,
        );
        for (const [index, crown] of clumpCrowns(camera).entries()) {
          assert.ok(
            raysClear(sun, crown),
            `${screen}: the rays on crown ${String(index)}`,
          );
        }
        const rays = { ...sun, r: sun.r * SUN_RAY_REACH };
        for (const control of [
          ...standingControls(layout),
          ...picker,
          ...housePicker,
        ]) {
          assert.ok(
            apart({ ...control, r: tapReach(control.r) }, rays),
            `${screen}: a control on the sun`,
          );
        }
      }
    }
  });

  it("stands the flower picker's cross on the screen, off the sun's rays and clear of every button shown with it", () => {
    for (let width = 300; width <= 2600; width += GRID_STEP) {
      for (let height = 300; height <= 1600; height += GRID_STEP) {
        const layout = meadowLayout(width, height, 1);
        const { sun } = layout;
        const { colours, cross } = flowerPicker(layout);
        const screen = `${String(width)}×${String(height)}`;
        const touch = { ...cross, r: tapReach(cross.r) };
        assert.ok(
          touch.x - touch.r >= -1e-9 &&
            touch.x + touch.r <= width + 1e-9 &&
            touch.y - touch.r >= -1e-9,
          `${screen}: the cross off the screen`,
        );
        assert.ok(
          apart(touch, { ...sun, r: sun.r * SUN_RAY_REACH }),
          `${screen}: the cross on the sun`,
        );
        // The cross keeps clear of the buttons wherever its colours do: on
        // the few screens whose colours stand on an insect's button, no spot
        // beside them is clear of everything.
        const shown = shownOverPickers(layout);
        if (!colours.every((colour) => clearOf(colour, shown))) continue;
        assert.ok(
          clearOf(cross, [...colours, ...shown]),
          `${screen}: the cross on a button`,
        );
      }
    }
  });
});

describe('the sun', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`stands whole in the sky, clear of both hill ranges and every control, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 200)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, horizon, picker, housePicker, camera } = layout;
        const rays = { ...sun, r: sun.r * SUN_RAY_REACH };
        assert.ok(
          sun.y + sun.r <= horizon + 1e-9,
          `visit ${String(seed)}: the disc below the horizon`,
        );
        const crests = [farthestSkyline, farSkyline].map((skyline) =>
          skyline(mulberry32(seed), layout),
        );
        const near = nearSkyline(mulberry32(seed), layout);
        for (const heading of HEADINGS) {
          const view = viewAt(camera, { ...OPENING_EYE, heading });
          const x = screenAt(view, azimuthAt(camera, sun.x));
          // Only a sun whose rays reach onto the screen meets the hills drawn across it.
          if (x + rays.r < 0 || x - rays.r > width) continue;
          const at = `visit ${String(seed)}, heading ${heading.toFixed(2)}`;
          for (const crest of crests) {
            assert.equal(
              shownAbove(
                { ...rays, x },
                crestAcross(crest, view, HILL_STEPS, rays.r),
              ),
              1,
              `${at}: a far hill on the rays`,
            );
          }
          assert.equal(
            shownAbove(
              { ...sun, x },
              crestAcross(near, view, HILL_STEPS, sun.r),
            ),
            1,
            `${at}: a near hill on the disc`,
          );
        }
        const glow = sun.r * SUN_GLOW_REACH;
        assert.ok(sun.x + glow <= width + 1e-9 && sun.y - glow >= -1e-9);
        for (const control of [
          ...standingControls(layout),
          ...picker,
          ...housePicker,
        ]) {
          assert.ok(
            apart({ ...control, r: tapReach(control.r) }, rays),
            `visit ${String(seed)}: a control on the sun`,
          );
        }
      }
    });

    it(`parts the far hills under the sun with no level run, above where the sky ends, from every heading, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 200)) {
        const layout = meadowLayout(width, height, seed);
        const crest = farSkyline(mulberry32(seed), layout);
        for (const heading of HEADINGS) {
          const view = viewAt(layout.camera, { ...OPENING_EYE, heading });
          const line = crestAcross(crest, view, HILL_STEPS);
          const at = `visit ${String(seed)}, heading ${heading.toFixed(2)}`;
          for (const [index, point] of line.slice(1).entries()) {
            const before = line[index] ?? point;
            // Two samples may straddle a ripple of the rolling crest at one
            // height; a level run stays at it between them too.
            const between = crestAt(crest, view, (before.x + point.x) / 2);
            assert.ok(
              Math.abs(point.y - before.y) > 1e-6 ||
                Math.abs(between - point.y) > 1e-6,
              `${at}: level at x ${point.x.toFixed(0)}`,
            );
            assert.ok(point.y < layout.nearHills, `${at}: sky`);
          }
        }
      }
    });

    it(`keeps the wash above the brow, short of the farthest foot's clearance, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 20)) {
        const layout = meadowLayout(width, height, seed);
        const { camera, sun, mushrooms, wash } = layout;
        const outer = Math.max(...wash);
        // A place's size shrinks toward the horizon in step with its foot's
        // height above it, so the farthest foot the eye sees, on the brow, is
        // each place's size scaled to the brow's row.
        const horizon = pinholeOf(mushrooms.camera).y;
        const farthest = Math.max(
          ...everyPlace(mushrooms).map(
            ({ y, size }) =>
              (size * (camera.groundTop - horizon)) / (y - horizon),
          ),
        );
        const clear = farthest * WASH_FOOT_CLEAR;
        for (let step = 0; step <= 40; step++) {
          const x = sun.x + outer * (step / 20 - 1);
          const lowest =
            sun.y + Math.sqrt(Math.max(0, outer ** 2 - (x - sun.x) ** 2));
          assert.ok(
            lowest <= browRow(camera, x) - clear + 1e-6,
            `visit ${String(seed)}: the wash ${(lowest - browRow(camera, x) + clear).toFixed(1)} px too low at x ${x.toFixed(0)}`,
          );
        }
      }
    });

    it(`washes the land past the sun's rays and never over a mushroom's foot, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 20)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, mushrooms, wash } = layout;
        const outer = Math.max(...wash);
        assert.ok(outer > sun.r * SUN_RAY_REACH, `visit ${String(seed)}`);
        // Every place at the extremes: its foot, and some ground round it.
        for (const [index, { x, y, size }] of everyPlace(mushrooms).entries()) {
          const clear = Math.hypot(x - sun.x, y - sun.y) - outer;
          assert.ok(
            clear >= size * 0.4,
            `visit ${String(seed)}: place ${String(index)}'s foot ${clear.toFixed(0)} px outside the wash`,
          );
        }
      }
    });
  }
});
