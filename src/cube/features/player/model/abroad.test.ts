import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Abroad,
  abroad,
  asleepOn,
  byDoorway,
  canClimb,
  leaving,
} from './abroad';
import { STAGE } from './abroad.test-kit';
import type { Cue } from './play';
import { EYE_OVER_SAND, roamingAt } from './roam';
import { shotOf } from './scenes';
import { type Input, STILL } from './step';

const DT = 1 / 30;
const ahead: Input = { ...STILL, walk: 1 };
const { land, arrival, ladder, wake, indoors } = STAGE;

/** `state` after `seconds` of `input`, awake, and every cue on the way. */
function run(
  state: Abroad,
  input: Input,
  seconds: number,
  until: (state: Abroad) => boolean = () => false,
): { state: Abroad; cues: Cue[] } {
  const cues: Cue[] = [];
  let now = state;
  for (let t = 0; t < seconds && !until(now); t += DT) {
    now = abroad(now, input, DT, t, STAGE, true);
    cues.push(...now.cues);
  }
  return { state: now, cues };
}

/** A free body standing at `x`, `z`, looking along `yaw`. */
const freeAt = (
  x: number,
  z: number,
  yaw: number,
  unlooked = false,
): Abroad => {
  const roamer = roamingAt(land, [x, z], { yaw, elevation: 0 }, 0);
  return {
    roamer,
    scene: null,
    asleep: false,
    lookedUnder: !unlooked,
    shot: shotOf(roamer),
    cues: [],
    entered: false,
  };
};

describe('abroad', () => {
  it('sleeps in the dark until the player gives a sign', () => {
    let state = asleepOn(STAGE, 0);
    for (let frame = 0; frame < 90; frame += 1) {
      state = abroad(state, ahead, DT, frame * DT, STAGE, false);
    }
    assert.equal(state.shot.lids, 0);
    assert.equal(state.scene?.playedFor, 0);
    assert.ok(state.asleep);
  });

  it('wakes, groans once and is handed back facing the cube, on its feet', () => {
    const { state, cues } = run(
      asleepOn(STAGE, 0),
      ahead,
      60,
      (now) => now.scene === null,
    );
    const { scene, roamer } = state;
    assert.equal(scene, null);
    assert.equal(cues.filter((cue) => cue.cue === 'say').length, 1);
    const [x, y, z] = roamer.eye;
    assert.ok(Math.abs(y - land.height(x, z) - EYE_OVER_SAND) < 1e-6);
    // The keys held all through the scene moved nothing.
    assert.ok(Math.hypot(x - wake.at[0], z - wake.at[1]) < 0.5);
    assert.ok(Math.cos(roamer.yaw - Math.atan2(-z, -x)) > 0.99);
  });

  it('looks under the cube the first time it comes near, and only then', () => {
    const start = freeAt(-14, 0, 0, true);
    const near = run(start, ahead, 10, (now) => now.scene !== null).state;
    assert.ok(near.scene !== null && near.lookedUnder);
    assert.ok(near.roamer.eye[0] < -10.4 && near.roamer.eye[0] > -10.7);
    const after = run(near, ahead, 30, (now) => now.scene === null).state;
    assert.equal(after.scene, null);
    assert.equal(after.entered, false);
    const again = run(after, { ...STILL, strafe: 1 }, 3).state;
    assert.equal(again.scene, null);
  });

  it('does not look under the cube from the water', () => {
    const state = run(freeAt(-60, 0, 0, true), STILL, 1).state;
    assert.equal(state.scene, null);
  });

  it('climbs on E within reach of the ladder foot, into the cube', () => {
    const by = freeAt(4.8, -1.2, Math.PI);
    assert.ok(canClimb(by, STAGE, 0));
    assert.ok(!canClimb(freeAt(8, -1.2, Math.PI), STAGE, 0));
    const far = abroad(
      freeAt(8, -1.2, Math.PI),
      { ...STILL, pull: true },
      DT,
      0,
      STAGE,
      true,
    );
    assert.equal(far.scene, null);
    const started = abroad(by, { ...STILL, pull: true }, DT, 0, STAGE, true);
    assert.equal(started.scene?.into, 'cube');
    const { state, cues } = run(started, ahead, 60, (now) => now.entered);
    assert.ok(state.entered);
    assert.deepEqual([state.shot.x, state.shot.y, state.shot.z], arrival);
    assert.equal(cues.filter((cue) => cue.cue === 'rung').length, 24);
  });

  it('comes back down from the doorway to the ladder foot', () => {
    const inside = {
      ...shotOf({
        eye: [arrival[0], arrival[1], arrival[2] + 0.3],
        yaw: 0.1,
        elevation: 0,
      }),
      exposure: indoors,
    };
    assert.ok(byDoorway(inside, STAGE));
    assert.ok(!byDoorway({ ...inside, yaw: Math.PI }, STAGE));
    assert.ok(!byDoorway({ ...inside, x: arrival[0] - 2 }, STAGE));
    const { state } = run(
      leaving(inside, STAGE, 0),
      ahead,
      60,
      (now) => now.scene === null,
    );
    const [x, , z] = state.roamer.eye;
    assert.ok(Math.hypot(x - ladder.foot[0], z - ladder.foot[2]) < 0.6);
    assert.ok(state.lookedUnder);
    assert.equal(state.entered, false);
    assert.ok(canClimb(state, STAGE, 0));
  });
});
