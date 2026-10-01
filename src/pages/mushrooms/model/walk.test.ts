import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { meadowCamera } from '../ui/scene/meadow-camera';
import { viewAt } from '../ui/scene/view';
import { planeUnder } from '../ui/scene/view-inverse';
import { VIEWPORTS } from '../ui/scene/viewports';
import type { Point } from './geometry';
import { type Camera, pinholeOf, viewOf } from './ground';
import { SLOP, TURN_CRUISE } from './pan';
import { STRIDE_CRUISE } from './stride';
import {
  distanceOfRow,
  eyeAt,
  headingAt,
  heldStill,
  holdTurn,
  holdWalk,
  letGoTurn,
  liftAt,
  moveTo,
  openingWalk,
  pressAt,
  refit,
  tickWalk,
  type Walk,
} from './walk';

const FRAME = 1 / 60;
const CAMERAS = VIEWPORTS.flatMap(([name, width, height]) => [
  { name, camera: meadowCamera(width, height) },
  { name: `${name} turned`, camera: meadowCamera(height, width) },
]);
const TABLET = meadowCamera(1180, 820);

/** How far `one` is from `other`. */
function apart(one: Point, other: Point): number {
  return Math.hypot(one.x - other.x, one.y - other.y);
}

/** The shorter angle between two headings, in radians. */
function turnedBy(from: number, to: number): number {
  const turn = (to - from) % (2 * Math.PI);
  return Math.abs(
    turn > Math.PI
      ? turn - 2 * Math.PI
      : turn < -Math.PI
        ? turn + 2 * Math.PI
        : turn,
  );
}

/** A clock and the walk it drives: each call runs `seconds` of frames, ticking the walk. */
class Clock {
  time = 10;
  walk: Walk;
  constructor(walk: Walk) {
    this.walk = walk;
  }
  /** Runs `seconds`, a frame at a time, handing `each` the walk after every frame. */
  run(seconds: number, each?: (walk: Walk) => void): void {
    for (let spent = 0; spent < seconds - 1e-9; spent += FRAME) {
      this.time += FRAME;
      this.walk = tickWalk(this.walk, FRAME, this.time);
      each?.(this.walk);
    }
  }
  press(point: Point): void {
    this.walk = pressAt(this.walk, point, this.time);
  }
  move(point: Point): void {
    this.walk = moveTo(this.walk, point, this.time);
  }
  lift(): void {
    this.walk = liftAt(this.walk, this.time);
  }
  /** Drags the finger from where it is to `to` over `seconds`, a sample a frame. */
  drag(from: Point, to: Point, seconds: number): void {
    const frames = Math.round(seconds / FRAME);
    for (let frame = 1; frame <= frames; frame++) {
      this.run(FRAME);
      const share = frame / frames;
      this.move({
        x: from.x + (to.x - from.x) * share,
        y: from.y + (to.y - from.y) * share,
      });
    }
  }
}

/** `point` moved by `dx` and `dy`. */
function shifted(point: Point, dx: number, dy: number): Point {
  return { x: point.x + dx, y: point.y + dy };
}

/** The axis a walk's pressed finger is locked to, if any. */
function axisOf(walk: Walk): string | undefined {
  return walk.drag?.lock?.axis;
}

/** A finger's start low on the ground, right of the middle, on `camera`. */
function groundPress(camera: Camera): Point {
  return { x: camera.width * 0.6, y: camera.height * 0.85 };
}

describe('a drag on the walk', () => {
  it('moves nothing while it stays inside the radial slop, a long press while it lasts', () => {
    const clock = new Clock(openingWalk(TABLET));
    const down = groundPress(TABLET);
    clock.press(down);
    const before = eyeAt(clock.walk, clock.time);
    // 16 px on each axis is inside a per-axis slop of 24 but not inside the circle's 16·√2 ≈ 22.6.
    clock.drag(down, shifted(down, 16, -16), 0.3);
    assert.deepEqual(eyeAt(clock.walk, clock.time), before);
    assert.ok(Math.abs((heldStill(clock.walk, clock.time) ?? 0) - 0.3) < 1e-6);
  });

  it('crosses the slop radially: 20 px on each axis is past it', () => {
    const clock = new Clock(openingWalk(TABLET));
    const down = groundPress(TABLET);
    clock.press(down);
    clock.move(shifted(down, 20, 20.5));
    assert.equal(heldStill(clock.walk, clock.time), undefined);
    assert.equal(axisOf(clock.walk), 'step');
    clock.lift();
    assert.equal(heldStill(clock.walk, clock.time), undefined);
  });

  it('locks within 45° of horizontal to the turn, else to the step, and holds the lock to the lift', () => {
    for (const [dx, dy, axis] of [
      [30, 0, 'turn'],
      [-25, 25, 'turn'],
      [20, -29, 'step'],
      [0, 30, 'step'],
    ] as const) {
      const clock = new Clock(openingWalk(TABLET));
      const down = groundPress(TABLET);
      clock.press(down);
      clock.move(shifted(down, dx, dy));
      assert.equal(axisOf(clock.walk), axis, `${dx}, ${dy}`);
      // Then the finger turns the other way round: the lock stays.
      clock.move(shifted(down, dy * 3, dx * 3));
      assert.equal(axisOf(clock.walk), axis, `${dx}, ${dy} after`);
    }
  });

  it('a drag within 45° of horizontal moves no eye with no key held', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(openingWalk(camera));
      const down = groundPress(camera);
      clock.press(down);
      clock.drag(down, shifted(down, 300, -280), 0.4);
      clock.lift();
      clock.run(2.5);
      assert.deepEqual(clock.walk.stride.at, { x: 0, y: 0 }, name);
    }
  });

  it('turns 1:1 in angle: the ground under the crossing stays under the finger', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(openingWalk(camera));
      const down = groundPress(camera);
      clock.press(down);
      const crossing = shifted(down, -SLOP, 0);
      const under = planeUnder(
        viewAt(camera, eyeAt(clock.walk, clock.time)),
        crossing,
      );
      clock.move(shifted(crossing, -1, 0));
      assert.ok(under, name);
      for (const x of [down.x - 100, 10, camera.width - 10, down.x + 40]) {
        clock.run(FRAME);
        clock.move({ ...down, x });
        const eye = eyeAt(clock.walk, clock.time);
        const seen = viewOf(camera, eye, under, 0);
        assert.ok(Math.abs(seen.x - x) < 1e-6, `${name} at ${x}: ${seen.x}`);
        // And the angle formula itself, from the crossing.
        const want = (crossing.x - x) / pinholeOf(camera).arc;
        assert.ok(turnedBy(want, eye.heading) < 1e-9, `${name} formula`);
      }
    }
  });

  it('glides on from a quick lift and rests from a still one', () => {
    const clock = new Clock(openingWalk(TABLET));
    const down = groundPress(TABLET);
    clock.press(down);
    clock.drag(down, shifted(down, -300, 0), 0.15);
    clock.lift();
    const lifted = headingAt(clock.walk, clock.time);
    clock.run(2.5);
    assert.ok(turnedBy(lifted, headingAt(clock.walk, clock.time)) > 0.05);

    const still = new Clock(openingWalk(TABLET));
    still.press(down);
    still.drag(down, shifted(down, -300, 0), 0.15);
    still.run(0.3);
    still.lift();
    const rested = headingAt(still.walk, still.time);
    still.run(2.5);
    assert.equal(headingAt(still.walk, still.time), rested);
  });

  it('steps no faster than the stride’s cruise, never turns, and settles the crossing’s row under the lift', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(openingWalk(camera));
      clock.walk = holdTurn(clock.walk, 1, clock.time);
      clock.run(0.4 / TURN_CRUISE);
      clock.walk = letGoTurn(clock.walk, 1);
      clock.run(1);
      const turned = headingAt(clock.walk, clock.time);
      const down = { x: camera.width / 2, y: camera.groundTop + 10 };
      clock.press(down);
      const crossing = shifted(down, 0, SLOP);
      const lift = { ...down, y: camera.height - 5 };
      let last = clock.walk.stride.at;
      const fastest = (walk: Walk) => {
        const step = apart(walk.stride.at, last);
        assert.ok(
          step <= STRIDE_CRUISE * FRAME + 1e-9,
          `${name}: ${step / FRAME}`,
        );
        last = walk.stride.at;
      };
      const under = planeUnder(
        viewAt(camera, eyeAt(clock.walk, clock.time)),
        crossing,
      );
      clock.move(shifted(crossing, 0, 1));
      assert.ok(under);
      for (let frame = 1; frame <= 6; frame++) {
        clock.run(FRAME, fastest);
        clock.move(shifted(crossing, 0, ((lift.y - crossing.y) * frame) / 6));
      }
      clock.lift();
      clock.run(12, fastest);
      assert.equal(clock.walk.stride.pace, 0, name);
      assert.equal(clock.walk.stride.chase, undefined, name);
      assert.equal(headingAt(clock.walk, clock.time), turned, name);
      const seen = viewOf(camera, eyeAt(clock.walk, clock.time), under, 0);
      assert.ok(Math.abs(seen.y - lift.y) < 0.05, `${name}: ${seen.y}`);
    }
  });

  it('counts a row above the seam as the seam’s', () => {
    assert.equal(
      distanceOfRow(TABLET, TABLET.groundTop - 100),
      distanceOfRow(TABLET, TABLET.groundTop),
    );
    const clock = new Clock(openingWalk(TABLET));
    const down = { x: TABLET.width / 2, y: TABLET.groundTop + 60 };
    clock.press(down);
    clock.move({ ...down, y: TABLET.groundTop - 400 });
    clock.lift();
    clock.run(12);
    const back =
      distanceOfRow(TABLET, TABLET.groundTop + 60 - SLOP) -
      distanceOfRow(TABLET, TABLET.groundTop);
    assert.ok(Math.abs(clock.walk.stride.at.y - back) < 1e-6);
  });

  it('a press stops a glide and a key’s walk where they stand', () => {
    const clock = new Clock(holdWalk(openingWalk(TABLET), 1));
    clock.run(1);
    clock.press(groundPress(TABLET));
    const at = clock.walk.stride.at;
    clock.run(1);
    assert.deepEqual(clock.walk.stride.at, at);
  });
});

describe('the walk across a resize', () => {
  it('keeps the heading and the eye’s place', () => {
    const clock = new Clock(holdTurn(holdWalk(openingWalk(TABLET), 1), -1, 10));
    clock.run(1.3);
    const before = eyeAt(clock.walk, clock.time);
    for (const { name, camera } of CAMERAS) {
      const after = eyeAt(refit(clock.walk, camera, clock.time), clock.time);
      assert.ok(Math.abs(after.heading - before.heading) < 1e-9, name);
      assert.deepEqual(pick(after, 'x', 'y'), pick(before, 'x', 'y'));
    }
  });
});
