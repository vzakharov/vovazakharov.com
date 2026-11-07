import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CLIMB_DOUBLINGS_PER_SECOND,
  type Eye,
  eyeAt,
  type GroundAt,
  HEIGHTS_PER_SECOND,
  IDLE,
  type Intent,
  MAX_HEIGHT,
  MIN_HEIGHT,
  step,
  TURN_RADIANS_PER_SECOND,
  withHeight,
} from './eye';

const FRAME = 1 / 60;
const flat: GroundAt = () => 0;
const cliff: GroundAt = (x) => (x > 50 ? 500 : 0);
const sea: GroundAt = () => -3000;

/** `eye` stepped by `intent` for `seconds`, frame by frame, each frame seen. */
function hold(
  eye: Eye,
  intent: Intent,
  seconds: number,
  groundAt = flat,
  seen?: (eye: Eye) => void,
): Eye {
  let now = eye;
  for (let t = 0; t < seconds - 1e-9; t += FRAME) {
    now = step(now, intent, FRAME, groundAt);
    seen?.(now);
  }
  return now;
}

const climbing: Intent = { ...IDLE, climb: 1 };
const falling: Intent = { ...IDLE, climb: -1 };

describe('climbing', () => {
  it('doubles the height every 1/CLIMB_DOUBLINGS_PER_SECOND seconds while held', () => {
    const settled = hold(eyeAt({ x: 0, y: 0, height: 100 }, flat), climbing, 1);
    const later = hold(settled, climbing, 1 / CLIMB_DOUBLINGS_PER_SECOND);
    assert.ok(Math.abs(later.height / settled.height - 2) < 0.02);
  });

  it('falls from orbit to the ground in about nine seconds', () => {
    let eye = eyeAt({ x: 0, y: 0, height: MAX_HEIGHT }, flat);
    let seconds = 0;
    while (eye.height > MIN_HEIGHT * 1.01 && seconds < 30) {
      eye = step(eye, falling, FRAME, flat);
      seconds += FRAME;
    }
    assert.ok(seconds > 8 && seconds < 11, `took ${seconds} s`);
  });

  it('stays between MIN_HEIGHT and MAX_HEIGHT', () => {
    const low = hold(eyeAt({ x: 0, y: 0, height: 10 }, flat), falling, 5);
    assert.equal(low.aim.height, MIN_HEIGHT);
    assert.ok(low.height >= MIN_HEIGHT && low.height < MIN_HEIGHT + 1e-6);
    const high = hold(eyeAt({ x: 0, y: 0, height: 1e6 }, flat), climbing, 10);
    assert.equal(high.aim.height, MAX_HEIGHT);
    assert.ok(high.height <= MAX_HEIGHT && high.height > MAX_HEIGHT - 1);
  });

  it('glides through a wheel notch rather than stepping', () => {
    const start = eyeAt({ x: 0, y: 0, height: 1000 }, flat);
    let eye = step(start, { ...IDLE, doublings: 1 }, FRAME, flat);
    let previous = start.height;
    let largest = 0;
    for (let frame = 0; frame < 120; frame += 1) {
      assert.ok(eye.height >= previous);
      largest = Math.max(largest, eye.height / previous);
      previous = eye.height;
      eye = step(eye, IDLE, FRAME, flat);
    }
    assert.ok(largest < 1.2, `a frame took ×${largest}`);
    assert.ok(Math.abs(eye.height - 2000) < 1);
  });

  it('jumps to a height at once with withHeight', () => {
    const eye = withHeight(eyeAt({ x: 0, y: 0, height: 1000 }, flat), 50);
    assert.equal(eye.height, 50);
    assert.equal(step(eye, IDLE, FRAME, flat).height, 50);
  });
});

describe('moving sideways', () => {
  const north: Intent = { ...IDLE, steer: [0, 1] };

  /** Metres crossed in one second of held steering, once settled. */
  const pace = (height: number) => {
    const settled = hold(eyeAt({ x: 0, y: 0, height }, flat), north, 1);
    return hold(settled, north, 1).y - settled.y;
  };

  it('crosses HEIGHTS_PER_SECOND heights a second', () => {
    assert.ok(Math.abs(pace(100) / (100 * HEIGHTS_PER_SECOND) - 1) < 0.01);
  });

  it('goes as fast as it is high', () => {
    assert.ok(Math.abs(pace(100_000) / pace(10) - 10_000) < 1);
  });

  it('turns screen-up into the heading', () => {
    const east = hold(
      eyeAt({ x: 0, y: 0, height: 100, heading: Math.PI / 2 }, flat),
      north,
      1,
    );
    assert.ok(east.x > 50);
    assert.ok(Math.abs(east.y) < 1e-6);
  });

  it('moves a drag of one height by one height', () => {
    const eye = hold(
      step(
        eyeAt({ x: 0, y: 0, height: 300 }, flat),
        { ...IDLE, shift: [1, 0] },
        FRAME,
        flat,
      ),
      IDLE,
      2,
    );
    assert.ok(Math.abs(eye.x - 300) < 0.01);
  });
});

describe('turning', () => {
  const right: Intent = { ...IDLE, turn: 1 };
  const forward: Intent = { ...IDLE, steer: [0, 1] };
  const strafeRight: Intent = { ...IDLE, steer: [1, 0] };

  /** How much `eye` turned in one second of held turning, once settled. */
  const rate = (height: number) => {
    const settled = hold(eyeAt({ x: 0, y: 0, height }, flat), right, 1);
    return hold(settled, right, 1).heading - settled.heading;
  };

  it('turns clockwise at TURN_RADIANS_PER_SECOND while held', () => {
    assert.ok(Math.abs(rate(100) / TURN_RADIANS_PER_SECOND - 1) < 0.01);
  });

  it('turns as fast at orbit as at the ground', () => {
    assert.ok(Math.abs(rate(MAX_HEIGHT) - rate(MIN_HEIGHT)) < 1e-9);
  });

  it('glides through a twist rather than stepping', () => {
    const start = eyeAt({ x: 0, y: 0, height: 100 }, flat);
    const first = step(start, { ...IDLE, twist: 1 }, FRAME, flat);
    assert.ok(first.heading > 0 && first.heading < 0.2);
    assert.ok(Math.abs(hold(first, IDLE, 2).heading - 1) < 1e-3);
  });

  it('keeps the heading within half a turn of north, easing the short way', () => {
    let eye = eyeAt({ x: 0, y: 0, height: 100, heading: 3 }, flat);
    eye = step(eye, { ...IDLE, twist: 0.5 }, FRAME, flat);
    assert.ok(Math.abs(eye.aim.heading - (3.5 - 2 * Math.PI)) < 1e-9);
    hold(eye, IDLE, 2, flat, (now) => {
      assert.ok(now.aim.heading - now.heading > -1e-9);
      assert.ok(now.aim.heading - now.heading < 0.5);
    });
  });

  it('moves forward along the heading', () => {
    const west = hold(
      eyeAt({ x: 0, y: 0, height: 100, heading: -Math.PI / 2 }, flat),
      forward,
      1,
    );
    assert.ok(west.x < -50);
    assert.ok(Math.abs(west.y) < 1e-6);
  });

  it('strafes square to the heading', () => {
    const facingEast = eyeAt(
      { x: 0, y: 0, height: 100, heading: Math.PI / 2 },
      flat,
    );
    const south = hold(facingEast, strafeRight, 1);
    assert.ok(south.y < -50);
    assert.ok(Math.abs(south.x) < 1e-6);
  });

  it('moves forward along the heading it has turned to', () => {
    const turned = hold(
      step(
        eyeAt({ x: 0, y: 0, height: 100 }, flat),
        { ...IDLE, twist: Math.PI },
        FRAME,
        flat,
      ),
      IDLE,
      2,
    );
    const moved = hold(turned, forward, 1);
    assert.ok(moved.y < -50);
    assert.ok(Math.abs(moved.x) < 1e-3);
  });
});

describe('over the ground', () => {
  it('never comes within MIN_HEIGHT of a raised ground', () => {
    hold(
      eyeAt({ x: 0, y: 0, height: MIN_HEIGHT, heading: Math.PI / 2 }, cliff),
      { ...IDLE, steer: [0, 1] },
      120,
      cliff,
      (eye) => {
        assert.ok(
          eye.floor + eye.height >= cliff(eye.x, eye.y) + MIN_HEIGHT - 1e-9,
        );
      },
    );
  });

  it('settles back to its height over the raised ground', () => {
    const atop = hold(
      eyeAt({ x: 100, y: 0, height: 10 }, flat),
      IDLE,
      10,
      cliff,
    );
    assert.ok(Math.abs(atop.floor - 500) < 0.01);
    assert.ok(Math.abs(atop.height - 10) < 0.01);
  });

  it('measures height over the sea from its surface', () => {
    assert.equal(eyeAt({ x: 0, y: 0, height: 5 }, sea).floor, 0);
  });
});
