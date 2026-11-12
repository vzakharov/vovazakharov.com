import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sampled, STAGE } from './abroad.test-kit';
import { EYE_OVER_SAND } from './roam';
import { climb, descent, farFrom, lookUnder, shotOf, waking } from './scenes';
import { type Shot, shotAt } from './track';

const { land, cube, wake, arrival, ladder } = STAGE;

const overSand = ({ x, y, z }: Shot): number => y - land.height(x, z);

const close = (a: number, b: number, within = 1e-9): boolean =>
  Math.abs(a - b) <= within;

/** A free eye standing at `x`, `z`, looking along `yaw`. */
const standing = (x: number, z: number, yaw: number): Shot =>
  shotOf({ eye: [x, land.height(x, z) + EYE_OVER_SAND, z], yaw, elevation: 0 });

describe('waking', () => {
  const track = waking(STAGE);
  const shots = sampled(track);

  it('opens in the dark on its side at sand level, by the water', () => {
    const first = shotAt(track, 0);
    assert.equal(first.lids, 0);
    assert.ok(Math.abs(first.roll) > 1);
    assert.ok(overSand(first) < 0.2);
    assert.ok(Math.hypot(first.x - wake.at[0], first.z - wake.at[1]) < 1);
  });

  it('parts the lids, shuts them and parts them again', () => {
    const lids = shots.map((shot) => shot.lids);
    const firstOpen = lids.findIndex((open) => open > 0.3);
    const shutAgain = lids.findIndex((open, at) => at > firstOpen && open === 0);
    assert.ok(firstOpen > 0 && shutAgain > firstOpen);
    assert.equal(lids.at(-1), 1);
  });

  it('never puts the eye under the sand', () => {
    assert.ok(shots.every((shot) => overSand(shot) > 0.1));
  });

  it('stands looking out to sea, the horizon level', () => {
    const stood = shotAt(track, 13.5);
    assert.ok(close(stood.yaw, wake.seaward));
    assert.equal(stood.roll, 0);
    assert.ok(close(overSand(stood), EYE_OVER_SAND, 1e-6));
  });

  it('ends on the cube, upright, having turned the short way', () => {
    const last = shotAt(track, track.span);
    const toCube = Math.atan2(-last.z, -last.x);
    assert.ok(close(Math.cos(last.yaw - toCube), 1, 1e-3));
    assert.ok(Math.abs(last.yaw - wake.seaward) < Math.PI);
    assert.equal(last.roll, 0);
    assert.ok(last.elevation > 0 && last.elevation < 0.2);
  });

  it('groans once, before it moves', () => {
    const said = track.cues.filter(([, cue]) => cue.cue === 'say');
    assert.equal(said.length, 1);
    assert.ok((said[0]?.[0] ?? 9) < 4.5);
  });
});

describe('lookUnder', () => {
  const from = standing(-7.5, 7.5, -0.3);
  const track = lookUnder(from, STAGE);
  const shots = sampled(track);

  it('starts where the body stands and ends on its feet', () => {
    assert.deepEqual(shotAt(track, 0), from);
    const last = shotAt(track, track.span);
    assert.ok(close(overSand(last), EYE_OVER_SAND, 1e-6));
    assert.equal(last.roll, 0);
  });

  it('walks nearer, footfall by footfall, and stays clear of the cube', () => {
    assert.ok(track.cues.length >= 3);
    assert.ok(shots.every(({ x, z }) => farFrom(cube, [x, z]) > 2.5));
    const { x, z } = shotAt(track, track.span);
    assert.ok(farFrom(cube, [x, z]) < 3.5);
  });

  it('bends until the eye is under the cube and sees through to the far side', () => {
    const lowest = shots.reduce((low, shot) => (shot.y < low.y ? shot : low));
    assert.ok(lowest.y < cube.underside - 0.3);
    assert.ok(overSand(lowest) > 0.4);
    // The line of sight at the far edge is still under the cube and over the sand.
    const reach = farFrom(cube, [lowest.x, lowest.z]) + 5;
    const there = lowest.y + reach * Math.tan(lowest.elevation);
    assert.ok(there < cube.underside && there > 1.6, `${there}`);
    assert.ok(Math.abs(lowest.roll) > 0.1);
  });

  it('bends where it stands when already near', () => {
    const near = lookUnder(standing(-4, 0, 0), STAGE);
    assert.equal(near.cues.length, 0);
    assert.ok(near.span < track.span);
  });
});

describe('climb and descent', () => {
  const from = standing(5, -1, Math.PI + 0.4);
  const up = climb(from, STAGE);
  const shots = sampled(up);

  it('goes from the sand to the room, facing in, exposed for indoors', () => {
    assert.deepEqual(shotAt(up, 0), { ...from, yaw: shotAt(up, 0).yaw });
    const last = shotAt(up, up.span);
    assert.deepEqual([last.x, last.y, last.z], arrival);
    assert.ok(close(Math.cos(last.yaw), -1));
    assert.equal(last.exposure, STAGE.indoors);
    assert.equal(last.elevation, 0);
  });

  it('takes a hand and a foot to every rung', () => {
    const limbs = up.cues.flatMap(([, cue]) =>
      cue.cue === 'rung' ? [cue.limb] : [],
    );
    assert.equal(limbs.length, 2 * ladder.rungs.length);
    assert.equal(limbs.filter((limb) => limb === 'foot').length, 12);
  });

  it('only ever rises on the way up', () => {
    const heights = shots.map(({ y }) => y);
    assert.ok(heights.every((y, at) => at === 0 || y >= (heights[at - 1] ?? y) - 1e-9));
  });

  it('keeps the eye outside the wall until it is over the sill', () => {
    assert.ok(
      shots.every(({ x, y }) => x > cube.east + 0.05 || y > ladder.top[1] + 1.3),
    );
  });

  it('comes down the same way backwards, to the ladder foot', () => {
    const inside: Shot = {
      x: 1.2,
      y: arrival[1],
      z: -1.2,
      yaw: 0.2,
      elevation: -0.1,
      roll: 0,
      lids: 1,
      exposure: STAGE.indoors,
    };
    const down = descent(inside, STAGE);
    const last = shotAt(down, down.span);
    assert.ok(close(overSand(last), EYE_OVER_SAND, 1e-6));
    assert.ok(Math.hypot(last.x - ladder.foot[0], last.z - ladder.foot[2]) < 0.6);
    assert.equal(last.exposure, 1);
    const [upMid, downMid] = [shotAt(up, up.span - 3), shotAt(down, 0.8 + 3)];
    assert.ok(close(upMid.y, downMid.y, 1e-9));
  });
});
