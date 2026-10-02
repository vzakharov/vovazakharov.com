import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from './geometry';
import { KEY_EASE } from './pan';
import {
  chaseFrom,
  chaseTo,
  forwardOf,
  GLADE,
  holdStep,
  holdStrafe,
  letGoStep,
  letGoStrafe,
  liftChase,
  RIM_KEEP,
  roomAhead,
  sidewaysOf,
  standingAt,
  type Stride,
  STRIDE_CRUISE,
  tick,
} from './stride';

const FRAME = 1 / 60;
const REACH = GLADE.r - RIM_KEEP;
const ORIGIN: Point = { x: 0, y: 0 };

/** How far `one` is from `other`. */
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

/** The eye's own rim point straight along `heading` from the glade's centre. */
function rimAlong(heading: number): Point {
  const way = forwardOf(heading);
  return { x: GLADE.x + way.x * REACH, y: GLADE.y + way.y * REACH };
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

  it('brakes head-on to rest exactly on its rim', () => {
    const [rested] = walked(holdStep(standingAt(ORIGIN), 1), 0, 20);
    assert.equal(rested.pace, 0);
    assert.ok(apart(rested.at, rimAlong(0)) < 1e-9);
  });

  it('slides along the rim when it meets it slanting, to where the rim turns square to it', () => {
    const heading = 1.1;
    const start = standingAt({ x: 0, y: 4 });
    const [, seen] = walked(holdStep(start, 1), heading, 30);
    const contact = seen.findIndex((at) => apart(at, GLADE) > REACH - 1e-9);
    assert.ok(contact > 0, 'it reaches the rim');
    const after = moves(start.at, seen).slice(contact, contact + 30);
    assert.ok(
      after.every((each) => each > 1e-4),
      'it never stops dead',
    );
    assert.ok(apart(seen.at(-1) ?? ORIGIN, rimAlong(heading)) < 1e-6);
  });

  it('never walks faster than its cruise, nor out of the glade', () => {
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
      assert.ok(seen.every((at) => apart(at, GLADE) <= REACH + 1e-9));
      assert.equal(stride.pace, 0, 'at rest after the keys are up');
    }
  });

  it('keeps a stand put inside the glade', () => {
    const outside = standingAt({ x: 0, y: 30 });
    assert.ok(apart(outside.at, rimAlong(0)) < 1e-9);
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

  it('brakes to rest on the rim and slides along it, never out of the glade nor past the cruise', () => {
    const start = standingAt({ x: 3, y: 5 });
    const [rested, seen] = walked(holdStrafe(start, 1), 0, 20);
    assert.equal(rested.sidePace, 0);
    assert.ok(apart(rested.at, rimAlong(sidewaysOf(0))) < 1e-6);
    assert.ok(seen.every((at) => apart(at, GLADE) <= REACH + 1e-9));
    assert.ok(
      moves(start.at, seen).every(
        (each) => each <= STRIDE_CRUISE * FRAME + 1e-9,
      ),
    );
    for (let index = 0; index < 12; index++) {
      let stride = holdStep(
        holdStrafe(
          standingAt({
            x: 8 * Math.cos(index),
            y: 8 + 8 * Math.sin(index * 1.3),
          }),
          index % 2 === 0 ? 1 : -1,
        ),
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
      assert.ok(path.every((at) => apart(at, GLADE) <= REACH + 1e-9));
      assert.equal(stride.pace, 0);
      assert.equal(stride.sidePace, 0);
    }
  });

  it('chases a drag square to the heading as it chases one along it', () => {
    const heading = 0.3;
    const sideways = sidewaysOf(heading);
    const pressed = chaseTo(chaseFrom(standingAt(ORIGIN), sideways), -2);
    const [lifted] = walked(liftChase(pressed), heading, 4);
    const side = forwardOf(sideways);
    assert.ok(apart(lifted.at, { x: -2 * side.x, y: -2 * side.y }) < 1e-9);
    assert.equal(lifted.chase, undefined);
  });
});

describe('the stride on a drag', () => {
  it('settles on its target and rests after the lift, with no glide', () => {
    const heading = -0.4;
    const pressed = chaseTo(chaseFrom(standingAt({ x: 1, y: 2 }), heading), 3);
    const [lifted] = walked(liftChase(pressed), heading, 4);
    const way = forwardOf(heading);
    const target = { x: 1 + 3 * way.x, y: 2 + 3 * way.y };
    assert.ok(apart(lifted.at, target) < 1e-9);
    assert.equal(lifted.chase, undefined);
    assert.equal(tick(lifted, heading, FRAME), lifted);
  });

  it('chases no faster than its cruise, however far the finger runs', () => {
    const start = standingAt(ORIGIN);
    const pressed = chaseTo(chaseFrom(start, 0), -3.5);
    const [, seen] = walked(pressed, 0, 4);
    const steps = moves(start.at, seen);
    assert.ok(steps.every((each) => each <= STRIDE_CRUISE * FRAME + 1e-9));
    assert.ok(Math.abs((seen.at(-1)?.y ?? 0) + 3.5) < 1e-9);
  });

  it('follows a moving target, the keys waiting for the lift', () => {
    let stride = holdStep(chaseFrom(standingAt(ORIGIN), 0), -1);
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

  it('stops on the rim when the target lies past it', () => {
    const pressed = chaseTo(chaseFrom(standingAt({ x: 0, y: 15 }), 0), 10);
    const [lifted] = walked(liftChase(pressed), 0, 6);
    assert.ok(apart(lifted.at, rimAlong(0)) < 1e-9);
    assert.equal(lifted.chase, undefined);
  });

  it('slides to its target when the rim stands between, if the target is on the slide', () => {
    const heading = 1.2;
    const from = standingAt({ x: 9, y: 8 });
    const pressed = chaseTo(chaseFrom(from, heading), 2.9);
    const [lifted] = walked(liftChase(pressed), heading, 6);
    const way = forwardOf(heading);
    const gained = (lifted.at.x - 9) * way.x + (lifted.at.y - 8) * way.y;
    assert.ok(Math.abs(apart(lifted.at, GLADE) - REACH) < 1e-9, 'on the rim');
    assert.ok(Math.abs(gained - 2.9) < 1e-6, 'as far on as the target');
  });
});

describe('the room ahead', () => {
  it('runs from the centre to the rim, square to it', () => {
    for (const heading of [0, 1, 2.5, -2]) {
      assert.ok(Math.abs(roomAhead(GLADE, forwardOf(heading)) - REACH) < 1e-9);
    }
  });

  it('adds the slide along the rim to the ray', () => {
    const at = { x: 6, y: 8 };
    const ray = Math.sqrt(REACH ** 2 - 36);
    const slide = REACH * Math.acos(ray / REACH);
    assert.ok(Math.abs(roomAhead(at, forwardOf(0)) - ray - slide) < 1e-9);
  });
});
