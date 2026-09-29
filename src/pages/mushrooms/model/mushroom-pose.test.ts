import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { containsPoint } from './geometry';
import {
  GENE_RANGES,
  MUSHROOM_SPECIES,
  mushroomGenes,
  type Species,
} from './mushroom-genes';
import { capOutlines, capReach, stemOutline } from './mushroom-outline';
import { capSeat, maxReach, splayed, stemAt } from './mushroom-pose';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);
const genesOf = (seed: number, species: Species = 'fly-agaric') =>
  mushroomGenes({ seed, species });

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
  // Every turn a placement stands a mushroom at: upright, and splayed either
  // way as the forest and the clump splay theirs.
  for (const splay of [0, 0.1, 0.22]) {
    it(`bounds each species' drawn, turned cap at a splay of ${splay}`, (t) => {
      const bound = maxReach(splay);
      const farthest = new Map<Species, number>();
      for (const species of MUSHROOM_SPECIES) {
        for (const seed of SEEDS) {
          for (const sign of splay === 0 ? [1] : [-1, 1]) {
            const { genes, turn } = splayed(
              genesOf(seed, species),
              sign * splay,
            );
            const { left, right } = capReach(genes, turn);
            const [toward, away] = sign < 0 ? [left, right] : [right, left];
            const label = `${species} ${seed}`;
            assert.ok(toward <= bound.toward, `${label}: ${toward}`);
            assert.ok(away <= bound.away, `${label}: ${away}`);
            farthest.set(
              species,
              Math.max(farthest.get(species) ?? 0, toward / bound.toward),
            );
          }
        }
      }
      assert.equal(farthest.size, MUSHROOM_SPECIES.length);
      t.diagnostic(
        `farthest reach, of the bound: ${[...farthest]
          .map(([species, share]) => `${species} ${(share * 100).toFixed(0)}%`)
          .join(', ')}`,
      );
    });
  }
});

describe('splayed', () => {
  it('faces a mushroom its splay’s way, each gene keeping a size its range allows', () => {
    for (const species of MUSHROOM_SPECIES) {
      for (const seed of SEEDS.slice(0, 200)) {
        for (const side of [-1, 1] as const) {
          const { genes, turn } = splayed(genesOf(seed, species), side * 0.2);
          assert.ok(Math.sign(turn) === side);
          assert.ok(genes.stemBend * side >= 0 && genes.lean * side >= 0);
          for (const name of ['lean', 'stemBend', 'capTilt'] as const) {
            // A range on one side of 0 gives the size alone; the sign is the side's.
            const [min, max] = GENE_RANGES[species][name];
            const least = Math.max(0, min);
            const most = Math.max(-min, max);
            const size = Math.abs(genes[name]);
            assert.ok(size >= least && size <= most);
          }
        }
      }
    }
  });
});

describe('capSeat', () => {
  it('seats a butterfly inside every species’ cap as drawn, never in the air', () => {
    for (const species of MUSHROOM_SPECIES) {
      for (const seed of SEEDS.slice(0, 400)) {
        const genes = genesOf(seed, species);
        const [cap] = capOutlines(genes);
        for (const across of [-0.9, -0.5, 0, 0.5, 0.9]) {
          assert.ok(
            containsPoint(cap, capSeat(genes, across)),
            `${species} ${seed} at ${across}`,
          );
        }
      }
    }
  });

  it('seats a butterfly clear of the stem, on top of the head', () => {
    for (const species of MUSHROOM_SPECIES) {
      for (const seed of SEEDS.slice(0, 400)) {
        const genes = genesOf(seed, species);
        const seat = capSeat(genes, 0);
        assert.ok(!containsPoint(stemOutline(genes), seat));
        assert.ok(seat.y > stemAt(genes, 1).y, `${species} ${seed}`);
      }
    }
  });
});
