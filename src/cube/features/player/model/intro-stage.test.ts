import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toWorld } from '@/cube/shared/outside';
import { holeQuarter, isOutside, pillOn, planted } from '@/cube/entities/world';

import { abroad, asleepOn } from './abroad';
import { sampled } from './abroad.test-kit';
import { plantedHoledOf } from './holed';
import { INTRO_STAGE } from './intro-stage';
import type { Cue } from './player';
import { footingAt, roamingAt } from './roam';
import { climb, shotOf } from './scenes';
import { STILL } from './step';
import { whereOf } from './threshold';

const { land, ladder, shelf, wake } = INTRO_STAGE;

describe("the intro's stage", () => {
  it('has the shelf where the planted world lays its pill on floor 1', async () => {
    const room = { n: 1, x: 0n, y: 0n };
    const quarter = await holeQuarter(planted, room.n, room.x, room.y);
    assert.ok(quarter !== null);
    const pill = toWorld(pillOn(plantedHoledOf(room, quarter).shelf).centre);
    const off = Math.hypot(...pill.map((at, axis) => at - (shelf[axis] ?? 0)));
    assert.ok(off < 0.2, `${String(off)} m off`);
  });

  it('lays the head on sand the sea never wets, its feet towards the sea', () => {
    const [x, z] = wake.at;
    const down = (metres: number): number =>
      land.height(
        x + metres * Math.cos(wake.seaward),
        z + metres * Math.sin(wake.seaward),
      );
    assert.ok(down(0) > 0.3);
    assert.ok(down(1.5) < down(0));
  });

  it('gives every footfall of the waking the ground the sea has left there', () => {
    let body = asleepOn(INTRO_STAGE, 0);
    const steps: Cue[] = [];
    for (let t = 0; body.scene !== null && t < 60; t += 1 / 30) {
      body = abroad(body, STILL, 1 / 30, t, INTRO_STAGE, true);
      steps.push(...body.cues.filter(({ cue }) => cue === 'step'));
    }
    assert.equal(steps.length, 4);
    for (const step of steps) {
      assert.ok(step.cue === 'step');
      const [x, , z] = body.roamer.eye;
      assert.equal(step.ground, footingAt(land, x, z, 0));
    }
    assert.ok(!body.cues.some(({ cue }) => cue === 'splash'));
  });

  it('takes the eye into the cube once on the way up the ladder', () => {
    const [footX, , footZ] = ladder.foot;
    const from = shotOf(
      roamingAt(land, [footX + 0.9, footZ + 0.3], { yaw: 3, elevation: 0 }, 0),
    );
    const inside = sampled(climb(from, INTRO_STAGE), 1 / 60).map(
      (shot) => !isOutside(whereOf(shot, INTRO_STAGE)),
    );
    const crossings = inside.filter(
      (within, at) => at > 0 && within !== inside[at - 1],
    );
    assert.deepEqual(crossings, [true]);
    assert.equal(inside.at(-1), true);
  });
});
