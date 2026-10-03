import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from './geometry';
import { KEY_EASE } from './pan';
import {
  chaseFrom,
  chaseTo,
  forwardOf,
  holdStep,
  holdStrafe,
  letGoStep,
  letGoStrafe,
  liftChase,
  sidewaysOf,
  standingAt,
  type Stride,
  STRIDE_CRUISE,
  tick,
  yieldChase,
} from './stride';

const FRAME = 1 / 60;
const ORIGIN: Point = { x: 0, y: 0 };

function apart(one: Point, other: Point): number {
  return Math.hypot(one.x - other.x, one.y - other.y);
}

/** `stride` ticked along `heading` for `seconds`, a frame at a time, and where it stood after each. */
function walked(
  stride: Stride,
  heading: number,
  seconds: number,
): [Stride, Point[]] {
  let walking = stride;
  const seen: Point[] = [];
  for (let time = 0; time < seconds - 1e-9; time += FRAME) {
    walking = tick(walking, heading, FRAME);
    seen.push(walking.at);
  }
  return [walking, seen];
}

/** Every frame's move along `seen` from `from`. */
function moves(from: Point, seen: Point[]): number[] {
  return seen.map((at, index) => apart(at, seen[index - 1] ?? from));
}

describe('the stride on the keys', () => {
  it('eases up to its cruise over KEY_EASE and walks straight along the heading', () => {
    const heading = 0.7;
    const [eased] = walked(holdStep(standingAt(ORIGIN), 1), heading, KEY_EASE);
    assert.ok(Math.abs(eased.pace - STRIDE_CRUISE) < 1e-9);
    const [later] = walked(eased, heading, 1);
    const way = forwardOf(heading);
    const along =
      (later.at.x - eased.at.x) * way.x + (later.at.y - eased.at.y) * way.y;
    assert.ok(Math.abs(along - STRIDE_CRUISE) < 1e-9);
    assert.ok(Math.abs(apart(later.at, eased.at) - STRIDE_CRUISE) < 1e-9);
    assert.ok(
      Math.abs(later.walked - (STRIDE_CRUISE * KEY_EASE) / 2 - STRIDE_CRUISE) <
        1e-9,
    );
  });

  it('walks back on ↓', () => {
    const [back] = walked(holdStep(standingAt(ORIGIN), -1), 0, 1);
    assert.ok(back.at.y < 0 && Math.abs(back.at.x) < 1e-12);
  });

  it('stands with both keys held', () => {
    const both = holdStep(holdStep(standingAt(ORIGIN), 1), -1);
    assert.equal(tick(both, 0, FRAME), both);
  });

  it('eases to rest on letting go, and a held key repeating changes nothing', () => {
    const held = holdStep(standingAt(ORIGIN), 1);
    assert.equal(holdStep(held, 1), held);
    const [walking] = walked(held, 0, 1);
    const [rested] = walked(letGoStep(walking, 1), 0, KEY_EASE + FRAME);
    assert.equal(rested.pace, 0);
    assert.equal(tick(rested, 0, FRAME), rested);
  });

  it('never walks faster than its cruise', () => {
    for (let index = 0; index < 24; index++) {
      const start = standingAt({
        x: 9 * Math.cos(index * 2.4),
        y: 8 + 9 * Math.sin(index * 1.7),
      });
      let stride = holdStep(start, index % 3 === 0 ? -1 : 1);
      let heading = index * 0.9;
      const seen: Point[] = [];
      for (let frame = 0; frame < 900; frame++) {
        heading += index % 2 === 0 ? 0.004 : -0.006;
        if (frame === 600) stride = letGoStep(letGoStep(stride, 1), -1);
        stride = tick(stride, heading, FRAME);
        seen.push(stride.at);
      }
      const steps = moves(start.at, seen);
      assert.ok(steps.every((each) => each <= STRIDE_CRUISE * FRAME + 1e-9));
      assert.equal(stride.pace, 0, 'at rest after the keys are up');
    }
  });

  it('walks on with no end while the key is held', () => {
    const [far] = walked(holdStep(standingAt(ORIGIN), 1), 0, 40);
    assert.equal(far.pace, STRIDE_CRUISE);
    assert.ok(Math.abs(far.at.y - STRIDE_CRUISE * (40 - KEY_EASE / 2)) < 1e-6);
  });

  it('stands where it is asked to, however far out', () => {
    const far = { x: -300, y: 4000 };
    assert.deepEqual(standingAt(far).at, far);
  });
});

describe('the stride on the strafing keys', () => {
  it('eases up to its cruise over KEY_EASE and walks square to the heading, to the right on 1', () => {
    const heading = 0.7;
    const held = holdStrafe(standingAt(ORIGIN), 1);
    assert.equal(holdStrafe(held, 1), held);
    const [eased] = walked(held, heading, KEY_EASE);
    assert.ok(Math.abs(eased.sidePace - STRIDE_CRUISE) < 1e-9);
    assert.equal(eased.pace, 0);
    const [later] = walked(eased, heading, 1);
    const side = forwardOf(sidewaysOf(heading));
    const across =
      (later.at.x - eased.at.x) * side.x + (later.at.y - eased.at.y) * side.y;
    assert.ok(Math.abs(across - STRIDE_CRUISE) < 1e-9);
    assert.ok(Math.abs(apart(later.at, eased.at) - STRIDE_CRUISE) < 1e-9);
    assert.ok(
      Math.abs(later.walked - (STRIDE_CRUISE * KEY_EASE) / 2 - STRIDE_CRUISE) <
        1e-9,
      'the bob and the feet count it as a walk',
    );
    // At heading 0 the eye looks along +y, and its right is +x.
    const [right] = walked(holdStrafe(standingAt(ORIGIN), 1), 0, 1);
    assert.ok(right.at.x > 0 && Math.abs(right.at.y) < 1e-12);
  });

  it('eases to rest on letting go, and stands with both held', () => {
    const [walking] = walked(holdStrafe(standingAt(ORIGIN), -1), 0, 1);
    assert.ok(walking.at.x < 0);
    const [rested] = walked(letGoStrafe(walking, -1), 0, KEY_EASE + FRAME);
    assert.equal(rested.sidePace, 0);
    assert.equal(tick(rested, 0, FRAME), rested);
    const both = holdStrafe(holdStrafe(standingAt(ORIGIN), 1), -1);
    assert.equal(tick(both, 0, FRAME), both);
  });

  it('walks the diagonal at the cruise with a step and a strafe held', () => {
    const start = standingAt(ORIGIN);
    const [eased] = walked(holdStrafe(holdStep(start, 1), 1), 0, 1);
    const [later, seen] = walked(eased, 0, 1);
    const steps = moves(eased.at, seen);
    assert.ok(
      steps.every((each) => Math.abs(each - STRIDE_CRUISE * FRAME) < 1e-9),
    );
    assert.ok(Math.abs(later.at.x - later.at.y) < 1e-9, 'at 45°');
    assert.ok(Math.abs(later.walked - eased.walked - STRIDE_CRUISE) < 1e-9);
  });

  it('never walks past the cruise with a step and a strafe held, and rests once let go', () => {
    for (let index = 0; index < 12; index++) {
      const start = standingAt({
        x: 8 * Math.cos(index),
        y: 8 + 8 * Math.sin(index * 1.3),
      });
      let stride = holdStep(
        holdStrafe(start, index % 2 === 0 ? 1 : -1),
        index % 3 === 0 ? -1 : 1,
      );
      let heading = index * 0.7;
      const path: Point[] = [];
      for (let frame = 0; frame < 900; frame++) {
        heading += 0.005;
        if (frame === 600)
          stride = letGoStrafe(
            letGoStrafe(letGoStep(letGoStep(stride, 1), -1), 1),
            -1,
          );
        stride = tick(stride, heading, FRAME);
        path.push(stride.at);
      }
      assert.ok(
        moves(start.at, path).every(
          (each) => each <= STRIDE_CRUISE * FRAME + 1e-9,
        ),
      );
      assert.equal(stride.pace, 0);
      assert.equal(stride.sidePace, 0);
    }
  });

  it('chases a drag square to the heading as it chases one along it', () => {
    const heading = 0.3;
    const pressed = chaseTo(
      chaseFrom(standingAt(ORIGIN), heading, 'strafe'),
      -2,
    );
    const [held] = walked(pressed, heading, 4);
    const [lifted] = walked(liftChase(held), heading, 1);
    const side = forwardOf(sidewaysOf(heading));
    assert.ok(apart(lifted.at, { x: -2 * side.x, y: -2 * side.y }) < 1e-9);
    assert.equal(lifted.chase, undefined);
  });
});

describe('the stride on a drag', () => {
  it('settles on its target while held and rests after the lift, with no glide', () => {
    const heading = -0.4;
    const start = standingAt({ x: 1, y: 2 });
    const pressed = chaseTo(chaseFrom(start, heading, 'step'), 3);
    const [held] = walked(pressed, heading, 4);
    const [lifted] = walked(liftChase(held), heading, 1);
    const way = forwardOf(heading);
    const target = { x: 1 + 3 * way.x, y: 2 + 3 * way.y };
    assert.ok(apart(lifted.at, target) < 1e-9);
    assert.equal(lifted.chase, undefined);
    assert.equal(tick(lifted, heading, FRAME), lifted);
  });

  it('chases no faster than its cruise, however far the finger runs', () => {
    const start = standingAt(ORIGIN);
    const pressed = chaseTo(chaseFrom(start, 0, 'step'), -3.5);
    const [, seen] = walked(pressed, 0, 4);
    const steps = moves(start.at, seen);
    assert.ok(steps.every((each) => each <= STRIDE_CRUISE * FRAME + 1e-9));
    assert.ok(Math.abs((seen.at(-1)?.y ?? 0) + 3.5) < 1e-9);
  });

  it('follows a moving target, a key held before the press waiting for the lift', () => {
    let stride = chaseFrom(holdStep(standingAt(ORIGIN), -1), 0, 'step');
    for (let frame = 1; frame <= 60; frame++) {
      stride = tick(chaseTo(stride, frame * 0.02), 0, FRAME);
    }
    assert.ok(stride.at.y > 0.8, 'it follows the finger on, not the key back');
    const [lifted] = walked(liftChase(stride), 0, 3);
    assert.equal(lifted.chase, undefined);
    assert.ok(
      lifted.at.y < 1.2,
      'the held key walks it back once the chase is done',
    );
  });

  it('eases to rest over the cruise’s ease on a lift mid-chase, short of a far target', () => {
    for (const axis of ['step', 'strafe'] as const) {
      const heading = 0.7;
      const pressed = chaseTo(chaseFrom(standingAt(ORIGIN), heading, axis), 6);
      const [running] = walked(pressed, heading, 1);
      assert.equal(running.pace, STRIDE_CRUISE, axis);
      const [lifted, seen] = walked(liftChase(running), heading, 2);
      const steps = moves(running.at, seen);
      const still = steps.indexOf(0);
      assert.ok(
        still > 0 && still * FRAME <= KEY_EASE + FRAME,
        `${axis}: ${still}`,
      );
      // A steady ease from the cruise covers half the cruise over the ease.
      const coasted = apart(lifted.at, running.at);
      assert.ok(
        Math.abs(coasted - (STRIDE_CRUISE * KEY_EASE) / 2) < 0.01,
        `${axis}: ${coasted}`,
      );
      assert.equal(lifted.chase, undefined, axis);
      assert.equal(lifted.pace, 0, axis);
      assert.equal(tick(lifted, heading, FRAME), lifted, axis);
    }
  });

  it('brakes short of a target nearer than its ease on the lift', () => {
    const pressed = chaseTo(chaseFrom(standingAt(ORIGIN), 0, 'step'), 2);
    const [near] = walked(pressed, 0, 1.3);
    assert.ok(2 - near.at.y < (STRIDE_CRUISE * KEY_EASE) / 2, `${near.at.y}`);
    const [lifted] = walked(liftChase(near), 0, 1);
    assert.ok(lifted.at.y <= 2 + 1e-9, `${lifted.at.y}`);
    assert.equal(lifted.chase, undefined);
  });

  it('ends a chase at once on a walking or strafing key going down, lifted or not, and hands the keys its pace', () => {
    for (const lifted of [false, true]) {
      for (const [axis, hold, other] of [
        ['step', holdStep, 'sidePace'],
        ['strafe', holdStrafe, 'pace'],
      ] as const) {
        const pressed = chaseTo(chaseFrom(standingAt(ORIGIN), 0, axis), 8);
        const [running] = walked(pressed, 0, 1);
        const pace = axis === 'step' ? 'pace' : 'sidePace';
        // The other way, so the key turns it back: shift+← against a rightward strafe.
        const taken = hold(lifted ? liftChase(running) : running, -1);
        const name = `${axis}${lifted ? ' lifted' : ''}`;
        assert.equal(taken.chase, undefined, name);
        assert.equal(taken[pace], STRIDE_CRUISE, name);
        assert.equal(taken[other], 0, name);
        const [back] = walked(taken, 0, 1);
        assert.ok(
          Math.abs(back[pace] + STRIDE_CRUISE) < 1e-9,
          `${name}: walks back`,
        );
      }
    }
  });

  it('ends a chase where it stands on yielding to a turn, easing its pace to rest', () => {
    const pressed = chaseTo(chaseFrom(standingAt(ORIGIN), 0, 'strafe'), 8);
    const [running] = walked(pressed, 0, 1);
    const taken = yieldChase(running);
    assert.equal(taken.chase, undefined);
    assert.equal(taken.sidePace, STRIDE_CRUISE);
    const [rested] = walked(taken, 0, 1);
    assert.equal(rested.sidePace, 0);
    assert.ok(
      rested.at.x < running.at.x + STRIDE_CRUISE * KEY_EASE,
      `${rested.at.x}`,
    );
    assert.equal(yieldChase(rested), rested);
  });
});
