import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { meadowCamera } from '../ui/scene/meadow-camera';
import { viewAt } from '../ui/scene/view';
import { planeUnder } from '../ui/scene/view-inverse';
import { VIEWPORTS } from '../ui/scene/viewports';
import type { Point } from './geometry';
import { GLIDE_OVER } from './glide';
import type { Camera } from './ground';
import { KEY_EASE, SLOP, TURN_CRUISE } from './pan';
import { pinholeOf, viewOf } from './pinhole';
import { forwardOf, sidewaysOf, STRIDE_CRUISE } from './stride';
import {
  distanceOfRow,
  eyeAt,
  haltAt,
  headingAt,
  heldStill,
  holdStrafe,
  holdTurn,
  holdWalk,
  letGoStrafe,
  letGoTurn,
  liftAt,
  lockOf,
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

/** A finger's start on the sky, right of the middle, on `camera`. */
function skyPress(camera: Camera): Point {
  return { x: camera.width * 0.6, y: camera.groundTop * 0.5 };
}

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
      const under = planeUnder(viewAt(camera, eyeAt(clock.walk, clock.time)), {
        ...crossing,
        y: camera.height * 0.85,
      });
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

  it('steps with the finger, the crossing’s ground on its row frame by frame at the middle and off it, never turning, and glides on from a moving lift', () => {
    for (const [{ name, camera }, across] of CAMERAS.flatMap((seen) =>
      [0.5, 0.8].map((share) => [seen, share] as const),
    )) {
      const clock = new Clock(openingWalk(camera));
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
        viewAt(camera, eyeAt(clock.walk, clock.time)),
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
        const seen = viewOf(camera, eyeAt(clock.walk, clock.time), under, 0);
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
      distanceOfRow(TABLET, TABLET.groundTop - 100),
      distanceOfRow(TABLET, TABLET.groundTop),
    );
    const clock = new Clock(openingWalk(TABLET));
    const down = { x: TABLET.width / 2, y: TABLET.groundTop + 60 };
    clock.press(down);
    clock.move({ ...down, y: TABLET.groundTop - 400 });
    clock.run(12);
    clock.lift();
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

describe('a strafe on the walk', () => {
  it('locks a horizontal drag that went down on the ground to the strafe, above it to the turn, a vertical one to the step', () => {
    const sky = { x: TABLET.width * 0.4, y: TABLET.groundTop - 40 };
    const ground = { x: TABLET.width * 0.4, y: TABLET.groundTop + 40 };
    for (const [down, dx, dy, axis] of [
      [ground, 30, 0, 'strafe'],
      [ground, -25, 25, 'strafe'],
      [ground, 10, -30, 'step'],
      [sky, 30, 0, 'turn'],
      [sky, 10, 30, 'step'],
    ] as const) {
      assert.equal(lockOf(TABLET, down, shifted(down, dx, dy)), axis);
      const clock = new Clock(openingWalk(TABLET));
      clock.press(down);
      clock.move(shifted(down, dx, dy));
      assert.equal(axisOf(clock.walk), axis, `${dx}, ${dy}`);
    }
  });

  it('slides the ground under the finger with it frame by frame, square to the heading and never turning, and glides on from a moving lift', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(openingWalk(camera));
      clock.walk = holdTurn(clock.walk, 1, clock.time);
      clock.run(0.3 / TURN_CRUISE);
      clock.walk = letGoTurn(clock.walk, 1);
      clock.run(1);
      const heading = headingAt(clock.walk, clock.time);
      const start = clock.walk.stride.at;
      const down = { x: camera.width * 0.4, y: camera.height * 0.8 };
      const { arc, x: middle } = pinholeOf(camera);
      const crossing = shifted(down, SLOP, 0);
      const lift = shifted(crossing, 150, 0);
      const ahead = forwardOf(heading);
      const side = forwardOf(sidewaysOf(heading));
      // The ground under the crossing: `reference` straight ahead, at its azimuth.
      const under = planeUnder(viewAt(camera, { ...start, heading }), crossing);
      assert.ok(under, name);
      const reference =
        (under.x - start.x) * ahead.x + (under.y - start.y) * ahead.y;
      const offset = reference * Math.tan((crossing.x - middle) / arc);
      const far = {
        x: start.x + ahead.x * reference + side.x * offset,
        y: start.y + ahead.y * reference + side.y * offset,
      };
      assert.ok(apart(far, under) < 1e-6, `${name}: under the crossing`);
      const before = viewOf(camera, { ...start, heading }, far, 0).x;
      assert.ok(Math.abs(before - crossing.x) < 1e-6, `${name}: ${before}`);
      clock.press(down);
      clock.move(shifted(crossing, 1, 0));
      for (let frame = 1; frame <= 12; frame++) {
        clock.run(FRAME);
        const finger = shifted(
          crossing,
          ((lift.x - crossing.x) * frame) / 12,
          0,
        );
        clock.move(finger);
        const seen = viewOf(camera, eyeAt(clock.walk, clock.time), far, 0).x;
        assert.ok(
          Math.abs(seen - finger.x) < 1e-6,
          `${name}, frame ${String(frame)}: ${seen} under ${finger.x}`,
        );
      }
      const lifted = clock.walk.stride.at;
      clock.lift();
      assert.ok(clock.walk.stride.glide, `${name}: a moving lift glides`);
      clock.run(GLIDE_OVER + FRAME);
      assert.equal(clock.walk.stride.glide, undefined, name);
      assert.equal(headingAt(clock.walk, clock.time), heading, name);
      const moved = {
        x: clock.walk.stride.at.x - start.x,
        y: clock.walk.stride.at.y - start.y,
      };
      assert.ok(
        moved.x * side.x + moved.y * side.y <
          (lifted.x - start.x) * side.x + (lifted.y - start.y) * side.y - 0.5,
        `${name}: the eye glided on left as the finger went right`,
      );
      assert.ok(
        Math.abs(moved.x * ahead.x + moved.y * ahead.y) < 1e-9,
        `${name}: square to the heading`,
      );
    }
  });

  it('strafes and turns at once on a strafe key and a turning arrow held together, frame by frame square to the turning heading', () => {
    const clock = new Clock(holdStrafe(openingWalk(TABLET), -1));
    const heading = headingAt(clock.walk, clock.time);
    clock.walk = holdTurn(clock.walk, 1, clock.time);
    const from = clock.walk.stride.at;
    let at = from;
    clock.run(2, (walk) => {
      const now = headingAt(walk, clock.time);
      const step = { x: walk.stride.at.x - at.x, y: walk.stride.at.y - at.y };
      const on = forwardOf(now);
      const side = forwardOf(sidewaysOf(now));
      assert.ok(Math.abs(step.x * on.x + step.y * on.y) < 1e-9, 'never on');
      assert.ok(step.x * side.x + step.y * side.y <= 0, 'leftward');
      at = walk.stride.at;
    });
    assert.ok(turnedBy(heading, headingAt(clock.walk, clock.time)) > 0.1);
    assert.ok(apart(from, at) > 2, `${at.x}, ${at.y}`);
    assert.ok(Math.abs(clock.walk.stride.sidePace + STRIDE_CRUISE) < 1e-9);
  });

  it('strafes on a held strafe key square to the heading at the walk’s pace, and eases to rest', () => {
    const clock = new Clock(holdStrafe(openingWalk(TABLET), -1));
    clock.run(2);
    const { at, sidePace, walked } = clock.walk.stride;
    assert.ok(Math.abs(sidePace + STRIDE_CRUISE) < 1e-9, 'leftward');
    assert.ok(at.x < -2 && Math.abs(at.y) < 1e-9, `${at.x}, ${at.y}`);
    assert.ok(walked > 2, 'the footsteps count it');
    clock.walk = letGoStrafe(clock.walk, -1);
    clock.run(1);
    const { sidePace: rested } = clock.walk.stride;
    assert.equal(rested, 0);
  });

  it('bobs the meadow on a steady drag as a held key does, stepping every frame and never faster, though the finger’s samples straddle the frames', () => {
    const clock = new Clock(openingWalk(TABLET));
    const down = { x: TABLET.width * 0.4, y: TABLET.height * 0.8 };
    const pressed = clock.time;
    clock.press(down);
    // 300 px a second, sampled 60 times a second 2 ms to either side of the
    // frames by turns, so one frame gets two samples and the next none.
    const sampledAt = (sample: number) =>
      pressed + sample * FRAME + (sample % 2 === 0 ? 0.002 : -0.002);
    let sample = 1;
    const steps: number[] = [];
    for (let frame = 1; frame <= 60; frame++) {
      for (; sampledAt(sample) <= pressed + frame * FRAME; sample++) {
        const time = sampledAt(sample);
        const finger = shifted(down, 300 * (time - pressed), 0);
        clock.walk = moveTo(clock.walk, finger, time);
      }
      const before = clock.walk.stride.walked;
      clock.run(FRAME);
      // The first frames cross the slop and set the finger's pace.
      if (frame > 10) steps.push(clock.walk.stride.walked - before);
    }
    assert.equal(axisOf(clock.walk), 'strafe');
    assert.ok(
      steps.every((step) => step > 0),
      `the bob snaps to rest on a frame with no sample: ${steps.join(', ')}`,
    );
    assert.ok(
      steps.every((step) => step <= STRIDE_CRUISE * FRAME + 1e-12),
      `the feet step past a held key's pace: ${Math.max(...steps) / FRAME} units/s`,
    );
  });
});

/** A long strafe drag across `camera`'s ground, the finger then held still. */
function strafing(camera: Camera): Clock {
  const clock = new Clock(openingWalk(camera));
  const down = { x: camera.width * 0.15, y: camera.height * 0.8 };
  clock.press(down);
  clock.drag(down, { ...down, x: camera.width * 0.9 }, 0.2);
  clock.run(0.5);
  return clock;
}

describe('a chase’s end', () => {
  it('leaves a strafe or a step standing where a finger at rest lifts', () => {
    const stepping = new Clock(openingWalk(TABLET));
    const down = { x: TABLET.width / 2, y: TABLET.groundTop + 10 };
    stepping.press(down);
    stepping.drag(down, { ...down, y: TABLET.height - 5 }, 0.1);
    stepping.run(0.5);
    for (const [name, clock] of [
      ...CAMERAS.map((each) => [each.name, strafing(each.camera)] as const),
      ['a step', stepping] as const,
    ]) {
      const lifted = clock.walk.stride.at;
      clock.lift();
      const { stride } = clock.walk;
      assert.equal(stride.chase, undefined, name);
      assert.equal(stride.glide, undefined, name);
      assert.equal(stride.pace, 0, name);
      assert.deepEqual(stride.at, lifted, name);
      clock.run(2);
      const { stride: after } = clock.walk;
      assert.equal(after, stride, `${name}: and stays`);
    }
  });

  it('ends a strafe’s chase at once on a walk, strafe or turn key going down, lifted or not, the key taking over', () => {
    const keys = [
      ['walk', (walk: Walk) => holdWalk(walk, 1)],
      ['strafe back', (walk: Walk) => holdStrafe(walk, 1)],
      ['turn', (walk: Walk, time: number) => holdTurn(walk, 1, time)],
    ] as const;
    for (const lifting of [false, true]) {
      for (const [key, hold] of keys) {
        const name = `${key}${lifting ? ' after the lift' : ' under the finger'}`;
        const clock = strafing(TABLET);
        if (lifting) clock.lift();
        const heading = headingAt(clock.walk, clock.time);
        clock.walk = hold(clock.walk, clock.time);
        assert.equal(clock.walk.stride.chase, undefined, name);
        const at = clock.walk.stride.at;
        clock.run(2);
        const { stride } = clock.walk;
        const side = forwardOf(sidewaysOf(heading));
        const across =
          (stride.at.x - at.x) * side.x + (stride.at.y - at.y) * side.y;
        if (key === 'strafe back') {
          assert.ok(Math.abs(stride.sidePace - STRIDE_CRUISE) < 1e-9, name);
          assert.ok(across > 2, `${name}: ${across}`);
        } else {
          assert.equal(stride.sidePace, 0, name);
          assert.ok(
            Math.abs(across) < STRIDE_CRUISE * KEY_EASE,
            `${name}: ${across}`,
          );
        }
        if (key === 'walk') assert.equal(stride.pace, STRIDE_CRUISE, name);
        // The pan takes a turn key over once the finger is up.
        if (key === 'turn' && lifting) {
          assert.ok(
            turnedBy(heading, headingAt(clock.walk, clock.time)) > 0.5,
            name,
          );
        }
      }
    }
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
