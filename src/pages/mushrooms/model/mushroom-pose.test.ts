import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { containsPoint, placedAt } from './geometry';
import {
  GENE_RANGES,
  MUSHROOM_SPECIES,
  mushroomGenes,
  type Species,
} from './mushroom-genes';
import { capOutlines, stemOutline } from './mushroom-outline';
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
  for (const splay of [0, 0.22]) {
    it(`bounds every species' reach at a splay of ${splay}, as its cap is drawn`, () => {
      const bound = maxReach(splay);
      for (const species of MUSHROOM_SPECIES) {
        for (const seed of SEEDS) {
          for (const sign of splay === 0 ? [1] : [-1, 1]) {
            const { genes, turn } = splayed(
              genesOf(seed, species),
              sign * splay,
            );
            // The cap as drawn: its outlines turned as the mushroom stands.
            const drawn = capOutlines(genes)
              .flat()
              .map((point) => placedAt({ x: 0, y: 0 }, -turn, point).x);
            const [left, right] = [-Math.min(...drawn), Math.max(...drawn)];
            const label = `${species} ${seed}`;
            const [toward, away] = sign < 0 ? [left, right] : [right, left];
            assert.ok(toward <= bound.toward, `${label}: ${toward}`);
            assert.ok(away <= bound.away, `${label}: ${away}`);
          }
        }
      }
    });
  }

  it('reaches no farther for any species than for the fly agaric', () => {
    // The layout's margins were set for the fly agaric's reach.
    const flyAgaric = GENE_RANGES['fly-agaric'];
    for (const splay of [0, 0.22]) {
      const lean = flyAgaric.lean[1] + splay;
      const corner = Math.hypot(
        flyAgaric.capWidth[1] / 2,
        flyAgaric.capHeight[1],
      );
      const toward =
        flyAgaric.stemHeight[1] * (flyAgaric.stemBend[1] + Math.sin(lean)) +
        corner;
      assert.ok(Math.abs(maxReach(splay).toward - toward) < 1e-12);
      if (splay > 0) assert.ok(Math.abs(maxReach(splay).away - corner) < 1e-3);
    }
  });
});

describe('splayed', () => {
  it('faces a mushroom its splay’s way without leaving any gene’s range', () => {
    for (const species of MUSHROOM_SPECIES) {
      for (const seed of SEEDS.slice(0, 200)) {
        for (const side of [-1, 1] as const) {
          const { genes, turn } = splayed(genesOf(seed, species), side * 0.2);
          assert.ok(Math.sign(turn) === side);
          assert.ok(genes.stemBend * side >= 0 && genes.lean * side >= 0);
          for (const name of ['lean', 'stemBend', 'capTilt'] as const) {
            const [min, max] = GENE_RANGES[species][name];
            assert.ok(genes[name] >= min && genes[name] <= max);
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
