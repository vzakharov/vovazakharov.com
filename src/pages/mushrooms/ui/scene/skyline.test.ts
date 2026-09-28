import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { sunLight } from '../../model/light';
import { mulberry32 } from '../../model/random';
import { meadowLayout } from './layout';
import {
  farSkyline,
  farthestSkyline,
  hillBands,
  litRidge,
  nearSkyline,
} from './skyline';
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
            { x: width, y: floor },
            { x: 0, y: floor },
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
