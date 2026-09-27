import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLIGHT_HABITS } from './flight';
import type { Point } from './geometry';
import { INSECT_KINDS, type InsectKind } from './insect-genes';
import { flyingTurn, wrap } from './insect-motion';
import {
  flightPoint,
  heading,
  MAX_TILT,
  type Path,
  PATH_SHAPES,
  tilt,
} from './insect-paths';
import { between, mulberry32 } from './random';

const PATH: Path = {
  start: { x: -40, y: 120 },
  end: { x: 300, y: 260 },
  departs: 1000,
  arrives: 3000,
  launch: 0,
  speed: 0,
  drink: 0,
};
const PHASES = [0, 0.7, 2, 3.5, 5.9];
const flier = (phase: number, kind: InsectKind = 'butterfly') => ({
  phase,
  flutter: 12,
  kind,
});
const times = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, index) => from + index * step,
  );
/** One frame at 60 frames a second, in ms. */
const FRAME = 1000 / 60;

/** How far `point` stands off the straight line from the path's start to its end, signed. */
function offChord({ start, end }: Path, point: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return (
    ((point.x - start.x) * -dy + (point.y - start.y) * dx) / Math.hypot(dx, dy)
  );
}

describe('flightPoint', () => {
  it('starts exactly at the start and ends exactly at the end, every kind', () => {
    for (const kind of INSECT_KINDS) {
      for (const phase of PHASES) {
        const motion = flier(phase, kind);
        assert.deepEqual(flightPoint(PATH, PATH.departs, motion), PATH.start);
        assert.deepEqual(flightPoint(PATH, 0, motion), PATH.start);
        assert.deepEqual(flightPoint(PATH, PATH.arrives, motion), PATH.end);
        assert.deepEqual(flightPoint(PATH, 99_999, motion), PATH.end);
      }
    }
  });

  it('comes in to the end without a jump, every kind', () => {
    for (const kind of INSECT_KINDS) {
      for (const phase of PHASES) {
        const near = flightPoint(PATH, PATH.arrives - 16, flier(phase, kind));
        const gap = Math.hypot(near.x - PATH.end.x, near.y - PATH.end.y);
        assert.ok(
          gap < 3,
          `${kind}: gap ${String(gap)} a frame before landing`,
        );
      }
    }
  });

  it('moves little from one frame to the next, all the way, every kind', () => {
    for (const kind of INSECT_KINDS) {
      for (const phase of PHASES) {
        let last = flightPoint(PATH, PATH.departs - 16, flier(phase, kind));
        for (const now of times(PATH.departs, PATH.arrives + 64, 16)) {
          const here = flightPoint(PATH, now, flier(phase, kind));
          assert.ok(Math.hypot(here.x - last.x, here.y - last.y) < 12, kind);
          last = here;
        }
      }
    }
  });

  it('bows a butterfly off the straight line mid-flight', () => {
    const mid = flightPoint(PATH, 2000, { ...flier(0), flutter: 0 });
    assert.ok(Math.abs(offChord(PATH, mid)) > 20);
  });

  it('zigzags a fly back and forth across its line', () => {
    for (const phase of PHASES) {
      const motion = { ...flier(phase, 'fly'), flutter: 0 };
      const sides = times(PATH.departs + 50, PATH.arrives - 50, 10).map((now) =>
        Math.sign(offChord(PATH, flightPoint(PATH, now, motion))),
      );
      const crossings = sides.filter(
        (side, index) => index > 0 && side !== sides[index - 1],
      ).length;
      assert.ok(crossings >= 2, `${String(crossings)} crossings`);
    }
  });

  it('holds a bee near its line, bobbing up and down', () => {
    for (const phase of PHASES) {
      const bobbing = flier(phase, 'bee');
      const still = { ...bobbing, flutter: 0 };
      const offs = times(PATH.departs, PATH.arrives, 20).map((now) =>
        Math.abs(offChord(PATH, flightPoint(PATH, now, still))),
      );
      const straight = Math.hypot(340, 140);
      assert.ok(Math.max(...offs) < straight * 0.1);
      const lifts = times(PATH.departs, PATH.arrives, 20).map(
        (now) =>
          flightPoint(PATH, now, still).y - flightPoint(PATH, now, bobbing).y,
      );
      assert.ok(Math.max(...lifts) > 6 && Math.min(...lifts) < -6);
    }
  });

  it('stays put on a flight to where it already is, every kind', () => {
    const still = { ...PATH, end: PATH.start };
    for (const kind of INSECT_KINDS) {
      const here = flightPoint(still, 2000, { ...flier(1, kind), flutter: 0 });
      assert.deepEqual(here, PATH.start);
    }
  });
});

describe('heading and tilt', () => {
  it('faces the way the curve goes, and lands facing the way it came', () => {
    const toward = Math.atan2(140, 340);
    for (const kind of INSECT_KINDS) {
      for (const phase of PHASES) {
        const off = heading(PATH, PATH.departs, flier(phase, kind));
        const on = heading(PATH, PATH.arrives, flier(phase, kind));
        assert.ok(Math.abs(off - toward) < 1 && Math.abs(on - toward) < 1);
        assert.notEqual(off, on);
      }
    }
  });

  it('banks into the turn mid-flight, as far as its kind does, and is level at both ends', () => {
    assert.equal(PATH_SHAPES.butterfly.bank, MAX_TILT);
    for (const kind of INSECT_KINDS) {
      for (const phase of PHASES) {
        const motion = flier(phase, kind);
        assert.equal(Math.abs(tilt(PATH, PATH.departs, motion)), 0);
        assert.ok(Math.abs(tilt(PATH, PATH.arrives, motion)) < 1e-9);
        const mid = tilt(PATH, 2000, motion);
        assert.ok(Math.abs(Math.abs(mid) - PATH_SHAPES[kind].bank) < 1e-9);
        assert.ok(PATH_SHAPES[kind].bank <= MAX_TILT);
      }
    }
  });

  it('never turns more than 0.2 rad between frames through a whole leg, any kind, any seed', () => {
    for (const kind of INSECT_KINDS) {
      const { flying } = FLIGHT_HABITS[kind];
      for (let seed = 1; seed <= 300; seed++) {
        const random = mulberry32(seed * 7919);
        const start = {
          x: between(random, 0, 1200),
          y: between(random, 0, 800),
        };
        const reach = between(random, 40, 900);
        const angle = between(random, -Math.PI, Math.PI);
        const departs = between(random, 0, 5000);
        const path: Path = {
          start,
          end: {
            x: start.x + reach * Math.cos(angle),
            y: start.y + reach * Math.sin(angle),
          },
          departs,
          arrives: departs + between(random, flying[0], flying[1]),
          launch: random(),
          speed: random(),
          drink: 0,
        };
        const motion = flier(between(random, 0, Math.PI * 2), kind);
        let facing = heading(path, departs - FRAME, motion);
        let turn = flyingTurn(facing, path, departs - FRAME, motion);
        for (let now = departs; now <= path.arrives + FRAME * 2; now += FRAME) {
          const next = heading(path, now, motion);
          const turning = flyingTurn(next, path, now, motion);
          const step = Math.abs(wrap(next - facing));
          const bodyStep = Math.abs(wrap(turning - turn));
          assert.ok(
            step <= 0.2,
            `${kind} seed ${String(seed)}: ${String(step)}`,
          );
          assert.ok(bodyStep <= 0.2, `${kind} seed ${String(seed)} body`);
          [facing, turn] = [next, turning];
        }
      }
    }
  });
});
