import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toHsv } from './colour';
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
