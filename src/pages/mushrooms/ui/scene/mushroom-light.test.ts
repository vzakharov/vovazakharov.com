import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { mushroomGenes } from '../../model/mushroom-genes';
import { luminance, mix, toHsv } from './colour';
import {
  capRimArc,
  capShadeArc,
  capShine,
  shadedHalf,
  STEM_LIGHT,
  type StemLayer,
} from './mushroom-light';
import { PALETTE } from './palette';

/** How far round the wheel a colour's hue stands from orange's. */
function towardOrange(colour: number): number {
  return Math.abs(toHsv(colour).h - 30 / 360);
}

/** The blue channel's share of the three. */
function blueness(colour: number): number {
  const [r, g, b] = [
    (colour >> 16) & 0xff,
    (colour >> 8) & 0xff,
    colour & 0xff,
  ];
  return b / (r + g + b);
}

const middleOf = (points: readonly Point[]) => ({
  x: points.reduce((sum, { x }) => sum + x, 0) / points.length,
  y: points.reduce((sum, { y }) => sum + y, 0) / points.length,
});

describe('a cap in the light', () => {
  const genes = mushroomGenes({ seed: 7, cap: 'spotted' });
  for (const [name, toward, side] of [
    ['from the right', { x: 0.8, y: -0.6 }, 1],
    ['from the left', { x: -0.8, y: -0.6 }, -1],
  ] as const) {
    it(`is shaded away from a light ${name}, and lit and shining toward it`, () => {
      assert.ok(middleOf(capShadeArc(genes, toward)).x * side < 0);
      assert.ok(middleOf(capRimArc(genes, toward)).x * side > 0);
      assert.ok(capShine(genes, toward).x * side > 0);
    });
  }

  it('shades a spot on the side away from the light', () => {
    const half = shadedHalf({ x: 0, y: 0 }, 1, { x: 1, y: 0 });
    assert.ok(middleOf(half).x < 0);
  });
});

describe('the creatures’ light and shade', () => {
  it('lights a cap warmer than its red, and shades bluer than the old shade ink', () => {
    assert.ok(towardOrange(PALETTE.capLit) < towardOrange(PALETTE.capRed));
    assert.ok(blueness(PALETTE.shadeCool) > blueness(PALETTE.shadeInk));
  });

  it('keeps a spot white on its lit side', () => {
    assert.ok(luminance(PALETTE.spot) >= 0.9);
  });
});

describe('a stem in the light', () => {
  const over = (side: StemLayer[3], depth: number) => {
    let colour: number = PALETTE.stem;
    for (const [layer, alpha, reach, on] of STEM_LIGHT) {
      if (on === side && reach >= depth) colour = mix(colour, layer, alpha);
    }
    return colour;
  };
  const shade = STEM_LIGHT.filter((layer) => layer[3] === 'shade');

  it('shades softly, deepening toward its edge in steps too small to read as a band', () => {
    assert.ok(shade.length >= 4);
    for (const [, alpha] of shade) assert.ok(alpha <= 0.08);
    const depths = shade.map((layer) => layer[2]);
    assert.ok(
      depths.every(
        (depth, index) => index === 0 || depth < (depths[index - 1] ?? 0),
      ),
    );
    assert.ok(blueness(over('shade', 0)) > blueness(PALETTE.stem));
  });

  it('warms toward the sun and stays pale on both sides', () => {
    assert.ok(towardOrange(over('sun', 0.05)) < towardOrange(PALETTE.stem));
    for (const side of ['sun', 'shade'] as const) {
      assert.ok(luminance(over(side, 0)) >= 0.5, side);
    }
  });
});
