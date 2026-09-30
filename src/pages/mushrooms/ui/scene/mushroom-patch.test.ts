import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { openingIndex } from '../../model/placement';
import { patchlessIn, takerAt, tappedIn } from './mushroom-patch';
import { drawnHolds } from './mushroom-tap';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** How many visits each screen grows a forest for, and tries at every size up to the cap. */
const FORESTS = 40;
/** The full forests each screen's taps are tried over: every tenth visit. */
const SAMPLED = VISITS.filter((_, index) => index % 10 === 0);
/** How far apart, in CSS px, the taps tried across a grown mushroom's head stand. */
const HEAD_GRID = 3;
/**
 * The least share of the taps on a grown mushroom's drawn cap and gills that
 * reach it: the rest land where a nearer mushroom is drawn in front, which
 * takes them by design.
 */
const LEAST_HEAD_SHARE = 0.8;
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

    // A child aims at a grown mushroom's head: a tap at its middle always
    // reaches it, and a tap anywhere on its drawn cap and gills almost always.
    it(`lands a tap on every grown mushroom of a full forest on a ${name} screen`, (t) => {
      let grown = 0;
      let missed = 0;
      let worst = 1;
      for (const seed of SAMPLED) {
        const forest = opened(seed, width, height, true);
        assert.deepEqual(patchlessIn(forest), [], `visit ${String(seed)}`);
        const tapped = tappedIn(forest);
        for (const target of tapped.targets) {
          const mushroom = forest.mushrooms.find(({ id }) => id === target.id);
          assert.ok(mushroom, `${target.id} stands in no meadow`);
          if (openingIndex(mushroom.foot) !== undefined) continue;
          grown += 1;
          if (takerAt(target.middle, tapped) !== target.id) missed += 1;
          const head = { ...target.area, stem: [] };
          let on = 0;
          let took = 0;
          const { left, right, top, bottom } = target.box;
          for (let x = left; x <= right; x += HEAD_GRID) {
            for (let y = top; y <= bottom; y += HEAD_GRID) {
              if (!drawnHolds(head, target.local({ x, y }))) continue;
              on += 1;
              if (takerAt({ x, y }, tapped) === target.id) took += 1;
            }
          }
          assert.ok(
            on > 0,
            `visit ${String(seed)}, ${target.id} draws no head`,
          );
          const share = took / on;
          worst = Math.min(worst, share);
          assert.ok(
            share >= LEAST_HEAD_SHARE,
            `visit ${String(seed)}, ${target.id} keeps ${(share * 100).toFixed(1)}% of its head's taps`,
          );
        }
      }
      t.diagnostic(
        `${String(grown)} grown, ${String(missed)} missed at the head's middle, the worst keeps ${(worst * 100).toFixed(1)}% of its head's taps`,
      );
      assert.equal(missed, 0);
    });
  }
});
