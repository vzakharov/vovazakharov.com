import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CRUISE_ACROSS,
  type Direction,
  holdKey,
  KEY_EASE,
  leftAt,
  letGoKey,
  move,
  openingPan,
  type Pan,
  press,
  recrop,
  release,
  tick,
  type View,
} from './pan';
import { dragged, FRAME, TABLET } from './pan.test-kit';

/** Every left edge `pan` passes through over `seconds` of frames `frame` seconds long, the first before any tick. */
function ticked(pan: Pan, seconds: number, frame: number): [Pan, number[]] {
  const lefts = [leftAt(pan, 0)];
  let now = pan;
  for (let index = 0; index < Math.round(seconds / frame); index++) {
    now = tick(now, frame);
    lefts.push(leftAt(now, 0));
  }
  return [now, lefts];
}

/** A key for `direction` held `seconds` from the opening crop over `view`, then let go and left to rest, at frames `frame` seconds long. */
function heldFor(
  view: View,
  direction: Direction,
  seconds: number,
  frame: number,
): { held: number[]; after: number[]; rest: Pan } {
  const [holding, held] = ticked(
    holdKey(openingPan(view), direction, 0),
    seconds,
    frame,
  );
  const [rest, after] = ticked(letGoKey(holding, direction), 1, frame);
  return { held, after, rest };
}

/** Each frame's move across `lefts`. */
function moves(lefts: readonly number[]): number[] {
  return lefts.slice(1).map((left, index) => left - (lefts[index] ?? 0));
}

const CRUISE = CRUISE_ACROSS * TABLET.width;

/** That the last frame of `lefts` moves leftward at the cruise. */
function assertCruisesLeftward(lefts: readonly number[]): void {
  const last = moves(lefts).at(-1) ?? 0;
  assert.ok(
    Math.abs(last + CRUISE * FRAME) < 1e-6,
    `turns leftward at ${String(last / FRAME)} px/s`,
  );
}

describe('a held key', () => {
  it('eases in to a steady cruise in screen widths a second', () => {
    const { held } = heldFor(TABLET, 1, 1, FRAME);
    const steps = moves(held);
    const cruising = steps.slice(-10);
    for (const each of cruising) {
      assert.ok(
        Math.abs(each - CRUISE * FRAME) < 1e-6,
        `cruises: ${String(each)}`,
      );
    }
    const easing = steps.slice(0, Math.round(KEY_EASE / FRAME));
    assert.ok(
      easing.every((each, index) => each > (easing[index - 1] ?? 0)),
      'each frame of the start moves farther than the last',
    );
    assert.ok((easing[0] ?? 0) < CRUISE * FRAME * 0.2, 'no jump on the press');
    assert.ok(steps.every((each) => each <= CRUISE * FRAME + 1e-9));
  });

  it('eases out to rest on release, and rests', () => {
    const { held, after, rest } = heldFor(TABLET, 1, 0.6, FRAME);
    const steps = moves(after);
    const stopping = steps.slice(0, Math.round(KEY_EASE / FRAME));
    assert.ok(
      stopping.every(
        (each, index) =>
          each < (index === 0 ? CRUISE * FRAME : (stopping[index - 1] ?? 0)),
      ),
      'each frame of the stop moves less than the last',
    );
    assert.ok(
      stopping.every((each) => each > 0),
      'it never backs up',
    );
    assert.equal(rest.motion.kind, 'rest');
    assert.equal(tick(rest, FRAME), rest, 'a rest is the same crop');
    const coasted = (after.at(-1) ?? 0) - (held.at(-1) ?? 0);
    assert.ok(
      Math.abs(coasted - (CRUISE * KEY_EASE) / 2) < 1,
      `coasts ${String(coasted)}`,
    );
  });

  it('nudges a little on a quick tap', () => {
    const { rest } = heldFor(TABLET, -1, 0.1, FRAME);
    const moved = 590 - leftAt(rest, 0);
    assert.ok(
      moved > 5 && moved < 0.05 * TABLET.width,
      `a tap moved ${String(moved)}`,
    );
  });

  it('is not restarted by a held key’s repeats', () => {
    const [once] = ticked(holdKey(openingPan(TABLET), 1, 0), 0.5, FRAME);
    let repeated = holdKey(openingPan(TABLET), 1, 0);
    for (let index = 0; index < 30; index++) {
      repeated = tick(holdKey(repeated, 1, index * FRAME), FRAME);
    }
    assert.equal(leftAt(repeated, 0), leftAt(once, 0));
  });

  it('holds still with both keys held', () => {
    const both = holdKey(holdKey(openingPan(TABLET), 1, 0), -1, 0);
    const [standing, lefts] = ticked(both, 1, FRAME);
    assert.ok(lefts.every((left) => left === 590));
    assert.equal(tick(standing, FRAME), standing, 'a stand is the same crop');
  });

  it('turns the other way at cruise within the ease once one of two keys is let go', () => {
    const [rightward] = ticked(holdKey(openingPan(TABLET), 1, 0), 0.5, FRAME);
    const [both, standing] = ticked(holdKey(rightward, -1, 0.5), 1, FRAME);
    const stood = moves(standing).slice(-10);
    assert.ok(
      stood.every((each) => each === 0),
      `stands: ${stood.join(', ')}`,
    );
    const [, lefts] = ticked(letGoKey(both, 1), KEY_EASE + FRAME, FRAME);
    assertCruisesLeftward(lefts);
  });

  it('turns on after a finger presses and lifts while it is held', () => {
    const [turning] = ticked(holdKey(openingPan(TABLET), -1, 0), 0.5, FRAME);
    const at = leftAt(turning, 0);
    const pressed = press(turning, 400, 0.5);
    assert.equal(leftAt(tick(pressed, FRAME), 0.6), at, 'the finger keeps it');
    const lifted = release(tick(pressed, 0.1), 0.6);
    const [, lefts] = ticked(lifted, KEY_EASE + FRAME, FRAME);
    assertCruisesLeftward(lefts);
  });

  it('turns on after a finger drags while it is held, from the drag’s crop', () => {
    const turning = holdKey(openingPan(TABLET), 1, 0);
    const lifted = release(dragged(turning, 800, -200, { seconds: 0.1 }), 0.1);
    const from = leftAt(lifted, 0.1);
    assert.ok(from > 590 + 150, `the drag carried it to ${String(from)}`);
    const [, lefts] = ticked(lifted, 0.4, FRAME);
    const steps = moves(lefts);
    assert.ok(
      steps.every((each) => each > 0 && each <= CRUISE * FRAME + 1e-9),
      'it turns on rightward, never past the cruise',
    );
  });

  it('is the same crop each frame it is held against a world’s end', () => {
    const { held } = heldFor(TABLET, 1, 4, FRAME);
    assert.equal(held.at(-1), 1180);
    const [atEnd] = ticked(holdKey(openingPan(TABLET), 1, 0), 4, FRAME);
    assert.equal(tick(atEnd, FRAME), atEnd);
  });

  it('comes to rest softly at the world’s end, never past it', () => {
    const { held } = heldFor(TABLET, 1, 4, FRAME);
    assert.ok(held.every((left) => left <= 1180));
    assert.ok(Math.abs((held.at(-1) ?? 0) - 1180) < 1e-6);
    const steps = moves(held);
    const cruised = steps.findIndex(
      (each, index) => index > 20 && each < CRUISE * FRAME - 1e-6,
    );
    const braking = steps.slice(cruised).filter((each) => each > 0);
    assert.ok(braking.length > 5, 'the stop takes several frames');
    assert.ok(
      braking.every(
        (each, index) => each <= (braking[index - 1] ?? Infinity) + 1e-9,
      ),
      'it only slows as it nears the end',
    );
    const last = braking.at(-1) ?? Infinity;
    assert.ok(
      last < CRUISE * FRAME * 0.25,
      `the last frame moves ${String(last)} px`,
    );
  });

  it('lands within a pixel at 60, 30 and 144 frames a second', () => {
    // Each hold spans a whole number of frames at every rate.
    for (const seconds of [1 / 6, 1, 3]) {
      const lands = [1 / 60, 1 / 30, 1 / 144].map((frame): [number, number] => {
        const { held, after } = heldFor(TABLET, 1, seconds, frame);
        return [held.at(-1) ?? 0, after.at(-1) ?? 0];
      });
      const [first = [0, 0]] = lands;
      for (const [letGo, rest] of lands) {
        assert.ok(Math.abs(letGo - first[0]) < 1, `let go at ${String(letGo)}`);
        assert.ok(Math.abs(rest - first[1]) < 1, `rested at ${String(rest)}`);
      }
    }
  });

  it('takes a long frame as no more than a tenth of a second', () => {
    const away = tick(holdKey(openingPan(TABLET), 1, 0), 30);
    assert.ok(leftAt(away, 0) - 590 < CRUISE * 0.1);
  });

  it('stops a glide, carrying its pace no faster than the cruise', () => {
    const gliding = release(
      dragged(openingPan(TABLET), 800, -200, { seconds: 0.1 }),
      0.1,
    );
    const at = leftAt(gliding, 0.2);
    const keyed = holdKey(gliding, -1, 0.2);
    assert.equal(leftAt(keyed, 0.2), at);
    const next = tick(keyed, FRAME);
    const moved = leftAt(next, 0) - at;
    assert.ok(
      moved > 0 && moved <= CRUISE * FRAME,
      `the next frame moves ${String(moved)}`,
    );
    const [, lefts] = ticked(next, 2, FRAME);
    assert.ok((lefts.at(-1) ?? 0) < at, 'the key turns it back');
  });

  it('pressed under a finger waits for the lift, and then turns', () => {
    const pressed = press(openingPan(TABLET), 400, 0);
    const keyed = holdKey(pressed, 1, 0.1);
    assert.equal(leftAt(tick(keyed, FRAME), 0.2), 590);
    const [, lefts] = ticked(release(keyed, 0.2), 1, FRAME);
    assert.ok((lefts.at(-1) ?? 0) > 590 + CRUISE * 0.5, 'it turns after');
    const letGo = release(letGoKey(keyed, 1), 0.2);
    assert.equal(letGo.motion.kind, 'rest', 'a key let go first is let go');
  });
});

describe('a resize', () => {
  it('keeps the ground point at the screen’s centre there, across a new zoom', () => {
    const view = { ...TABLET };
    const [panned] = ticked(holdKey(openingPan(view), 1, 0), 0.5, FRAME);
    const centre =
      (leftAt(panned, 1) + view.width / 2 - view.world / 2) / view.unit;
    const turned: View = { width: 820, world: 1640 * 1.2, unit: 120 };
    const there = recrop(panned, turned, 1);
    const after =
      (leftAt(there, 1) + turned.width / 2 - turned.world / 2) / turned.unit;
    assert.ok(Math.abs(after - centre) < 1e-9);
  });

  it('keeps the opening crop centred, and holds the crop inside the new world', () => {
    const turned: View = { width: 820, world: 1640, unit: 70 };
    assert.equal(leftAt(recrop(openingPan(TABLET), turned, 0), 0), 410);
    const atEnd = dragged(openingPan(TABLET), 1000, -2000);
    const narrow: View = { width: 820, world: 900, unit: 30 };
    assert.equal(leftAt(recrop(release(atEnd, 5), narrow, 5), 5), 80);
  });

  it('lets a pressed finger pan on from the new crop', () => {
    const pressed = dragged(openingPan(TABLET), 600, -100);
    const turned: View = { width: 820, world: 1640, unit: 70 };
    const there = recrop(pressed, turned, 0.2);
    const left = leftAt(there, 0.2);
    assert.equal(leftAt(move(there, 400, 0.3), 0.3), left + 100);
  });
});
