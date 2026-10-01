import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_COLOURS, flowerGenes } from '../../model/flower-genes';
import { mulberry32, nextSeed } from '../../model/random';
import { toHsv } from './colour';
import { petalColour } from './flower-tints';
import { PALETTE } from './palette';

/** Under this saturation a colour is a white, and has no hue to read. */
const WHITE = 0.1;
/** How many times nearer its own base hue a nudged petal stays than any other colour's. */
const LEAST_MARGIN = 3;

/** How far apart two hues stand round the wheel, in turns. */
const hueGap = (a: number, b: number) => {
  const gap = Math.abs(a - b) % 1;
  return Math.min(gap, 1 - gap);
};

const random = mulberry32(21);
const grown = Array.from({ length: 4000 }, () =>
  flowerGenes({ seed: nextSeed(random) }),
);

describe('petalColour', () => {
  it('keeps every flower’s colour reading as its own', () => {
    for (const genes of grown) {
      const petal = toHsv(petalColour(genes));
      const base = toHsv(PALETTE.flowers[genes.colour]);
      if (base.s < WHITE) {
        assert.ok(petal.s < WHITE, 'a white stays white');
        continue;
      }
      const own = hueGap(petal.h, base.h);
      for (const other of FLOWER_COLOURS) {
        const hsv = toHsv(PALETTE.flowers[other]);
        if (other === genes.colour || hsv.s < WHITE) continue;
        assert.ok(
          hueGap(petal.h, hsv.h) >= own * LEAST_MARGIN,
          `${genes.colour} nudged toward ${other}`,
        );
      }
    }
  });

  it('gives a colour’s flowers a spread of petals, few quite the same', () => {
    for (const colour of FLOWER_COLOURS) {
      const petals = grown
        .filter((genes) => genes.colour === colour)
        .slice(0, 40)
        .map((genes) => petalColour(genes));
      assert.ok(new Set(petals).size >= 10, colour);
    }
  });
});
