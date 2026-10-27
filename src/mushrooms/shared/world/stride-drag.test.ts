import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GLIDE_OVER, GLIDE_TAU } from '../lib/glide';
import { KEY_EASE } from './pan';
import {
  chaseFrom,
  chaseTo,
  forwardOf,
  type Gait,
  holdStep,
  holdStrafe,
  liftChase,
  standingAt,
  STEP_LENGTH,
  type Stride,
  STRIDE_CRUISE,
  STRIDE_FLING_FASTEST,
  tick,
  yieldChase,
} from './stride';
import { apart, FRAME, LATE, moves, ORIGIN, walked } from './stride.test-kit';

/**
 * A finger that takes the walk along `axis` at heading 0 and moves the eye on
 * at `speed` units a second for `seconds`, the stride ticked a frame at a
 * time: the stride with the finger still down, and the time it last moved.
 */
function dragged(
  axis: 'step' | 'strafe',
  speed: number,
  seconds: number,
  stride = standingAt(ORIGIN),
  gait: Gait = 'flight',
): [Stride, number] {
  let dragging = chaseFrom(stride, 0, axis, 0, gait);
  let time = 0;
  for (; time < seconds - 1e-9; ) {
    time += FRAME;
    dragging = tick(chaseTo(dragging, speed * time, time), 0, FRAME);
  }
  return [dragging, time];
}

/** `dragged`, then, `rest` seconds still, lifted: the stride as it lifts. */
function swiped(
  axis: 'step' | 'strafe',
  speed: number,
  seconds: number,
  rest = 0,
  gait: Gait = 'flight',
): Stride {
  const [stride, time] = dragged(axis, speed, seconds, undefined, gait);
  const [still] = walked(stride, 0, rest);
  return liftChase(still, time + rest);
}

describe('the stride on a drag', () => {
  it('stands where the finger sets it while held and rests after the lift, with no glide', () => {
    const heading = -0.4;
    const start = standingAt({ x: 1, y: 2 });
    const pressed = chaseTo(
      chaseFrom(start, heading, 'step', 0, 'flight'),
      3,
      0,
    );
    const way = forwardOf(heading);
    const target = { x: 1 + 3 * way.x, y: 2 + 3 * way.y };
    assert.ok(apart(pressed.at, target) < 1e-9);
    const [held] = walked(pressed, heading, 4);
    assert.equal(held, pressed, 'the ticks move nothing while it is held');
    const [lifted] = walked(liftChase(held, LATE), heading, 1);
    assert.ok(apart(lifted.at, target) < 1e-9);
    assert.equal(lifted.chase, undefined);
    assert.equal(lifted.pace, 0);
    assert.equal(tick(lifted, heading, FRAME), lifted);
  });

  it('keeps up with the finger however fast it moves, its feet stepping after it at the cruise', () => {
    for (const axis of ['step', 'strafe'] as const) {
      // 30 units a second, many times the cruise and the fling's most.
      const [stride] = dragged(axis, 30, 0.2);
      const way = axis === 'step' ? stride.at.y : stride.at.x;
      assert.ok(Math.abs(way - 6) < 1e-9, `${axis}: ${way}`);
      assert.ok(
        Math.abs(stride.walked - STRIDE_CRUISE * 0.2) < 1e-9,
        `${axis}: walked ${stride.walked}`,
      );
      assert.ok(Math.abs(stride.pace - 30) < 1e-6, `${axis}: ${stride.pace}`);
    }
  });

  it('follows a moving finger, a key held before the press waiting for the lift and taking over from its pace', () => {
    const [stride, time] = dragged(
      'step',
      1.2,
      1,
      holdStep(standingAt(ORIGIN), -1),
    );
    assert.ok(Math.abs(stride.at.y - 1.2) < 1e-9, 'it follows the finger on');
    const lifted = liftChase(stride, time);
    assert.equal(lifted.chase, undefined);
    assert.equal(lifted.glide, undefined, 'a held key flings nothing');
    assert.ok(Math.abs(lifted.pace - 1.2) < 1e-6, `${lifted.pace}`);
    const [later] = walked(lifted, 0, 3);
    assert.ok(later.at.y < 1.2, 'the held key walks it back');
  });

  it('ends a chase at once on a walking or strafing key going down, and hands the keys its pace held to the cruise', () => {
    for (const [axis, hold, other] of [
      ['step', holdStep, 'sidePace'],
      ['strafe', holdStrafe, 'pace'],
    ] as const) {
      const [running] = dragged(axis, 8, 0.5);
      const pace = axis === 'step' ? 'pace' : 'sidePace';
      // The other way, so the key turns it back: shift+← against a rightward strafe.
      const taken = hold(running, -1);
      assert.equal(taken.chase, undefined, axis);
      assert.equal(taken[pace], STRIDE_CRUISE, axis);
      assert.equal(taken[other], 0, axis);
      assert.equal(chaseTo(taken, 9, 1), taken, `${axis}: moved no more`);
      const [back] = walked(taken, 0, 1);
      assert.ok(
        Math.abs(back[pace] + STRIDE_CRUISE) < 1e-9,
        `${axis}: walks back`,
      );
    }
  });

  it('ends a chase where it stands on yielding to a turn, easing its pace to rest', () => {
    const [running] = dragged('strafe', 8, 0.5);
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

describe('the stride on a fling', () => {
  it('glides on from a quick swipe some two to three units, nearly all within a second, then rests', () => {
    for (const axis of ['step', 'strafe'] as const) {
      // A swipe laying 2.7 units of ground across 0.2 s, as a third of a tablet's width does.
      const flung = swiped(axis, 13.5, 0.2);
      assert.ok(flung.glide !== undefined && flung.chase === undefined, axis);
      const [first] = walked(flung, 0, FRAME);
      assert.ok(
        first.walked - flung.walked <= STRIDE_CRUISE * FRAME + 1e-12,
        `${axis}: its feet no faster than a held key's`,
      );
      const [second] = walked(flung, 0, 1);
      const [rested] = walked(second, 0, GLIDE_OVER);
      const glided = apart(rested.at, flung.at);
      assert.ok(glided > 2 && glided < 3, `${axis}: glided ${glided}`);
      assert.ok(
        apart(second.at, flung.at) > 0.95 * glided,
        `${axis}: ${apart(second.at, flung.at)} of ${glided} within a second`,
      );
      assert.equal(rested.glide, undefined, axis);
      assert.equal(rested.pace, 0, axis);
      assert.equal(tick(rested, 0, FRAME), rested, axis);
      const way = axis === 'step' ? rested.at.y : rested.at.x;
      assert.ok(
        Math.abs(way - apart(rested.at, ORIGIN)) < 1e-9,
        `${axis}: on its line`,
      );
    }
  });

  it('flings back on a swipe the other way, and at the finger’s own speed below the most', () => {
    const flung = swiped('strafe', -3, 0.3);
    const [rested] = walked(flung, 0, GLIDE_OVER + FRAME);
    // 3 units a second, under the fling's most, carries it on by 3 · GLIDE_TAU.
    assert.ok(
      Math.abs(rested.at.x - flung.at.x + 3 * 0.325) < 1e-6,
      `${rested.at.x - flung.at.x}`,
    );
  });

  it('flings nothing from a slow drag released at rest', () => {
    const lifted = swiped('strafe', 0.5, 1, 0.2);
    assert.equal(lifted.glide, undefined);
    const [rested] = walked(lifted, 0, 2);
    assert.ok(
      apart(rested.at, lifted.at) < 0.01,
      `${apart(rested.at, lifted.at)}`,
    );
    assert.equal(rested.chase, undefined);
  });

  it('ends at once on a walking, strafing or turning key going down, the keys easing from its pace held to the cruise', () => {
    for (const [axis, hold, pace] of [
      ['step', (stride: Stride) => holdStep(stride, -1), 'pace'],
      ['strafe', (stride: Stride) => holdStrafe(stride, -1), 'sidePace'],
      ['strafe', yieldChase, 'sidePace'],
    ] as const) {
      const [gliding] = walked(swiped(axis, 13.5, 0.2), 0, 0.1);
      const taken = hold(gliding);
      assert.equal(taken.glide, undefined, axis);
      assert.equal(taken[pace], STRIDE_CRUISE, axis);
      const [, seen] = walked(taken, 0, 1);
      // On along the fling's line, at heading 0 +y for a step and +x for a strafe.
      const on = Math.max(
        ...seen.map((at) =>
          axis === 'step' ? at.y - gliding.at.y : at.x - gliding.at.x,
        ),
      );
      // Eased from the cruise to rest over KEY_EASE, it comes on half that far.
      assert.ok(
        on <= (STRIDE_CRUISE * KEY_EASE) / 2 + 1e-9,
        `${axis}: ${on} on after the key`,
      );
    }
  });

  it('ends at once on a new press, the eye standing where it stood', () => {
    const [gliding] = walked(swiped('strafe', 13.5, 0.2), 0, 0.1);
    const pressed = chaseFrom(gliding, 0, 'step', 1, 'flight');
    assert.equal(pressed.glide, undefined);
    assert.equal(pressed.pace, 0);
    assert.equal(tick(pressed, 0, FRAME).at, gliding.at);
  });
});

describe('the stride on a drag in steps', () => {
  it('walks to the finger’s point at the cruise, its feet stepping every unit, and rests there', () => {
    const pressed = chaseTo(
      chaseFrom(standingAt(ORIGIN), 0, 'step', 0, 'steps'),
      3,
      0,
    );
    assert.deepEqual(pressed.at, ORIGIN, 'the finger moves no eye at once');
    const [held, seen] = walked(pressed, 0, 4);
    for (const move of moves(ORIGIN, seen)) {
      assert.ok(move <= STRIDE_CRUISE * FRAME + 1e-12, `${move}`);
    }
    assert.ok(Math.abs(held.at.y - 3) < 1e-6, `${held.at.y}`);
    assert.ok(Math.abs(held.walked - 3) < 1e-6, `walked ${held.walked}`);
    assert.equal(held.pace, 0);
  });

  it('carries a long quick swipe a bounded number of steps, where a flight goes the whole way', () => {
    for (const axis of ['step', 'strafe'] as const) {
      // 15 units of ground laid across 0.3 s: a swipe from near the horizon.
      const flown = swiped(axis, 50, 0.3);
      assert.ok(
        apart(flown.at, ORIGIN) > 14,
        `${axis}: flew ${apart(flown.at, ORIGIN)}`,
      );
      const lifted = swiped(axis, 50, 0.3, 0, 'steps');
      assert.ok(
        apart(lifted.at, ORIGIN) <= STRIDE_CRUISE * 0.3 + 1e-9,
        `${axis}: walked ${apart(lifted.at, ORIGIN)} under the finger`,
      );
      const [rested] = walked(lifted, 0, GLIDE_OVER + FRAME);
      const most = STRIDE_CRUISE * 0.3 + STRIDE_FLING_FASTEST * GLIDE_TAU;
      const went = apart(rested.at, ORIGIN);
      assert.ok(went <= most + 1e-9, `${axis}: ${went} of at most ${most}`);
      assert.ok(went / STEP_LENGTH < 4, `${axis}: ${went / STEP_LENGTH} steps`);
    }
  });

  it('eases to rest from a finger lifted at rest, as a let-go key does', () => {
    // The finger set the point 3 units off, then rested while the eye walked on.
    const lifted = swiped('strafe', 10, 0.3, 0.5, 'steps');
    assert.equal(lifted.chase, undefined);
    assert.equal(lifted.glide, undefined);
    assert.ok(
      Math.abs(lifted.sidePace - STRIDE_CRUISE) < 1e-6,
      `${lifted.sidePace}`,
    );
    const [rested] = walked(lifted, 0, 1);
    assert.equal(rested.sidePace, 0);
    assert.ok(
      rested.at.x - lifted.at.x <= (STRIDE_CRUISE * KEY_EASE) / 2 + 1e-9,
      `${rested.at.x - lifted.at.x}`,
    );
  });
});
