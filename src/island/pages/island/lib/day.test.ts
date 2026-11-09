import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CENTRE,
  dot,
  EAST,
  latLonToUnit,
  length,
  NORTH,
  northAt,
  type Vec3,
} from '@/island/shared/globe';
import { openingOf } from '@/island/features/eye';

import { advance, DAY_HOURS, daylight, heavensAt, OPENING_CLOCK } from './day';

const DEGREE = Math.PI / 180;

const near = (a: Vec3, b: Vec3, tolerance = 1e-12) =>
  a.every((v, i) => Math.abs(v - (b[i] ?? Number.NaN)) < tolerance);

/** Today's sun before the planet turned: 20° up from the north-west over the island's centre. */
const TODAY: Vec3 = (() => {
  const up = Math.sin(20 * DEGREE);
  const across = Math.cos(20 * DEGREE);
  const east = across * Math.sin(315 * DEGREE);
  const north = across * Math.cos(315 * DEGREE);
  const axis = (i: 0 | 1 | 2) =>
    up * CENTRE[i] + east * EAST[i] + north * NORTH[i];
  return [axis(0), axis(1), axis(2)];
})();

describe('heavensAt', () => {
  it("keeps today's sun over #1's opening at hour 0", () => {
    assert.ok(near(heavensAt(openingOf(1), 0).sun, TODAY));
  });

  it("stands the same low north-west sun over #0's opening at hour 0", () => {
    const opening = openingOf(0);
    const up = latLonToUnit(opening);
    const { sun } = heavensAt(opening, 0);
    assert.ok(Math.abs(Math.asin(dot(sun, up)) - 20 * DEGREE) < 1e-12);
    assert.ok(dot(sun, northAt(up)) > 0, 'from the north');
  });

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
