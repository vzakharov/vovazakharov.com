import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BUTTERFLY_LIMIT } from './flight';
import { containsPoint, ellipse, type Point } from './geometry';
import {
  BUTTERFLY_COLOURS,
  EYE_RADIUS,
  EYE_RINGS,
  INSECT_RANGES,
  insectGenes,
  PATTERN_TURN,
} from './insect-genes';
import { eyeCentre, WING_PAIRS, wingOutline } from './insect-outline';
import { mulberry32, nextSeed } from './random';

const SEEDS = Array.from({ length: 400 }, (_, index) => index * 7919 + 1);
const butterflies = SEEDS.map((seed) =>
  insectGenes({ seed, kind: 'butterfly' }),
);

/** Meadows of `BUTTERFLY_LIMIT` butterflies, their seeds drawn as the scene draws them. */
const SPREAD_SETS = 2000;
const SPREAD_STREAM = 20_260_927;
/**
 * The most of those meadows that may repeat a base colour, and that may show
 * two colours or fewer: independent seeds cannot beat the birthday odds of
 * `BUTTERFLY_COLOURS`, so these hold the ring's size rather than a pairing.
 */
const MOST_REPEATING = 0.45;
const MOST_TWO_TONED = 0.06;

function inRange(name: keyof typeof INSECT_RANGES, value: number): void {
  const [min, max] = INSECT_RANGES[name];
  assert.ok(value >= min && value <= max, `${name} = ${String(value)}`);
}

/** How far out to the side a wing's outline reaches from the body's middle. */
const sideways = (outline: readonly Point[]) =>
  Math.max(...outline.map(({ x }) => x));

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

  it('grows every colour, its pattern a quarter of the ring away or more', () => {
    const colours = new Set(butterflies.map(({ colour }) => colour));
    assert.equal(colours.size, BUTTERFLY_COLOURS.length);
    const count = BUTTERFLY_COLOURS.length;
    for (const { colour, pattern } of butterflies) {
      const apart =
        (BUTTERFLY_COLOURS.indexOf(pattern) -
          BUTTERFLY_COLOURS.indexOf(colour) +
          count) %
        count;
      const turn = Math.min(apart, count - apart) / count;
      assert.ok(turn >= PATTERN_TURN[0], `${colour} under ${pattern}`);
    }
  });

  it('seldom repeats a base colour among four butterflies on screen', () => {
    const stream = mulberry32(SPREAD_STREAM);
    const sets = Array.from({ length: SPREAD_SETS }, () =>
      Array.from(
        { length: BUTTERFLY_LIMIT },
        () => insectGenes({ seed: nextSeed(stream), kind: 'butterfly' }).colour,
      ),
    );
    const distinct = sets.map((set) => new Set(set).size);
    const share = (holds: (size: number) => boolean) =>
      distinct.filter((size) => holds(size)).length / SPREAD_SETS;
    assert.ok(share((size) => size < BUTTERFLY_LIMIT) < MOST_REPEATING);
    assert.ok(share((size) => size <= 2) < MOST_TWO_TONED);
  });

  it('never reaches the hind wings sideways past the fore wings’ tips', () => {
    for (const [index, genes] of butterflies.entries()) {
      assert.ok(
        sideways(wingOutline(genes, 'hind', 1)) <
          sideways(wingOutline(genes, 'fore', 1)),
        `seed ${String(SEEDS[index])}`,
      );
    }
  });
});
