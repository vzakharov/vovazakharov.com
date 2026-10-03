import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distanceBetween, type Point } from './geometry';
import {
  acrossOn,
  alongPath,
  bowedPath,
  facingAlong,
  pathLength,
  type RunPath,
  sideOf,
} from './mouse-run-course';

const EYE = { x: 0, y: 0 };
/** Two doors one behind the other, as the opening clump stands them: the run between them lies wholly behind the nearer. */
const BACK = { x: -0.08, y: 10.3 };
const FRONT = { x: 0.06, y: 10 };
/** Two doors side by side. */
const LEFT = { x: -1, y: 10 };
const RIGHT = { x: 1, y: 10 };
const CLEARANCE = 0.12;
const LEAST = 0.6;

const fromEye = (point: Point) => distanceBetween(EYE, point);
const pointsOf = (path: RunPath) =>
  Array.from({ length: 201 }, (_, step) => alongPath(path, step / 200).point);
const nearest = (path: RunPath) =>
  Math.min(...pointsOf(path).map((point) => fromEye(point)));
const course = (from: Point, to: Point, clearance: number, least: number) =>
  bowedPath(from, to, EYE, clearance, least, sideOf(from, to, EYE));

const facings = (path: RunPath) =>
  Array.from({ length: 101 }, (_, step) => facingAlong(path, step / 100, EYE));
const flips = (path: RunPath) =>
  facings(path).filter((way, step, all) => step > 0 && way !== all[step - 1])
    .length;

describe('bowedPath', () => {
  it('runs its middle a clearance nearer the eye than the nearer end', () => {
    for (const [from, to] of [
      [BACK, FRONT],
      [FRONT, BACK],
      [LEFT, RIGHT],
    ] as const) {
      for (const least of [0, LEAST]) {
        const path = course(from, to, CLEARANCE, least);
        const nearer = Math.min(fromEye(from), fromEye(to));
        assert.ok(nearest(path) <= nearer - CLEARANCE + 1e-9);
      }
    }
  });

  it('starts and ends on the two fronts', () => {
    const path = course(BACK, FRONT, CLEARANCE, LEAST);
    assert.ok(distanceBetween(alongPath(path, 0).point, BACK) < 1e-12);
    assert.ok(distanceBetween(alongPath(path, 1).point, FRONT) < 1e-12);
  });

  it('bows a short course out to its side until, so bowed alone, it is the least length', () => {
    const path = course(BACK, FRONT, CLEARANCE, LEAST);
    assert.ok(pathLength(path) >= LEAST);
    // The aside bow alone makes the least length, the toward bow adding to it.
    const alone = course(BACK, FRONT, -100, LEAST);
    assert.ok(Math.abs(pathLength(alone) - LEAST) < 1e-6);
    assert.ok(pathLength(path) > pathLength(alone));
    // Doors one behind the other: the course swings across the line of sight
    // as far whatever its clearance.
    const swing = (each: RunPath) => {
      const across = pointsOf(each).map(({ x, y }) => Math.atan2(x, y));
      return Math.max(...across) - Math.min(...across);
    };
    assert.ok(swing(alone) > 0.02);
    assert.ok(swing(path) > swing(alone) * 0.9);
    const long = course(LEFT, RIGHT, 0.1, LEAST);
    assert.ok(pathLength(long) > 2 && pathLength(long) < 2.1);
  });

  it('bows out to the side of its chord nearer the eye, kept as given', () => {
    const slanted = { x: 1, y: 11 };
    const side = sideOf(LEFT, slanted, EYE);
    const out = (given: number) =>
      fromEye(bowedPath(LEFT, slanted, EYE, 0, 3, given).bend);
    assert.ok(out(side) < out(-side));
    assert.equal(sideOf(slanted, LEFT, EYE), -side);
  });

  it('never bows its middle past half the way from the nearer end to the eye', () => {
    const { bend } = course(BACK, FRONT, 100, 0);
    const middle = {
      x: (bend.x + (BACK.x + FRONT.x) / 2) / 2,
      y: (bend.y + (BACK.y + FRONT.y) / 2) / 2,
    };
    assert.ok(fromEye(middle) >= fromEye(FRONT) / 2 - 1e-9);
  });

  it('moves smoothly along by length, facing along the course', () => {
    const path = course(BACK, FRONT, CLEARANCE, LEAST);
    const whole = pathLength(path);
    const steps = 300;
    let last = alongPath(path, 0);
    for (let step = 1; step <= steps; step++) {
      const at = alongPath(path, step / steps);
      const moved = distanceBetween(last.point, at.point);
      assert.ok(Math.abs(moved - whole / steps) < (whole / steps) * 0.1);
      const way = {
        x: (at.point.x - last.point.x) / moved,
        y: (at.point.y - last.point.y) / moved,
      };
      assert.ok(way.x * at.heading.x + way.y * at.heading.y > 0.95);
      last = at;
    }
  });
});

describe('acrossOn', () => {
  it('reads how far a way runs across the screen, right positive', () => {
    const ahead = { x: 0, y: 2 };
    assert.equal(acrossOn({ x: 1, y: 0 }, ahead, EYE), 1);
    assert.equal(acrossOn({ x: -1, y: 0 }, ahead, EYE), -1);
    assert.equal(acrossOn({ x: 0, y: 1 }, ahead, EYE), 0);
    assert.equal(acrossOn({ x: 1, y: 0 }, { x: 0, y: -2 }, EYE), -1);
  });
});

describe('facingAlong', () => {
  it('never flips on a course that crosses the screen', () => {
    for (const [from, to, way] of [
      [LEFT, RIGHT, 1],
      [RIGHT, LEFT, -1],
    ] as const) {
      const path = course(from, to, CLEARANCE, LEAST);
      assert.ok(facings(path).every((each) => each === way));
    }
  });

  it('turns once, where a course out and back across the screen turns', () => {
    const path = course(BACK, FRONT, CLEARANCE, LEAST);
    assert.equal(flips(path), 1);
    const first = facingAlong(path, 0, EYE);
    assert.equal(facingAlong(path, 1, EYE), -first);
  });

  it('keeps its way where the course runs toward the eye or away', () => {
    // A course straight away from the eye, nudged a hair aside.
    const away: RunPath = {
      from: { x: 0, y: 5 },
      bend: { x: 0.001, y: 5.5 },
      to: { x: 0, y: 6 },
    };
    assert.equal(flips(away), 0);
  });
});
