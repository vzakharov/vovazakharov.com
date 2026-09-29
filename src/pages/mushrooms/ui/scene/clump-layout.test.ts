import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { FRAME_DEPTH, scaleAt } from '../../model/ground';
import { mushroomGenes } from '../../model/mushroom-genes';
import { openingIndex } from '../../model/placement';
import { placeIn, placeOf } from './clump-layout';
import { meadowCamera } from './meadow-camera';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** How many steps into the distance the frame is walked in. */
const STEPS = 16;
/** How near two sizes count as the same, against the clump's. */
const SAME = 1e-9;

/**
 * The most of the pairs of forest mushrooms standing at different depths, in
 * a meadow grown to six, whose farther one is drawn with the wider cap: the
 * pairs standing nearly as far off as each other are a toss between their
 * genes, and a flat forest, drawn as big wherever it stands, gave 40–57%.
 */
const MOST_FAR_WIDER = 0.2;
/** How many visits each screen grows to six for the pairs. */
const PAIRED_VISITS = 50;

describe('a forest mushroom', () => {
  it('stands smaller the farther off it stands, by the depth that scales the clump', () => {
    const camera = meadowCamera(1180, 820);
    const depths = Array.from(
      { length: STEPS + 1 },
      (_, step) =>
        FRAME_DEPTH.near +
        (step / STEPS) * (FRAME_DEPTH.far - FRAME_DEPTH.near),
    );
    for (const [step, z] of depths.entries()) {
      const nearer = depths[step - 1];
      if (nearer === undefined) continue;
      const [far, near] = [z, nearer].map((depth) =>
        placeOf(camera, { x: 0.5, z: depth }),
      );
      assert.ok(far && near);
      assert.ok(far.size < near.size, `z ${z.toFixed(2)}: no smaller`);
      assert.ok(
        Math.abs(far.size / near.size - scaleAt(z) / scaleAt(nearer)) < SAME,
        `z ${z.toFixed(2)}: ${(far.size / near.size).toFixed(4)} of the nearer`,
      );
    }
  });

  for (const [name, width, height] of VIEWPORTS) {
    it(`is drawn with the wider cap of two at different depths, when the farther, in under ${String(MOST_FAR_WIDER * 100)}% of pairs on a ${name} screen`, (t) => {
      let pairs = 0;
      let farWider = 0;
      for (const seed of VISITS.slice(0, PAIRED_VISITS)) {
        const { layout, mushrooms } = opened(seed, width, height, true);
        const drawn = mushrooms.flatMap((mushroom) => {
          const place = placeIn(layout.mushrooms, mushroom);
          return place && openingIndex(mushroom.foot) === undefined
            ? [
                {
                  ...pick(mushroom.foot, 'z'),
                  cap: mushroomGenes(mushroom).capWidth * place.size,
                },
              ]
            : [];
        });
        for (const far of drawn) {
          for (const near of drawn) {
            if (far.z <= near.z) continue;
            pairs += 1;
            if (far.cap > near.cap) farWider += 1;
          }
        }
      }
      assert.ok(pairs > 0, 'no pairs grown');
      const share = farWider / pairs;
      t.diagnostic(`${String(farWider)} of ${String(pairs)} pairs`);
      assert.ok(share < MOST_FAR_WIDER, `${(share * 100).toFixed(0)}%`);
    });
  }
});
