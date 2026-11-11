import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Pose, Vec3 } from '@/cube/entities/world';

import { forward, viewProjection } from './camera';

const pose = (yaw: number, pitch: number): Pose => ({
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  h: 0.32,
  yaw,
  pitch,
});

/** `point` through `matrix`, divided by w. */
function project(matrix: Float32Array, [x, y, z]: Vec3): Vec3 {
  const at = (row: number) =>
    (matrix[row] ?? 0) * x +
    (matrix[4 + row] ?? 0) * y +
    (matrix[8 + row] ?? 0) * z +
    (matrix[12 + row] ?? 0);
  const w = at(3);
  return [at(0) / w, at(1) / w, at(2) / w];
}

describe('the camera', () => {
  it('looks east at yaw 0 and south at a quarter turn', () => {
    const east = forward(pose(0, 0));
    assert.ok(Math.abs(east[0] - 1) < 1e-12);
    const south = forward(pose(Math.PI / 2, 0));
    assert.ok(Math.abs(south[2] - 1) < 1e-12);
  });

  it('puts what is ahead in the middle, and south on the right facing east', () => {
    const eye: Vec3 = [0.5, 0.32, 0.5];
    const matrix = viewProjection(pose(0, 0), eye, 16 / 9);
    const [x, y, depth] = project(matrix, [1.5, 0.32, 0.5]);
    assert.ok(Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6);
    assert.ok(depth > 0 && depth < 1);
    const [right] = project(matrix, [1.5, 0.32, 0.8]);
    assert.ok(right > 0);
  });

  it('sees the floor low on the screen when pitched down', () => {
    const eye: Vec3 = [0.5, 0.32, 0.5];
    const matrix = viewProjection(pose(0, -0.3), eye, 1);
    const [, y] = project(matrix, [1, 0.32, 0.5]);
    assert.ok(y > 0);
  });
});
