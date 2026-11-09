import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Pace, paced, paceFields, speedText } from './pace';

/** The pace after `seconds` of frames `ms` long, the eye at `speed` m/s, from `from`. */
function run(from: Pace, ms: number, speed: number, seconds: number): Pace {
  let pace = from;
  for (let t = 0; t < seconds * 1000; t += ms) {
    pace = paced(pace, { ms, metres: (speed * ms) / 1000, seconds: ms / 1000 });
  }
  return pace;
}

describe('paced', () => {
  it('starts at the first frame', () => {
    assert.deepEqual(
      paced(undefined, { ms: 16.7, metres: 2, seconds: 0.0167 }),
      { frameMs: 16.7, speed: 2 / 0.0167 },
    );
  });

  it('holds a steady frame time and speed', () => {
    const steady = run({ frameMs: 16.7, speed: 40 }, 16.7, 40, 2);
    assert.ok(Math.abs(steady.frameMs - 16.7) < 1e-12);
    assert.ok(Math.abs(steady.speed - 40) < 1e-9);
  });

  it('settles on a new frame time within two seconds, never past it', () => {
    const { frameMs } = run({ frameMs: 16.7, speed: 0 }, 33.3, 0, 2);
    assert.ok(frameMs < 33.3);
    assert.ok(33.3 - frameMs < 0.02 * (33.3 - 16.7));
  });

  it('goes two-thirds of the way in half a second at 30 fps and at 120', () => {
    for (const ms of [33.3, 8.3]) {
      const { frameMs, speed } = run({ frameMs: 0, speed: 0 }, ms, 100, 0.5);
      for (const share of [frameMs / ms, speed / 100]) {
        assert.ok(Math.abs(share - (1 - Math.exp(-1))) < 0.03, String(share));
      }
    }
  });

  it('reads the speed over the time the eye stepped, not the frame’s', () => {
    const slow = paced(undefined, { ms: 250, metres: 10, seconds: 0.1 });
    assert.equal(slow.speed, 100);
  });

  it('keeps the speed over a frame that stepped no time', () => {
    const still = paced(
      { frameMs: 16, speed: 7 },
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
  it('spells the speed and the frame time, a row each', () => {
    assert.deepEqual(paceFields({ frameMs: 16.66, speed: 3 }), [
      'speed 3.0 m/s (11 km/h)',
      'frame 16.7 ms',
    ]);
  });
});
