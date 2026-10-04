import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FULL_DAY, FULL_DUSK } from './dusk';
import { firstMeadow, type Meadow, reduce } from './game';
import type { RunDoor } from './mouse-run';
import {
  type Burrows,
  NIGHT_GAP,
  nightRan,
  type NightRuns,
  NO_NIGHT_RUNS,
} from './night-runs';
import { mulberry32 } from './random';

const door = (id: string, x: number, hidden = false): RunDoor => ({
  id,
  foot: { x, y: 0 },
  seen: !hidden,
});

/** Two houses in sight of each other, one mouse home in each. */
const PAIR: Burrows = {
  seed: 7,
  doors: [door('a', 0), door('b', 1)],
  mice: new Map([
    ['a', 1],
    ['b', 1],
  ]),
};

/** `night` ticked every 100 ms from 0 to `to` at full dusk, and every outing it sent. */
function nightOf(burrows: Burrows, to: number) {
  const sent: Array<NonNullable<NightRuns['last']>> = [];
  let at = NO_NIGHT_RUNS;
  for (let now = 0; now <= to; now += 100) {
    const next = nightRan(at, FULL_DUSK, now, burrows);
    if (next.last && next.last !== at.last) sent.push(next.last);
    at = next;
  }
  return { night: at, sent };
}

/** When the outings off `seed` are sent over a minute between `PAIR`. */
const timesOf = (seed: number) =>
  nightOf({ ...PAIR, seed }, 60_000).sent.map(({ at }) => at);

describe('nightRan', () => {
  it('rests by day, the same object, and forgets a due outing', () => {
    assert.equal(
      nightRan(NO_NIGHT_RUNS, FULL_DAY, 60_000, PAIR),
      NO_NIGHT_RUNS,
    );
    const due = { ...NO_NIGHT_RUNS, due: 5000 };
    assert.equal(nightRan(due, FULL_DAY, 0, PAIR).due, undefined);
  });

  it('sends no one at dusk without the houses', () => {
    assert.equal(
      nightRan(NO_NIGHT_RUNS, FULL_DUSK, 60_000, undefined),
      NO_NIGHT_RUNS,
    );
  });

  it('sends a mouse every 6–12 s at dusk, between the doors in sight', () => {
    const { sent } = nightOf(PAIR, 120_000);
    assert.ok(sent.length >= 9 && sent.length <= 20, `${sent.length}`);
    for (const [index, run] of sent.entries()) {
      assert.ok(run.to !== undefined && run.to !== run.from);
      assert.ok(['a', 'b'].includes(run.from));
      const gap = run.at - (sent[index - 1]?.at ?? 0);
      assert.ok(gap >= NIGHT_GAP[0] && gap <= NIGHT_GAP[1] + 100, `${gap}`);
    }
  });

  it('times its outings by the seed alone', () => {
    assert.deepEqual(timesOf(7), timesOf(7));
    assert.notDeepEqual(timesOf(7), timesOf(8));
  });

  it('runs to no door out of sight: the mouse peeks', () => {
    const { sent } = nightOf(
      {
        ...PAIR,
        doors: [door('a', 0), door('b', 1, true)],
        mice: new Map([['a', 1]]),
      },
      30_000,
    );
    assert.ok(sent.length > 0);
    for (const run of sent)
      assert.deepEqual(run, { ...run, from: 'a', to: undefined });
  });

  it('runs between houses grown at the screen’s two sides, the first within 12 s', () => {
    // As a child's meadow stood on a tablet: three houses grown by `+`, each
    // as far from the others as the screen allows (`pickFoot`).
    const burrows: Burrows = {
      seed: 3,
      doors: [door('a', -8.5), door('b', 6.2), door('c', -4)],
      mice: new Map([
        ['a', 1],
        ['b', 1],
        ['c', 1],
      ]),
    };
    const { sent } = nightOf(burrows, 30_000);
    const [first] = sent;
    assert.ok(first && first.at <= NIGHT_GAP[1] + 100);
    for (const run of sent)
      assert.ok(run.to !== undefined && run.to !== run.from);
  });

  it('sends no one with no mouse home in sight, and keeps the timer going', () => {
    const empty = { ...PAIR, mice: new Map<string, number>() };
    const { night, sent } = nightOf(empty, 30_000);
    assert.equal(sent.length, 0);
    assert.ok(night.made > 0);
  });
});

describe('the tick at dusk', () => {
  const dusked: Meadow = { ...firstMeadow(mulberry32(1)), dusk: FULL_DUSK };
  const SIGHT = { caps: [], flowers: [], air: [], crowded: [], room: [] };
  const tick = (meadow: Meadow, now: number, burrows?: Burrows) =>
    reduce(meadow, { kind: 'tick', now, ...SIGHT, burrows });

  it('sends the mice out through the reducer at dusk, never by day', () => {
    let night = dusked;
    let day = { ...dusked, dusk: FULL_DAY };
    for (let now = 0; now <= 30_000; now += 100) {
      night = tick(night, now, PAIR);
      day = tick(day, now, PAIR);
    }
    assert.ok(night.nightRuns.made >= 2);
    assert.ok(night.nightRuns.last?.to !== undefined);
    assert.equal(day.nightRuns, NO_NIGHT_RUNS);
  });
});
