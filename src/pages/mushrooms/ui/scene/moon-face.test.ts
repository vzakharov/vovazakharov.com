import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { moonFace } from './moon-face';

const MOON = { x: 40, y: -10, r: 20 };

const inside = ({ x, y }: Point, reach = 0) =>
  Math.hypot(x - MOON.x, y - MOON.y) + reach < MOON.r;

describe('moonFace', () => {
  const face = moonFace(MOON);

  it('lies wholly on the disc', () => {
    for (const shape of [...face.seas, ...face.features]) {
      assert.ok(shape.every((point) => inside(point)));
    }
    assert.ok(face.cheeks.every((cheek) => inside(cheek, cheek.r)));
  });

  it('is two eyes over a smile, and mirrored across the middle', () => {
    const middles = face.features.map((shape) => ({
      x: shape.reduce((sum, { x }) => sum + x, 0) / shape.length,
      y: Math.max(...shape.map(({ y }) => y)),
    }));
    const [left, right, smile] = middles;
    assert.ok(left && right && smile);
    assert.ok(Math.abs(left.x - MOON.x + (right.x - MOON.x)) < 1e-9);
    assert.ok(Math.abs(left.y - right.y) < 1e-9);
    assert.ok(Math.abs(smile.x - MOON.x) < 1e-9);
    assert.ok(smile.y > left.y);
    const [one, two] = face.cheeks;
    assert.ok(one && two && Math.abs(one.x - MOON.x + (two.x - MOON.x)) < 1e-9);
  });

  it('bows every feature downward, as a sleeping smile does', () => {
    for (const shape of face.features) {
      const [start] = shape;
      assert.ok(start);
      assert.ok(shape.every(({ y }) => y >= start.y - 1e-9));
    }
  });

  it('scales with the moon', () => {
    const { r } = MOON;
    const [eye] = moonFace({ x: 0, y: 0, r: 2 * r }).features;
    const [small] = moonFace({ x: 0, y: 0, r }).features;
    assert.ok(eye && small);
    for (const [index, point] of eye.entries()) {
      const half = small[index];
      assert.ok(half);
      assert.ok(Math.abs(point.x - 2 * half.x) < 1e-9);
      assert.ok(Math.abs(point.y - 2 * half.y) < 1e-9);
    }
  });
});
