import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clampLeft,
  leftAt,
  move,
  openingPan,
  press,
  release,
  screenOf,
  SLOP,
  type View,
  worldOf,
} from './pan';
import { dragged, FRAME, TABLET } from './pan.test-kit';

describe('the crop', () => {
  it('opens on the world’s middle, and stays inside the world', () => {
    const pan = openingPan(TABLET);
    assert.equal(leftAt(pan, 0), 590);
    assert.equal(clampLeft(TABLET, -50), 0);
    assert.equal(clampLeft(TABLET, 5000), 1180);
  });

  it('centres a world narrower than the screen, and never pans it', () => {
    const narrow = { ...TABLET, world: 1000 };
    assert.equal(leftAt(openingPan(narrow), 0), -90);
    const pan = dragged(openingPan(narrow), 600, -300);
    assert.equal(leftAt(pan, 0.2), -90);
    assert.equal(leftAt(release(pan, 0.2), 5), -90);
  });

  it('converts screen x to world x and back through the crop', () => {
    const pan = openingPan(TABLET);
    assert.equal(worldOf(pan, 0, 100), 690);
    assert.equal(screenOf(pan, 0, worldOf(pan, 0, 321)), 321);
  });
});

describe('a drag', () => {
  it('is a tap until the finger moves past the slop, and a tap never pans', () => {
    const start = openingPan(TABLET);
    const within = dragged(start, 600, SLOP);
    assert.equal(leftAt(within, 0.2), 590);
    const lifted = release(within, 0.2);
    assert.equal(leftAt(lifted, 5), 590);
  });

  it('follows the finger 1:1 past the slop, lagging it by the slop', () => {
    const start = openingPan(TABLET);
    const crossed = move(press(start, 600, 0), 600 - SLOP - 1, 0.01);
    assert.equal(leftAt(crossed, 0.01), 591);
    const on = move(crossed, 600 - SLOP - 1 - 200, 0.1);
    assert.equal(leftAt(on, 0.1), 791);
  });

  it('keeps the ground under the press within the slop of the finger, whatever its first step', () => {
    for (const step of [SLOP + 1, 40, 60, 200]) {
      for (const way of [-1, 1]) {
        let pan = press(openingPan(TABLET), 600, 0);
        const ground = worldOf(pan, 0, 600);
        for (let index = 1; index <= 8; index++) {
          const x = 600 + way * (step + 20 * (index - 1));
          pan = move(pan, x, index / 60);
          const lag = Math.abs(screenOf(pan, index / 60, ground) - x);
          assert.ok(
            lag <= SLOP + 1e-9,
            `a first step of ${String(step)} px lags ${String(lag)} px`,
          );
        }
      }
    }
  });

  it('moves the crop no farther than a wobbly tap drifts', () => {
    // How far a child's tap drifts over 100 ms.
    for (const drift of [4, 8, 11, 14, 18, 24]) {
      for (const steps of [3, 6, 12]) {
        for (const way of [-1, 1]) {
          const wobbled = dragged(openingPan(TABLET), 600, way * drift, {
            steps,
            seconds: 0.1,
          });
          const slid = Math.abs(leftAt(release(wobbled, 0.1), 5) - 590);
          assert.ok(
            slid <= drift,
            `a ${String(drift)} px drift in ${String(steps)} steps slid ${String(slid)} px`,
          );
        }
      }
    }
  });

  it('glides only on the finger’s velocity after it crossed the slop', () => {
    const crossed = move(press(openingPan(TABLET), 600, 0), 540, FRAME);
    const at = leftAt(crossed, FRAME);
    assert.equal(at, 590 + 60 - SLOP);
    assert.equal(
      leftAt(release(crossed, FRAME + 0.004), 5),
      at,
      'a lift right after the crossing step does not glide',
    );
    let slow = crossed;
    for (let index = 2; index <= 6; index++) {
      slow = move(slow, 540 - (index - 1), index * FRAME);
    }
    const from = leftAt(slow, 6 * FRAME);
    const glide = leftAt(release(slow, 6 * FRAME), 5) - from;
    // 60 px/s after the crossing glides on by that times `GLIDE_TAU`, 0.325 s.
    assert.ok(Math.abs(glide - 60 * 0.325) < 1e-6, `glided ${String(glide)}`);
  });

  it('stops at the world’s ends however far the finger goes', () => {
    const pan = dragged(openingPan(TABLET), 1000, 2000);
    assert.equal(leftAt(pan, 0.2), 0);
  });

  it('moves back within a frame of turning, however far it overshot an end', () => {
    const wide: View = { width: 1024, world: 2048, unit: 100 };
    for (const overshoot of [1, 100, 1000]) {
      // Pressed at 10 and dragged right by the crop's room plus the slop's lag and `overshoot`.
      const by = leftAt(openingPan(wide), 0) + SLOP + overshoot;
      const over = dragged(openingPan(wide), 10, by);
      assert.equal(leftAt(over, 0.2), 0);
      const back = move(over, 10 + by - 5, 0.2 + FRAME);
      assert.equal(
        leftAt(back, 0.2 + FRAME),
        5,
        `overshot by ${String(overshoot)}`,
      );
    }
  });

  it('glides on after a quick release, decaying to rest, and not after a still one', () => {
    const pan = dragged(openingPan(TABLET), 800, -200, { seconds: 0.1 });
    const at = leftAt(pan, 0.1);
    const gliding = release(pan, 0.1);
    const soon = leftAt(gliding, 0.2);
    const later = leftAt(gliding, 0.3);
    const rest = leftAt(gliding, 5);
    assert.ok(at < soon && soon < later && later < rest);
    assert.ok(soon - at > later - soon, 'the glide slows');
    assert.equal(leftAt(gliding, 2.1), rest, 'it rests within two seconds');
    assert.equal(leftAt(gliding, 50), rest);
    const still = release(pan, 0.5);
    assert.equal(leftAt(still, 5), at);
  });

  it('eases a glide to rest at the world’s end rather than past it', () => {
    const near = dragged(openingPan(TABLET), 800, -560, { seconds: 0.1 });
    const gliding = release(near, 0.1);
    const path = Array.from({ length: 40 }, (_, index) =>
      leftAt(gliding, 0.1 + index * 0.05),
    );
    assert.ok(path.every((left) => left <= 1180));
    assert.equal(path.at(-1), 1180);
    const steps = path.slice(1).map((left, index) => left - (path[index] ?? 0));
    assert.ok(
      steps.every(
        (each, index) => each <= (steps[index - 1] ?? Infinity) + 1e-9,
      ),
      'it only slows as it nears the end',
    );
  });

  it('is stopped by a press, where the glide stands', () => {
    const gliding = release(
      dragged(openingPan(TABLET), 800, -200, { seconds: 0.1 }),
      0.1,
    );
    const stopped = press(gliding, 400, 0.3);
    assert.equal(leftAt(stopped, 2), leftAt(gliding, 0.3));
  });
});
