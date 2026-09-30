import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { patchlessIn } from './mushroom-patch';
import { type Screen, VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** How many visits each screen grows a forest for, and tries at every size up to the cap. */
const FORESTS = 40;
/** The full forests each screen's share of small patches is read over: every tenth visit. */
const SAMPLED = VISITS.filter((_, index) => index % 10 === 0);
/** The radius, in CSS px, of a patch a fingertip lands in whole: 44 across. */
const FINGERTIP = 22;
/**
 * The most of a full forest's mushrooms on each screen whose own patch is
 * narrower than `FINGERTIP`: over `SAMPLED`, as measured, with a point or
 * two to spare. Far caps drawn smaller than a fingertip, and the clump's
 * back cap on the small screens, are most of them.
 */
const MOST_UNDER_FINGERTIP: Record<Screen, number> = {
  tablet: 0.25,
  'tablet portrait': 0.03,
  phone: 0.22,
  'phone held sideways': 0.25,
  'small phone': 0.36,
  desktop: 0.18,
};
/** The mushrooms review 5360733525 found keeping no patch, each on its screen, where a full forest stands. */
const REVIEWED = [
  ['phone held sideways', 1_005_716, 'mushroom-4'],
  ['phone', 9_906_672, 'mushroom-3'],
  ['small phone', 8_402_062, 'mushroom-1'],
] as const;

describe('a grown forest’s taps', () => {
  for (const [name, visit, id] of REVIEWED) {
    it(`leaves ${id} of visit ${String(visit)} a patch of its own on a ${name} screen`, () => {
      const screen = VIEWPORTS.find(([each]) => each === name);
      assert.ok(screen, `${name} is not one of the screens`);
      const [, width, height] = screen;
      const forest = opened(visit, width, height, true);
      assert.ok(forest.mushrooms.some((mushroom) => mushroom.id === id));
      assert.deepEqual(patchlessIn(forest), []);
    });
  }

  for (const [name, width, height] of VIEWPORTS) {
    it(`leaves every mushroom a patch of its own, at every size up to the cap, on a ${name} screen`, (t) => {
      let tried = 0;
      for (const seed of VISITS.slice(0, FORESTS)) {
        const forest = opened(seed, width, height, true);
        for (let size = 1; size <= forest.mushrooms.length; size += 1) {
          const stand = {
            ...forest,
            mushrooms: forest.mushrooms.slice(0, size),
          };
          tried += size;
          assert.deepEqual(
            patchlessIn(stand),
            [],
            `visit ${String(seed)}, ${String(size)} grown`,
          );
        }
      }
      t.diagnostic(`${String(tried)} mushrooms each kept a patch`);
    });

    it(`leaves at most ${String(Math.round(MOST_UNDER_FINGERTIP[name] * 100))}% of a full forest’s mushrooms a patch under a fingertip on a ${name} screen`, (t) => {
      let mushrooms = 0;
      let under = 0;
      for (const seed of SAMPLED) {
        const forest = opened(seed, width, height, true);
        assert.deepEqual(patchlessIn(forest), [], `visit ${String(seed)}`);
        mushrooms += forest.mushrooms.length;
        under += patchlessIn(forest, () => FINGERTIP).length;
      }
      const share = under / mushrooms;
      t.diagnostic(
        `${String(under)} of ${String(mushrooms)} under a fingertip, ${(share * 100).toFixed(1)}%`,
      );
      assert.ok(share <= MOST_UNDER_FINGERTIP[name]);
    });
  }
});
