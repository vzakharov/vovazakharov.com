import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GROUND_STOPS, SEA_COLOUR, SHORE_TOP } from './land-colour';

/** An 8-bit sRGB channel above the curve's linear toe, as linear. */
const linear = (c: number) => (c / 255 / 1.055 + 0.055 / 1.055) ** 2.4;

/** Relative luminance of a linear colour. */
const luma = ([r, g, b]: readonly [number, number, number]) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

/** The stop at `level`, metres. */
function stop(level: number): readonly [number, number, number] {
  const found = GROUND_STOPS.find(([at]) => at === level);
  assert.ok(found, `a stop at ${level} m`);
  return found[1];
}

describe('GROUND_STOPS', () => {
  it('gives the deep floor the sea colour, linear', () => {
    const [level, [r, g, b]] = GROUND_STOPS[0] ?? [0, [0, 0, 0]];
    assert.ok(level < 0);
    assert.ok(Math.abs(r - linear((SEA_COLOUR >> 16) & 0xff)) < 1e-6);
    assert.ok(Math.abs(g - linear((SEA_COLOUR >> 8) & 0xff)) < 1e-6);
    assert.ok(Math.abs(b - linear(SEA_COLOUR & 0xff)) < 1e-6);
  });

  it('keeps the shoreline and the shore top sandy', () => {
    for (const level of [0, SHORE_TOP]) {
      const [r, , b] = stop(level);
      assert.ok(r > b, 'sand stays warmer than the sea');
    }
  });

  it('runs sand, green, brown, pale up the heights', () => {
    const [sr, sg] = stop(SHORE_TOP);
    const [gr, gg, gb] = stop(450);
    const [br, bg, bb] = stop(800);
    const pale = GROUND_STOPS.at(-1)?.[1] ?? [0, 0, 0];
    assert.ok(sr > gr && sg > gg, 'sand is lighter than lowland');
    assert.ok(gg > gr && gg > gb, 'lowland is green');
    assert.ok(br > bg && bg > bb, 'upland is brown');
    assert.ok(
      pale.every((c) => c > 0.8),
      'peaks are pale',
    );
  });

  it('lightens the sea up the shelf to the waterline', () => {
    const below = GROUND_STOPS.filter(([level]) => level <= 0);
    assert.ok(below.length >= 3, 'a shelf of stops between deep and shore');
    for (const [i, [, colour]] of below.entries()) {
      const [, previous] = below[i - 1] ?? [0, [0, 0, 0]];
      assert.ok(luma(colour) > luma(previous));
    }
  });

  it('keeps its stops in rising height', () => {
    for (const [i, [level]] of GROUND_STOPS.entries()) {
      const [previous] = GROUND_STOPS[i - 1] ?? [-Infinity];
      assert.ok(level > previous);
    }
  });
});
