import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import { GLIDE_OVER } from '@/mushrooms/shared/lib/glide';
import {
  type Camera,
  eyeAt,
  forwardOf,
  gaitHeight,
  GAITS,
  haltAt,
  heldStill,
  holdTurn,
  holdWalk,
  lensAt,
  letGoTurn,
  OPENING_EYE,
  openingWalk,
  pinholeOf,
  viewAt,
  viewOf,
  type WalkStart,
} from '@/mushrooms/shared/space';
import {
  distanceOfRow,
  headingAt,
  planeUnder,
  SLOP,
  TURN_CRUISE,
  walking,
} from '@/mushrooms/shared/space/index.test-only';

import {
  axisOf,
  CAMERAS,
  Clock,
  flying,
  FRAME,
  shifted,
  TABLET,
  turnedBy,
} from './walk.test-kit';

/** A finger's start low on the ground, right of the middle, on `camera`. */
function groundPress(camera: Camera): Point {
  return { x: camera.width * 0.6, y: camera.height * 0.85 };
}

/** A finger's start on the sky, right of the middle, on `camera`. */
function skyPress(camera: Camera): Point {
  return { x: camera.width * 0.6, y: camera.groundTop * 0.5 };
}

describe('the walk a visit opens on', () => {
  it('opens on the opening eye, in steps, at the walking height', () => {
    const walk = openingWalk(TABLET);
    assert.equal(walk.gait, 'steps');
    for (const time of [0, 10]) {
      assert.deepEqual(eyeAt(walk, time), OPENING_EYE);
      assert.equal(lensAt(walk, time).eyeHeight, gaitHeight('steps'));
    }
  });

  for (const gait of GAITS) {
    it(`opens where it is started, ${gait}, at the gait’s height from the first frame`, () => {
      for (const { name, camera } of CAMERAS) {
        const start: WalkStart = {
          eye: { x: 3.4, y: -7.25, heading: 2.1 },
          gait,
        };
        const { eye } = start;
        const walk = openingWalk(camera, start);
        assert.equal(walk.gait, gait, name);
        for (const time of [0, FRAME, 10]) {
          const at = eyeAt(walk, time);
          assert.deepEqual(pick(at, 'x', 'y'), pick(eye, 'x', 'y'), name);
          assert.ok(Math.abs(at.heading - eye.heading) < 1e-9, name);
          assert.equal(lensAt(walk, time).eyeHeight, gaitHeight(gait), name);
        }
      }
    });
  }
});

describe('a drag on the walk', () => {
  it('moves nothing while it stays inside the radial slop, a long press while it lasts', () => {
    const clock = new Clock(openingWalk(TABLET));
    const down = groundPress(TABLET);
    clock.press(down);
    const before = eyeAt(clock.walk, clock.time);
    // 16 px on each axis is 16·√2 ≈ 22.6 from the press, inside the slop of 24.
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
      const down = skyPress(TABLET);
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
      const down = skyPress(camera);
      clock.press(down);
      clock.drag(down, shifted(down, 300, -280), 0.4);
      clock.lift();
      clock.run(2.5);
      assert.deepEqual(clock.walk.stride.at, { x: 0, y: 0 }, name);
    }
  });

  it('turns 1:1 in angle: the ground below the crossing stays below the finger', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(openingWalk(camera));
      const down = skyPress(camera);
      clock.press(down);
      const crossing = shifted(down, -SLOP, 0);
      const under = planeUnder(
        viewAt(
          camera,
          eyeAt(clock.walk, clock.time),
          lensAt(clock.walk, clock.time).eyeHeight,
        ),
        {
          ...crossing,
          y: camera.height * 0.85,
        },
      );
      clock.move(shifted(crossing, -1, 0));
      assert.ok(under, name);
      for (const x of [down.x - 100, 10, camera.width - 10, down.x + 40]) {
        clock.run(FRAME);
        clock.move({ ...down, x });
        const eye = eyeAt(clock.walk, clock.time);
        const seen = viewOf(walking(camera), eye, under, 0);
        assert.ok(Math.abs(seen.x - x) < 1e-6, `${name} at ${x}: ${seen.x}`);
        // And the angle formula itself, from the crossing.
        const want = (crossing.x - x) / pinholeOf(camera).arc;
        assert.ok(turnedBy(want, eye.heading) < 1e-9, `${name} formula`);
      }
    }
  });

  it('glides on from a quick lift and rests from a still one', () => {
    const clock = new Clock(openingWalk(TABLET));
    const down = skyPress(TABLET);
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

  it('stops dead on a halt, a turn’s glide, a step’s fling and a held key all', () => {
    const down = skyPress(TABLET);
    const turning = new Clock(openingWalk(TABLET));
    turning.press(down);
    turning.drag(down, shifted(down, -300, 0), 0.15);
    turning.lift();
    turning.run(0.1);
    turning.walk = haltAt(turning.walk, turning.time);
    const halted = headingAt(turning.walk, turning.time);
    turning.run(2.5);
    assert.equal(headingAt(turning.walk, turning.time), halted);

    const ground = groundPress(TABLET);
    const flung = new Clock(openingWalk(TABLET));
    flung.walk = holdWalk(flung.walk, 1);
    flung.walk = holdTurn(flung.walk, 1, flung.time);
    flung.run(0.3);
    flung.press(ground);
    flung.drag(ground, shifted(ground, 0, 200), 0.15);
    flung.lift();
    flung.run(0.1);
    flung.walk = haltAt(flung.walk, flung.time);
    const at = eyeAt(flung.walk, flung.time);
    flung.run(2.5);
    assert.deepEqual(eyeAt(flung.walk, flung.time), at);
  });

  it('in flight, steps with the finger, the crossing’s ground on its row frame by frame at the middle and off it, never turning, and glides on from a moving lift', () => {
    for (const [{ name, camera }, across] of CAMERAS.flatMap((seen) =>
      [0.5, 0.8].map((share) => [seen, share] as const),
    )) {
      const clock = new Clock(flying(camera));
      clock.walk = holdTurn(clock.walk, 1, clock.time);
      clock.run(0.4 / TURN_CRUISE);
      clock.walk = letGoTurn(clock.walk, 1);
      clock.run(1);
      const turned = headingAt(clock.walk, clock.time);
      const down = { x: camera.width * across, y: camera.groundTop + 10 };
      clock.press(down);
      const crossing = shifted(down, 0, SLOP);
      const lift = { ...down, y: camera.height - 5 };
      const under = planeUnder(
        viewAt(
          camera,
          eyeAt(clock.walk, clock.time),
          lensAt(clock.walk, clock.time).eyeHeight,
        ),
        crossing,
      );
      assert.ok(under);
      clock.move(shifted(crossing, 0, 1));
      for (let frame = 1; frame <= 6; frame++) {
        clock.run(FRAME);
        const finger = shifted(
          crossing,
          0,
          ((lift.y - crossing.y) * frame) / 6,
        );
        clock.move(finger);
        const seen = viewOf(
          lensAt(clock.walk, clock.time),
          eyeAt(clock.walk, clock.time),
          under,
          0,
        );
        assert.ok(
          Math.abs(seen.y - finger.y) < 0.05,
          `${name} at ${String(across)}, frame ${String(frame)}: ${seen.y} under ${finger.y}`,
        );
      }
      const lifted = clock.walk.stride.at;
      clock.lift();
      assert.ok(clock.walk.stride.glide, `${name}: a moving lift glides`);
      clock.run(GLIDE_OVER + FRAME);
      const { stride } = clock.walk;
      assert.equal(stride.glide, undefined, name);
      assert.equal(stride.pace, 0, name);
      assert.equal(headingAt(clock.walk, clock.time), turned, name);
      const way = forwardOf(turned);
      const on =
        (stride.at.x - lifted.x) * way.x + (stride.at.y - lifted.y) * way.y;
      assert.ok(on > 0.5, `${name}: glided on ${on}`);
    }
  });

  it('counts a row above the seam as the seam’s', () => {
    assert.equal(
      distanceOfRow(walking(TABLET), TABLET.groundTop - 100),
      distanceOfRow(walking(TABLET), TABLET.groundTop),
    );
    const clock = new Clock(openingWalk(TABLET));
    const down = { x: TABLET.width / 2, y: TABLET.groundTop + 60 };
    clock.press(down);
    clock.move({ ...down, y: TABLET.groundTop - 400 });
    clock.run(12);
    clock.lift();
    const back =
      distanceOfRow(walking(TABLET), TABLET.groundTop + 60 - SLOP) -
      distanceOfRow(walking(TABLET), TABLET.groundTop);
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
