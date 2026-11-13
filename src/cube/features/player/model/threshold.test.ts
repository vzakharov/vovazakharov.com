import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Abroad, abroad, steppingOut } from './abroad';
import { INTRO_STAGE } from './intro-stage';
import { arrivedOn } from './play';
import { EYE_OVER_SAND, roamingAt } from './roam';
import { shotOf } from './scenes';
import { EYE_HEIGHT, STILL } from './step';
import { poseWithin, shotWithin, stepsOut } from './threshold';

const { land, ladder, arrival, cube } = INTRO_STAGE;
const DT = 1 / 30;

/** `state` played with no keys until its scene ends. */
function played(state: Abroad): Abroad {
  let now = state;
  for (let t = 0; now.scene !== null && t < 60; t += DT) {
    now = abroad(now, STILL, DT, t, INTRO_STAGE, true);
  }
  return now;
}

describe('the threshold', () => {
  it('reads a pose in the room as a camera and back', () => {
    const pose = { ...arrivedOn(1), u: 0.8, v: 0.2, yaw: 0.4, elevation: -0.1 };
    const shot = shotWithin(pose, INTRO_STAGE);
    assert.ok(shot.x > cube.min[0] && shot.x < cube.max[0]);
    assert.ok(Math.abs(shot.y - (cube.min[1] + 2.5 + 1.6)) < 1e-9);
    const back = poseWithin(shot);
    assert.ok(Math.abs(back.u - 0.8) < 1e-12 && Math.abs(back.v - 0.2) < 1e-12);
    assert.ok(Math.abs(back.yaw - 0.4) < 1e-12);
    assert.equal(back.elevation, -0.1);
    assert.equal(back.eyeAbove, EYE_HEIGHT);
    assert.equal(back.scale, 1);
  });

  it('arrives inside the room, past the doorway, facing in', () => {
    const [x, y, z] = arrival;
    const pose = poseWithin({
      ...shotOf({ eye: [x, y, z], yaw: -Math.PI, elevation: 0, roll: 0 }),
    });
    assert.ok(pose.u > 0.7 && pose.u < 0.9);
    assert.ok(pose.v > 0.1 && pose.v < 0.25);
    assert.ok(Math.abs(pose.yaw - Math.PI) < 1e-9);
    assert.equal(pose.n, 1);
  });

  it('walks out of the doorway only pressed to it, inside it, heading east', () => {
    const east = { ...STILL, walk: 1 };
    for (const scale of [1, 0.5]) {
      const by = {
        ...arrivedOn(1),
        scale,
        u: 1 - 0.06 * scale,
        v: 0.15,
        yaw: 0.3,
      };
      assert.ok(stepsOut(by, east), `at scale ${scale}`);
      assert.ok(!stepsOut(by, STILL));
      assert.ok(!stepsOut(by, { ...STILL, walk: -1 }));
      assert.ok(!stepsOut({ ...by, yaw: Math.PI }, east));
      assert.ok(
        stepsOut({ ...by, yaw: Math.PI / 2 }, { ...STILL, strafe: -1 }),
      );
      assert.ok(!stepsOut({ ...by, u: 0.9 }, east));
      assert.ok(!stepsOut({ ...by, v: 0.4 }, east));
      assert.ok(!stepsOut({ ...by, n: 2 }, east));
    }
    // A whole body's width does not fit where a halved one's does.
    const edge = { ...arrivedOn(1), v: 0.09, yaw: 0 };
    assert.ok(!stepsOut({ ...edge, u: 0.94 }, east));
    assert.ok(stepsOut({ ...edge, u: 0.97, scale: 0.5 }, east));
  });

  it('climbs the real ladder into the room and steps back out onto the sand', () => {
    const [footX, , footZ] = ladder.foot;
    const roamer = roamingAt(
      land,
      [footX + 0.9, footZ + 0.3],
      { yaw: Math.PI, elevation: 0 },
      0,
    );
    const free: Abroad = {
      roamer,
      scene: null,
      asleep: false,
      ladderGone: false,
      shot: shotOf(roamer),
      cues: [],
      entered: false,
    };
    const up = played(
      abroad(free, { ...STILL, use: true }, DT, 0, INTRO_STAGE, true),
    );
    assert.ok(up.entered);
    const pose = { ...poseWithin(up.shot), u: 0.94, yaw: 0 };
    assert.ok(stepsOut(pose, { ...STILL, walk: 1 }));
    const down = played(
      steppingOut(shotWithin(pose, INTRO_STAGE), 1, INTRO_STAGE, 0),
    );
    const [x, y, z] = down.roamer.eye;
    assert.ok(x > cube.max[0] + 0.3 && x < cube.max[0] + 1);
    assert.ok(Math.abs(y - land.height(x, z) - EYE_OVER_SAND) < 1e-6);
    // The drop is the sill's height over the sand.
    assert.ok(Math.abs(ladder.top[1] - land.height(x, z) - 3.6) < 0.15);
  });
});
