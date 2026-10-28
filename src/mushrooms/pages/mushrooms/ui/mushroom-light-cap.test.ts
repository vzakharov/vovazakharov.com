import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  capSurface,
  type MushroomGenes,
  mushroomGenes,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  type CapLight,
  capLight,
  capRimArc,
  capShadeArc,
  capShine,
  shadedHalf,
} from '@/mushrooms/entities/mushroom/index.test-only';

import { middleOf } from './mushroom-light.test-kit';

describe('a cap in the light', () => {
  const genes = mushroomGenes({ seed: 7, species: 'fly-agaric' });
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

describe('a chanterelle’s hollow top in the light', () => {
  const genes = mushroomGenes({ seed: 7, species: 'chanterelle' });
  assert.ok(genes.species === 'chanterelle');
  for (const [name, toward, side] of [
    ['from the right', { x: 0.8, y: -0.6 }, 1],
    ['from the left', { x: -0.8, y: -0.6 }, -1],
  ] as const) {
    it(`is shaded on the wall toward a light ${name}, and lit on the far one`, () => {
      const layers = capLight(genes, toward);
      const arc = (kind: CapLight['kind']) => {
        const layer = layers.find((each) => each.kind === kind);
        assert.ok(layer && 'arc' in layer, kind);
        return middleOf(layer.arc);
      };
      assert.ok(arc('dip-shade').x * side > 0);
      assert.ok(arc('dip-light').x * side < 0);
      // Outside the hollow the lip is lit as a dome's rim is.
      assert.ok(arc('rim').x * side > 0);
      assert.ok(arc('shade').x * side < 0);
      const shine = layers.find((layer) => layer.kind === 'shine');
      assert.ok(shine?.kind === 'shine' && shine.centre.x * side < 0);
      // Each lies along the lip's top, where the hollow is.
      for (const kind of ['dip-shade', 'dip-light'] as const) {
        const { x, y } = arc(kind);
        assert.ok(Math.abs(y - capSurface(genes, x)) < genes.lip * 0.5, kind);
      }
    });
  }
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
      const genes = mushroomGenes({ seed, species: 'fly-agaric' });
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
