import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
  RUSSULA_TONES,
  type Species,
} from '../../model/mushroom-genes';
import { contrast, luminance, mix, toHsv } from './colour';
import { inkFor } from './ink';
import {
  haloFor,
  mushroomTints,
  porciniMargin,
  russulaCentre,
} from './mushroom-tints';
import { PALETTE } from './palette';

/** The luminances where the ink rule gives a dark fill only a weak edge. */
const WEAK_EDGE = [0.021, 0.045] as const;
/** Every haze a mushroom stands in, from none to the farthest slot's. */
const HAZES = [0, 0.1, 0.2, 0.3, 0.4];
const SEEDS = Array.from({ length: 2000 }, (_, index) => index + 1);

function grown(species: Species): MushroomGenes[] {
  return SEEDS.map((seed) => mushroomGenes({ seed, species }));
}

const hueDegrees = (colour: number) => toHsv(colour).h * 360;

describe('a porcini', () => {
  const porcini = grown('porcini').flatMap((genes) =>
    genes.species === 'porcini' ? [genes] : [],
  );

  it('keeps its cap and its margin out of the luminance where an edge reads weakly', () => {
    const failing = porcini.flatMap((genes) =>
      [mushroomTints(genes).cap, porciniMargin(genes)].flatMap((fill) =>
        HAZES.flatMap((haze) => {
          const shown = luminance(mix(fill, PALETTE.air, haze));
          return shown > WEAK_EDGE[0] && shown < WEAK_EDGE[1]
            ? [`${fill.toString(16)} hazed ${String(haze)}: ${shown.toFixed(3)}`]
            : [];
        }),
      ),
    );
    assert.deepEqual(failing, []);
  });

  it('is brown, from tan to chestnut, under a paler margin, on a whitish stem', () => {
    const caps = porcini.map((genes) => mushroomTints(genes).cap);
    const lums = caps.map((cap) => luminance(cap));
    // A spread of browns, not one.
    assert.ok(Math.max(...lums) / Math.min(...lums) > 1.6);
    for (const genes of porcini) {
      const { cap, stem } = mushroomTints(genes);
      const hue = hueDegrees(cap);
      assert.ok(hue > 15 && hue < 40, hue.toFixed(1));
      assert.ok(toHsv(cap).s > 0.4 && toHsv(cap).v < 0.8);
      assert.ok(luminance(porciniMargin(genes)) > luminance(cap) * 1.3);
      assert.ok(luminance(stem) > 0.75);
    }
  });
});

describe('a chanterelle', () => {
  it('is one egg-yolk orange from foot to rim', () => {
    for (const genes of grown('chanterelle')) {
      const { stem, under, cap } = mushroomTints(genes);
      assert.equal(stem, cap);
      assert.equal(under, cap);
      const hue = hueDegrees(cap);
      assert.ok(hue > 22 && hue < 46, hue.toFixed(1));
      assert.ok(toHsv(cap).s > 0.8 && toHsv(cap).v > 0.9);
    }
  });
});

describe('a russula', () => {
  const russulas = grown('russula').flatMap((genes) =>
    genes.species === 'russula' ? [genes] : [],
  );

  it('grows every tone, each on a white stem over white gills', () => {
    const tones = new Set(russulas.map(({ tone }) => tone));
    assert.deepEqual([...tones].toSorted(), [...RUSSULA_TONES].toSorted());
    for (const genes of russulas) {
      const { stem, under } = mushroomTints(genes);
      assert.ok(luminance(stem) > 0.8 && luminance(under) > 0.8);
    }
  });

  it('is paler in its dip than at its rim', () => {
    for (const genes of russulas) {
      assert.ok(
        luminance(russulaCentre(genes)) >
          luminance(mushroomTints(genes).cap) * 1.1,
      );
    }
  });

  it('keeps its red apart from a fly agaric’s, and its rose lighter still', () => {
    const { red, rose } = PALETTE.russula;
    assert.ok(Math.abs(hueDegrees(red) - hueDegrees(PALETTE.capRed)) > 5);
    assert.ok(luminance(rose) > luminance(PALETTE.capRed) * 1.8);
  });
});

describe('a house on every species', () => {
  it('edges each window on the cap and the door on the stem, by the ink or a pale line round it', () => {
    const failing = MUSHROOM_SPECIES.flatMap((species) =>
      grown(species).flatMap((genes) => {
        const { cap, stem } = mushroomTints(genes);
        return [
          [PALETTE.wood, cap],
          [PALETTE.woodDeep, stem],
        ].flatMap(([fill = 0, behind = 0]) => {
          const edge = haloFor(fill, behind) ?? inkFor(fill);
          return contrast(edge, behind) >= 3
            ? []
            : [`${species} ${fill.toString(16)} on ${behind.toString(16)}`];
        });
      }),
    );
    assert.deepEqual([...new Set(failing)], []);
  });

  it('rings a window with a pale line on a porcini’s darker caps only', () => {
    const haloed = grown('porcini').filter(
      (genes) => haloFor(PALETTE.wood, mushroomTints(genes).cap) !== undefined,
    );
    assert.ok(haloed.length > 0 && haloed.length < SEEDS.length);
    const [fly] = grown('fly-agaric');
    assert.ok(fly);
    assert.equal(haloFor(PALETTE.wood, mushroomTints(fly).cap), undefined);
  });
});
