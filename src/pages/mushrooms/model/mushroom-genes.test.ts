import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CAP_KINDS,
  domeHeight,
  firstMushrooms,
  GENE_RANGES,
  mushroomGenes,
  SPOT_MARGIN,
} from './mushroom-genes';
import { mulberry32 } from './random';

const SEEDS = Array.from({ length: 400 }, (_, index) => index * 7919 + 1);

describe('mushroomGenes', () => {
  it('grows the same mushroom from the same seed', () => {
    for (const cap of CAP_KINDS) {
      assert.deepEqual(
        mushroomGenes({ seed: 42, cap }),
        mushroomGenes({ seed: 42, cap }),
      );
    }
  });

  it('grows different mushrooms from neighbouring seeds', () => {
    const a = mushroomGenes({ seed: 1, cap: 'plain' });
    const b = mushroomGenes({ seed: 2, cap: 'plain' });
    assert.notEqual(a.capWidth, b.capWidth);
  });

  it('keeps every gene inside its range', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, cap: 'spotted' });
      for (const [name, [min, max]] of Object.entries(GENE_RANGES)) {
        const value = genes[name as keyof typeof GENE_RANGES];
        assert.ok(value >= min && value <= max, `${name} = ${value}`);
      }
    }
  });

  it('gives the same seed the same shape whatever the cap', () => {
    const {
      spots: _spots,
      cap: _cap,
      ...spotted
    } = mushroomGenes({
      seed: 9,
      cap: 'spotted',
    });
    const {
      spots: _none,
      cap: _plain,
      ...plain
    } = mushroomGenes({
      seed: 9,
      cap: 'plain',
    });
    assert.deepEqual(spotted, plain);
  });

  it('spots only the spotted cap', () => {
    for (const cap of CAP_KINDS.filter((kind) => kind !== 'spotted')) {
      assert.equal(mushroomGenes({ seed: 3, cap }).spots.length, 0);
    }
    for (const seed of SEEDS) {
      assert.ok(mushroomGenes({ seed, cap: 'spotted' }).spots.length >= 3);
    }
  });

  it('keeps spots inside the cap and off the rim', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, cap: 'spotted' });
      for (const { x, y, r } of genes.spots) {
        assert.ok(y - r >= SPOT_MARGIN, `seed ${seed}: a spot on the rim`);
        assert.ok(
          y + r <= domeHeight(genes, x),
          `seed ${seed}: a spot past the dome`,
        );
      }
    }
  });

  it('never overlaps two spots', () => {
    for (const seed of SEEDS) {
      const { spots } = mushroomGenes({ seed, cap: 'spotted' });
      spots.forEach((a, i) => {
        for (const b of spots.slice(i + 1)) {
          assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r);
        }
      });
    }
  });
});

describe('firstMushrooms', () => {
  it('opens the meadow with two distinct fly agarics', () => {
    const [first, second, ...rest] = firstMushrooms(mulberry32(5));
    assert.equal(rest.length, 0);
    assert.ok(first && second);
    assert.notEqual(first.id, second.id);
    assert.notEqual(first.seed, second.seed);
    assert.equal(first.cap, 'spotted');
  });
});
