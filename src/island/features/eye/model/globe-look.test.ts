import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  dot,
  type LatLon,
  R,
  scaled,
  unit,
  unitToLatLon,
  type Vec3,
} from '@/island/shared/globe';

import { MAX_HEIGHT, MIN_HEIGHT } from './eye';
import {
  EARTH_OPENING,
  type Eye,
  eyeAt,
  type GroundAt,
  type Intent,
  ISLAND_OPENING,
  step,
  STILL,
} from './globe-eye';
import { poseOf } from './globe-pose';
import {
  ABOVE_HORIZON,
  dipAt,
  lookWithin,
  pitchFor,
  TILT_RADIANS_PER_SECOND,
} from './look';
import { type Pose, poseFrom } from './pose';

const FRAME = 1 / 60;
const DEGREE = Math.PI / 180;
const LANDSCAPE = 1440 / 900;
const flat: GroundAt = () => 0;
const PLACES: LatLon[] = [
  ISLAND_OPENING,
  EARTH_OPENING,
  { lat: Math.PI / 2, lon: 0 },
  { lat: -Math.PI / 2, lon: 1 },
  { lat: -40 * DEGREE, lon: 179.9 * DEGREE },
];

/** `eye` stepped by `intent` for `seconds`, frame by frame, each frame seen. */
function hold(
  eye: Eye,
  intent: Intent,
  seconds: number,
  seen?: (eye: Eye) => void,
): Eye {
  let now = eye;
  for (let t = 0; t < seconds - 1e-9; t += FRAME) {
    now = step(now, intent, FRAME, flat);
    seen?.(now);
  }
  return now;
}

const raising: Intent = { ...STILL, tilt: 1 };
const lowering: Intent = { ...STILL, tilt: -1 };

/** At `place`, `height` up, the view raised by `look` and settled there. */
const looking = (height: number, look: number, place: LatLon = EARTH_OPENING) =>
  hold(
    step(
      eyeAt({ ...place, height, heading: 0.7 }, flat),
      { ...STILL, nod: look },
      FRAME,
      flat,
    ),
    STILL,
    4,
  );

/** How far below the level the pose looks, radians. */
const pitchOf = (pose: Pose) =>
  Math.asin(-dot(pose.forward, unit(pose.position)));

const near = (a: Vec3, b: Vec3, within: number) =>
  a.every((value, i) => Math.abs(value - (b[i] ?? Number.NaN)) < within);

const HEIGHTS: number[] = [];
for (let h = MIN_HEIGHT; h <= MAX_HEIGHT; h *= 1.5) HEIGHTS.push(h);
HEIGHTS.push(MAX_HEIGHT);

describe('looking up and down', () => {
  it('eases toward the look asked for and converges on it', () => {
    const start = eyeAt({ ...EARTH_OPENING, height: 10_000 }, flat);
    const kicked = hold(start, raising, 0.25);
    const asked = kicked.aim.look;
    assert.ok(Math.abs(asked - 0.25 * TILT_RADIANS_PER_SECOND) < 1e-9);
    assert.ok(kicked.look > 0 && kicked.look < asked);
    let before = kicked.look;
    const settled = hold(kicked, STILL, 4, (eye) => {
      assert.ok(eye.look >= before && eye.look <= asked);
      before = eye.look;
    });
    assert.ok(Math.abs(settled.look - asked) < 1e-9);
  });

  it('stops a little above the horizon and at straight down, banking nothing past either', () => {
    for (const height of [MIN_HEIGHT, 300, 10_000, 1_000_000, MAX_HEIGHT]) {
      const start = eyeAt({ ...EARTH_OPENING, height }, flat);
      const up = hold(start, raising, 5);
      const top = pitchOf(poseOf(up, LANDSCAPE));
      assert.ok(Math.abs(top - (dipAt(height) - ABOVE_HORIZON)) < 1e-9);
      const down = hold(up, lowering, 5);
      const bottom = poseOf(down, LANDSCAPE);
      // Straight down by the cosine: `asin` of a rounded −1 can be NaN.
      assert.ok(dot(bottom.forward, unit(bottom.position)) < -1 + 1e-12);
      const back = step(down, raising, FRAME, flat);
      assert.ok(
        Math.abs(
          back.aim.look - down.aim.look - TILT_RADIANS_PER_SECOND * FRAME,
        ) < 1e-12,
      );
    }
  });

  it('keeps the planar pitch at the default look, at every height', () => {
    for (const height of HEIGHTS) {
      assert.equal(lookWithin(0, height), 0);
      for (const place of PLACES) {
        const eye = eyeAt({ ...place, height, heading: 0.7 }, () => 250);
        const now = poseOf(eye, LANDSCAPE);
        const was = poseFrom(
          scaled(eye.at, R + eye.floor + eye.height),
          eye.ahead,
          eye.height,
          LANDSCAPE,
        );
        assert.ok(near(now.position, was.position, 1e-12));
        assert.ok(near(now.forward, was.forward, 1e-12));
        assert.ok(near(now.up, was.up, 1e-12));
        assert.equal(now.fov, was.fov);
      }
    }
  });

  it('raises forward and up together, square and unit', () => {
    for (const height of HEIGHTS) {
      const look = lookWithin(0.3, height);
      const { forward, up, position } = poseOf(looking(height, look), LANDSCAPE);
      assert.ok(Math.abs(dot(forward, forward) - 1) < 1e-12);
      assert.ok(Math.abs(dot(up, up) - 1) < 1e-12);
      assert.ok(Math.abs(dot(forward, up)) < 1e-12);
      const below = Math.asin(-dot(forward, unit(position)));
      assert.ok(Math.abs(below - pitchFor(height, look)) < 1e-9);
    }
  });

  it('survives a turn', () => {
    const eye = looking(5000, 0.2);
    const turned = hold(eye, { ...STILL, turn: 1 }, 1.5);
    assert.ok(Math.abs(turned.look - 0.2) < 1e-12);
    assert.equal(turned.aim.look, eye.aim.look);
  });

  it('survives crossing a pole', () => {
    const height = 1_000_000;
    const place = { lat: 80 * DEGREE, lon: 0.4 };
    const eye = looking(height, 0.25, place);
    const crossed = hold(eye, { ...STILL, steer: [0, 1] }, 5);
    assert.ok(Math.abs(unitToLatLon(crossed.at).lon) > Math.PI / 2);
    assert.ok(Math.abs(crossed.look - 0.25) < 1e-12);
    assert.equal(crossed.aim.look, eye.aim.look);
  });

  it('keeps its offset as the eye climbs and descends', () => {
    for (const look of [0.1, -0.2]) {
      const eye = looking(200, look);
      const climbed = hold(eye, { ...STILL, climb: 1 }, 2);
      assert.ok(climbed.height > 200 * 16);
      assert.ok(Math.abs(climbed.look - look) < 1e-12);
      assert.equal(climbed.aim.look, look);
      const descended = hold(climbed, { ...STILL, climb: -1 }, 4);
      assert.ok(descended.height < 200 / 4);
      assert.ok(Math.abs(descended.look - look) < 1e-12);
      assert.equal(descended.aim.look, look);
    }
  });
});
