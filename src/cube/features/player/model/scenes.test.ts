import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import { sampled, STAGE } from './abroad.test-kit';
import { EYE_OVER_SAND } from './roam';
import { climb, shotOf, stepOff, waking } from './scenes';
import { type Shot, shotAt } from './track';

const { land, cube, wake, arrival, ladder } = STAGE;

const overSand = ({ x, y, z }: Shot): number => y - land.height(x, z);

const close = (a: number, b: number, within = 1e-9): boolean =>
  Math.abs(a - b) <= within;

/** How far `a` is turned from `b`, the short way round, in radians. */
const turned = (a: number, b: number): number =>
  Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

/** A free eye standing at `x`, `z`, looking along `yaw`. */
const standing = (x: number, z: number, yaw: number): Shot =>
  shotOf({
    eye: [x, land.height(x, z) + EYE_OVER_SAND, z],
    yaw,
    elevation: 0,
    roll: 0,
  });

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
    const shutAgain = lids.findIndex(
      (open, at) => at > firstOpen && open === 0,
    );
    assert.ok(firstOpen > 0 && shutAgain > firstOpen);
    assert.equal(lids.at(-1), 1);
  });

  it('never puts the eye under the sand', () => {
    assert.ok(shots.every((shot) => overSand(shot) > 0.1));
  });

  it('stands looking out to sea, the horizon level', () => {
    const stood = shotAt(track, 10.5);
    assert.ok(close(stood.yaw, wake.seaward));
    assert.equal(stood.roll, 0);
    assert.ok(close(overSand(stood), EYE_OVER_SAND, 1e-6));
  });

  it('ends looking out to sea, upright', () => {
    const last = shotAt(track, track.runs);
    assert.ok(turned(last.yaw, wake.seaward) < 1e-9);
    assert.equal(last.roll, 0);
  });

  it('groans once, before it moves', () => {
    const said = track.cues.filter(([, cue]) => cue.cue === 'say');
    assert.equal(said.length, 1);
    assert.ok((said[0]?.[0] ?? 9) < 4);
  });
});

describe('climb', () => {
  const from = standing(5, -1, Math.PI + 0.4);
  const up = climb(from, STAGE);
  const shots = sampled(up);

  const { foot, top, rungs } = ladder;
  const ladderYaw = Math.atan2(top[2] - foot[2], top[0] - foot[0]);

  it('goes from the sand to the room, looking along the ladder, level', () => {
    const first = shotAt(up, 0);
    assert.deepEqual({ ...first, ...pick(from, 'yaw') }, from);
    const last = shotAt(up, up.runs);
    assert.deepEqual([last.x, last.y, last.z], arrival);
    assert.ok(turned(last.yaw, ladderYaw) < 1e-9);
    assert.equal(last.elevation, 0);
    assert.equal(last.exposure, 1);
  });

  it('looks aside on the way up, and back along the ladder at the sill', () => {
    assert.ok(shots.some(({ yaw }) => turned(yaw, ladderYaw) > 0.5));
    // The first footfall off the rungs comes a tenth of a second before the sill.
    const [stepped] = up.cues.flatMap(([at, cue]) =>
      cue.cue === 'step' ? [at] : [],
    );
    assert.ok(stepped !== undefined);
    const sill = shotAt(up, stepped + 0.1);
    assert.ok(turned(sill.yaw, ladderYaw) < 0.01);
    assert.ok(turned(shotAt(up, up.runs).yaw, ladderYaw) < 0.01);
  });

  it('takes a hand and a foot to every rung', () => {
    const limbs = up.cues.flatMap(([, cue]) =>
      cue.cue === 'rung' ? [cue.limb] : [],
    );
    assert.equal(limbs.length, 2 * rungs.length);
    assert.equal(limbs.filter((limb) => limb === 'foot').length, 12);
  });

  it('only ever rises on the way up', () => {
    const heights = shots.map(({ y }) => y);
    assert.ok(
      heights.every((y, at) => at === 0 || y >= (heights[at - 1] ?? y) - 1e-9),
    );
  });

  it('keeps the eye outside the wall until it is over the sill', () => {
    assert.ok(
      shots.every(({ x, y }) => x > cube.max[0] + 0.05 || y > top[1] + 1.3),
    );
  });
});

/** The eye of a body of `scale` on the sill's edge. */
const onEdge = (scale: number): Shot => ({
  x: cube.max[0],
  y: ladder.top[1] + EYE_OVER_SAND * scale,
  z: -1.7,
  yaw: 0.2,
  elevation: -0.1,
  roll: 0,
  lids: 1,
  exposure: 1,
});

describe('stepOff', () => {
  for (const scale of [1, 0.5]) {
    const from = onEdge(scale);
    const track = stepOff(from, scale, STAGE);
    const shots = sampled(track, 0.01);

    it(`starts where a body of ${scale} stands and keeps its gaze`, () => {
      assert.deepEqual(shotAt(track, 0), from);
      assert.ok(shots.every(({ yaw }) => yaw === from.yaw));
      assert.ok(shots.every(({ elevation }) => elevation === from.elevation));
    });

    it(`lands a body of ${scale} on the sand under the doorway, in daylight`, () => {
      const last = shotAt(track, track.runs);
      assert.ok(close(overSand(last), EYE_OVER_SAND * scale, 1e-9));
      assert.ok(last.x > cube.max[0] + 0.3 * scale);
      assert.equal(last.z, from.z);
      assert.equal(last.exposure, 1);
    });

    it(`is clear of the face before a body of ${scale} sinks under the sill`, () => {
      assert.ok(
        shots.every(({ x, y }) => x > cube.max[0] || y >= from.y - 1e-9),
      );
    });

    it(`falls a body of ${scale} as a dropped thing does, and lands once`, () => {
      const drop = from.y - shotAt(track, track.runs).y;
      const [[at, cue] = [0, null]] = track.cues;
      assert.equal(track.cues.length, 1);
      assert.ok(cue?.cue === 'landing');
      assert.ok(close(at, 0.2 + Math.sqrt((2 * drop) / 9.8), 1e-9));
      // Half way through the fall's time, a quarter of the way down.
      const half = shotAt(track, 0.2 + (at - 0.2) / 2);
      assert.ok(close(from.y - half.y, drop / 4, 1e-9));
      assert.ok(shots.every((shot) => overSand(shot) > 0.6 * scale));
    });
  }
});
