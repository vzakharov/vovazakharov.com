import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MEADOW_FRAME } from '../ui/scene/meadow-camera';
import { VIEWPORTS, VISITS } from '../ui/scene/viewports';
import { opened } from '../ui/scene/visit-play';
import { type Frame, type Ground, scaleAt, seen } from './ground';
import { apartOnScreen, pickFoot } from './placement';
import { mulberry32, type Random } from './random';

/** How many feet an evenness trial lays out: a meadow's six. */
const FEET = 6;

/** The nearest two of `feet` stand this far apart, as a camera lays them out. */
function nearestPair(feet: readonly Ground[]): number {
  return Math.min(
    ...feet.flatMap((foot, index) =>
      feet.slice(index + 1).map((other) => apartOnScreen(foot, other)),
    ),
  );
}

/** `FEET` feet picked one after another over `frame`, every foot admitted. */
function picked(seed: number, frame: Frame): Ground[] {
  const random = mulberry32(seed);
  const feet: Ground[] = [];
  while (feet.length < FEET) {
    const foot = pickFoot(Math.floor(random() * 2 ** 32), {
      frame,
      feet,
      admits: () => true,
    });
    assert.ok(foot, `no room for foot ${String(feet.length + 1)}`);
    feet.push(foot);
  }
  return feet;
}

/**
 * `FEET` feet over `frame` as a jittered grid lays them: the frame, as a
 * camera lays it out, cut into the cells nearest square, one foot at random
 * in each.
 */
function jittered(random: Random, { across, near, far }: Frame): Ground[] {
  const deep = seen({ x: 0, z: far }).y - seen({ x: 0, z: near }).y;
  const wide = 2 * across;
  const [columns, rows] = [1, 2, 3, 6]
    .map((count) => [count, FEET / count] as const)
    .toSorted(
      ([a, b], [c, d]) =>
        Math.abs(Math.log(wide / a / (deep / b))) -
        Math.abs(Math.log(wide / c / (deep / d))),
    )[0] ?? [FEET, 1];
  return Array.from({ length: FEET }, (_, cell) => {
    const column = cell % columns;
    const row = Math.floor(cell / columns);
    const z = near + ((row + random()) / rows) * (far - near);
    const x = -across + ((column + random()) / columns) * wide;
    return { x: x / scaleAt(z), z };
  });
}

/** `FEET` feet thrown over `frame` at random, as a camera lays it out. */
function thrown(random: Random, { across, near, far }: Frame): Ground[] {
  return Array.from({ length: FEET }, () => {
    const z = near + random() * (far - near);
    return { x: ((random() * 2 - 1) * across) / scaleAt(z), z };
  });
}

const mean = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

describe('pickFoot', () => {
  it("spreads six feet over the world's frame further past a jittered grid than the grid is past feet thrown at random", () => {
    const frame = MEADOW_FRAME;
    const trials = VISITS.slice(0, 300);
    const random = mulberry32(0x97_1d);
    const spread = (lay: (seed: number) => Ground[]) =>
      mean(trials.map((seed) => nearestPair(lay(seed))));
    const picks = spread((seed) => picked(seed, frame));
    const grid = spread(() => jittered(random, frame));
    const chance = spread(() => thrown(random, frame));
    assert.ok(
      picks - grid >= grid - chance,
      `nearest pair ${picks.toFixed(3)}, a grid's ${grid.toFixed(3)}, at random ${chance.toFixed(3)}`,
    );
  });
});

describe('pickFoot without near', () => {
  it('draws the feet it always has', () => {
    let asked = 0;
    const feet = [
      { x: 0, z: 0.24 },
      { x: -0.03, z: 0 },
    ];
    const picks = [1, 2, 3].map((seed) =>
      pickFoot(seed, {
        frame: MEADOW_FRAME,
        feet,
        within: { left: -1, right: 1.5 },
        admits: () => asked++ % 5 === 4,
      }),
    );
    assert.deepEqual(picks, [
      { x: 1.229_470_438_103_484_9, z: 0.232_838_607_565_499_8 },
      { x: 0.908_076_693_222_960_7, z: 1.487_470_301_422_290_3 },
      { x: 0.114_874_278_939_894_71, z: 1.983_268_376_234_919 },
    ]);
  });
});

describe('pickFoot near a parent', () => {
  const frame = MEADOW_FRAME;
  const within = { left: -2, right: 2 };
  const reach = 1;
  /** Parents in the middle, at the span's edges and at the frame's near and far edges. */
  const parents: readonly Ground[] = [
    { x: 0, z: 0.24 },
    { x: 1.9, z: 1 },
    { x: -1.9, z: 0 },
    { x: 0.5, z: frame.near },
    { x: -0.2, z: frame.far },
  ];

  it('stands every foot within reach of the parent, clear of it, on the frame and within the span', () => {
    for (const ground of parents) {
      for (const seed of VISITS.slice(0, 40)) {
        const foot = pickFoot(seed, {
          frame,
          feet: [ground],
          within,
          admits: () => true,
          near: { ground, reach },
        });
        assert.ok(foot, `no foot round ${JSON.stringify(ground)}`);
        const apart = apartOnScreen(foot, ground);
        assert.ok(apart <= reach + 1e-9, `${String(apart)} from the parent`);
        assert.ok(apart >= 0.3, `${String(apart)} from the parent`);
        assert.ok(foot.z >= frame.near && foot.z <= frame.far);
        const across = seen(foot).x;
        assert.ok(across >= within.left && across <= within.right);
      }
    }
  });

  it('spreads the feet round the parent rather than to one side', () => {
    const [ground] = parents;
    assert.ok(ground);
    const sides = new Set(
      VISITS.slice(0, 40).map((seed) => {
        const foot = pickFoot(seed, {
          frame,
          feet: [ground],
          admits: () => true,
          near: { ground, reach },
        });
        assert.ok(foot);
        return Math.sign(seen(foot).x - seen(ground).x);
      }),
    );
    assert.ok(sides.has(1) && sides.has(-1));
  });
});

describe('a meadow grown to six', () => {
  const [, width, height] = VIEWPORTS[2];
  const seeds = VISITS.slice(0, 12);
  const feetOf = (seed: number) =>
    opened(seed, width, height, true).mushrooms.map(({ foot }) => foot);

  it('grows differently in every visit', () => {
    const meadows = seeds.map((seed) => JSON.stringify(feetOf(seed)));
    assert.equal(new Set(meadows).size, seeds.length);
  });

  it('grows the same from one seed', () => {
    for (const seed of seeds.slice(0, 4)) {
      assert.deepEqual(feetOf(seed), feetOf(seed));
    }
  });
});
