import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  blend,
  GROUND_STOPS,
  groundAt,
  RANGES,
  skyAt,
  SUN_HALO,
} from './backdrop-tones';
import { tuftColours } from './grass';
import { type MeadowLayout, meadowLayout } from './layout';
import { PALETTE } from './palette';
import { SUN_RAY_REACH } from './sun-layout';
import { VIEWPORTS } from './viewports';

const channels = (colour: number) =>
  [(colour >> 16) & 0xff, (colour >> 8) & 0xff, colour & 0xff] as const;

/** Relative luminance, as WCAG defines it. */
function luminance(colour: number): number {
  const [r, g, b] = channels(colour).map((value) => {
    const v = value / 255;
    return v <= 0.040_45 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: number, b: number): number {
  const [light, dark] = [luminance(a), luminance(b)].toSorted((p, q) => q - p);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

function saturation(colour: number): number {
  const values = channels(colour);
  const most = Math.max(...values);
  return most === 0 ? 0 : (most - Math.min(...values)) / most;
}

/** How far a tuft's most distinct blade stands from the ground under it, in RGB. */
function standOut(down: number): number {
  const ground = channels(groundAt(down));
  return Math.max(
    ...Object.values(tuftColours(down)).map((colour) =>
      Math.hypot(
        ...channels(colour).map((value, index) => value - (ground[index] ?? 0)),
      ),
    ),
  );
}

/** The sky at `x`, `y` with the sun's halo laid over it, as `paintSky` lays it. */
function skyWithHalo(
  { nearHills, sun }: MeadowLayout,
  x: number,
  y: number,
): number {
  const away = Math.hypot(x - sun.x, y - sun.y) / sun.r;
  let colour = skyAt(y / nearHills);
  for (const [over, alpha, radius] of SUN_HALO) {
    if (away < radius) colour = blend(colour, over, alpha);
  }
  return colour;
}

/** HSL saturation and lightness, 0 to 1. */
function saturationAndLightness(colour: number): [number, number] {
  const values = channels(colour).map((value) => value / 255);
  const [high, low] = [Math.max(...values), Math.min(...values)];
  const lightness = (high + low) / 2;
  const span = high - low;
  return [span === 0 ? 0 : span / (1 - Math.abs(2 * lightness - 1)), lightness];
}

const increasing = (values: readonly number[]) =>
  values.every(
    (value, index) => index === 0 || value > (values[index - 1] ?? 0),
  );

describe('the backdrop', () => {
  it('has a sky warm at the horizon and cool, bright blue at the top', () => {
    const [lowR, , lowB] = channels(PALETTE.skyLow);
    const [topR, , topB] = channels(PALETTE.skyTop);
    assert.ok(lowR - lowB > 0);
    assert.ok(topB - topR > 60);
    assert.ok(Math.max(...channels(PALETTE.skyTop)) / 255 >= 0.85);
  });

  it('gains contrast against the sky and saturation from the farthest range to the front of the ground', () => {
    const depths = [
      RANGES.farthest.lit,
      RANGES.far.lit,
      RANGES.near.lit,
      groundAt(1),
    ];
    assert.ok(increasing(depths.map((c) => contrast(c, PALETTE.skyLow))));
    assert.ok(increasing(depths.map((c) => saturation(c))));
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
      const mottle = blend(
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
            skyWithHalo(layout, x, y),
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
        const [r, , b] = channels(
          skyWithHalo(
            layout,
            sun.x + Math.cos(angle) * reach,
            sun.y + Math.sin(angle) * reach,
          ),
        );
        assert.ok(r - b >= 12, `${r} against ${b}`);
      }
    });
  }
});
