import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { luminance, mix, toHsv } from '@/mushrooms/shared/lib/colour';
import { PALETTE } from '@/mushrooms/shared/ui/index.node-safe';
import {
  CURVE_STEPS,
  STEM_LIGHT,
  type StemLayer,
  stemLight,
} from '@/mushrooms/entities/mushroom/index.test-only';

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

  it('paints a far stem in fewer, more opaque layers that leave its edge as dark', () => {
    assert.deepEqual(stemLight(PALETTE.stemLit, CURVE_STEPS), STEM_LIGHT);
    for (const steps of [8, 14, 20]) {
      const far = stemLight(PALETTE.stemLit, steps);
      for (const side of ['sun', 'shade'] as const) {
        const [near, coarse] = [atEdge(STEM_LIGHT, side), atEdge(far, side)];
        assert.ok(coarse.count < near.count, `${steps} chords, ${side}`);
        assert.ok(coarse.count >= 2);
        assert.ok(Math.abs(coarse.opacity - near.opacity) < 1e-9);
        assert.deepEqual(coarse.span, near.span);
      }
    }
  });
});

/**
 * How many of `side`'s soft layers of stem light there are, how opaque they
 * stand together over its edge, and the depths they span (the rim line, at
 * over half opaque, left out).
 */
function atEdge(layers: readonly StemLayer[], side: StemLayer[3]) {
  const on = layers.filter((layer) => layer[3] === side && layer[1] < 0.5);
  const depths = on.map((layer) => layer[2]);
  return {
    count: on.length,
    opacity: 1 - on.reduce((clear, [, alpha]) => clear * (1 - alpha), 1),
    span: [Math.max(...depths), Math.min(...depths)],
  };
}
