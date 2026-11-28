import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FRAME_WINDOW, type Pace, paced, paceFields, speedText } from './pace';

/** The pace after `frames` frames `ms` long, the eye at `speed` m/s, from `from`. */
function run(
  from: Pace | undefined,
  ms: number,
  speed: number,
  frames: number,
): Pace {
  let pace = paced(from, {
    ms,
    metres: (speed * ms) / 1000,
    seconds: ms / 1000,
  });
  for (let n = 1; n < frames; n += 1) {
    pace = paced(pace, { ms, metres: (speed * ms) / 1000, seconds: ms / 1000 });
  }
  return pace;
}

describe('paced', () => {
  it('starts at the first frame', () => {
    assert.deepEqual(
      paced(undefined, { ms: 16.7, metres: 2, seconds: 0.0167 }),
      { frameMs: 16.7, recent: [16.7], drawn: 1, speed: 2 / 0.0167 },
    );
  });

  it('holds a steady frame time and speed', () => {
    const steady = run(undefined, 16.7, 40, 120);
    assert.ok(Math.abs(steady.frameMs - 16.7) < 1e-9);
    assert.ok(Math.abs(steady.speed - 40) < 1e-9);
    assert.equal(steady.drawn, 120);
  });

  it('reads the frame time as the mean of the last window, and only of it', () => {
    const slow = run(run(undefined, 16, 0, 200), 32, 0, FRAME_WINDOW / 2);
    assert.equal(slow.recent.length, FRAME_WINDOW);
    assert.ok(Math.abs(slow.frameMs - 24) < 1e-9, String(slow.frameMs));
    const settled = run(slow, 32, 0, FRAME_WINDOW / 2);
    assert.ok(Math.abs(settled.frameMs - 32) < 1e-9, String(settled.frameMs));
  });

  it('moves the speed two-thirds of the way in half a second at 30 fps and at 120', () => {
    for (const ms of [33.3, 8.3]) {
      const { speed } = run(
        { frameMs: 0, recent: [], drawn: 0, speed: 0 },
        ms,
        100,
        Math.ceil(500 / ms),
      );
      assert.ok(
        Math.abs(speed / 100 - (1 - Math.exp(-1))) < 0.03,
        String(speed),
      );
    }
  });

  it('reads the speed over the time the eye stepped, not the frame’s', () => {
    const slow = paced(undefined, { ms: 250, metres: 10, seconds: 0.1 });
    assert.equal(slow.speed, 100);
  });

  it('keeps the speed over a frame that stepped no time', () => {
    const still = paced(
      { frameMs: 16, recent: [16], drawn: 1, speed: 7 },
      { ms: 0, metres: 0, seconds: 0 },
    );
    assert.equal(still.speed, 7);
    assert.ok(Number.isFinite(still.frameMs));
  });
});

describe('speedText', () => {
  it('gives m/s with km/h below one km/s, km/s from there', () => {
    assert.equal(speedText(0), '0.0 m/s (0 km/h)');
    assert.equal(speedText(12.5), '12.5 m/s (45 km/h)');
    assert.equal(speedText(999), '999.0 m/s (3596 km/h)');
    assert.equal(speedText(1000), '1.0 km/s');
    assert.equal(speedText(7_654_321), '7654.3 km/s');
  });
});

describe('paceFields', () => {
  it('spells the speed and the frame time with its rate, a row each', () => {
    assert.deepEqual(paceFields({ frameMs: 16.66, speed: 3 }), [
      'speed 3.0 m/s (11 km/h)',
      'frame 16.7 ms, 60 fps (mean of 60)',
    ]);
  });
});
