import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import {
  anchored as anchoredPoint,
  type Eye,
  FRAME_DEPTH,
  groundOfPlane,
  OPENING_EYE,
  scaleAt,
} from '../../model/ground';
import { mushroomGenes } from '../../model/mushroom-genes';
import { grownOn, OPENING_FOOTING, openingIndex } from '../../model/placement';
import { bedPlace } from './bed-place';
import {
  anchoredGround,
  extremes,
  laidOf,
  placeIn,
  placeOf,
} from './clump-layout';
import { meadowLayout } from './layout';
import { MEADOW_FRAME, meadowCamera } from './meadow-camera';
import { viewAt } from './view';
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
 * genes, and a forest drawn as big wherever it stands gives 40–57%.
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
        placeOf(camera, grownOn(OPENING_EYE, { x: 0.5, z: depth })),
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
                  ...pick(groundOfPlane(mushroom.foot), 'z'),
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

describe('the layout anchored at an eye', () => {
  const camera = meadowCamera(1180, 820);
  const opening = meadowLayout(1180, 820, VISITS[0] ?? 1).mushrooms;
  /** An eye walked past the opening clump and turned round to face back the way it came. */
  const BEHIND: Eye = { x: 0.3, y: -6, heading: Math.PI };
  /** Forest mushrooms the eye at `BEHIND` sees ahead of it, behind the opening eye. */
  const grownBehind = [-0.6, 0, 0.6].map((x) => grownOn(BEHIND, { x, z: 0.5 }));

  it('is the opening layout itself at the opening eye', () => {
    assert.equal(anchoredGround(opening, OPENING_EYE), opening);
    for (const footed of [...OPENING_FOOTING, ...extremes(MEADOW_FRAME)]) {
      const place = placeIn(opening, footed);
      assert.ok(place, 'an extreme of the frame not placed');
      assert.deepEqual(place, placeOf(camera, footed));
    }
  });

  it('stays one object while its anchor stays', () => {
    const anchored = anchoredGround(opening, BEHIND);
    assert.equal(anchoredGround(opening, { ...BEHIND }), anchored);
    assert.equal(anchoredGround(anchored, BEHIND), anchored);
  });

  it('places a mushroom behind the opening eye from an anchor facing it', () => {
    const anchored = anchoredGround(opening, BEHIND);
    for (const footed of grownBehind) {
      assert.ok(footed.foot.y < 0, 'not behind the opening eye');
      assert.equal(placeIn(opening, footed), undefined);
      const place = placeIn(anchored, footed);
      assert.ok(place, 'not placed from the anchor facing it');
      const asOpening = placeOf(camera, {
        ...footed,
        foot: anchoredPoint(BEHIND, footed.foot),
      });
      for (const key of ['x', 'y', 'size', 'splay', 'haze'] as const) {
        assert.ok(Math.abs(place[key] - asOpening[key]) < 1e-6, key);
      }
    }
  });

  it('lays a mushroom grown off the opening out once, drawn as the forest stood there', () => {
    for (const footed of grownBehind) {
      const laid = laidOf(camera, footed);
      for (const eye of [BEHIND, { ...BEHIND, x: -0.4, heading: 3 }]) {
        assert.deepEqual(laidOf(camera, footed), laid);
        const drawn = bedPlace(
          viewAt(camera, eye),
          footed.foot,
          0,
          laid.opening,
        );
        const place = placeIn(anchoredGround(opening, eye), footed);
        assert.ok(place);
        const asOpening = bedPlace(
          viewAt(camera, OPENING_EYE),
          anchoredPoint(eye, footed.foot),
        );
        const size = laid.size * drawn.zoom;
        assert.ok(
          Math.abs(size - place.size * asOpening.zoom) < 1e-6 * size,
          `${size.toFixed(3)} drawn`,
        );
      }
    }
  });

  it('keeps the opening clump laid out as the opening eye stands it', () => {
    for (const footed of OPENING_FOOTING) {
      const laid = laidOf(camera, footed);
      assert.deepEqual(
        pick(laid, 'x', 'y', 'size', 'splay', 'haze'),
        placeOf(camera, footed),
      );
    }
  });
});
