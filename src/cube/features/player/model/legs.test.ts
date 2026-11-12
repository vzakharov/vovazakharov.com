import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toWorld } from '@/cube/shared/outside';
import type { Quad, Vec3 } from '@/cube/entities/world';

import { STAGE } from './abroad.test-kit';
import { type Bearing, legsOf } from './legs';
import { EYE_OVER_SAND } from './roam';

const { land } = STAGE;

/** Every corner of `quads`, in the world's metres. */
const cornersOf = (quads: readonly Quad[]): Vec3[] =>
  quads.flatMap(({ corners }) => corners.map((corner) => toWorld(corner)));

const feetOf = (quads: readonly Quad[]): Vec3[] =>
  cornersOf(quads.filter(({ surface }) => surface === 'skin'));

const standing = (x: number, z: number, yaw: number): Bearing => ({
  eye: [x, land.height(x, z) + EYE_OVER_SAND, z],
  yaw,
  elevation: 0,
  roll: 0,
  seat: null,
  swing: 0,
  afloat: false,
});

const bounds = (points: readonly Vec3[], axis: 0 | 1 | 2): [number, number] => {
  const values = points.map((point) => point[axis]);
  return [Math.min(...values), Math.max(...values)];
};

describe('legsOf', () => {
  it('stands the feet on the sand under the eye, in trousers', () => {
    const quads = legsOf(standing(-10, 6, 0), land);
    const all = cornersOf(quads);
    assert.ok(
      all.every((corner) => corner.every((value) => Number.isFinite(value))),
    );
    const [low, high] = bounds(all, 1);
    const ground = land.height(-10, 6);
    assert.ok(Math.abs(low - ground) < 0.06, `${low - ground}`);
    assert.ok(high < ground + EYE_OVER_SAND - 0.15);
    const [west, east] = bounds(feetOf(quads), 0);
    assert.ok(west > -10.3 && east < -9.7);
    assert.ok(quads.some(({ paint }) => paint !== undefined));
    assert.ok(quads.every(({ room }) => room.n === 1));
  });

  it('strides its feet apart with the swing, each the other way', () => {
    const still = bounds(feetOf(legsOf(standing(-10, 6, 0), land)), 0);
    const mid = bounds(
      feetOf(legsOf({ ...standing(-10, 6, 0), swing: 1 }, land)),
      0,
    );
    assert.ok(mid[1] - mid[0] > still[1] - still[0] + 0.4);
  });

  it('lies the legs out from the seat while the eye is down', () => {
    const seat = { at: [-20, 20] as const, lies: Math.PI / 2 };
    const eye: Vec3 = [-20, land.height(-20, 19.2) + 0.13, 19.2];
    const quads = legsOf({ eye, yaw: 2, seat, swing: 0, afloat: false }, land);
    const all = cornersOf(quads);
    assert.ok(
      all.every((corner) => corner.every((value) => Number.isFinite(value))),
    );
    const [, south] = bounds(feetOf(quads), 2);
    assert.ok(south > 20.8 && south < 21.2, `${south}`);
    assert.ok(all.every(([x, y, z]) => y > land.height(x, z) - 0.05));
    const [, high] = bounds(all, 1);
    assert.ok(high < land.height(-20, 20) + 0.5);
  });

  it('trails the legs behind a swimmer, under the eye', () => {
    const eye: Vec3 = [-60, 0.14, 0];
    const feet = feetOf(
      legsOf({ eye, yaw: Math.PI, seat: null, swing: 0.5, afloat: true }, land),
    );
    assert.ok(feet.every(([x, y]) => x > -59.5 && y < 0));
  });
});
