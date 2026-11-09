import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  dot,
  latLonToUnit,
  length,
  northAt,
  type Vec3,
} from '@/island/shared/globe';
import { openingOf } from '@/island/features/eye';

import { advance, DAY_HOURS, daylight, heavensAt, OPENING_CLOCK } from './day';

const DEGREE = Math.PI / 180;

const near = (a: Vec3, b: Vec3, tolerance = 1e-12) =>
  a.every((v, i) => Math.abs(v - (b[i] ?? Number.NaN)) < tolerance);

/** The sun's elevation over `up`, radians, through one day every `step` hours. */
const dayOver = (up: Vec3, step = 0.01): number[] =>
  Array.from({ length: DAY_HOURS / step }, (_, i) =>
    Math.asin(dot(heavensAt(openingOf(1), i * step).sun, up)),
  );

describe('heavensAt', () => {
  for (const world of [1, 0]) {
    it(`stands a 20° afternoon sun over #${String(world)}'s opening at hour 0`, () => {
      const opening = openingOf(world);
      const up = latLonToUnit(opening);
      const { sun } = heavensAt(opening, 0);
      const east = cross(northAt(up), up);
      assert.ok(Math.abs(Math.asin(dot(sun, up)) - 20 * DEGREE) < 1e-12);
      assert.ok(dot(sun, east) < 0, 'west of the meridian');
    });
  }

  it('stands the sun over the equator', () => {
    for (const hours of [0, 5, 13.5]) {
      assert.ok(Math.abs(heavensAt(openingOf(0), hours).sun[1]) < 1e-12);
    }
  });

  for (const lat of [0, 38, 60, 80]) {
    it(`brings ${String(lat)}° N twelve hours of day and a night`, () => {
      const day = dayOver(latLonToUnit({ lat: lat * DEGREE, lon: 0.4 }));
      const lit = day.filter((elevation) => elevation > 0).length;
      assert.ok(Math.abs(lit / day.length - 0.5) < 0.002, `lit ${String(lit)}`);
      assert.ok(Math.min(...day) < -6 * DEGREE, 'past twilight at midnight');
    });
  }

  it('keeps the full moon exactly opposite the sun', () => {
    for (const hours of [0, 3.5, 12, 17.25]) {
      const { sun, moon } = heavensAt(openingOf(1), hours);
      assert.deepEqual(
        moon,
        sun.map((v) => -v),
      );
      assert.ok(Math.abs(length(sun) - 1) < 1e-12);
    }
  });

  it('returns to the start after a full day', () => {
    const start = heavensAt(openingOf(1), 0).sun;
    assert.ok(near(heavensAt(openingOf(1), DAY_HOURS).sun, start));
  });

  it('turns about the pole: the sun keeps its height over the equator', () => {
    const start = heavensAt(openingOf(1), 0).sun;
    for (const hours of [1, 6, 12, 18]) {
      const { sun } = heavensAt(openingOf(1), hours);
      assert.ok(Math.abs(sun[1] - start[1]) < 1e-12);
    }
  });

  it('moves the sun west, as a planet turning east does', () => {
    const lonOf = ([x, , z]: Vec3) => Math.atan2(-z, x);
    const before = lonOf(heavensAt(openingOf(1), 0).sun);
    const after = lonOf(heavensAt(openingOf(1), 1).sun);
    assert.ok(Math.abs(before - after - (2 * Math.PI) / DAY_HOURS) < 1e-12);
  });

  it("brings night over #1's opening when the sun is across the pole", () => {
    const opening = openingOf(1);
    const lonOf = ([x, , z]: Vec3) => Math.atan2(-z, x);
    // The sun's longitude falls a day's turn per day; at midnight it is the opening's plus π.
    const behind = lonOf(heavensAt(opening, 0).sun) - opening.lon - Math.PI;
    const midnight = ((((behind / (2 * Math.PI)) % 1) + 1) % 1) * DAY_HOURS;
    const { sun, moon } = heavensAt(opening, midnight);
    const up = latLonToUnit(opening);
    assert.equal(daylight(sun, up), 0);
    assert.ok(dot(moon, up) > 0, 'the moon is up');
  });
});

describe('daylight', () => {
  it('is full day under the opening sun', () => {
    const opening = openingOf(1);
    assert.equal(daylight(heavensAt(opening, 0).sun, latLonToUnit(opening)), 1);
  });

  it('eases from night to day as the sun rises', () => {
    const up: Vec3 = [0, 1, 0];
    let previous = -1;
    for (let deg = -20; deg <= 30; deg += 1) {
      const sun: Vec3 = [Math.cos(deg * DEGREE), Math.sin(deg * DEGREE), 0];
      const now = daylight(sun, up);
      assert.ok(now >= previous && now >= 0 && now <= 1, `${String(deg)}°`);
      previous = now;
    }
    assert.equal(
      daylight([Math.cos(-10 * DEGREE), Math.sin(-10 * DEGREE), 0], up),
      0,
    );
  });
});

describe('advance', () => {
  it('stands still when stopped and unscrubbed', () => {
    assert.deepEqual(
      advance(OPENING_CLOCK, { scrub: 0, fast: false }, 5),
      OPENING_CLOCK,
    );
  });

  it('scrubs an hour a second, six with the fast scrub, both ways', () => {
    assert.equal(advance(OPENING_CLOCK, { scrub: 1, fast: false }, 2).hours, 2);
    assert.equal(advance(OPENING_CLOCK, { scrub: 1, fast: true }, 1).hours, 6);
    assert.equal(
      advance(OPENING_CLOCK, { scrub: -1, fast: false }, 1).hours,
      DAY_HOURS - 1,
    );
  });

  it('runs a day in twenty minutes once started', () => {
    const running = { hours: 0, running: true };
    assert.ok(
      Math.abs(advance(running, { scrub: 0, fast: false }, 600).hours - 12) <
        1e-9,
    );
  });
});
