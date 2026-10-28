import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GLIDE_OVER } from '@/mushrooms/shared/lib/glide';
import {
  type Camera,
  eyeAt,
  forwardOf,
  gaitHeight,
  holdStrafe,
  holdTurn,
  holdWalk,
  lensAt,
  letGoStrafe,
  letGoTurn,
  moveTo,
  openingWalk,
  pinholeOf,
  viewAt,
  viewOf,
  type Walk,
} from '@/mushrooms/shared/space';
import {
  headingAt,
  KEY_EASE,
  lockOf,
  planeUnder,
  sidewaysOf,
  SLOP,
  STRIDE_CRUISE,
  TURN_CRUISE,
} from '@/mushrooms/shared/space/index.test-only';

import {
  apart,
  axisOf,
  CAMERAS,
  Clock,
  flying,
  FRAME,
  shifted,
  TABLET,
  turnedBy,
} from './walk.test-kit';

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

  it('in flight, slides the ground under the finger with it frame by frame, square to the heading and never turning, and glides on from a moving lift', () => {
    for (const { name, camera } of CAMERAS) {
      const clock = new Clock(flying(camera));
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
      const under = planeUnder(
        viewAt(camera, { ...start, heading }, gaitHeight('flight')),
        crossing,
      );
      assert.ok(under, name);
      const reference =
        (under.x - start.x) * ahead.x + (under.y - start.y) * ahead.y;
      const offset = reference * Math.tan((crossing.x - middle) / arc);
      const far = {
        x: start.x + ahead.x * reference + side.x * offset,
        y: start.y + ahead.y * reference + side.y * offset,
      };
      assert.ok(apart(far, under) < 1e-6, `${name}: under the crossing`);
      const before = viewOf(
        lensAt(clock.walk, clock.time),
        { ...start, heading },
        far,
        0,
      ).x;
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
        const seen = viewOf(
          lensAt(clock.walk, clock.time),
          eyeAt(clock.walk, clock.time),
          far,
          0,
        ).x;
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
function strafing(camera: Camera, walk = openingWalk(camera)): Clock {
  const clock = new Clock(walk);
  const down = { x: camera.width * 0.15, y: camera.height * 0.8 };
  clock.press(down);
  clock.drag(down, { ...down, x: camera.width * 0.9 }, 0.2);
  clock.run(0.5);
  return clock;
}

describe('a chase’s end', () => {
  it('in flight, leaves a strafe or a step standing where a finger at rest lifts', () => {
    const stepping = new Clock(flying(TABLET));
    const down = { x: TABLET.width / 2, y: TABLET.groundTop + 10 };
    stepping.press(down);
    stepping.drag(down, { ...down, y: TABLET.height - 5 }, 0.1);
    stepping.run(0.5);
    for (const [name, clock] of [
      ...CAMERAS.map(
        (each) =>
          [each.name, strafing(each.camera, flying(each.camera))] as const,
      ),
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
