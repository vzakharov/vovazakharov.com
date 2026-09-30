import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { sunLight } from '../../model/light';
import { clampLeft } from '../../model/pan';
import { mulberry32 } from '../../model/random';
import { meadowLayout } from './layout';
import { PARALLAX } from './parallax';
import {
  farSkyline,
  farthestSkyline,
  hillBands,
  litRidge,
  nearSkyline,
  seamAt,
} from './skyline';
import { SUN_RAY_REACH } from './sun-layout';
import { VIEWPORTS, VISITS } from './viewports';

/** A simple polygon's area, by the shoelace formula. */
function area(outline: readonly Point[]): number {
  let twice = 0;
  for (const [index, { x, y }] of outline.entries()) {
    const next = outline[(index + 1) % outline.length] ?? { x, y };
    twice += x * next.y - next.x * y;
  }
  return Math.abs(twice) / 2;
}

describe('the hill bands', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`tile each range exactly and never rise above its skyline, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 40)) {
        const layout = meadowLayout(width, height, seed);
        const random = mulberry32(seed);
        for (const line of [
          farthestSkyline(random, layout),
          farSkyline(random, layout),
          nearSkyline(random, layout),
        ]) {
          const floor = layout.groundTop;
          const whole = area([
            ...line,
            { x: line.at(-1)?.x ?? 0, y: floor },
            { x: line[0]?.x ?? 0, y: floor },
          ]);
          const bands = hillBands(line, floor, 16);
          const sum = bands.reduce(
            (total, { outline }) => total + area(outline),
            0,
          );
          assert.ok(Math.abs(sum - whole) < whole * 1e-9 + 1e-6);
          const top = Math.min(...line.map(({ y }) => y));
          for (const { outline } of bands) {
            for (const { y } of outline) assert.ok(y >= top - 1e-9);
          }
          assert.equal(bands[0]?.down, 0);
          assert.equal(bands.at(-1)?.down, 1);
        }
      }
    });
  }
});

describe('the far hills under the sun', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`stay under the sun's rays at every crop, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 40)) {
        const layout = meadowLayout(width, height, seed);
        const { sun, camera } = layout;
        const rays = sun.r * SUN_RAY_REACH;
        const random = mulberry32(seed);
        const lines = [
          farthestSkyline(random, layout),
          farSkyline(random, layout),
        ];
        for (const wanted of [-Infinity, 0.25, 0.5, 0.75, Infinity]) {
          const scroll = clampLeft(camera, wanted * camera.world);
          // Where the far layer has the sun, which stands still on screen.
          const x = sun.x + PARALLAX.far * scroll;
          for (const line of lines) {
            for (let dx = -rays; dx <= rays; dx += rays / 16) {
              const under = sun.y + Math.sqrt(rays ** 2 - dx ** 2);
              assert.ok(
                seamAt(line, x + dx) >= under - 1e-6,
                `visit ${String(seed)}: a far hill on the rays`,
              );
            }
          }
        }
      }
    });
  }
});

describe('the lit ridge', () => {
  it('rims only the slopes that face the sun', () => {
    const layout = meadowLayout(1180, 820, 3);
    const light = sunLight(layout);
    // The sun stands to the right on a tablet: a rising slope faces away,
    // a falling one toward it.
    assert.ok(light.toward.x > 0);
    const rising = [
      { x: 0, y: 100 },
      { x: 10, y: 90 },
    ];
    const falling = [
      { x: 0, y: 90 },
      { x: 10, y: 100 },
    ];
    assert.equal(litRidge(rising, light, 4).length, 0);
    assert.equal(litRidge(falling, light, 4).length, 1);
  });
});
