import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Eye, OPENING_EYE } from '../../model/ground';
import { openingIndex } from '../../model/placement';
import {
  patchlessIn,
  type PatchTarget,
  takerAt,
  type Tapped,
  tappedIn,
} from './mushroom-patch';
import { drawnHolds } from './mushroom-tap';
import { viewAt } from './view';
import { type Screen, VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** How many visits each screen grows a forest for, and tries at every size up to the cap. */
const FORESTS = 40;
/** How far apart, in CSS px, the taps tried across a grown mushroom's head stand. */
const HEAD_GRID = 3;
/** Where each forest's `+` presses stand, as `opened` takes it: a view, or anywhere in the world absent one. */
type Viewing = Parameters<typeof opened>[4];
/** The view `eye` sees each layout through. */
const from =
  (eye: Eye): NonNullable<Viewing> =>
  (layout) =>
    viewAt(layout.camera, eye);
/**
 * Where a child grows a forest, each tried over every 40th visit from its
 * own offset: anywhere in the world, as one who walks about; in the opening
 * view, as one who never moves and so grows the densest forests; and turned
 * toward the wedge's side, and stepped 3 units in.
 */
const GROWN_ON: ReadonlyArray<readonly [string, Viewing]> = [
  ['anywhere in the world', undefined],
  ['in the opening view', from(OPENING_EYE)],
  ['turned', from({ ...OPENING_EYE, heading: 0.3 })],
  ['stepped in', from({ ...OPENING_EYE, y: OPENING_EYE.y + 3 })],
];
/** How many visits apart the forests tried on each screen and crop stand. */
const SAMPLE_STEP = 40;
/** The visits measured worst, each on its screen and crop, tried beside the sample. */
const WORST: ReadonlyArray<{ screen: Screen; crop: string; visit: number }> = [
  { screen: 'tablet', crop: 'in the opening view', visit: 2_051_024 },
];
/**
 * The least share of the taps on a grown mushroom's drawn cap and gills that
 * reach it, over every screen's forests grown on each of `GROWN_ON`: the rest
 * land where something is drawn in front, which takes them by design. Set
 * under the worst measured over each screen's first 400 visits on each crop,
 * 73.0%, which the visits of `WORST` hold.
 */
const LEAST_HEAD_SHARE = 0.72;
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

    // A child aims at a grown mushroom's head: a tap anywhere on its drawn
    // cap and gills, its middle included, reaches it or what is drawn in
    // front of it, and it keeps most of them.
    for (const [offset, [crop, viewIn]] of GROWN_ON.entries()) {
      const visits = [
        ...VISITS.filter((_, index) => index % SAMPLE_STEP === offset * 10),
        ...WORST.filter(
          (each) => each.screen === name && each.crop === crop,
        ).map(({ visit }) => visit),
      ];
      it(`lands a tap on every grown mushroom of a full forest grown ${crop} on a ${name} screen`, (t) => {
        let grown = 0;
        let covered = 0;
        let worst = 1;
        for (const seed of visits) {
          const forest = opened(seed, width, height, true, viewIn);
          assert.deepEqual(patchlessIn(forest), [], `visit ${String(seed)}`);
          const tapped = tappedIn(forest);
          for (const target of tapped.targets) {
            const mushroom = forest.mushrooms.find(
              ({ id }) => id === target.id,
            );
            assert.ok(mushroom, `${target.id} stands in no meadow`);
            if (openingIndex(mushroom.foot) !== undefined) continue;
            grown += 1;
            const atMiddle = takerAt(target.middle, tapped);
            if (atMiddle !== target.id) covered += 1;
            assert.ok(
              atMiddle === target.id || inFront(atMiddle, target, tapped),
              `visit ${String(seed)}, ${target.id}'s middle goes to ${String(atMiddle)}`,
            );
            const head = { ...target.area, stem: [] };
            let on = 0;
            let took = 0;
            const { left, right, top, bottom } = target.box;
            for (let x = left; x <= right; x += HEAD_GRID) {
              for (let y = top; y <= bottom; y += HEAD_GRID) {
                if (!drawnHolds(head, target.local({ x, y }))) continue;
                on += 1;
                const taker = takerAt({ x, y }, tapped);
                if (taker === target.id) took += 1;
                else {
                  assert.ok(
                    inFront(taker, target, tapped),
                    `visit ${String(seed)}, a tap on ${target.id}'s head goes to ${String(taker)}, behind it`,
                  );
                }
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
          `${String(grown)} grown, ${String(covered)} covered at the head's middle, the worst keeps ${(worst * 100).toFixed(1)}% of its head's taps`,
        );
      });
    }
  }
});

/** Whether `taker`, taking a tap on `target`'s head, is something drawn in front of it. */
function inFront(
  taker: string | undefined,
  target: PatchTarget,
  { flowers, targets }: Tapped,
): boolean {
  if (taker === undefined) return false;
  const at = targets.findIndex(({ id }) => id === taker);
  return at === -1
    ? flowers.some(({ depth }) => depth > target.depth)
    : at > targets.indexOf(target);
}
