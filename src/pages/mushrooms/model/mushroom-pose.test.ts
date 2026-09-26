import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GENE_RANGES, mushroomGenes } from './mushroom-genes';
import { capReach, maxReach, splayed, stemAt } from './mushroom-pose';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);
const genesOf = (seed: number) => mushroomGenes({ seed, cap: 'spotted' });

describe('stemAt', () => {
  it('leaves the foot upright and ends bent over by stemBend', () => {
    const genes = { ...genesOf(1), stemBend: 0.2 };
    assert.deepEqual(stemAt(genes, 0), { x: 0, y: 0, tilt: 0 });
    const top = stemAt(genes, 1);
    assert.ok(Math.abs(top.x - 0.2 * genes.stemHeight) < 1e-9);
    assert.ok(Math.abs(top.y - genes.stemHeight) < 1e-9);
    assert.ok(top.tilt > 0);
  });
});

describe('maxReach', () => {
  for (const splay of [0, 0.22]) {
    it(`bounds every cap's reach at a splay of ${splay}`, () => {
      const bound = maxReach(splay);
      for (const seed of SEEDS) {
        for (const sign of splay === 0 ? [1] : [-1, 1]) {
          const { genes, turn } = splayed(genesOf(seed), sign * splay);
          const { left, right } = capReach(genes, turn);
          const [toward, away] = sign < 0 ? [left, right] : [right, left];
          assert.ok(toward <= bound.toward, `seed ${seed}: ${toward}`);
          assert.ok(away <= bound.away, `seed ${seed}: ${away}`);
        }
      }
    });
  }
});

describe('splayed', () => {
  it('faces a mushroom its splay’s way without leaving any gene’s range', () => {
    for (const seed of SEEDS.slice(0, 200)) {
      for (const side of [-1, 1] as const) {
        const { genes, turn } = splayed(genesOf(seed), side * 0.2);
        assert.ok(Math.sign(turn) === side);
        assert.ok(genes.stemBend * side >= 0 && genes.lean * side >= 0);
        for (const name of ['lean', 'stemBend', 'capTilt'] as const) {
          const [min, max] = GENE_RANGES[name];
          assert.ok(genes[name] >= min && genes[name] <= max);
        }
      }
    }
  });
});
