import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toCube, toWorld, yawToShell } from '@/cube/shared/outside';
import {
  eyeInFrame,
  type Outside,
  type Pose,
  type Vec3,
} from '@/cube/entities/world';

import {
  forward,
  gazeInCube,
  OUTSIDE_FAR,
  seenInWorld,
  viewProjection,
} from './camera';

const pose = (yaw: number, pitch: number): Pose => ({
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  scale: 1,
  yaw,
  elevation: pitch,
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
    const matrix = viewProjection(pose(0, 0), eye, 16 / 9, 1);
    const [x, y, depth] = project(matrix, [1.5, 0.32, 0.5]);
    assert.ok(Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6);
    assert.ok(depth > 0 && depth < 1);
    const [right] = project(matrix, [1.5, 0.32, 0.8]);
    assert.ok(right > 0);
  });

  it('reverses depth: nearer is greater, the near plane 1 and the far 0', () => {
    const eye: Vec3 = [0, 0, 0];
    const matrix = viewProjection(pose(0, 0), eye, 1, 1);
    const depth = (ahead: number) => project(matrix, [ahead, 0, 0])[2];
    assert.ok(Math.abs(depth(0.004) - 1) < 1e-6);
    assert.ok(Math.abs(depth(24)) < 1e-6);
    assert.ok(depth(1) > depth(2));
  });

  it('brings both planes in with a smaller eye', () => {
    const matrix = viewProjection(pose(0, 0), [0, 0, 0], 1, 0.5);
    const depth = (ahead: number) => project(matrix, [ahead, 0, 0])[2];
    assert.ok(Math.abs(depth(0.002) - 1) < 1e-6);
    assert.ok(Math.abs(depth(12)) < 1e-6);
  });

  it('sees the floor low on the screen when pitched down', () => {
    const eye: Vec3 = [0.5, 0.32, 0.5];
    const matrix = viewProjection(pose(0, -0.3), eye, 1, 1);
    const [, y] = project(matrix, [1, 0.32, 0.5]);
    assert.ok(y > 0);
  });

  it('drops the horizon on the left with a clockwise roll', () => {
    const eye: Vec3 = [0, 0, 0];
    const matrix = viewProjection(pose(0, 0), eye, 1, 1, { roll: 0.3 });
    // Facing east, north is on the left.
    const [x, y] = project(matrix, [1, 0, -0.2]);
    assert.ok(x < 0 && y < 0);
    const [, ahead] = project(matrix, [1, 0, 0]);
    assert.ok(Math.abs(ahead) < 1e-6);
  });

  it('puts the far plane where it is told to', () => {
    const matrix = viewProjection(pose(0, 0), [0, 0, 0], 1, 1, {
      far: OUTSIDE_FAR,
    });
    const depth = (ahead: number) => project(matrix, [ahead, 0, 0])[2];
    assert.ok(Math.abs(depth(0.004) - 1) < 1e-6);
    assert.ok(depth(24) > 0);
    assert.ok(Math.abs(depth(OUTSIDE_FAR)) < 1e-9);
  });

  it('sees a point of the world where it sees that point of the cube', () => {
    const eye: Vec3 = [0.5, 0.32, 0.5];
    const inCube = {
      viewProjection: viewProjection(pose(0.4, 0.1), eye, 1.6, 1),
      eye,
    };
    const inWorld = seenInWorld(inCube);
    const point: Vec3 = [1.7, 0.1, 0.9];
    const there = project(inCube.viewProjection, point);
    const here = project(inWorld.viewProjection, toWorld(point));
    for (const [index, value] of there.entries()) {
      assert.ok(Math.abs(value - (here[index] ?? Number.NaN)) < 1e-4);
    }
    assert.deepEqual(inWorld.eye, toWorld(eye));
  });

  it('sees the same from the doorway as a pose and as an eye outside', () => {
    for (const scale of [1, 0.5]) {
      const within: Pose = {
        ...pose(0.2, -0.4),
        u: 0.97,
        v: 0.15,
        eyeAbove: 0.32 * scale,
        scale,
      };
      const { eye, side } = eyeInFrame(within, within);
      assert.equal(side, 1);
      const { u, v, eyeAbove, yaw, elevation } = within;
      const twin: Outside = {
        eye: toWorld([u, eyeAbove, v]),
        yaw: yawToShell(yaw),
        elevation,
        roll: 0,
      };
      const far = { far: OUTSIDE_FAR };
      const inside = viewProjection(within, eye, 1.6, side * scale, far);
      const out = viewProjection(
        gazeInCube(twin),
        toCube(twin.eye),
        1.6,
        1,
        far,
      );
      for (const point of [
        [3, 0.1, 0.4],
        [40, -0.3, -12],
      ] satisfies Vec3[]) {
        const [x, y] = project(inside, point);
        const [alsoX, alsoY] = project(out, point);
        assert.ok(Math.abs(x - alsoX) < 1e-6 && Math.abs(y - alsoY) < 1e-6);
      }
    }
  });
});
