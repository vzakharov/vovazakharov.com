import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from './geometry';
import {
  bodyTurn,
  flightPoint,
  flyingTurn,
  heading,
  LANDING,
  landingBob,
  MAX_TILT,
  type Path,
  REST_LEAN,
  restTurn,
  tilt,
  turned,
  type Turns,
  wingBeat,
  wrap,
} from './insect-motion';
import { between, mulberry32, type Random } from './random';

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

/** A perch somewhere on a tall screen, swaying a few pixels about its place. */
function swaying(random: Random): (now: number) => Point {
  const place = { x: between(random, 0, 400), y: between(random, 0, 800) };
  const phase = between(random, 0, Math.PI * 2);
  return (now) => ({
    x: place.x + 4 * Math.sin(now / 700 + phase),
    y: place.y + 3 * Math.cos(now / 900 + phase),
  });
}

/**
 * A butterfly's body turn every 16 ms over a run of legs between swaying
 * perches, the last one away, set frame by frame as `InsectView` sets it:
 * each leg starts where the last frame drew it, turned as it was then.
 */
function turnsOverLegs(seed: number): number[] {
  const random = mulberry32(seed);
  const phased = { phase: between(random, 0, Math.PI * 2), flutter: 12 };
  const rotations: number[] = [];
  let at = { x: -40, y: 300 };
  let sat: number | undefined;
  let facing = 0;
  let departs = 0;
  for (const index of [0, 1, 2, 3, 4]) {
    const away = index === 4;
    const perch = away ? () => ({ x: 480, y: 200 }) : swaying(random);
    const arrives = departs + between(random, 1600, 2600);
    const leaves = away ? arrives : arrives + between(random, 3000, 6000);
    const start = at;
    let turns: Turns | undefined;
    for (let now = departs; now < leaves || now === departs; now += 16) {
      const path: Path = { departs, arrives, start, end: perch(now) };
      const { end } = path;
      if (Math.hypot(end.x - start.x, end.y - start.y) > 1) {
        facing = heading(path, now, phased);
      }
      const flying = flyingTurn(facing, path, now, phased);
      turns = turned(turns, sat, path, now, flying, !away);
      const rotation = bodyTurn(path, now, flying, turns);
      rotations.push(rotation);
      at = flightPoint(path, now, phased);
      sat = rotation;
    }
    departs = leaves + 16 - ((leaves - departs) % 16);
  }
  return rotations;
}

describe('bodyTurn', () => {
  it('never spins: at most ~0.2 rad a frame, flying, landing, resting and taking off', () => {
    for (const seed of Array.from({ length: 60 }, (_, index) => index * 977)) {
      const rotations = turnsOverLegs(seed);
      for (const [index, rotation] of rotations.entries()) {
        const last = rotations[index - 1] ?? rotation;
        const step = Math.abs(wrap(rotation - last));
        assert.ok(
          step <= 0.2,
          `seed ${String(seed)}: ${String(step)} rad at frame ${String(index)}`,
        );
      }
    }
  });

  it('settles facing up the screen, give or take, however it came in', () => {
    const span = { departs: 0, arrives: 2000 };
    for (const landing of times(-3.14, 3.14, 0.01)) {
      const turns = turned(undefined, undefined, span, 2000, landing, true);
      const settled = bodyTurn(span, 5000, landing, turns);
      assert.ok(Math.abs(settled) <= REST_LEAN + 1e-9);
      assert.ok(Math.abs(wrap(settled - restTurn(landing))) < 1e-9);
    }
  });

  it('takes off turned the way it sat, and turns into its heading', () => {
    const span = { departs: 1000, arrives: 3000 };
    const turns = turned(undefined, 2.5, span, 1000, -2.9, true);
    assert.ok(Math.abs(wrap(bodyTurn(span, 1000, -2.9, turns) - 2.5)) < 1e-9);
    assert.ok(Math.abs(wrap(bodyTurn(span, 2000, -2.9, turns) + 2.9)) < 1e-9);
  });
});
