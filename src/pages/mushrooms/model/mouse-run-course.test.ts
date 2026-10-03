import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distanceBetween, type Point } from './geometry';
import {
  alongPath,
  bowedPath,
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

  it('bows a short course out to its side until it is the least length', () => {
    assert.ok(pathLength(course(BACK, FRONT, CLEARANCE, LEAST)) >= LEAST);
    const path = course(BACK, FRONT, 0, LEAST);
    assert.ok(Math.abs(pathLength(path) - LEAST) < 1e-6);
    // Doors one behind the other: the course swings across the line of sight.
    const across = pointsOf(path).map(({ x, y }) => Math.atan2(x, y));
    assert.ok(Math.max(...across) - Math.min(...across) > 0.02);
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
