import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  flightPoint,
  heading,
  LANDING,
  landingBob,
  MAX_TILT,
  type Path,
  tilt,
  wingBeat,
} from './insect-motion';

const PATH: Path = {
  start: { x: -40, y: 120 },
  end: { x: 300, y: 260 },
  departs: 1000,
  arrives: 3000,
};
const PHASES = [0, 0.7, 2, 3.5, 5.9];
const flier = (phase: number) => ({ phase, flutter: 12 });
const times = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, index) => from + index * step,
  );

describe('flightPoint', () => {
  it('starts exactly at the start and ends exactly at the end', () => {
    for (const phase of PHASES) {
      assert.deepEqual(
        flightPoint(PATH, PATH.departs, flier(phase)),
        PATH.start,
      );
      assert.deepEqual(flightPoint(PATH, 0, flier(phase)), PATH.start);
      assert.deepEqual(flightPoint(PATH, PATH.arrives, flier(phase)), PATH.end);
      assert.deepEqual(flightPoint(PATH, 99_999, flier(phase)), PATH.end);
    }
  });

  it('comes in to the end without a jump', () => {
    for (const phase of PHASES) {
      const near = flightPoint(PATH, PATH.arrives - 16, flier(phase));
      const gap = Math.hypot(near.x - PATH.end.x, near.y - PATH.end.y);
      assert.ok(gap < 3, `gap ${String(gap)} a frame before landing`);
    }
  });

  it('moves little from one frame to the next, all the way', () => {
    for (const phase of PHASES) {
      let last = flightPoint(PATH, PATH.departs - 16, flier(phase));
      for (const now of times(PATH.departs, PATH.arrives + 64, 16)) {
        const here = flightPoint(PATH, now, flier(phase));
        assert.ok(Math.hypot(here.x - last.x, here.y - last.y) < 12);
        last = here;
      }
    }
  });

  it('bows off the straight line mid-flight', () => {
    const mid = flightPoint(PATH, 2000, { phase: 0, flutter: 0 });
    const straight = { x: 130, y: 190 };
    assert.ok(Math.hypot(mid.x - straight.x, mid.y - straight.y) > 20);
  });

  it('stays put on a flight to where it already is', () => {
    const still = { ...PATH, end: PATH.start };
    const here = flightPoint(still, 2000, { phase: 1, flutter: 0 });
    assert.deepEqual(here, PATH.start);
  });
});

describe('heading and tilt', () => {
  it('faces the way the curve goes, and lands facing the way it came', () => {
    const toward = Math.atan2(140, 340);
    for (const phase of PHASES) {
      const off = heading(PATH, PATH.departs, { phase });
      const on = heading(PATH, PATH.arrives, { phase });
      assert.ok(Math.abs(off - toward) < 1 && Math.abs(on - toward) < 1);
      assert.notEqual(off, on);
    }
  });

  it('banks into the turn mid-flight and is level at both ends', () => {
    for (const phase of PHASES) {
      assert.equal(Math.abs(tilt(PATH, PATH.departs, { phase })), 0);
      assert.ok(Math.abs(tilt(PATH, PATH.arrives, { phase })) < 1e-9);
      const mid = tilt(PATH, 2000, { phase });
      assert.ok(Math.abs(Math.abs(mid) - MAX_TILT) < 1e-9);
    }
  });
});

/** How far the wings swing between `from` and `to`. */
function swing(from: number, to: number): number {
  const beats = times(from, to, 5).map((now) =>
    wingBeat(PATH, now, { phase: 0 }),
  );
  return Math.max(...beats) - Math.min(...beats);
}

describe('wingBeat', () => {
  const all = times(0, 8000, 7);

  it('stays between closed and open', () => {
    for (const phase of PHASES) {
      for (const now of all) {
        const open = wingBeat(PATH, now, { phase });
        assert.ok(open >= 0 && open <= 1, `open ${String(open)}`);
      }
    }
  });

  it('beats fast in the air and slowly at rest', () => {
    assert.ok(swing(2000, 2200) > 0.9);
    assert.ok(swing(5000, 5200) < 0.3);
  });

  it('never jumps, at take-off, at landing or between', () => {
    for (const phase of PHASES) {
      for (const now of times(PATH.departs - 300, PATH.arrives + 700, 1)) {
        const step = Math.abs(
          wingBeat(PATH, now + 1, { phase }) - wingBeat(PATH, now, { phase }),
        );
        assert.ok(step < 0.05, `step ${String(step)} at ${String(now)}`);
      }
    }
  });
});

describe('landingBob', () => {
  it('dips after landing and is 0 before and after, without a jump', () => {
    assert.equal(landingBob(PATH, PATH.arrives - 1), 0);
    assert.equal(landingBob(PATH, PATH.arrives), 0);
    assert.ok(landingBob(PATH, PATH.arrives + LANDING / 4) > 0);
    assert.equal(landingBob(PATH, PATH.arrives + LANDING), 0);
    for (const now of times(
      PATH.arrives - 50,
      PATH.arrives + LANDING + 50,
      1,
    )) {
      const step = Math.abs(landingBob(PATH, now + 1) - landingBob(PATH, now));
      assert.ok(step < 0.01);
    }
  });
});
