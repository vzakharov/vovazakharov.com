import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { earFlights, earRise, RUMBLE, seats } from './crowd';

const AUDIENCE = { area: { width: 1280, height: 300 }, seed: 4 };

describe('seats', () => {
  it('puts the back row first, smaller', () => {
    const all = seats(AUDIENCE);
    const [first] = all;
    const last = all.at(-1);
    assert.ok(first && last);
    assert.ok(first.rank > last.rank);
    assert.ok(first.headScale < last.headScale);
  });

  it('numbers every seat once', () => {
    const numbers = seats(AUDIENCE).map(({ seat }) => seat);
    assert.equal(new Set(numbers).size, numbers.length);
  });
});

describe('earFlights', () => {
  it('flies nothing without a lift-off', () => {
    assert.deepEqual(earFlights(AUDIENCE), []);
  });

  const flights = earFlights({ ...AUDIENCE, liftOff: 10 });

  it('sends both ears of every head, each after its rumble', () => {
    assert.equal(flights.length, seats(AUDIENCE).length * 2);
    for (const { ignites, bursts } of flights) {
      assert.ok(ignites >= 10 + RUMBLE);
      assert.ok(bursts > ignites);
    }
  });

  it('staggers the ears rather than sending them as one', () => {
    assert.ok(
      new Set(flights.map(({ ignites }) => ignites)).size > flights.length / 2,
    );
  });
});

describe('earRise', () => {
  const flights = earFlights({ ...AUDIENCE, liftOff: 0 });

  it('is airborne only between leaving and bursting', () => {
    for (const flight of flights) {
      assert.equal(earRise(flight, flight.ignites - 0.01), undefined);
      assert.ok(earRise(flight, flight.ignites));
      assert.equal(earRise(flight, flight.bursts), undefined);
    }
  });

  it('starts where the ear sits and climbs the whole way', () => {
    for (const flight of flights) {
      const start = earRise(flight, flight.ignites);
      assert.ok(start);
      assert.equal(Math.hypot(...start.lift), 0);
      let lastY = 0;
      for (let tenth = 1; tenth < 10; tenth += 1) {
        const rise = earRise(
          flight,
          flight.ignites + (tenth / 10) * (flight.bursts - flight.ignites),
        );
        assert.ok(rise);
        assert.ok(rise.lift[1] < lastY);
        [, lastY] = rise.lift;
      }
    }
  });
});
