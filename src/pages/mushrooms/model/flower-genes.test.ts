import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  firstFlowers,
  FLOWER_COLOURS,
  FLOWER_RANGES,
  flowerGenes,
  PETAL_KINDS,
} from './flower-genes';
import { mulberry32 } from './random';

const flowers = firstFlowers(mulberry32(7), 400).map((flower) =>
  flowerGenes(flower),
);

const seen = (read: (genes: (typeof flowers)[number]) => unknown) =>
  new Set(flowers.map((genes) => read(genes)));

describe('flowerGenes', () => {
  it('is a pure function of the seed', () => {
    assert.deepEqual(flowerGenes({ seed: 42 }), flowerGenes({ seed: 42 }));
    assert.notDeepEqual(flowerGenes({ seed: 42 }), flowerGenes({ seed: 43 }));
  });

  it('keeps every gene in its range', () => {
    for (const genes of flowers) {
      const record: Record<string, unknown> = genes;
      for (const [name, [min, max]] of Object.entries(FLOWER_RANGES)) {
        const value = record[name];
        assert.ok(
          typeof value === 'number' && value >= min && value <= max,
          `${name} = ${String(value)}`,
        );
      }
      assert.ok(Number.isInteger(genes.fold));
      assert.ok(genes.twist >= 0 && genes.twist < (Math.PI * 2) / genes.fold);
    }
  });

  it('grows every kind, colour, fold and ring count', () => {
    assert.equal(seen((genes) => genes.petal).size, PETAL_KINDS.length);
    assert.equal(seen((genes) => genes.colour).size, FLOWER_COLOURS.length);
    assert.equal(seen((genes) => genes.fold).size, 5);
    assert.equal(seen((genes) => genes.rings).size, 2);
  });
});

describe('firstFlowers', () => {
  it('gives each its own id and seed', () => {
    const grown = firstFlowers(mulberry32(1), 8);
    assert.equal(new Set(grown.map(({ id }) => id)).size, 8);
    assert.equal(new Set(grown.map(({ seed }) => seed)).size, 8);
  });
});
