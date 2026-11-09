import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  dot,
  type LatLon,
  latLonToUnit,
  length,
  northAt,
  R,
  unit as sky,
  type Vec3,
} from '@/island/shared/globe';

import {
  EARTH_OPENING,
  eyeAt,
  headingOf,
  ISLAND_OPENING,
  MAX_HEIGHT,
  MIN_HEIGHT,
  openingOf,
} from './eye';
import { GROUND_PITCH } from './look';
import { groundPerScreen, poseOf } from './pose';

const LANDSCAPE = 1440 / 900;
const PORTRAIT = 390 / 844;
const DEGREE = Math.PI / 180;
const PLACES: LatLon[] = [
  ISLAND_OPENING,
  EARTH_OPENING,
  { lat: Math.PI / 2, lon: 0 },
  { lat: -Math.PI / 2, lon: 1 },
  { lat: -40 * DEGREE, lon: 179.9 * DEGREE },
];
const horizontalOf = (fov: number, aspect: number) =>
  2 * Math.atan(aspect * Math.tan(fov / 2));

const near = (a: Vec3, b: Vec3, within: number) =>
  a.every((value, i) => Math.abs(value - (b[i] ?? Number.NaN)) < within);

const atHeight = (
  height: number,
  place: LatLon = EARTH_OPENING,
  heading = 0.7,
) =>
  poseOf(
    eyeAt({ ...place, height, heading }, () => 250),
    LANDSCAPE,
  );

describe('the openings', () => {
  it('opens #1 at 10° N on the prime meridian, facing north at orbit', () => {
    const eye = eyeAt(openingOf(1), () => 0);
    const at = latLonToUnit({ lat: 10 * DEGREE, lon: 0 });
    assert.ok(near(eye.at, at, 1e-15));
    assert.ok(near(eye.ahead, northAt(at), 1e-15));
    assert.equal(eye.height, MAX_HEIGHT);
  });

  it('opens #0 over the Mediterranean at orbit, facing north', () => {
    const eye = eyeAt(openingOf(0), () => 0);
    assert.ok(near(eye.at, latLonToUnit(EARTH_OPENING), 1e-15));
    assert.ok(Math.abs(headingOf(eye)) < 1e-12);
    assert.equal(eye.height, MAX_HEIGHT);
  });

  it('opens every other world as #1', () => {
    assert.equal(openingOf(2), ISLAND_OPENING);
    assert.equal(openingOf(123_456), ISLAND_OPENING);
  });
});

describe('poseOf', () => {
  it('stands over its point, its height over its floor', () => {
    const eye = eyeAt({ ...EARTH_OPENING, height: 40 }, () => 60);
    const pose = poseOf(eye, LANDSCAPE);
    assert.ok(Math.abs(length(pose.position) - (R + 100)) < 1e-6);
    assert.ok(near(sky(pose.position), eye.at, 1e-15));
  });

  it('looks at the planet’s centre from orbit, the poles included', () => {
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
    const eye = eyeAt({ ...ISLAND_OPENING, height: MIN_HEIGHT }, () => 0);
    const pose = poseOf(eye, LANDSCAPE);
    assert.ok(
      dot(pose.forward, northAt(eye.at)) > Math.cos(GROUND_PITCH) - 1e-9,
    );
  });

  it('sees 50° vertically on a landscape screen', () => {
    assert.ok(Math.abs(atHeight(MAX_HEIGHT).fov - 50 * DEGREE) < 1e-12);
  });

  it('widens on a portrait screen so it never sees under 50° across', () => {
    const eye = eyeAt({ ...EARTH_OPENING, height: MAX_HEIGHT }, () => 0);
    for (const aspect of [PORTRAIT, 0.3, 0.75, 1]) {
      const { fov } = poseOf(eye, aspect);
      assert.ok(fov >= 50 * DEGREE - 1e-12);
      assert.ok(Math.abs(horizontalOf(fov, aspect) - 50 * DEGREE) < 1e-9);
    }
  });

  it('spans as much ground per screen height as its field of view shows', () => {
    const eye = eyeAt({ ...EARTH_OPENING, height: MAX_HEIGHT }, () => 0);
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
