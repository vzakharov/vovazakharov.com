import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mulberry32 } from '../../model/random';
import {
  GROUND_STOPS,
  groundAt,
  litSkyAt,
  RANGES,
  skyAt,
  skyGrid,
} from './backdrop-tones';
import { channels, contrast, luminance, mix, toHsv } from './colour';
import { tuftColours } from './grass';
import { type MeadowLayout, meadowLayout } from './layout';
import { PALETTE } from './palette';
import {
  farSkyline,
  farthestSkyline,
  nearSkyline,
  seamAt,
} from './skyline';
import { SUN_RAY_REACH } from './sun-layout';
import { VIEWPORTS, VISITS } from './viewports';

const rgb = (colour: number) => {
  const { r, g, b } = channels(colour);
  return [r, g, b] as const;
};

/** The most any one channel of `a` and `b` differs by, in 8-bit levels. */
const levels = (a: number, b: number) => {
  const [p, q] = [rgb(a), rgb(b)];
  return Math.max(
    ...p.map((value, index) => Math.abs(value - (q[index] ?? 0))),
  );
};

/** How far a tuft's most distinct blade stands from the ground under it, in RGB. */
function standOut(down: number): number {
  const ground = rgb(groundAt(down));
  return Math.max(
    ...Object.values(tuftColours(down)).map((colour) =>
      Math.hypot(
        ...rgb(colour).map((value, index) => value - (ground[index] ?? 0)),
      ),
    ),
  );
}

/** HSL saturation and lightness, 0 to 1. */
function saturationAndLightness(colour: number): [number, number] {
  const values = rgb(colour).map((value) => value / 255);
  const [high, low] = [Math.max(...values), Math.min(...values)];
  const lightness = (high + low) / 2;
  const span = high - low;
  return [span === 0 ? 0 : span / (1 - Math.abs(2 * lightness - 1)), lightness];
}

/** How much the sun's light shifts the sky at `x`, `y`, in 8-bit levels. */
const shiftAt = (layout: MeadowLayout, x: number, y: number) =>
  levels(litSkyAt(layout, x, y), skyAt(y / layout.nearHills));

/** Where the sky shows past the sun's rays, above all three ranges at the leftmost crop, `step` px apart, for `seed`'s hills. */
function openSky(layout: MeadowLayout, seed: number, step: number) {
  const { width, sun } = layout;
  const lines = [farthestSkyline, farSkyline, nearSkyline].map((skyline) =>
    skyline(mulberry32(seed), layout),
  );
  const top = (x: number) =>
    Math.min(
      // Each layer as the crop at the world's left end shows it, where
      // every layer's x is the screen's.
      ...lines.map((line) => seamAt(line, x)),
    );
  const points: Array<[number, number]> = [];
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < top(x); y += step) {
      if (Math.hypot(x - sun.x, y - sun.y) >= sun.r * SUN_RAY_REACH)
        points.push([x, y]);
    }
  }
  return points;
}

/**
 * `turns` lines of points a pixel apart, from the sun's rays out to the sky's
 * edge, or `past` it to as far as the screen's longer side.
 */
function raysOut(
  layout: MeadowLayout,
  turns: number,
  past = false,
): Array<Array<[number, number]>> {
  const { width, height, nearHills, sun } = layout;
  return Array.from({ length: turns }, (_, turn) => {
    const angle = (turn / turns) * Math.PI * 2;
    const line: Array<[number, number]> = [];
    for (let away = sun.r * SUN_RAY_REACH; ; away += 1) {
      const [x, y] = [
        sun.x + Math.cos(angle) * away,
        sun.y + Math.sin(angle) * away,
      ];
      const off = x < 0 || y < 0 || x > width || y > nearHills;
      if (past ? away > Math.max(width, height) : off) return line;
      line.push([x, y]);
    }
  });
}

const increasing = (values: readonly number[]) =>
  values.every(
    (value, index) => index === 0 || value > (values[index - 1] ?? 0),
  );

/** The most of the open sky the sun's light may shift by 8 levels or more. */
const HALO_COVER = 0.4;

describe('the backdrop', () => {
  it('has a sky warm at the horizon and cool, bright blue at the top', () => {
    const low = channels(PALETTE.skyLow);
    const top = channels(PALETTE.skyTop);
    assert.ok(low.r - low.b > 0);
    assert.ok(top.b - top.r > 60);
    assert.ok(toHsv(PALETTE.skyTop).v >= 0.85);
  });

  it('gains contrast against the sky and saturation from the farthest range to the front of the ground', () => {
    const depths = [
      RANGES.farthest.lit,
      RANGES.far.lit,
      RANGES.near.lit,
      groundAt(1),
    ];
    assert.ok(increasing(depths.map((c) => contrast(c, PALETTE.skyLow))));
    assert.ok(increasing(depths.map((c) => toHsv(c).s)));
  });

  it('pales every range toward its foot', () => {
    for (const { lit, foot } of Object.values(RANGES)) {
      assert.ok(luminance(foot) > luminance(lit));
    }
  });

  it('opens the ground on the near range’s foot and never goes darker than the deep ground', () => {
    assert.equal(groundAt(0), RANGES.near.foot);
    assert.equal(groundAt(1), PALETTE.groundDeep);
    for (const [down] of GROUND_STOPS) {
      assert.ok(luminance(groundAt(down)) >= luminance(PALETTE.groundDeep));
    }
    for (const deep of [true, false]) {
      const mottle = mix(
        PALETTE.ground,
        deep ? PALETTE.groundDeep : PALETTE.groundLit,
        0.3,
      );
      assert.ok(luminance(mottle) >= luminance(PALETTE.groundDeep));
    }
  });

  it('is darker under the flowers’ front row than under their back row', () => {
    assert.ok(luminance(groundAt(0.96)) < luminance(groundAt(0.12)));
  });

  it('stands a tuft at the front out from the ground under it more than any at the back', () => {
    const steps = Array.from({ length: 21 }, (_, index) => index / 20);
    const back = steps
      .filter((down) => down <= 0.25)
      .map((down) => standOut(down));
    const front = steps
      .filter((down) => down >= 0.6)
      .map((down) => standOut(down));
    assert.ok(Math.max(...back) < Math.min(...front));
  });

  for (const [name, width, height] of VIEWPORTS) {
    it(`has no grey in the sky, round the sun or anywhere, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      const { horizon, sun } = layout;
      for (let y = 0; y < horizon; y += 6) {
        for (let x = 0; x < width; x += 6) {
          if (Math.hypot(x - sun.x, y - sun.y) < sun.r * SUN_RAY_REACH)
            continue;
          const [chroma, lightness] = saturationAndLightness(
            litSkyAt(layout, x, y),
          );
          // Clearly coloured, or so light it reads as white.
          assert.ok(
            chroma >= 0.3 || lightness >= 0.88,
            `grey at ${x}, ${y}: ${chroma.toFixed(2)}, ${lightness.toFixed(2)}`,
          );
        }
      }
    });

    it(`is warm just past the sun's rays, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      const { sun } = layout;
      for (let turn = 0; turn < 16; turn++) {
        const angle = (turn / 16) * Math.PI * 2;
        const reach = sun.r * (SUN_RAY_REACH + 0.2);
        const { r, b } = channels(
          litSkyAt(
            layout,
            sun.x + Math.cos(angle) * reach,
            sun.y + Math.sin(angle) * reach,
          ),
        );
        assert.ok(r - b >= 12, `${String(r)} against ${String(b)}`);
      }
    });

    it(`lights no more than ${String(HALO_COVER * 100)}% of the open sky, and nowhere flat, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      for (const seed of VISITS.slice(0, 8)) {
        const sky = openSky(layout, seed, 4);
        const lit = sky.filter(([x, y]) => shiftAt(layout, x, y) >= 8);
        assert.ok(
          lit.length <= sky.length * HALO_COVER,
          `visit ${String(seed)}: ${(lit.length / sky.length).toFixed(2)} of the sky`,
        );
      }
      // A plateau: a sun radius of lit sky at one colour.
      for (const line of raysOut(layout, 32)) {
        let [run, from] = [0, 0];
        for (const [x, y] of line) {
          const colour = litSkyAt(layout, x, y);
          if (shiftAt(layout, x, y) < 8) run = 0;
          else if (run > 0 && levels(colour, from) <= 1) run += 1;
          else [run, from] = [1, colour];
          assert.ok(
            run < layout.sun.r,
            `flat at ${x.toFixed(0)}, ${y.toFixed(0)}`,
          );
        }
      }
    });

    it(`lays the sun's light on with no ring, falling off to nothing at its edge, on a ${name} screen`, () => {
      const layout = meadowLayout(width, height, 1);
      // The painted cells: shaded between corners, each must meet the light
      // at its middle, or the grid shows as facets and rings.
      const { columns, rows, across, down } = skyGrid(layout);
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const [x, y] = [column * across, row * down];
          const corners = [
            [x, y],
            [x + across, y],
            [x, y + down],
            [x + across, y + down],
          ].map(([cx, cy]) => rgb(litSkyAt(layout, cx ?? 0, cy ?? 0)));
          const shaded = [0, 1, 2].map(
            (index) =>
              corners.reduce((sum, corner) => sum + (corner[index] ?? 0), 0) /
              4,
          );
          const middle = rgb(litSkyAt(layout, x + across / 2, y + down / 2));
          for (const [index, value] of middle.entries()) {
            assert.ok(
              Math.abs(value - (shaded[index] ?? 0)) <= 2.5,
              `a facet at ${x.toFixed(0)}, ${y.toFixed(0)}`,
            );
          }
        }
      }
      // Level with the sun the bare sky is one colour, so what changes is the
      // light alone: it may never brighten again on the way out.
      const { sun } = layout;
      for (const side of [-1, 1]) {
        let nearer = Infinity;
        for (let away = sun.r * SUN_RAY_REACH; away < width * 2; away += 1) {
          const shift = shiftAt(layout, sun.x + side * away, sun.y);
          assert.ok(
            shift <= nearer,
            `brightens again ${away.toFixed(0)} px out`,
          );
          nearer = shift;
        }
        assert.equal(nearer, 0, 'still lit two screens away');
      }
      for (const line of raysOut(layout, 32, true)) {
        const [x, y] = line.at(-1) ?? [0, 0];
        assert.equal(shiftAt(layout, x, y), 0, 'still lit a screen away');
      }
    });
  }
});
