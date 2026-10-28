import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Course, cruise, type Cruising } from './cruise';

const FRAME = 1 / 60;

/** A line from 0 to `end` units, cruising at 2 units a second, asked onward. */
function line(end: number, toward = 1): Course<number> {
  return {
    cruise: 2,
    ease: 0.25,
    toward: () => toward,
    room: (at, way) => (way > 0 ? end - at : at),
    step: (at, by) => {
      const next = Math.min(end, Math.max(0, at + by));
      return { at: next, stopped: next !== at + by };
    },
  };
}

/** `from` driven along `course` for `seconds`, a frame of `frame` at a time. */
function driven<P>(
  course: Course<P>,
  from: Cruising<P>,
  seconds: number,
  frame = FRAME,
): Cruising<P> {
  let state = from;
  for (let time = 0; time < seconds - 1e-9; time += frame) {
    state = cruise(course, state, frame);
  }
  return state;
}

describe('a cruise', () => {
  it('eases up to its cruise over its ease, covering half the cruise times the ease', () => {
    const eased = driven(line(Infinity), { at: 0, pace: 0 }, 0.25);
    assert.ok(Math.abs(eased.pace - 2) < 1e-9);
    assert.ok(Math.abs(eased.at - 0.25) < 1e-9);
    const cruising = driven(line(Infinity), eased, 1);
    assert.ok(Math.abs(cruising.at - 2.25) < 1e-9);
  });

  it('brakes to rest exactly at the end of its room', () => {
    const rested = driven(line(3), { at: 0, pace: 0 }, 4);
    assert.equal(rested.at, 3);
    assert.equal(rested.pace, 0);
  });

  it('brakes to the end alike at 30 and 144 frames a second', () => {
    const slow = driven(line(3), { at: 0, pace: 0 }, 1.5, 1 / 30);
    const fast = driven(line(3), { at: 0, pace: 0 }, 1.5, 1 / 144);
    assert.ok(slow.at < 3 && slow.pace > 0, 'still braking');
    assert.ok(Math.abs(slow.at - fast.at) < 1e-3);
  });

  it('brakes harder than its rate when handed a pace too fast to stop', () => {
    const rested = driven(line(3, 0), { at: 2.9, pace: 4 }, 1);
    assert.ok(rested.at <= 3);
    assert.equal(rested.pace, 0);
  });

  it('eases back to rest when asked to stand', () => {
    const stood = driven(line(Infinity, 0), { at: 0, pace: 2 }, 0.25);
    assert.equal(stood.pace, 0);
    assert.ok(Math.abs(stood.at - 0.25) < 1e-9);
  });

  it('returns the same state for no time at all', () => {
    const from = { at: 1, pace: 1 };
    assert.equal(cruise(line(3), from, 0), from);
  });
});
