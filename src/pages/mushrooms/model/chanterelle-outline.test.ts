import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  mouthEdges,
  ridgeLines,
  trumpetOutlines,
} from './chanterelle-outline';
import { containsPoint, distanceToEdge, type Point } from './geometry';
import {
  type ChanterelleGenes,
  mushroomGenes,
  type Species,
} from './mushroom-genes';
import { capOutlines, MUSHROOM_INK, stemOutline } from './mushroom-outline';
import { stemAt } from './mushroom-pose';
import { capBase, capSurface } from './mushroom-profile';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 7919 + 3);

function chanterelle(seed: number): ChanterelleGenes {
  const genes = mushroomGenes({ seed, species: 'chanterelle' });
  assert.ok(genes.species === 'chanterelle');
  return genes;
}

/** Whether `point` lies in `outline` or no farther out than the ink line drawn round it covers. */
const underInk = (outline: readonly Point[], point: Point) =>
  containsPoint(outline, point) ||
  distanceToEdge(outline, point) <= MUSHROOM_INK / 2;

describe('ridgeLines', () => {
  it('runs every ridge over the funnel and the stem as they are filled, never off them', () => {
    for (const seed of SEEDS) {
      const genes = chanterelle(seed);
      const [, funnel] = capOutlines(genes);
      const stem = stemOutline(genes);
      for (const [index, ridge] of ridgeLines(genes).entries()) {
        for (const point of ridge) {
          if (!underInk(funnel, point) && !underInk(stem, point))
            assert.fail(
              `seed ${seed}: ridge ${index} off at ${JSON.stringify(point)}`,
            );
        }
      }
    }
  });

  it('starts every ridge on the front rim and ends it down the stem', () => {
    for (const seed of SEEDS.slice(0, 400)) {
      const genes = chanterelle(seed);
      const ridges = ridgeLines(genes);
      assert.equal(ridges.length, genes.ridges);
      const top = stemAt(genes, 1);
      const [lip, funnel] = capOutlines(genes);
      for (const ridge of ridges) {
        const [start] = ridge;
        const end = ridge.at(-1);
        assert.ok(start && end);
        // On the funnel's front rim, tucked under the lip or its ink.
        assert.ok(
          distanceToEdge(funnel, start) <= MUSHROOM_INK / 2,
          `seed ${seed}`,
        );
        assert.ok(underInk(lip, start), `seed ${seed}`);
        assert.ok(end.y < top.y - 0.2 * genes.stemHeight, `seed ${seed}`);
      }
    }
  });
});

/** The height of the middle point of a mouth's `edge`. */
const middleY = (edge: readonly Point[]) =>
  edge[Math.floor(edge.length / 2)]?.y ?? 0;

describe('mouthEdges', () => {
  it('opens the mouth inside the lip, its far edge well over its near one', () => {
    for (const seed of SEEDS) {
      const genes = chanterelle(seed);
      const [lip] = trumpetOutlines(genes);
      const { far, near } = mouthEdges(genes);
      for (const point of [...far, ...near]) {
        if (!containsPoint(lip, point))
          assert.fail(`seed ${seed}: mouth off the lip at ${JSON.stringify(point)}`);
      }
      const depth = capSurface(genes, 0) - capBase(genes, 0);
      assert.ok(middleY(far) - middleY(near) > depth * 0.4, `seed ${seed}`);
    }
  });
});

/** The mean of how far `species`' stem's top stands turned from upright, its lean with its bend. */
function meanTurn(species: Species): number {
  const turns = SEEDS.map((seed) => {
    const genes = mushroomGenes({ seed, species });
    return Math.abs(genes.lean + stemAt(genes, 1).tilt);
  });
  return turns.reduce((sum, turn) => sum + turn, 0) / turns.length;
}

describe('a chanterelle', () => {
  it('stands nearer upright than a fly agaric', () => {
    assert.ok(meanTurn('chanterelle') < meanTurn('fly-agaric') * 0.5);
  });
});
