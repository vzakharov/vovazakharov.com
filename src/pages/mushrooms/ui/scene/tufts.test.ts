import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_LIMIT, type Sown } from '../../model/pollen';
import { mulberry32 } from '../../model/random';
import { FLOWER_SIZE, standingOn } from './flower-layout';
import { standingFlowers } from './flower-plots';
import { type Stand, takesFlower } from './flower-sight';
import type { Tuft } from './grass';
import { growTufts, TUFT_REACH, tuftAt, tuftFoot, tuftReach } from './tufts';
import { FLOOR_HELD, VIEWPORTS } from './viewports';
import { opened, relaidOn } from './visit-play';

const SCREENS = [...VIEWPORTS, FLOOR_HELD] as const;
/** How many visits each screen is tried over. */
const VISITS = 40;
/** The fewest tufts a screen grows for the child to plant on. */
const FEWEST_TUFTS = 6;

const tuftsOf = (stand: Stand, seed: number): Tuft[] =>
  growTufts(stand, mulberry32(seed ^ 0x5e_ed));

/** `stand` with a flower planted on `tuft`, as the scene plants it. */
function plantedOn(stand: Stand, tuft: Tuft, seed: number): Stand {
  const planted: Sown[] = [
    ...stand.planted,
    {
      id: `planted-${String(stand.planted.length + 1)}`,
      seed,
      foot: tuftFoot(stand.layout.camera, tuft),
    },
  ];
  return { ...stand, planted };
}

describe('tuftAt', () => {
  const tufts: Tuft[] = [
    { x: 100, y: 300, size: 6, phase: 0, flank: 0, middle: 0, crown: 0 },
    { x: 130, y: 300, size: 6, phase: 0, flank: 0, middle: 0, crown: 0 },
    { x: 400, y: 500, size: 30, phase: 0, flank: 0, middle: 0, crown: 0 },
  ];

  it('finds the tuft a finger lands on, the nearest of two that reach', () => {
    assert.equal(tuftAt(tufts, { x: 104, y: 294 }), tufts[0]);
    assert.equal(tuftAt(tufts, { x: 124, y: 294 }), tufts[1]);
  });

  it('answers a finger’s pad round a small tuft, and its blades round a big one', () => {
    const [small, , big] = tufts;
    assert.ok(small && big);
    assert.equal(tuftReach(small), TUFT_REACH);
    assert.ok(tuftReach(big) > TUFT_REACH);
    assert.equal(tuftAt(tufts, { x: 400, y: 470 + tuftReach(big) - 1 }), big);
  });

  it('leaves the bare ground bare', () => {
    assert.equal(tuftAt(tufts, { x: 250, y: 400 }), undefined);
    assert.equal(
      tuftAt(tufts, { x: 100, y: 300 - 6 - TUFT_REACH - 1 }),
      undefined,
    );
  });
});

describe('planting on a tuft', () => {
  for (const [name, width, height] of SCREENS) {
    it(`grows tufts on the ${name} that each take a flower, standing at its root, till the meadow is full`, () => {
      for (let visit = 0; visit < VISITS; visit++) {
        const seed = visit * 7919 + 3;
        let stand: Stand = opened(seed, width, height, false);
        const tufts = tuftsOf(stand, seed);
        assert.ok(tufts.length >= FEWEST_TUFTS, `visit ${String(seed)}`);
        for (const tuft of tufts) {
          const foot = tuftFoot(stand.layout.camera, tuft);
          const full =
            stand.flowers.length + stand.planted.length >= FLOWER_LIMIT;
          assert.equal(
            takesFlower(stand, foot),
            !full,
            `visit ${String(seed)}`,
          );
          if (full) continue;
          assert.equal(foot.size, FLOWER_SIZE);
          const root = standingOn(stand.layout.camera, foot);
          assert.ok(Math.abs(root.x - tuft.x) < 1e-6);
          assert.ok(Math.abs(root.y - tuft.y) < 1e-6);
          stand = plantedOn(stand, tuft, stand.planted.length + 60);
        }
      }
    });
  }

  it('refuses a second flower on a tuft already planted, and every tuft once the meadow is full', () => {
    const seed = 3;
    const stand = opened(seed, 1180, 820, false);
    const tufts = tuftsOf(stand, seed);
    const tuft = tufts.find((each) =>
      takesFlower(stand, tuftFoot(stand.layout.camera, each)),
    );
    assert.ok(tuft);
    const once = plantedOn(stand, tuft, 11);
    assert.equal(takesFlower(once, tuftFoot(once.layout.camera, tuft)), false);
    let full: Stand = stand;
    for (const each of tufts) {
      if (takesFlower(full, tuftFoot(full.layout.camera, each))) {
        full = plantedOn(full, each, full.planted.length + 20);
      }
    }
    assert.equal(full.flowers.length + full.planted.length, FLOWER_LIMIT);
    for (const each of tufts) {
      assert.equal(
        takesFlower(full, tuftFoot(full.layout.camera, each)),
        false,
      );
    }
  });

  it('keeps every flower planted on a tuft through a turn and back, on a tuft of its own', () => {
    for (const [, width, height] of SCREENS) {
      const seed = 17;
      let stand: Stand = opened(seed, width, height, false);
      for (const tuft of tuftsOf(stand, seed)) {
        if (takesFlower(stand, tuftFoot(stand.layout.camera, tuft))) {
          stand = plantedOn(stand, tuft, stand.planted.length + 40);
        }
      }
      assert.ok(stand.planted.length > 0);
      for (const [across, down] of [
        [height, width],
        [width, height],
      ] as const) {
        const layout = relaidOn(stand, seed, across, down);
        const standing = standingFlowers(
          layout,
          stand.flowers,
          stand.planted,
          stand.mushrooms,
        );
        const regrown = tuftsOf({ ...stand, layout }, seed);
        for (const { id } of stand.planted) {
          const flower = standing.find((each) => each.id === id);
          assert.ok(flower, `${id} gone on ${String(across)}×${String(down)}`);
          assert.ok(
            regrown.some(
              ({ x, y }) =>
                Math.hypot(x - flower.place.x, y - flower.place.y) < 1e-6,
            ),
            `${id} off the grass on ${String(across)}×${String(down)}`,
          );
        }
      }
    }
  });
});
