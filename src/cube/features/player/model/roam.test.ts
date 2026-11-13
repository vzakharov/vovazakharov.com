import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Cue } from './player';
import {
  EYE_OVER_SAND,
  EYE_OVER_WATER,
  isAfloat,
  type Land,
  roam,
  type Roamer,
  roamingAt,
} from './roam';
import { type Input, STILL } from './step';

/** A beach falling eastward into a still sea: dry west of x = 0, 1 m deep at x = 10. */
const beach: Land = {
  height: (x) => -x / 10,
  level: () => 0,
  solids: [],
};

const EAST = { yaw: 0, elevation: 0 };
const ahead: Input = { ...STILL, walk: 1 };
const DT = 1 / 60;

/** `roamer` after `seconds` of `input` on `land`, and every cue on the way. */
function going(
  roamer: Roamer,
  input: Input,
  seconds: number,
  land: Land = beach,
): { roamer: Roamer; cues: Cue[] } {
  const cues: Cue[] = [];
  let now = roamer;
  for (let t = 0; t < seconds; t += DT) {
    now = roam(now, input, DT, t, land);
    cues.push(...now.cues);
  }
  return { roamer: now, cues };
}

/** How far a frame of walking east carries a body from `x`. */
const paceFrom = (x: number): number =>
  roam(roamingAt(beach, [x, 0], EAST, 0), ahead, DT, 0, beach).eye[0] - x;

describe('roam', () => {
  it('stands a body with its eye a person over the sand', () => {
    const { eye } = roamingAt(beach, [-20, 3], EAST, 0);
    assert.deepEqual(eye, [-20, 2 + EYE_OVER_SAND, 3]);
  });

  it('runs dry sand at the inside pace, footfalls on sand', () => {
    const { roamer, cues } = going(
      roamingAt(beach, [-30, 0], EAST, 0),
      ahead,
      2,
    );
    assert.ok(Math.abs(roamer.eye[0] - -23) < 0.1, `${roamer.eye[0]}`);
    assert.equal(cues.length, 9);
    assert.ok(cues.every((cue) => cue.cue === 'step' && cue.ground === 'sand'));
  });

  it('follows the sand down, the eye settling over it', () => {
    const { roamer } = going(roamingAt(beach, [-30, 0], EAST, 0), ahead, 2);
    const [x, y] = roamer.eye;
    const over = y - (-x / 10 + EYE_OVER_SAND);
    assert.ok(over > 0 && over < 0.06, `${over}`);
  });

  it('names wet sand by the water and shallows in it', () => {
    const grounds = going(
      roamingAt(beach, [-2, 0], EAST, 0),
      ahead,
      3,
    ).cues.map((cue) => (cue.cue === 'step' ? cue.ground : cue.cue));
    assert.deepEqual(
      [...new Set(grounds)],
      ['sand', 'wet-sand', 'shallows', 'splash'],
    );
  });

  it('slows as the water deepens', () => {
    assert.ok(paceFrom(5) < paceFrom(0));
    assert.ok(paceFrom(10) < paceFrom(5));
    assert.ok(Math.abs(paceFrom(30) / paceFrom(-5) - 0.32) < 1e-9);
  });

  it('floats once the water would cover its eyes, and has no edge', () => {
    const { roamer, cues } = going(
      roamingAt(beach, [10, 0], EAST, 0),
      ahead,
      60,
    );
    const [x, y] = roamer.eye;
    assert.ok(x > 60, `${x}`);
    assert.ok(isAfloat(beach, roamer.eye, 0));
    assert.ok(Math.abs(y - EYE_OVER_WATER) < 0.08, `${y}`);
    assert.ok(roamer.stroke > 20);
    assert.equal(cues.at(-1)?.cue, 'splash');
  });

  it('rides the water as it rises and falls', () => {
    const swell: Land = { ...beach, level: (_x, _z, t) => 0.5 * Math.sin(t) };
    const heights: number[] = [];
    let now = roamingAt(swell, [200, 0], EAST, 0);
    for (let t = 0; t < 7; t += DT) {
      now = roam(now, STILL, DT, t, swell);
      heights.push(now.eye[1]);
    }
    assert.ok(Math.max(...heights) > 0.5);
    assert.ok(Math.min(...heights) < -0.25);
  });

  it('is turned aside by a solid, and slides along it', () => {
    const walled: Land = {
      ...beach,
      solids: [{ min: [-20, 0, -2], max: [-15, 5, 3] }],
    };
    const head = going(roamingAt(walled, [-25, 0], EAST, 0), ahead, 3, walled);
    assert.ok(Math.abs(head.roamer.eye[0] - -20.3) < 1e-9);
    const slide = going(
      roamingAt(walled, [-25, 0], { yaw: 0.6, elevation: 0 }, 0),
      ahead,
      4,
      walled,
    ).roamer.eye;
    assert.ok(slide[0] > -15 && slide[2] > 3.29, slide.join(','));
  });

  it('puts a body found inside a solid out through its nearest side', () => {
    const walled: Land = {
      ...beach,
      solids: [{ min: [-20, 0, -2], max: [-15, 5, 3] }],
    };
    const { eye } = roam(
      roamingAt(walled, [-19, 0], EAST, 0),
      STILL,
      DT,
      0,
      walled,
    );
    assert.equal(eye[0], -20.3);
  });

  it('turns and tilts as the inside does, and stands still without keys', () => {
    const turnedBy = roam(
      roamingAt(beach, [-20, 0], EAST, 0),
      { ...STILL, yawBy: 0.5, elevationBy: -0.2 },
      DT,
      0,
      beach,
    );
    assert.equal(turnedBy.yaw, 0.5);
    assert.equal(turnedBy.elevation, -0.2);
    assert.deepEqual(turnedBy.eye, [-20, 2 + EYE_OVER_SAND, 0]);
    assert.deepEqual(turnedBy.cues, []);
  });
});
