import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Ring, signedArea } from './ring';
import {
  resample,
  ringsCross,
  selfIntersects,
  smoothCoast,
  type SmoothOptions,
} from './smooth';

const OPTIONS: SmoothOptions = {
  minArea: 20,
  resampleStep: 1,
  sigma: 3,
  tolerance: 0.2,
};

/** A counter-clockwise polygon through `points`, closed implicitly. */
const ring = (...points: Array<[number, number]>): Ring => points;

/** A square of side `side` at `(x, y)`, counter-clockwise. */
const square = (x: number, y: number, side: number): Ring =>
  ring([x, y], [x + side, y], [x + side, y + side], [x, y + side]);

/**
 * A 60×40 block with a 30-long, 3-wide spit off its east side and a
 * one-unit-wide, 4-long spike off its north side, counter-clockwise.
 */
const BODY = ring(
  [0, 0],
  [60, 0],
  [60, 18],
  [90, 18],
  [90, 21],
  [60, 21],
  [60, 40],
  [30.5, 40],
  [30, 44],
  [29.5, 40],
  [0, 40],
);

const maxX = (r: Ring) => Math.max(...r.map(([x]) => x));
const maxY = (r: Ring) => Math.max(...r.map(([, y]) => y));

describe('smoothCoast', () => {
  it('drops rings under the minimum area and keeps the main body first', () => {
    const speck = square(200, 200, 3);
    const islet = square(120, 0, 8);
    const smoothed = smoothCoast([islet, speck, BODY], OPTIONS);
    assert.equal(smoothed.length, 2);
    assert.ok(
      Math.abs(signedArea(smoothed[0] ?? [])) >
        Math.abs(signedArea(smoothed[1] ?? [])),
    );
    assert.ok(maxX(smoothed[0] ?? []) > 80, 'the main body is first');
  });

  it('keeps every ring counter-clockwise, simple and apart', () => {
    const smoothed = smoothCoast([BODY, square(95, 15, 10)], OPTIONS);
    for (const r of smoothed) {
      assert.ok(signedArea(r) > 0);
      assert.equal(selfIntersects(r), false);
    }
    const [one = [], other = []] = smoothed;
    assert.equal(ringsCross(one, other), false);
  });

  it('melts a thin spike and keeps a long spit', () => {
    const [body = []] = smoothCoast([BODY], OPTIONS);
    assert.ok(maxY(body) < 42, `spike reaches ${maxY(body).toFixed(1)}`);
    assert.ok(maxX(body) > 86, `spit reaches ${maxX(body).toFixed(1)}`);
  });

  it('rounds a corner rather than cutting it off', () => {
    const [smoothed = []] = smoothCoast([square(0, 0, 40)], OPTIONS);
    const corner = Math.min(...smoothed.map(([x, y]) => Math.hypot(x, y)));
    assert.ok(corner > 0.5 && corner < 4, `corner at ${corner.toFixed(2)}`);
    const area = signedArea(smoothed);
    assert.ok(area > 1560 && area <= 1600, `area ${area.toFixed(0)}`);
  });

  it('keeps a narrow strait between two rings open', () => {
    const smoothed = smoothCoast(
      [square(0, 0, 30), square(30.6, 0, 30)],
      OPTIONS,
    );
    const [one = [], other = []] = smoothed;
    assert.equal(ringsCross(one, other), false);
  });
});

describe('resample', () => {
  it('spaces points evenly around a closed ring', () => {
    const even = resample(square(0, 0, 10), 1);
    assert.equal(even.length, 40);
    for (const [i, [x, y]] of even.entries()) {
      const [nx, ny] = even[(i + 1) % even.length] ?? [0, 0];
      assert.ok(Math.abs(Math.hypot(nx - x, ny - y) - 1) < 1e-9);
    }
  });
});

describe('selfIntersects', () => {
  it('finds a figure eight and passes a square', () => {
    assert.equal(selfIntersects(ring([0, 0], [1, 1], [1, 0], [0, 1])), true);
    assert.equal(selfIntersects(square(0, 0, 1)), false);
  });
});
