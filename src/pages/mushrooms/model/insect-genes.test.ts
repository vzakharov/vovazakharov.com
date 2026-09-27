import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { containsPoint, ellipse } from './geometry';
import {
  BUTTERFLY_COLOURS,
  EYE_RADIUS,
  EYE_RINGS,
  INSECT_RANGES,
  insectGenes,
} from './insect-genes';
import { eyeCentre, WING_PAIRS, wingOutline } from './insect-outline';

const SEEDS = Array.from({ length: 400 }, (_, index) => index * 7919 + 1);
const butterflies = SEEDS.map((seed) =>
  insectGenes({ seed, kind: 'butterfly' }),
);

function inRange(name: keyof typeof INSECT_RANGES, value: number): void {
  const [min, max] = INSECT_RANGES[name];
  assert.ok(value >= min && value <= max, `${name} = ${String(value)}`);
}

describe('insectGenes', () => {
  it('is a pure function of the seed', () => {
    const grown = insectGenes({ seed: 42, kind: 'butterfly' });
    assert.deepEqual(grown, insectGenes({ seed: 42, kind: 'butterfly' }));
    assert.notDeepEqual(grown, insectGenes({ seed: 43, kind: 'butterfly' }));
  });

  it('keeps every gene in its range', () => {
    for (const genes of butterflies) {
      inRange('bodyLength', genes.bodyLength);
      inRange('bodyWidth', genes.bodyWidth);
      inRange('foreLength', genes.fore.length);
      inRange('foreBreadth', genes.fore.breadth);
      inRange('foreTip', genes.fore.tip);
      inRange('hindLength', genes.hind.length);
      inRange('hindBreadth', genes.hind.breadth);
      inRange('hindTip', genes.hind.tip);
      inRange('eyeAt', genes.eyeAt);
      inRange('hueNudge', genes.hueNudge);
      inRange('patternNudge', genes.patternNudge);
    }
  });

  it('rings each eye two or three times, each ring inside the last', () => {
    for (const { eyes } of butterflies) {
      assert.ok(eyes.length >= EYE_RINGS[0] && eyes.length <= EYE_RINGS[1]);
      const [outer = 0] = eyes;
      assert.ok(outer > 0 && outer <= EYE_RADIUS[1]);
      for (const [index, radius] of eyes.entries()) {
        if (index > 0) assert.ok(radius < (eyes[index - 1] ?? 0));
      }
    }
    const counts = new Set(butterflies.map(({ eyes }) => eyes.length));
    assert.deepEqual(
      [...counts].toSorted((a, b) => a - b),
      [2, 3],
    );
  });

  it('keeps each eye’s outer ring inside its wing, on both pairs', () => {
    for (const [index, genes] of butterflies.entries()) {
      for (const pair of WING_PAIRS) {
        const outline = wingOutline(genes, pair, 1);
        const ring = ellipse(
          eyeCentre(genes, pair, 1),
          (genes.eyes[0] ?? 0) * genes[pair].breadth,
        );
        for (const point of ring) {
          assert.ok(
            containsPoint(outline, point),
            `seed ${String(SEEDS[index])}'s ${pair} eye`,
          );
        }
      }
    }
  });

  it('grows every colour, and never a pattern the colour of its base', () => {
    const colours = new Set(butterflies.map(({ colour }) => colour));
    assert.equal(colours.size, BUTTERFLY_COLOURS.length);
    for (const { colour, pattern } of butterflies) {
      assert.notEqual(pattern, colour);
    }
  });

  it('keeps the fore wings longer than the hind', () => {
    for (const { fore, hind } of butterflies) {
      assert.ok(fore.length > hind.length);
    }
  });
});
