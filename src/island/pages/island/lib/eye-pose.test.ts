import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Vec3 } from '@/island/shared/globe';

import { eyeOfPose, poseOfEye } from './eye-pose';
import { formatPlace, parsePlace } from './place-hash';

const SEA = () => 0;
const HILL = () => 1998;

const near = (a: Vec3, b: Vec3, tolerance: number) =>
  a.every((v, i) => Math.abs(v - (b[i] ?? Number.NaN)) < tolerance);

describe('eye pose', () => {
  it('puts the eye where the pose says, and reads the same pose back', () => {
    const pose = {
      lat: 38.5,
      lon: -120.25,
      height: 850,
      heading: 300,
      pitch: -7.5,
      hours: 5,
    };
    const back = poseOfEye(eyeOfPose(pose, SEA), 5, SEA);
    for (const field of ['lat', 'lon', 'height', 'heading', 'pitch'] as const) {
      assert.ok(Math.abs(back[field] - pose[field]) < 1e-9, field);
    }
    assert.equal(back.hours, 5);
  });

  it('reopens a flown eye from its printed hash within a metre', () => {
    const flown = eyeOfPose(
      {
        lat: 9.876_543_21,
        lon: 0.123_456_7,
        height: 1234.567,
        heading: 12.3456,
        pitch: 4.567,
      },
      SEA,
    );
    const hash = formatPlace({ world: '1', pose: poseOfEye(flown, 0, SEA) });
    const pose = parsePlace(hash).pose;
    assert.ok(pose !== undefined);
    const reopened = eyeOfPose(pose, SEA);
    // 1e-5° of arc is ~1.1 m on the planet's unit sphere: 2e-7 of its radius.
    assert.ok(near(reopened.at, flown.at, 2e-7));
    assert.ok(Math.abs(reopened.height - flown.height) <= 0.05);
    assert.ok(Math.abs(reopened.look - flown.look) <= (0.05 * Math.PI) / 180);
  });

  it('measures the height over the ground while the floor still lags it', () => {
    // The floor still at the sea a world switch left it at, the eye 2 m over the hill.
    const lagging = {
      ...eyeOfPose(
        { lat: 10, lon: 0, height: 2000, heading: 0, pitch: 0 },
        SEA,
      ),
      floor: 0,
    };
    const pose = poseOfEye(lagging, 0, HILL);
    assert.ok(Math.abs(pose.height - 2) < 1e-9);
    const reopened = eyeOfPose(pose, HILL);
    assert.ok(
      Math.abs(
        reopened.floor + reopened.height - (lagging.floor + lagging.height),
      ) < 1e-9,
    );
  });
});
