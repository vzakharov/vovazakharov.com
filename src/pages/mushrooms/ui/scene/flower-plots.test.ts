import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { anchorOf } from '../../model/anchor';
import { reduce } from '../../model/game';
import { distanceBetween } from '../../model/geometry';
import {
  anchored,
  CLUMP_DISTANCE,
  groundFootOf,
  OPENING_EYE,
  unanchored,
} from '../../model/ground';
import { openingIndex } from '../../model/placement';
import { isBeeSown, type Sown } from '../../model/pollen';
import { mulberry32, nextSeed } from '../../model/random';
import { anchoredStand } from './anchored-stand';
import {
  FLOWER_SIZE,
  FLOWERS_APART,
  FOOT_CLEARANCE,
  HEAD_REACH,
} from './flower-layout';
import {
  flowerFeet,
  flowersOf,
  mushroomFeet,
  pulledFeet,
  RING_SLOTS,
  ringFoot,
  standingFlowers,
} from './flower-plots';
import type { Stand } from './flower-sight';
import { type MeadowLayout, meadowLayout } from './layout';
import { perchSight } from './perch-sight';
import { VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/** The least number of flowers the bees plant in the median visit, on every screen. */
const LEAST_PLANTED = 4;
/** How near two ground points count as the same one, in the clump's size. */
const SAME_GROUND = 1e-9;

/** What stands in the meadow while the bees plant. */
const STANDINGS = {
  clump: 'the opening clump',
  forest: 'a full forest',
  thinned: 'the clump thinned to its front mushroom',
} as const;
type Standing = keyof typeof STANDINGS;

/** How many visits each screen and standing plants out. */
const PLANTED_VISITS = 20;
/** How many visits a tablet plants out for the median bed. */
const BED_VISITS = 200;

/**
 * How many flowers a visit plants at the most: the world has room for more,
 * and this many beside the seeded bed already stand more flowers than one
 * screen's cap of fourteen ever held.
 */
const PLANTINGS = 15;

/** A planted-out visit, and how to lay it out on another screen. */
type PlantedOut = Stand & {
  on: (width: number, height: number) => MeadowLayout;
};

/**
 * A visit's meadow as the scene stands it on a screen `width` by `height`,
 * with `standing` in it, and flowers planted until `PLANTINGS` or the sight
 * offers no more room, each in the first slot it offers, as a bee leaving each flower
 * in turn would plant them.
 */
function plantedOut(
  seed: number,
  [width, height]: readonly [number, number],
  standing: Standing,
): PlantedOut {
  const visit = opened(seed, width, height, standing === 'forest');
  let { meadow } = visit;
  const back = meadow.mushrooms[0];
  if (standing === 'thinned' && back) {
    meadow = reduce(meadow, { kind: 'select', ...pick(back, 'id') });
    meadow = reduce(meadow, { kind: 'remove' });
  }
  const { mushrooms } = meadow;
  const { layout, flowers } = visit;
  const planted: Sown[] = [];
  const stand = { layout, flowers, mushrooms, spores: [], planted, pulled: [] };
  const random = mulberry32(seed ^ 0x50_1d);
  while (planted.length < PLANTINGS) {
    const [slot] = perchSight(stand).room;
    if (!slot) break;
    planted.push({
      id: `planted-${String(planted.length + 1)}`,
      seed: nextSeed(random),
      parent: slot.flower,
      ...pick(slot, 'ring'),
    });
  }
  const openers = visit.meadow.mushrooms.filter(
    ({ foot }) => openingIndex(foot) !== undefined,
  );
  return {
    ...stand,
    on: (across, down) =>
      meadowLayout(across, down, seed ^ 0xf1_0e_25, openers),
  };
}

/** The middle of `counts`, the upper one of an even count's two. */
function median(counts: readonly number[]): number {
  const sorted = counts.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Asserts that every planted flower of `stand` stands in `screen`'s world
 * where it stands on the ground, at whatever depth a bee's ring took it, off
 * every standing mushroom's foot and its head apart from every other
 * flower's.
 */
function assertGrounded(
  seed: number,
  stand: Stand,
  screen: MeadowLayout,
): void {
  const placed = standingFlowers(
    screen,
    stand.flowers,
    stand.planted,
    stand.mushrooms,
    stand.pulled,
  );
  const feet = mushroomFeet(screen, stand.mushrooms);
  for (const { id } of stand.planted) {
    const flower = placed.find((each) => each.id === id);
    assert.ok(flower, `visit ${String(seed)}: ${id} hidden on a turn`);
    const { place, foot } = flower;
    assert.ok(
      place.x >= 0 && place.x <= screen.camera.world,
      `visit ${String(seed)}: ${id} out of the world`,
    );
    const head = HEAD_REACH * foot.size;
    for (const mushroom of feet) {
      assert.ok(
        distanceBetween(foot, mushroom) >=
          mushroom.size * FOOT_CLEARANCE + head,
        `visit ${String(seed)}: ${id} on a foot`,
      );
    }
    for (const other of placed) {
      if (other.id === id) continue;
      assert.ok(
        distanceBetween(foot, other.foot) >=
          FLOWERS_APART * HEAD_REACH * (foot.size + other.foot.size),
        `visit ${String(seed)}: ${id} on ${other.id}`,
      );
    }
  }
}

describe('a planted flower', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const standing of ['clump', 'forest', 'thinned'] as const) {
      it(`stands in sight where it was planted, and on its ground off every foot and flower on that screen and turned, the turn moving nothing on the ground, on a ${name} screen with ${STANDINGS[standing]}`, () => {
        const counts = VISITS.slice(0, PLANTED_VISITS).map((seed) => {
          const stand = plantedOut(seed, [width, height], standing);
          const shown = new Set(perchSight(stand).flowers);
          const feet = flowerFeet(stand);
          for (const { id } of stand.planted) {
            assert.ok(
              shown.has(id),
              `visit ${String(seed)}: ${id} out of sight`,
            );
          }
          for (const [across, down] of [
            [width, height],
            [height, width],
          ] as const) {
            const there = stand.on(across, down);
            assertGrounded(seed, stand, there);
            const moved = flowerFeet({ ...stand, layout: there });
            assert.equal(moved.length, feet.length);
            for (const [at, moving] of moved.entries()) {
              const foot = groundFootOf(moving);
              const own = feet[at] && groundFootOf(feet[at]);
              assert.ok(
                own &&
                  Math.abs(foot.x - own.x) < SAME_GROUND &&
                  Math.abs(foot.z - own.z) < SAME_GROUND,
                `visit ${String(seed)}: flower ${String(at)} moved on the ground`,
              );
            }
          }
          return stand.planted.length;
        });
        assert.ok(
          median(counts) >= LEAST_PLANTED,
          `median ${String(median(counts))} planted`,
        );
      });
    }
  }
});

/** Eyes off the opening one, near and far, turned either way. */
const WALKED = [
  { x: 0.7, y: 1.3, heading: 0.2 },
  { x: -3, y: 6, heading: -0.9 },
  { x: 12, y: -20, heading: 2.6 },
].map((eye) => anchorOf(eye));

describe('a bee’s ring', () => {
  it('is the same plane spots from any anchor', () => {
    const parents = [
      { x: 0, y: CLUMP_DISTANCE, size: FLOWER_SIZE },
      { x: -4.2, y: 11.5, size: FLOWER_SIZE },
      { x: 30, y: -17, size: FLOWER_SIZE },
    ];
    for (const parent of parents) {
      for (const [ring] of RING_SLOTS.entries()) {
        const spot = ringFoot(parent, ring, OPENING_EYE);
        assert.ok(spot);
        for (const anchor of WALKED) {
          const moved = { ...parent, ...anchored(anchor, parent) };
          const seen = ringFoot(moved, ring, anchor);
          assert.ok(seen);
          const back = unanchored(anchor, seen);
          assert.ok(
            distanceBetween(back, spot) < SAME_GROUND,
            `slot ${String(ring)} slid ${String(distanceBetween(back, spot))}`,
          );
        }
      }
    }
  });

  it('stands its flowers on the same plane spots in a stand judged from any anchor', () => {
    let compared = 0;
    for (const seed of VISITS.slice(0, PLANTED_VISITS)) {
      const stand = plantedOut(seed, [1180, 820], 'clump');
      const opening = new Map(
        flowersOf(stand).map(({ id, foot }) => [id, foot]),
      );
      for (const anchor of WALKED.slice(0, 2)) {
        for (const { id, foot } of flowersOf(anchoredStand(stand, anchor))) {
          const own = opening.get(id);
          if (!own) continue;
          compared += 1;
          assert.ok(
            distanceBetween(unanchored(anchor, foot), own) < SAME_GROUND,
            `visit ${String(seed)}: ${id} moved`,
          );
        }
      }
    }
    assert.ok(compared > 0);
  });
});

describe('a flower pulled up', () => {
  it('stands nowhere, the rest stand where they stood, and a bee’s flower ringed round it keeps its foot', () => {
    let rung = 0;
    for (const seed of VISITS.slice(0, PLANTED_VISITS)) {
      const stand = plantedOut(seed, [1180, 820], 'clump');
      const before = flowersOf(stand);
      const parents = new Set(
        stand.planted.flatMap((sown) => (isBeeSown(sown) ? [sown.parent] : [])),
      );
      const parent = stand.flowers.find(({ id }) => parents.has(id));
      if (!parent) continue;
      rung += 1;
      const after = flowersOf({ ...stand, pulled: [parent.id] });
      assert.deepEqual(
        after,
        before.filter(({ id }) => id !== parent.id),
        `visit ${String(seed)}`,
      );
    }
    assert.ok(rung > 0, 'no visit rings a flower round a seeded one');
  });

  it('leaves the foot it stood on, seeded or planted, in the order they went, and a flower that never stood none', () => {
    for (const seed of VISITS.slice(0, PLANTED_VISITS)) {
      const stand = plantedOut(seed, [1180, 820], 'clump');
      const standing = flowersOf(stand);
      const [seeded] = standing;
      const planted = standing.at(-1);
      assert.ok(seeded && planted && seeded !== planted);
      const pulled = [planted.id, 'flower-none', seeded.id];
      assert.deepEqual(
        pulledFeet({ ...stand, pulled }),
        [planted.foot, seeded.foot],
        `visit ${String(seed)}`,
      );
    }
  });
});

describe('a tablet’s meadow', () => {
  for (const [name, width, height] of VIEWPORTS.filter(([screen]) =>
    screen.startsWith('tablet'),
  )) {
    for (const standing of ['clump', 'forest'] as const) {
      it(`has room for the bees to plant a bed, over the first visits, on a ${name} screen with ${STANDINGS[standing]}`, (t) => {
        const counts = VISITS.slice(0, BED_VISITS).map(
          (seed) => plantedOut(seed, [width, height], standing).planted.length,
        );
        t.diagnostic(`median ${String(median(counts))} planted`);
        assert.ok(
          median(counts) >= LEAST_PLANTED,
          `median ${String(median(counts))} planted`,
        );
      });
    }
  }
});
