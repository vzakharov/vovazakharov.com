import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distanceBetween, type Point } from './geometry';
import { alongPath, bowedPath, pathLength } from './mouse-run-course';

const EYE = { x: 0, y: 0 };
/** Two doors one behind the other, as the opening clump stands them: the run between them lies wholly behind the nearer. */
const BACK = { x: -0.08, y: 10.3 };
const FRONT = { x: 0.06, y: 10 };
const CLEARANCE = 0.12;
const LEAST = 0.6;

const fromEye = (point: Point) => distanceBetween(EYE, point);
const nearest = (of: ReturnType<typeof bowedPath>) => {
  let least = Infinity;
  for (let step = 0; step <= 200; step++) {
    least = Math.min(least, fromEye(alongPath(of, step / 200).point));
  }
  return least;
};

describe('bowedPath', () => {
  it('runs its middle a clearance nearer the eye than the nearer end', () => {
    for (const [from, to] of [
      [BACK, FRONT],
      [FRONT, BACK],
      [
        { x: -1, y: 10 },
        { x: 1, y: 10 },
      ],
    ] as const) {
      const path = bowedPath(from, to, EYE, CLEARANCE, 0);
      const middle = {
        x: (path.bend.x + (from.x + to.x) / 2) / 2,
        y: (path.bend.y + (from.y + to.y) / 2) / 2,
      };
      const nearer = Math.min(fromEye(from), fromEye(to));
      assert.ok(fromEye(middle) <= nearer - CLEARANCE + 1e-9);
      assert.ok(nearest(path) <= nearer - CLEARANCE + 1e-9);
    }
  });

  it('starts and ends on the two fronts', () => {
    const path = bowedPath(BACK, FRONT, EYE, CLEARANCE, LEAST);
    assert.ok(distanceBetween(alongPath(path, 0).point, BACK) < 1e-12);
    assert.ok(distanceBetween(alongPath(path, 1).point, FRONT) < 1e-12);
  });

  it('bows a short course farther until it is the least length', () => {
    assert.ok(
      pathLength(bowedPath(BACK, FRONT, EYE, CLEARANCE, LEAST)) >= LEAST,
    );
    const path = bowedPath(BACK, FRONT, EYE, 0, LEAST);
    assert.ok(Math.abs(pathLength(path) - LEAST) < 1e-6);
    const long = bowedPath({ x: -1, y: 10 }, { x: 1, y: 10 }, EYE, 0.1, LEAST);
    assert.ok(pathLength(long) > 2);
    assert.ok(pathLength(long) < 2.1);
  });

  it('never bows its middle past half the way from the nearer end to the eye', () => {
    const path = bowedPath(BACK, FRONT, EYE, CLEARANCE, 100);
    const middle = {
      x: (path.bend.x + (BACK.x + FRONT.x) / 2) / 2,
      y: (path.bend.y + (BACK.y + FRONT.y) / 2) / 2,
    };
    assert.ok(fromEye(middle) >= fromEye(FRONT) / 2 - 1e-9);
  });

  it('moves smoothly along by length, facing along the course', () => {
    const path = bowedPath(BACK, FRONT, EYE, CLEARANCE, LEAST);
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
