import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BEE_BANDS, BEE_RANGES, BEE_YELLOWS, type BeeGenes } from './bee-genes';
import { FLY_RANGES, FLY_SHEENS, FLY_VEINS, type FlyGenes } from './fly-genes';
import { INSECT_KINDS, insectGenes } from './insect-genes';
import { buzzWing, wingspan } from './insect-outline';

const SEEDS = Array.from({ length: 400 }, (_, index) => index * 7919 + 1);
const flies = SEEDS.map((seed) => insectGenes({ seed, kind: 'fly' }));
const bees = SEEDS.map((seed) => insectGenes({ seed, kind: 'bee' }));

/** Each gene the ranges name, read off `genes` where it lives. */
function readings(genes: FlyGenes | BeeGenes): Record<string, unknown> {
  const { wing, ...own } = genes;
  return {
    ...own,
    wingLength: wing.length,
    wingBreadth: wing.breadth,
    wingTip: wing.tip,
  };
}

function inRanges(
  genes: FlyGenes | BeeGenes,
  ranges: Record<string, readonly [number, number]>,
): void {
  const read = readings(genes);
  for (const [name, [min, max]] of Object.entries(ranges)) {
    const value = read[name];
    assert.ok(
      typeof value === 'number' && value >= min && value <= max,
      `${genes.kind} ${name} = ${String(value)}`,
    );
  }
}

describe('insectGenes, for a fly and a bee', () => {
  it('grows the kind it is asked for, a pure function of the seed', () => {
    for (const kind of INSECT_KINDS) {
      const grown = insectGenes({ seed: 42, kind });
      assert.equal(grown.kind, kind);
      assert.deepEqual(grown, insectGenes({ seed: 42, kind }));
      assert.notDeepEqual(grown, insectGenes({ seed: 43, kind }));
    }
  });

  it('keeps every fly gene in its range, with three or four veins and every sheen', () => {
    for (const fly of flies) inRanges(fly, FLY_RANGES);
    const veins = new Set(flies.map((fly) => fly.veins));
    assert.deepEqual(
      [...veins].toSorted((a, b) => a - b),
      [...FLY_VEINS],
    );
    const sheens = new Set(flies.map(({ sheen }) => sheen));
    assert.equal(sheens.size, FLY_SHEENS.length);
  });

  it('keeps every bee gene in its range, with three or four bands and every yellow', () => {
    for (const bee of bees) inRanges(bee, BEE_RANGES);
    const bands = new Set(bees.map((bee) => bee.bands));
    assert.deepEqual(
      [...bands].toSorted((a, b) => a - b),
      [...BEE_BANDS],
    );
    const yellows = new Set(bees.map(({ stripe }) => stripe));
    assert.equal(yellows.size, BEE_YELLOWS.length);
  });

  it('grows a stout fly and a round bee, the bee’s head small', () => {
    for (const fly of flies) assert.ok(fly.bodyWidth / fly.bodyLength > 0.3);
    for (const bee of bees) {
      assert.ok(bee.bodyWidth / bee.bodyLength > 0.7);
      assert.ok(bee.headRadius * 2 < bee.bodyWidth / 2);
    }
  });
});

describe('wingspan', () => {
  it('answers for every kind, from its open wings or its body', () => {
    for (const kind of INSECT_KINDS) {
      for (const seed of SEEDS) {
        const genes = insectGenes({ seed, kind });
        const span = wingspan(genes);
        assert.ok(span > 0.8 && span < 1.4, `${kind} ${String(span)}`);
        assert.ok(span >= genes.bodyWidth);
      }
    }
  });

  it('lays a fly’s and a bee’s wings back over the body at rest', () => {
    for (const genes of [...flies, ...bees]) {
      const reach = (spread: number) =>
        Math.max(...buzzWing(genes, 1, spread).map(({ x }) => x));
      assert.ok(reach(0) < reach(1) * 0.7);
      const back = buzzWing(genes, 1, 0).map(({ y }) => y);
      assert.ok(Math.max(...back) > genes.bodyLength * 0.2);
      assert.ok(Math.min(...back) > -genes.bodyLength / 2);
    }
  });
});
