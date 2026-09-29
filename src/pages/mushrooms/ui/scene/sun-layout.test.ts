import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Circle, Point } from '../../model/geometry';
import { mulberry32 } from '../../model/random';
import { meadowLayout } from './layout';
import { standingControls, tapReach } from './sky-layout';
import { farSkyline, farthestSkyline, nearSkyline } from './skyline';
import { SUN_GLOW_REACH, SUN_RAY_REACH, washRings } from './sun-layout';
import { VIEWPORTS, VISITS } from './viewports';

/** How many points across a disc its showing share is measured at. */
const SUN_GRID = 40;

/** The share of `disc` above `skyline`, a line of points left to right. */
function shownAbove(disc: Circle, skyline: readonly Point[]): number {
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
      inside++;
      if (y < lineAt(x)) shown++;
    }
  }
  return shown / inside;
}

const apart = (a: Circle, b: Circle) =>
  Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r;

describe('the sun', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`stands whole in the sky, clear of both hill ranges and every control, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 200)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, horizon, picker, housePicker } = layout;
        const rays = { ...sun, r: sun.r * SUN_RAY_REACH };
        assert.ok(
          sun.y + sun.r <= horizon + 1e-9,
          `visit ${String(seed)}: the disc below the horizon`,
        );
        for (const skyline of [farthestSkyline, farSkyline]) {
          assert.equal(
            shownAbove(rays, skyline(mulberry32(seed), layout)),
            1,
            `visit ${String(seed)}: a far hill on the rays`,
          );
        }
        const near = nearSkyline(mulberry32(seed), layout);
        assert.equal(
          shownAbove(sun, near),
          1,
          `visit ${String(seed)}: a near hill on the disc`,
        );
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

    it(`parts the far hills under the sun with no level run, above where the sky ends, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 200)) {
        const layout = meadowLayout(width, height, seed);
        const line = farSkyline(mulberry32(seed), layout);
        for (const [index, point] of line.slice(1).entries()) {
          const before = line[index] ?? point;
          assert.ok(
            Math.abs(point.y - before.y) > 1e-6,
            `visit ${String(seed)}: level at x ${point.x.toFixed(0)}`,
          );
          assert.ok(point.y < layout.nearHills, `visit ${String(seed)}: sky`);
        }
      }
    });

    it(`washes the land past the sun's rays and never over a mushroom's foot, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 20)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, mushrooms } = layout;
        const outer = Math.max(...washRings(layout));
        assert.ok(outer > sun.r * SUN_RAY_REACH, `visit ${String(seed)}`);
        // Every slot, taken or not: its foot, and some ground round it.
        for (const [slot, places] of mushrooms.entries()) {
          for (const { x, y, size } of Object.values(places)) {
            const clear = Math.hypot(x - sun.x, y - sun.y) - outer;
            assert.ok(
              clear >= size * 0.4,
              `visit ${String(seed)}: slot ${String(slot)}'s foot ${clear.toFixed(0)} px outside the wash`,
            );
          }
        }
      }
    });
  }
});
