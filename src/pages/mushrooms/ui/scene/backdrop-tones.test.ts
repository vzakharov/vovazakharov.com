import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { blend, GROUND_STOPS, groundAt, RANGES } from './backdrop-tones';
import { tuftColours } from './grass';
import { PALETTE } from './palette';

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
});
