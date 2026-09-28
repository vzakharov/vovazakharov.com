import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  domeHeight,
  firstMushrooms,
  GENE_RANGES,
  MUSHROOM_SPECIES,
  mushroomGenes,
  SPOT_MARGIN,
} from './mushroom-genes';
import { mulberry32 } from './random';

const SEEDS = Array.from({ length: 400 }, (_, index) => index * 7919 + 1);

describe('mushroomGenes', () => {
  it('grows the same mushroom from the same seed', () => {
    for (const species of MUSHROOM_SPECIES) {
      assert.deepEqual(
        mushroomGenes({ seed: 42, species }),
        mushroomGenes({ seed: 42, species }),
      );
    }
  });

  it('grows different mushrooms from neighbouring seeds', () => {
    const a = mushroomGenes({ seed: 1, species: 'porcini' });
    const b = mushroomGenes({ seed: 2, species: 'porcini' });
    assert.notEqual(a.capWidth, b.capWidth);
  });

  it('keeps every gene inside its range', () => {
    for (const seed of SEEDS) {
      const genes: Record<string, unknown> = mushroomGenes({
        seed,
        species: 'fly-agaric',
      });
      for (const [name, [min, max]] of Object.entries(GENE_RANGES)) {
        const value = genes[name];
        assert.ok(
          typeof value === 'number' && value >= min && value <= max,
          `${name} = ${String(value)}`,
        );
      }
    }
  });

  it('gives the same seed the same shape whatever the species', () => {
    const {
      spots: _spots,
      species: _species,
      ...spotted
    } = mushroomGenes({
      seed: 9,
      species: 'fly-agaric',
    });
    const {
      spots: _none,
      species: _porcini,
      ...plain
    } = mushroomGenes({
      seed: 9,
      species: 'porcini',
    });
    assert.deepEqual(spotted, plain);
  });

  it('spots only the fly agaric', () => {
    for (const species of MUSHROOM_SPECIES.filter(
      (kind) => kind !== 'fly-agaric',
    )) {
      assert.equal(mushroomGenes({ seed: 3, species }).spots.length, 0);
    }
    for (const seed of SEEDS) {
      assert.ok(
        mushroomGenes({ seed, species: 'fly-agaric' }).spots.length >= 3,
      );
    }
  });

  it('keeps spots inside the cap and off the rim', () => {
    for (const seed of SEEDS) {
      const genes = mushroomGenes({ seed, species: 'fly-agaric' });
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
      const { spots } = mushroomGenes({ seed, species: 'fly-agaric' });
      for (const [i, a] of spots.entries()) {
        for (const b of spots.slice(i + 1)) {
          assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= a.r + b.r);
        }
      }
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
    assert.equal(first.species, 'fly-agaric');
  });
});
