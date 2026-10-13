import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cycleOrder,
  nextStation,
  stationAt,
  stationOffset,
  stationTrack,
} from './station';

/** Seconds per catalogue position. */
const DURATIONS = [180, 240, 200, 95, 310, 150, 222, 128];
const CYCLE_MS = DURATIONS.reduce((sum, seconds) => sum + seconds, 0) * 1000;
const NOW = Date.UTC(2026, 9, 13, 12, 34, 56, 789);

function at(nowMs: number) {
  const station = stationAt(DURATIONS, nowMs);

  assert.ok(station);

  return station;
}

describe('cycleOrder', () => {
  it('is a permutation of the catalogue', () => {
    assert.deepEqual(
      cycleOrder(DURATIONS.length, 20_371).toSorted((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7],
    );
  });

  it('is the same for the same cycle and differs between cycles', () => {
    assert.deepEqual(cycleOrder(8, 42), cycleOrder(8, 42));
    assert.notDeepEqual(cycleOrder(8, 42), cycleOrder(8, 43));
  });

  it('never opens on the song the cycle before it closed on', () => {
    for (let cycle = 0; cycle < 2000; cycle++) {
      assert.notEqual(cycleOrder(3, cycle)[0], cycleOrder(3, cycle - 1).at(-1));
    }
  });

  it('keeps a song that segues ahead of the one it runs into, across the swap too', () => {
    const segues = new Set([1, 4, 5]);

    for (let cycle = 0; cycle < 2000; cycle++) {
      const order = cycleOrder(8, cycle, segues);

      assert.equal(order.indexOf(2), order.indexOf(1) + 1);
      assert.deepEqual(
        order.slice(order.indexOf(4), order.indexOf(4) + 3),
        [4, 5, 6],
      );
      assert.notEqual(order[0], cycleOrder(8, cycle - 1, segues).at(-1));
    }
  });
});

describe('stationAt', () => {
  it('answers the same instant the same way', () => {
    assert.deepEqual(stationAt(DURATIONS, NOW), stationAt(DURATIONS, NOW));
  });

  it('places the instant inside the slot it returns', () => {
    const station = at(NOW);
    const track = stationTrack(station);

    assert.ok(track !== undefined);
    assert.ok(station.startMs <= NOW && NOW < station.endMs);
    assert.equal(
      station.endMs - station.startMs,
      (DURATIONS[track] ?? 0) * 1000,
    );
  });

  it('hands a slot’s last millisecond and the next one’s first to different slots', () => {
    const { endMs, cursor } = at(NOW);

    assert.equal(at(endMs - 1).cursor, cursor);
    assert.equal(at(endMs).startMs, endMs);
  });

  it('turns over to the next cycle at the cycle’s length', () => {
    const cycle = Math.floor(NOW / CYCLE_MS);
    const last = at((cycle + 1) * CYCLE_MS - 1);
    const first = at((cycle + 1) * CYCLE_MS);

    assert.equal(last.cycle, cycle);
    assert.equal(last.cursor, DURATIONS.length - 1);
    assert.equal(last.endMs, (cycle + 1) * CYCLE_MS);
    assert.equal(first.cycle, cycle + 1);
    assert.equal(first.cursor, 0);
  });

  it('has nothing on air without a catalogue', () => {
    assert.equal(stationAt([], NOW), undefined);
    assert.equal(stationAt([0, 0], NOW), undefined);
  });
});

describe('nextStation', () => {
  it('plays the next slot when the song ends early, rather than itself again', () => {
    const station = at(NOW);
    const next = nextStation(DURATIONS, station, station.endMs - 900);

    assert.equal(next?.startMs, station.endMs);
  });

  it('joins the next slot as far in as the clock has gone', () => {
    const station = at(NOW);
    const late = station.endMs + 700;
    const next = nextStation(DURATIONS, station, late);

    assert.ok(next);
    assert.equal(stationOffset(next, late), 0.7);
  });
});
