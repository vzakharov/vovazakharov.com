import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { contrast, luminance, toHsv } from './colour';
import { inkFor } from './ink';
import { CREATURES } from './palette-creatures';

/** Under this saturation a colour is a white, and has no hue to keep apart. */
const WHITE = 0.1;
/** The closest two butterflies' hues stand, in degrees: what a meadow of them keeps apart. */
const LEAST_GAP = 8.19;
/** The dimmest a petal or a wing may be, in HSV value: none is dulled by the warm cast. */
const LEAST_VALUE = 0.81;

/** The gaps round the wheel between neighbouring hues of `colours`, in degrees. */
function hueGaps(colours: readonly number[]): number[] {
  const hues = colours
    .map((colour) => toHsv(colour))
    .filter(({ s }) => s >= WHITE)
    .map(({ h }) => h * 360)
    .toSorted((a, b) => a - b);
  return hues.map((hue, index) => {
    const next = hues[(index + 1) % hues.length] ?? hue;
    return (next - hue + 360) % 360 || 360;
  });
}

describe('the flowers and butterflies', () => {
  const families = [CREATURES.flowers, CREATURES.butterflies].map((family) =>
    Object.values(family),
  );

  it('keeps every butterfly’s hue apart from its neighbours’', () => {
    assert.ok(
      Math.min(...hueGaps(Object.values(CREATURES.butterflies))) >= LEAST_GAP,
    );
  });

  it('dulls none of them', () => {
    for (const colour of families.flat()) {
      assert.ok(toHsv(colour).v >= LEAST_VALUE, colour.toString(16));
    }
  });
});

/** How far apart two colours' hues stand round the wheel, in degrees. */
function hueApart(a: number, b: number): number {
  const gap = Math.abs(toHsv(a).h - toHsv(b).h) * 360;
  return Math.min(gap, 360 - gap);
}

describe('the worm', () => {
  const { worm, wormBand, capRed, chanterelle } = CREATURES;

  it('is a pale pink, half as saturated as the reds and apricot it crawls over, and inked darkly off them', () => {
    for (const cap of [capRed, chanterelle.flesh]) {
      assert.ok(toHsv(worm).s <= toHsv(cap).s / 2, cap.toString(16));
    }
    assert.ok(hueApart(worm, capRed) <= 15);
    assert.ok(contrast(worm, inkFor(worm)) >= 4.5);
  });

  it('wears a band of its own pink, deeper, its ink still standing off it', () => {
    assert.ok(luminance(wormBand) < luminance(worm));
    assert.ok(hueApart(wormBand, worm) <= 15);
    assert.ok(contrast(wormBand, inkFor(wormBand)) >= 3);
  });
});
