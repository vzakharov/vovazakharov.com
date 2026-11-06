import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NORTH, planeToWorld, type Vec3 } from '@/island/shared/globe';

import { eyeAt, MAX_HEIGHT, MIN_HEIGHT } from './eye';
import { GROUND_PITCH, poseOf } from './pose';

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const sky = (p: Vec3): Vec3 => {
  const k = 1 / length(p);
  return [p[0] * k, p[1] * k, p[2] * k];
};

const OFFSHORE = { x: 1_200_000, y: -800_000 };
const PLACES = [{ x: 0, y: 0 }, OFFSHORE, { x: -3_000_000, y: 2_500_000 }];

const atHeight = (height: number, place = OFFSHORE, heading = 0.7) =>
  poseOf(eyeAt({ ...place, height, heading }, () => 250));

describe('poseOf', () => {
  it('stands at the plane point, its height over its floor', () => {
    const pose = poseOf(eyeAt({ x: 1000, y: 2000, height: 40 }, () => 60));
    const want = planeToWorld(1000, 2000, 100);
    for (const i of [0, 1, 2] as const)
      assert.ok(Math.abs(pose.position[i] - want[i]) < 1e-6);
  });

  it('looks at the planet’s centre from orbit', () => {
    for (const place of PLACES) {
      for (const height of [MAX_HEIGHT, 4_000_000]) {
        const pose = atHeight(height, place);
        assert.ok(dot(pose.forward, sky(pose.position)) < -1 + 1e-9);
      }
    }
  });

  it('looks GROUND_PITCH below the horizon at the ground', () => {
    for (const place of PLACES) {
      const pose = atHeight(MIN_HEIGHT, place);
      const below = -dot(pose.forward, sky(pose.position));
      assert.ok(Math.abs(below - Math.sin(GROUND_PITCH)) < 1e-9);
    }
  });

  it('faces its heading', () => {
    const pose = poseOf(eyeAt({ x: 0, y: 0, height: MIN_HEIGHT }, () => 0));
    assert.ok(dot(pose.forward, NORTH) > Math.cos(GROUND_PITCH) - 1e-9);
  });

  it('keeps forward and up unit and square at every height', () => {
    for (let height = MIN_HEIGHT; height <= MAX_HEIGHT; height *= 3) {
      for (const place of PLACES) {
        const { forward, up } = atHeight(height, place);
        assert.ok(Math.abs(length(forward) - 1) < 1e-9);
        assert.ok(Math.abs(length(up) - 1) < 1e-9);
        assert.ok(Math.abs(dot(forward, up)) < 1e-9);
      }
    }
  });

  it('turns continuously from the ground to orbit', () => {
    let previous = atHeight(MIN_HEIGHT);
    for (let height = MIN_HEIGHT; height <= MAX_HEIGHT; height *= 1.01) {
      const pose = atHeight(height);
      const turned = Math.acos(
        Math.min(1, dot(pose.forward, previous.forward)),
      );
      assert.ok(turned < 0.01, `turned ${turned} rad at ${height} m`);
      previous = pose;
    }
  });
});
