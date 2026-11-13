import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  dot,
  minus,
  PILL_RADIUS,
  type Vec3,
} from '@/cube/entities/world';

import { type Axes, CM, hand, padOf } from './hand';
import { between, LOOSE, PINCH, RUNG_AT, RUNG_GRIP } from './hand-shape';

const ROOM = { n: 1, x: 0n, y: 0n };
const RIGHT: Axes = [
  [1, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
];

const apart = (a: Vec3, b: Vec3): number => Math.hypot(...minus(a, b));

describe('padOf', () => {
  it('closes a pinch’s thumb and forefinger on a pill’s width', () => {
    const gap = apart(padOf(PINCH, 0), padOf(PINCH, 4)) * CM;
    assert.ok(Math.abs(gap - 2 * PILL_RADIUS) < 0.1 * PILL_RADIUS);
    assert.ok(apart(padOf(LOOSE, 0), padOf(LOOSE, 4)) * CM > 4 * PILL_RADIUS);
  });

  it('folds a pinch’s other fingers short of the forefinger', () => {
    const [fore] = padOf(PINCH, 0);
    for (const index of [1, 2, 3] as const) {
      assert.ok(padOf(PINCH, index)[0] < fore - 1);
    }
  });

  it('brings a grip’s four fingers round onto the rung, beyond it from the palm', () => {
    const pads = ([0, 1, 2, 3] as const).map((index) =>
      padOf(RUNG_GRIP, index),
    );
    const [rungAlong, , rungThrough] = RUNG_AT;
    for (const [along, , through] of pads) {
      const off = Math.hypot(along - rungAlong, through - rungThrough);
      assert.ok(off > 1.4 && off < 2.2, 'on a 3 cm rung');
      assert.ok(through > rungThrough, 'beyond it from the palm');
    }
  });
});

describe('between', () => {
  it('is its ends at 0 and 1 and halfway at a half', () => {
    assert.deepEqual(between(LOOSE, PINCH, 0), LOOSE);
    assert.deepEqual(between(LOOSE, PINCH, 1), PINCH);
    const half = between(LOOSE, RUNG_GRIP, 0.5);
    assert.equal(half.oppose, (LOOSE.oppose + RUNG_GRIP.oppose) / 2);
    const [loose, grip] = [LOOSE.curls[2][1], RUNG_GRIP.curls[2][1]];
    assert.ok(loose !== undefined && grip !== undefined);
    assert.equal(half.curls[2][1], (loose + grip) / 2);
  });
});

describe('hand', () => {
  it('draws each pose with the same quads, wound the way they face', () => {
    const loose = hand([0, 0, 0], RIGHT, 1, ROOM, LOOSE);
    for (const pose of [PINCH, RUNG_GRIP, between(LOOSE, PINCH, 0.4)]) {
      const quads = hand([0, 0, 0], RIGHT, 1, ROOM, pose);
      assert.equal(quads.length, loose.length);
      for (const { corners, normal } of quads) {
        const [a, b, c, d] = corners;
        assert.ok(dot(cross(minus(c, a), minus(d, b)), normal) >= 0);
      }
    }
  });

  it('runs its sleeve as far back up the arm as the pose says', () => {
    const backOf = (sleeve: number): number =>
      Math.min(
        ...hand([0, 0, 0], RIGHT, 1, ROOM, { ...LOOSE, sleeve }).flatMap(
          ({ corners }) => corners.map(([along]) => along),
        ),
      );
    assert.ok(Math.abs(backOf(40) - -40 * CM) < 1e-9);
    assert.ok(Math.abs(backOf(12) - -12 * CM) < 1e-9);
  });
});
