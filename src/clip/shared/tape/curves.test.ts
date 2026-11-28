import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { frameAt, smooth, trackingBar, tubeOffState, zapState } from './curves';

describe('smooth', () => {
  it('runs 0 to 1 and clamps outside', () => {
    assert.equal(smooth(-1), 0);
    assert.equal(smooth(0), 0);
    assert.equal(smooth(0.5), 0.5);
    assert.equal(smooth(1), 1);
    assert.equal(smooth(2), 1);
  });
});

describe('frameAt', () => {
  it('counts video frames at 30 a second', () => {
    assert.equal(frameAt(0), 0);
    assert.equal(frameAt(1.999), 59);
    assert.equal(frameAt(2), 60);
  });
});

describe('zapState', () => {
  it('starts in snow and ends locked', () => {
    assert.deepEqual(zapState(0), {
      snow: 1,
      roll: 0.9,
      colour: 0,
      light: 0,
      jitter: 1,
    });
    assert.deepEqual(zapState(1), {
      snow: 0,
      roll: 0,
      colour: 1,
      light: 1,
      jitter: 0,
    });
  });

  it('reads as burst, roll, grey, lock over four frames', () => {
    const [a, b, c, d] = [0.125, 0.375, 0.625, 0.875].map((p) => zapState(p));
    assert.ok(a && b && c && d);
    assert.ok(a.snow > 0.8, 'the first frame is mostly snow');
    assert.ok(
      b.snow < 0.4 && b.roll > 0.3 && b.colour < 0.05,
      'the second rolls in grey',
    );
    assert.ok(
      c.snow === 0 && c.colour > 0.3 && c.colour < 0.8,
      'the third regains colour',
    );
    assert.ok(d.roll < 0.02 && d.colour > 0.95, 'the fourth has nearly locked');
  });

  it('only ever settles: snow, roll and shake fall, colour and light rise', () => {
    let last = zapState(0);
    for (let n = 1; n <= 100; n += 1) {
      const next = zapState(n / 100);
      assert.ok(
        next.snow <= last.snow &&
          next.roll <= last.roll &&
          next.jitter <= last.jitter,
      );
      assert.ok(next.colour >= last.colour && next.light >= last.light);
      last = next;
    }
  });
});

describe('tubeOffState', () => {
  it('collapses to a line, then a dot, then fades out', () => {
    const start = tubeOffState(0);
    assert.equal(start.height, 1);
    assert.equal(start.width, 1);
    assert.equal(start.picture, 1);
    const line = tubeOffState(0.4);
    assert.ok(
      line.height < 0.01 &&
        line.width === 1 &&
        line.picture === 0 &&
        line.flash === 1,
    );
    const dot = tubeOffState(0.6);
    assert.ok(dot.width < 0.01 && dot.glow === 1);
    const end = tubeOffState(1);
    assert.equal(end.flash, 0);
    assert.equal(end.glow, 0);
  });
});

// How many of two minutes' tenth-second samples catch the bar on screen.
const seen = (wear: number) =>
  Array.from({ length: 1200 }, (_, n) => trackingBar(n / 10, wear)).filter(
    Boolean,
  ).length;

describe('trackingBar', () => {
  it('shows more often the worse the wear', () => {
    assert.ok(seen(0) < seen(0.9));
    assert.ok(seen(0.9) > 200);
  });

  it('crosses the picture bottom to top', () => {
    const ys = Array.from({ length: 1200 }, (_, n) =>
      trackingBar(n / 10, 1),
    ).flatMap((bar) => (bar ? [bar.y] : []));
    assert.ok(Math.max(...ys) > 700 && Math.min(...ys) < 20);
  });
});
