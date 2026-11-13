import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOutside, type Vec3 } from '@/cube/entities/world';

import { abroad, asleepOn } from './abroad';
import { sampled } from './abroad.test-kit';
import { handsOnLadder } from './climbing';
import { grippingHand } from './grip';
import { INTRO_STAGE } from './intro-stage';
import type { Cue } from './player';
import { footingAt, roamingAt } from './roam';
import { climb, shotOf } from './scenes';
import { STILL } from './step';
import { whereOf } from './threshold';
import { type Shot, shotAt } from './track';

const { land, ladder, wake } = INTRO_STAGE;
const [footX, , footZ] = ladder.foot;

/** The climb from a body standing by the ladder's foot. */
const up = climb(
  shotOf(
    roamingAt(land, [footX + 0.9, footZ + 0.3], { yaw: 3, elevation: 0 }, 0),
  ),
  INTRO_STAGE,
);

/** The marks of the climb's first hand on a rung, and of the sill. */
const [onRungs = 0] = up.cues.flatMap(([at, cue]) =>
  cue.cue === 'rung' ? [at] : [],
);
const [stepped = 0] = up.cues.flatMap(([at, cue]) =>
  cue.cue === 'step' ? [at] : [],
);
const sill = stepped + 0.1;

/** The climb's shots every tenth of a second from `from` while `goes` holds. */
function shotsFrom(from: number, goes: (shot: Shot, at: number) => boolean) {
  const shots: Shot[] = [];
  for (let at = from; at < up.runs; at += 0.1) {
    const shot = shotAt(up, at);
    if (!goes(shot, at)) break;
    shots.push(shot);
  }
  return shots;
}

/** How far a shoulder sits under the eye, and a hand from the ladder's middle. */
const SHOULDER_UNDER = 0.22;
const HAND_OUT = 0.11;

/** The quads of one hand round a rung. */
const ONE_HAND = grippingHand([0, 0, 0], [0, 0, 1], [1, 0, 0], 'left', 1, {
  n: 1,
  x: 0n,
  y: 0n,
}).length;

/**
 * Where each hand of an eye at `eyeY` holds the ladder: the left on every other
 * rung, the right on those between, each on the one nearest the eye's height.
 */
const heldAt = (eyeY: number): Vec3[] =>
  [0, 1].map((parity) => {
    const { foot, top, rungs } = ladder;
    const [rung = 0] = rungs
      .filter((_, index) => index % 2 === parity)
      .toSorted((a, b) => Math.abs(a - eyeY) - Math.abs(b - eyeY));
    const share = (rung - foot[1]) / (top[1] - foot[1]);
    const out = parity === 0 ? 1 : -1;
    return [
      foot[0] + (top[0] - foot[0]) * share,
      rung,
      foot[2] + out * HAND_OUT,
    ];
  });

describe("the intro's stage", () => {
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
    assert.equal(steps.length, 2);
    for (const step of steps) {
      assert.ok(step.cue === 'step');
      const [x, , z] = body.roamer.eye;
      assert.equal(step.ground, footingAt(land, x, z, 0));
    }
    assert.ok(!body.cues.some(({ cue }) => cue === 'splash'));
  });

  it('takes the eye into the cube once on the way up the ladder', () => {
    const inside = sampled(up, 1 / 60).map(
      (shot) => !isOutside(whereOf(shot, INTRO_STAGE)),
    );
    const crossings = inside.filter(
      (within, at) => at > 0 && within !== inside[at - 1],
    );
    assert.deepEqual(crossings, [true]);
    assert.equal(inside.at(-1), true);
  });
});

describe("the intro's climb", () => {
  const topRung = Math.max(...ladder.rungs);
  const climbing = shotsFrom(onRungs, ({ y }) => y - SHOULDER_UNDER <= topRung);

  it('has both hands on the rungs until the shoulders pass the top one', () => {
    assert.ok(climbing.length > 20 && ONE_HAND > 0);
    for (const { x, y, z } of climbing) {
      const quads = handsOnLadder([x, y, z], ladder, 1).length;
      assert.equal(quads, 2 * ONE_HAND, `at ${String(y)} m`);
    }
  });

  it('has a hand in sight while the gaze is up the ladder', () => {
    const forward = shotsFrom(
      onRungs,
      (_, at) => at < onRungs + (sill - onRungs) / 4,
    );
    assert.ok(forward.length > 3);
    for (const { x, y, z, yaw, elevation } of forward) {
      const seen = heldAt(y).some(([handX, handY, handZ]) => {
        const along = (handX - x) * Math.cos(yaw) + (handZ - z) * Math.sin(yaw);
        const rise = handY - y;
        const ahead = along * Math.cos(elevation) + rise * Math.sin(elevation);
        const above = rise * Math.cos(elevation) - along * Math.sin(elevation);
        return (
          ahead > 0 && Math.abs(Math.atan2(above, ahead)) < (35 * Math.PI) / 180
        );
      });
      assert.ok(seen, `no hand in sight at ${String(y)} m`);
    }
  });
});
