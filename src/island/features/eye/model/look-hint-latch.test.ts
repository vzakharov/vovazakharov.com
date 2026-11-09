import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { eyeAt, ISLAND_OPENING, MAX_HEIGHT, step, STILL } from './eye';
import { type LookHint, lookHint } from './look-hint';
import {
  type HintLatch,
  type HintShowing,
  latchHint,
  LOOK_HINT_FADE_SECONDS,
  LOOK_HINT_LIT_SECONDS,
  NO_HINT,
} from './look-hint-latch';

/** A frame a power of two long, so every tick's time is exact. */
const TICK = 1 / 64;

/** Ticks a showing stays up, lit and fading. */
const UP = (LOOK_HINT_LIT_SECONDS + LOOK_HINT_FADE_SECONDS) / TICK;

/** A showing as the ticks saw it: its hint, its first tick, its tick count. */
type Seen = readonly [LookHint, number, number];

/**
 * The latch fed `earned(i)` on ticks `0` to `count - 1`, the time `i · TICK`,
 * and every distinct showing it put up.
 */
function shown(
  earned: (i: number) => LookHint | undefined,
  count: number,
): Seen[] {
  let latch: HintLatch = NO_HINT;
  const seen: Array<[LookHint, number, number]> = [];
  let last: HintShowing | undefined;
  for (let i = 0; i < count; i += 1) {
    latch = latchHint(latch, earned(i), i * TICK);
    const { showing } = latch;
    if (showing !== undefined && showing !== last) {
      seen.push([showing.hint, i, 0]);
    }
    const current = seen.at(-1);
    if (showing !== undefined && current !== undefined) current[2] += 1;
    last = showing;
  }
  return seen;
}

const flat = () => 0;

describe('latchHint', () => {
  it('stays up its lit and fading span under a held condition, then goes', () => {
    assert.deepEqual(
      shown(() => 'down', 10 * UP),
      [['down', 0, UP]],
    );
  });

  it('keeps one showing while the condition stays', () => {
    let latch = latchHint(NO_HINT, 'up', 0);
    const first = latch.showing;
    for (let i = 1; i < UP; i += 1) {
      latch = latchHint(latch, 'up', i * TICK);
      assert.equal(latch.showing, first);
    }
  });

  it('stays up its whole span when the condition lapses at once', () => {
    assert.deepEqual(
      shown((i) => (i < 5 ? 'up' : undefined), 10 * UP),
      [['up', 0, UP]],
    );
  });

  it('shows again after the condition lapses and returns', () => {
    const back = UP + 100;
    assert.deepEqual(
      shown((i) => (i < UP + 50 || i >= back ? 'up' : undefined), 10 * UP),
      [
        ['up', 0, UP],
        ['up', back, UP],
      ],
    );
  });

  it('shows again after a single tick without the condition', () => {
    assert.deepEqual(
      shown((i) => (i === 64 ? undefined : 'up'), 10 * UP),
      [
        ['up', 0, 65],
        ['up', 65, UP],
      ],
    );
  });

  it('replaces a hint still up with the other one at once, for its own span', () => {
    assert.deepEqual(
      shown((i) => (i < 64 ? 'up' : 'down'), 10 * UP),
      [
        ['up', 0, 64],
        ['down', 64, UP],
      ],
    );
  });
});

describe('a held descent from orbit', () => {
  it('shows each hint it earns its full span, never in a flash', () => {
    let eye = eyeAt({ ...ISLAND_OPENING, height: MAX_HEIGHT }, flat);
    const seen = shown(() => {
      eye = step(eye, { ...STILL, climb: -1 }, TICK, flat);
      return lookHint(eye, 16 / 9);
    }, 14 / TICK);
    // Earned for under a tenth of a second near 2,800 km, again from about
    // 1 km, where down takes over at 20 m before the span is out.
    assert.deepEqual(
      seen.map(([hint, , ticks]) => [hint, ticks === UP]),
      [
        ['up', true],
        ['up', false],
        ['down', true],
      ],
    );
  });
});
