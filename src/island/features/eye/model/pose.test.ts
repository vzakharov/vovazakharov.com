import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  dot,
  length,
  NORTH,
  planeToWorld,
  unit as sky,
} from '@/island/shared/globe';

import { eyeAt, MAX_HEIGHT, MIN_HEIGHT } from './eye';
import { GROUND_PITCH, groundPerScreen, poseOf } from './pose';

const LANDSCAPE = 1440 / 900;
const PORTRAIT = 390 / 844;
const DEGREE = Math.PI / 180;
const horizontalOf = (fov: number, aspect: number) =>
  2 * Math.atan(aspect * Math.tan(fov / 2));

const OFFSHORE = { x: 1_200_000, y: -800_000 };
const PLACES = [{ x: 0, y: 0 }, OFFSHORE, { x: -3_000_000, y: 2_500_000 }];

const atHeight = (height: number, place = OFFSHORE, heading = 0.7) =>
  poseOf(
    eyeAt({ ...place, height, heading }, () => 250),
    LANDSCAPE,
  );

describe('poseOf', () => {
  it('stands at the plane point, its height over its floor', () => {
    const pose = poseOf(
      eyeAt({ x: 1000, y: 2000, height: 40 }, () => 60),
      LANDSCAPE,
    );
    const want = planeToWorld(1000, 2000, 100);
    for (const i of [0, 1, 2] as const)
      assert.ok(Math.abs(pose.position[i] - want[i]) < 1e-6);
  });

  it('looks at the planet’s centre from orbit', () => {
    for (const place of PLACES) {
      for (const height of [MAX_HEIGHT, 18_000_000]) {
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
    const pose = poseOf(
      eyeAt({ x: 0, y: 0, height: MIN_HEIGHT }, () => 0),
      LANDSCAPE,
    );
    assert.ok(dot(pose.forward, NORTH) > Math.cos(GROUND_PITCH) - 1e-9);
  });

  it('sees 50° vertically on a landscape screen', () => {
    assert.ok(Math.abs(atHeight(MAX_HEIGHT).fov - 50 * DEGREE) < 1e-12);
  });

  it('widens on a portrait screen so it never sees under 50° across', () => {
    const eye = eyeAt({ ...OFFSHORE, height: MAX_HEIGHT }, () => 0);
    for (const aspect of [PORTRAIT, 0.3, 0.75, 1]) {
      const { fov } = poseOf(eye, aspect);
      assert.ok(fov >= 50 * DEGREE - 1e-12);
      assert.ok(Math.abs(horizontalOf(fov, aspect) - 50 * DEGREE) < 1e-9);
    }
  });

  it('spans as much ground per screen height as its field of view shows', () => {
    const eye = eyeAt({ ...OFFSHORE, height: MAX_HEIGHT }, () => 0);
    for (const aspect of [PORTRAIT, LANDSCAPE]) {
      const { fov } = poseOf(eye, aspect);
      assert.ok(
        Math.abs(groundPerScreen(aspect) - 2 * Math.tan(fov / 2)) < 1e-12,
      );
    }
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
