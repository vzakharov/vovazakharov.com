import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CENTRE,
  dot,
  type LatLon,
  latLonToUnit,
  length,
  NORTH,
  R,
  unit as sky,
  type Vec3,
} from '@/island/shared/globe';

import { eyeAt as planeEyeAt, MAX_HEIGHT, MIN_HEIGHT } from './eye';
import {
  EARTH_OPENING,
  eyeAt as globeEyeAt,
  headingOf,
  ISLAND_OPENING,
  openingOf,
} from './globe-eye';
import { poseOf as globePoseOf } from './globe-pose';
import { GROUND_PITCH, poseOf as planePoseOf } from './pose';

const LANDSCAPE = 1440 / 900;
const DEGREE = Math.PI / 180;
const PLACES: LatLon[] = [
  ISLAND_OPENING,
  EARTH_OPENING,
  { lat: Math.PI / 2, lon: 0 },
  { lat: -Math.PI / 2, lon: 1 },
  { lat: -40 * DEGREE, lon: 179.9 * DEGREE },
];

const near = (a: Vec3, b: Vec3, within: number) =>
  a.every((value, i) => Math.abs(value - (b[i] ?? Number.NaN)) < within);

const atHeight = (
  height: number,
  place: LatLon = EARTH_OPENING,
  heading = 0.7,
) =>
  globePoseOf(
    globeEyeAt({ ...place, height, heading }, () => 250),
    LANDSCAPE,
  );

describe('the openings', () => {
  it('opens #1 where /island opened on the plane, facing north at orbit', () => {
    const eye = globeEyeAt(openingOf(1), () => 0);
    assert.ok(near(eye.at, CENTRE, 1e-15));
    assert.ok(near(eye.ahead, NORTH, 1e-15));
    assert.equal(eye.height, MAX_HEIGHT);
    const was = planePoseOf(
      planeEyeAt({ x: 0, y: 0, height: MAX_HEIGHT }, () => 0),
      LANDSCAPE,
    );
    const now = globePoseOf(eye, LANDSCAPE);
    assert.ok(near(now.position, was.position, 1e-6));
    assert.ok(near(now.forward, was.forward, 1e-12));
    assert.ok(near(now.up, was.up, 1e-12));
  });

  it('opens #0 over the Mediterranean at orbit, facing north', () => {
    const eye = globeEyeAt(openingOf(0), () => 0);
    assert.ok(near(eye.at, latLonToUnit(EARTH_OPENING), 1e-15));
    assert.ok(Math.abs(headingOf(eye)) < 1e-12);
    assert.equal(eye.height, MAX_HEIGHT);
  });

  it('opens every other world as #1', () => {
    assert.equal(openingOf(2), ISLAND_OPENING);
    assert.equal(openingOf(123_456), ISLAND_OPENING);
  });
});

describe('poseOf on the sphere', () => {
  it('stands over its point, its height over its floor', () => {
    const eye = globeEyeAt({ ...EARTH_OPENING, height: 40 }, () => 60);
    const pose = globePoseOf(eye, LANDSCAPE);
    assert.ok(Math.abs(length(pose.position) - (R + 100)) < 1e-6);
    assert.ok(near(sky(pose.position), eye.at, 1e-15));
  });

  it('looks at the planet’s centre from orbit, the poles included', () => {
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
    const pose = globePoseOf(
      globeEyeAt({ ...ISLAND_OPENING, height: MIN_HEIGHT }, () => 0),
      LANDSCAPE,
    );
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
});
