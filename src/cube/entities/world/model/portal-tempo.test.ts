import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PORTALS } from './portal-counts';
import { SOLVED, tickAt, ticksFrom } from './portal-tempo';

const { cycleMs, ticks } = PORTALS.tempo;

/** The ticks of cycle `cycle`, in order. */
const cycleOf = (cycle: number) => {
  const from = ticksFrom(cycle * cycleMs);
  return Array.from({ length: ticks }, () => from.next().value);
};

describe('the portal tempo', () => {
  it('cuts a cycle into its ticks, end to end', () => {
    const cycle = cycleOf(9);
    assert.equal(cycle[0]?.startMs, 9 * cycleMs);
    assert.equal(cycle.at(-1)?.endMs, 10 * cycleMs);
    for (const [k, tick] of cycle.entries()) {
      assert.equal(tick.cycle, 9);
      assert.equal(tick.tick, k);
      assert.ok(tick.endMs > tick.startMs);
      if (k > 0) assert.equal(tick.startMs, cycle[k - 1]?.endMs);
    }
  });

  it('hangs a room ~1.9 s mid-cycle and flickers at its edges', () => {
    const holds = cycleOf(0).map(({ startMs, endMs }) => endMs - startMs);
    assert.deepEqual(
      holds,
      [234, 245, 270, 328, 499, 1848, 499, 328, 270, 245, 234],
    );
  });

  it('keeps every boundary far from a rounding edge, so engines agree on it', () => {
    for (const ms of SOLVED) {
      const off = Math.abs((ms % 1) - 0.5);
      assert.ok(off > 1e-6, `${ms} ms rounds on an edge`);
    }
  });

  it('finds the tick of any instant, a boundary starting the next', () => {
    for (const tick of [...cycleOf(-3), ...cycleOf(354_000_000)]) {
      assert.deepEqual(tickAt(tick.startMs), tick);
      assert.deepEqual(tickAt(tick.endMs - 1), tick);
      assert.deepEqual(tickAt((tick.startMs + tick.endMs) / 2), tick);
    }
  });

  it('lays the ticks’ windows over the cycle, longest first', () => {
    const cycle = cycleOf(0);
    const byWindow = cycle.toSorted((a, b) => a.window.lo - b.window.lo);
    const [slowest] = byWindow;
    assert.ok(slowest !== undefined);
    assert.equal(slowest.window.lo, 0);
    assert.equal(slowest.tick, (ticks - 1) / 2);
    assert.equal(byWindow.at(-1)?.window.hi, cycleMs);
    for (const [i, { window, startMs, endMs }] of byWindow.entries()) {
      assert.equal(window.hi - window.lo, endMs - startMs);
      if (i > 0) assert.equal(window.lo, byWindow[i - 1]?.window.hi);
    }
  });
});
