import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CENTRE,
  dot,
  EAST,
  length,
  NORTH,
  planeToWorld,
  R,
  sub,
  type Vec3,
  worldToPlane,
} from '.';

const distance = (a: Vec3, b: Vec3) => length(sub(a, b));

const HALF_SIDE = 3_000_000;

describe('planeToWorld', () => {
  it('puts the centre at R·c', () => {
    const p = planeToWorld(0, 0);
    for (const i of [0, 1, 2] as const) {
      assert.ok(Math.abs(p[i] - R * CENTRE[i]) < 1e-6);
    }
  });

  it('puts a point 1 km north about 1 km from the centre, along n', () => {
    const centre = planeToWorld(0, 0);
    const north = planeToWorld(0, 1000);
    assert.ok(Math.abs(distance(centre, north) - 1000) < 1e-3);
    const alongNorth = dot(sub(north, centre), NORTH) / 1000;
    assert.ok(alongNorth > 0.999_999);
  });

  it('puts east along e', () => {
    const east = planeToWorld(1000, 0);
    const centre = planeToWorld(0, 0);
    const alongEast = dot(sub(east, centre), EAST) / 1000;
    assert.ok(alongEast > 0.999_999);
  });

  it('adds height radially', () => {
    for (const [x, y] of [
      [0, 0],
      [1_234_567, -2_345_678],
    ] as const) {
      const ground = planeToWorld(x, y);
      const raised = planeToWorld(x, y, 500);
      assert.ok(Math.abs(distance(ground, raised) - 500) < 1e-6);
      const groundRadius = length(ground);
      const raisedRadius = length(raised);
      assert.ok(Math.abs(raisedRadius - groundRadius - 500) < 1e-6);
    }
  });
});

describe('worldToPlane', () => {
  it('inverts planeToWorld across the island square within 1e-6 m', () => {
    const steps = 24;
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps; j += 1) {
        const x = -HALF_SIDE + (2 * HALF_SIDE * i) / steps;
        const y = -HALF_SIDE + (2 * HALF_SIDE * j) / steps;
        const h = (i * 37 + j * 11) % 9000;
        const back = worldToPlane(planeToWorld(x, y, h));
        assert.ok(Math.abs(back.x - x) < 1e-6, `x at (${x}, ${y})`);
        assert.ok(Math.abs(back.y - y) < 1e-6, `y at (${x}, ${y})`);
        assert.ok(Math.abs(back.h - h) < 1e-6, `h at (${x}, ${y})`);
      }
    }
  });

  it('inverts near the centre, where the direction degenerates', () => {
    for (const [x, y] of [
      [0, 0],
      [1e-3, 0],
      [0, -2e-3],
    ] as const) {
      const back = worldToPlane(planeToWorld(x, y, 2));
      assert.ok(Math.abs(back.x - x) < 1e-6);
      assert.ok(Math.abs(back.y - y) < 1e-6);
      assert.ok(Math.abs(back.h - 2) < 1e-6);
    }
  });
});
