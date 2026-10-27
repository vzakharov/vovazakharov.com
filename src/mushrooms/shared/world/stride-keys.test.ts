import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../lib/geometry';
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
  STRIDE_CRUISE,
  tick,
} from './stride';
import { apart, FRAME, LATE, moves, ORIGIN, walked } from './stride.test-kit';

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
      chaseFrom(standingAt(ORIGIN), heading, 'strafe', 0, 'flight'),
      -2,
      0,
    );
    const [held] = walked(pressed, heading, 4);
    const [lifted] = walked(liftChase(held, LATE), heading, 1);
    const side = forwardOf(sidewaysOf(heading));
    assert.ok(apart(lifted.at, { x: -2 * side.x, y: -2 * side.y }) < 1e-9);
    assert.equal(lifted.chase, undefined);
  });
});
