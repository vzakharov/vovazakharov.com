import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LAND_STOPS, landColours, SEA_COLOUR } from './land-colour';

const at = (height: number) => [...landColours(new Float32Array([height]))];

/** An 8-bit sRGB channel above the curve's linear toe, as linear. */
const linear = (c: number) => (c / 255 / 1.055 + 0.055 / 1.055) ** 2.4;

describe('landColours', () => {
  it('gives the deep floor the sea colour, linear', () => {
    const [r = 0, g = 0, b = 0] = at(-500);
    assert.ok(Math.abs(r - linear((SEA_COLOUR >> 16) & 0xff)) < 1e-6);
    assert.ok(Math.abs(g - linear((SEA_COLOUR >> 8) & 0xff)) < 1e-6);
    assert.ok(Math.abs(b - linear(SEA_COLOUR & 0xff)) < 1e-6);
  });

  it('keeps the shallow floor sandy', () => {
    const [r = 0, , b = 0] = at(-2);
    assert.ok(r > b, 'sand stays warmer than the sea');
  });

  it('runs sand, green, brown, pale up the heights', () => {
    const [sand, green, brown, pale] = [at(0), at(300), at(900), at(3000)];
    const [sr = 0, sg = 0] = sand;
    const [gr = 0, gg = 0, gb = 0] = green;
    const [br = 0, bg = 0, bb = 0] = brown;
    const [pr = 0, pg = 0, pb = 0] = pale;
    assert.ok(sr > gr && sg > gg, 'sand is lighter than lowland');
    assert.ok(gg > gr && gg > gb, 'lowland is green');
    assert.ok(br > bg && bg > bb, 'upland is brown');
    assert.ok(pr > 0.8 && pg > 0.8 && pb > 0.8, 'peaks are pale');
  });

  it('keeps its stops in rising height', () => {
    for (const [i, [level]] of LAND_STOPS.entries()) {
      const [previous] = LAND_STOPS[i - 1] ?? [-Infinity];
      assert.ok(level > previous);
    }
  });

  it('is continuous across a stop', () => {
    const [below = 0] = at(449.9);
    const [above = 0] = at(450.1);
    assert.ok(Math.abs(below - above) < 1e-3);
  });
});
