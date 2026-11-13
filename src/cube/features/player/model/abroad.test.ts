import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Abroad, abroad, asleepOn, canClimb, steppingOut } from './abroad';
import { STAGE } from './abroad.test-kit';
import type { Cue } from './player';
import { EYE_OVER_SAND, roamingAt } from './roam';
import { shotOf } from './scenes';
import { type Input, STILL } from './step';

const DT = 1 / 30;
const ahead: Input = { ...STILL, walk: 1 };
const { land, arrival, wake } = STAGE;

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
const freeAt = (x: number, z: number, yaw: number): Abroad => {
  const roamer = roamingAt(land, [x, z], { yaw, elevation: 0 }, 0);
  return {
    roamer,
    scene: null,
    asleep: false,
    ladderGone: false,
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
    assert.ok(Math.hypot(x - wake.at[0], z - wake.at[1]) < 1.5);
    assert.ok(Math.cos(roamer.yaw - Math.atan2(-z, -x)) > 0.99);
  });

  it('climbs on E within reach of the ladder foot, into the cube', () => {
    const by = freeAt(4.8, -1.2, Math.PI);
    assert.ok(canClimb(by, STAGE, 0));
    assert.ok(!canClimb(freeAt(8, -1.2, Math.PI), STAGE, 0));
    const far = abroad(
      freeAt(8, -1.2, Math.PI),
      { ...STILL, use: true },
      DT,
      0,
      STAGE,
      true,
    );
    assert.equal(far.scene, null);
    const started = abroad(by, { ...STILL, use: true }, DT, 0, STAGE, true);
    assert.equal(started.scene?.into, 'cube');
    const { state, cues } = run(started, ahead, 60, (now) => now.entered);
    assert.ok(state.entered);
    assert.deepEqual([state.shot.x, state.shot.y, state.shot.z], arrival);
    assert.equal(cues.filter((cue) => cue.cue === 'rung').length, 24);
  });

  it('finds no ladder to climb once it has been inside', () => {
    const by = { ...freeAt(4.8, -1.2, Math.PI), ladderGone: true };
    assert.ok(!canClimb(by, STAGE, 0));
    const pressed = abroad(by, { ...STILL, use: true }, DT, 0, STAGE, true);
    assert.equal(pressed.scene, null);
  });

  it('walks round the ladder while it stands and through its place after', () => {
    const east = { ...ahead, walk: -1 };
    const before = run(freeAt(2.9, -1.7, Math.PI), east, 0.4).state;
    assert.ok(Math.abs(before.roamer.eye[2] + 1.7) > 0.3);
    const gone = { ...freeAt(2.9, -1.7, Math.PI), ladderGone: true };
    const after = run(gone, east, 0.4).state;
    assert.ok(Math.abs(after.roamer.eye[2] + 1.7) < 1e-9);
    assert.ok(after.roamer.eye[0] > 3.5);
  });

  for (const scale of [1, 0.5]) {
    it(`steps off the sill at scale ${scale} and walks the sand at that size`, () => {
      const inside = {
        ...shotOf({
          eye: [2.5 - 0.3 * scale, 5.2 + EYE_OVER_SAND * scale, -1.7],
          yaw: 0.1,
          elevation: 0,
          roll: 0,
        }),
      };
      const { state, cues } = run(
        steppingOut(inside, scale, STAGE, 0),
        ahead,
        10,
        (now) => now.scene === null,
      );
      assert.ok(state.ladderGone);
      assert.equal(state.entered, false);
      assert.deepEqual(
        cues.map((cue) => cue.cue),
        ['landing'],
      );
      const [x, y, z] = state.roamer.eye;
      assert.equal(state.roamer.scale, scale);
      assert.ok(Math.abs(y - land.height(x, z) - EYE_OVER_SAND * scale) < 1e-6);
      assert.ok(!canClimb(state, STAGE, 0));
      // A second of running east covers the body's own share of 3.5 m.
      const ran = run(state, { ...STILL, walk: 1 }, 1).state.roamer;
      const went = Math.hypot(ran.eye[0] - x, ran.eye[2] - z);
      assert.ok(Math.abs(went - 3.5 * scale) < 0.2 * scale, `${went}`);
      const over = ran.eye[1] - land.height(ran.eye[0], ran.eye[2]);
      assert.ok(Math.abs(over - EYE_OVER_SAND * scale) < 0.02);
    });
  }
});
