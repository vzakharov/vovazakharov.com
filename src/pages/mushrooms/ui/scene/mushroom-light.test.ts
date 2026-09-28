import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { placedAt, type Point } from '../../model/geometry';
import {
  CAP_KINDS,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import {
  CURVE_STEPS,
  stemOutline,
  toCanvas,
} from '../../model/mushroom-outline';
import { splayed } from '../../model/mushroom-pose';
import { luminance, mix, toHsv } from './colour';
import { meadowLayout } from './layout';
import {
  type CapLight,
  capLight,
  capRimArc,
  capShadeArc,
  capShine,
  mushroomShadow,
  shadedHalf,
  STEM_LIGHT,
  type StemLayer,
} from './mushroom-light';
import { PALETTE } from './palette';
import { VIEWPORTS } from './viewports';

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

/** Whether `point` lies under `layer`, of the cap's layers the ones a point can be tested against. */
function covers(layer: CapLight, { x, y }: Point): boolean {
  if (layer.kind === 'spot') {
    const { spot } = layer;
    return Math.hypot(x - spot.x, y - spot.y) <= spot.r;
  }
  if (layer.kind !== 'shine') return false;
  const [rx, ry] = layer.radii;
  const { centre } = layer;
  return ((x - centre.x) / rx) ** 2 + ((y - centre.y) / ry) ** 2 <= 1;
}

/**
 * The share of `genes`' cap painted as shine over a spot, sampled on a grid
 * across the shine: points under both where the shine is the later layer.
 */
function shineOverSpots(
  genes: MushroomGenes,
  toward: Point,
): { overlapped: number; showing: number } {
  const layers = capLight(genes, toward);
  const shine = layers.find((layer) => layer.kind === 'shine');
  assert.ok(shine?.kind === 'shine');
  const [rx, ry] = shine.radii;
  let overlapped = 0;
  let showing = 0;
  for (let i = -1; i <= 1; i += 0.05) {
    for (let j = -1; j <= 1; j += 0.05) {
      const point = { x: shine.centre.x + i * rx, y: shine.centre.y + j * ry };
      const under = layers.flatMap((layer, index) =>
        covers(layer, point) ? [{ layer, index }] : [],
      );
      if (!under.some(({ layer }) => layer.kind === 'spot')) continue;
      if (!under.some(({ layer }) => layer.kind === 'shine')) continue;
      overlapped++;
      if (under.at(-1)?.layer.kind === 'shine') showing++;
    }
  }
  return { overlapped, showing };
}

describe('a spotted cap’s shine', () => {
  it('never shows over a spot, on caps where the two overlap', () => {
    let overlapping = 0;
    for (let seed = 1; seed <= 3000; seed++) {
      const genes = mushroomGenes({ seed, cap: 'spotted' });
      for (const toward of [
        { x: 0.8, y: -0.6 },
        { x: -0.3, y: -0.95 },
      ]) {
        const { overlapped, showing } = shineOverSpots(genes, toward);
        if (overlapped > 0) overlapping++;
        assert.equal(showing, 0, `seed ${String(seed)}`);
      }
    }
    // Most caps put a spot under the shine: the order is what keeps it off.
    assert.ok(overlapping > 3000, String(overlapping));
  });
});

describe('a mushroom’s foot', () => {
  const size = 300;
  const light = { toward: { x: 0.8, y: -0.6 } };
  // Every turn a slot stands a mushroom at, on every screen.
  const splays = new Set(
    VIEWPORTS.flatMap(([, width, height]) =>
      meadowLayout(width, height, 1).mushrooms.map(({ splay }) => splay),
    ),
  );

  it('stands level on the ground, both corners inside its contact shadow, at every lean', () => {
    let worst = 0;
    for (const splay of splays) {
      for (let seed = 1; seed <= 200; seed++) {
        const { genes, turn } = splayed(
          mushroomGenes({
            seed,
            cap: CAP_KINDS[seed % CAP_KINDS.length] ?? 'plain',
          }),
          splay,
        );
        const canvas = toCanvas(size);
        const drawn = stemOutline(genes, turn).map((point) =>
          placedAt({ x: 0, y: 0 }, turn, canvas(point)),
        );
        // Where its sides end: up the right one, and back down the left.
        const corners = [drawn[0], drawn[CURVE_STEPS * 2 + 1]];
        const contact = mushroomShadow(genes, size, light, turn).find(
          ({ x }) => x === 0,
        );
        assert.ok(contact);
        for (const corner of corners) {
          assert.ok(corner);
          const reach =
            (corner.x / (contact.across / 2)) ** 2 +
            (corner.y / (contact.tall / 2)) ** 2;
          assert.ok(reach < 1, JSON.stringify({ seed, splay, corner, reach }));
        }
        const [left, right] = corners;
        worst = Math.max(worst, Math.abs((left?.y ?? 0) - (right?.y ?? 0)));
      }
    }
    assert.ok(worst < 1, `a foot rises ${worst.toFixed(1)} px across`);
  });
});
