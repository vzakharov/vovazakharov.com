import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clampLeft,
  isMoving,
  isPanning,
  leftAt,
  move,
  openingPan,
  type Pan,
  press,
  recrop,
  release,
  screenOf,
  SLOP,
  step,
  STEP_ACROSS,
  STEP_DURATION,
  type View,
  worldOf,
} from './pan';

/** A tablet held sideways over a world twice its width. */
const TABLET: View = { width: 1180, world: 2360, unit: 100 };

/** `pan` pressed at `x` and dragged by `by` in `steps` moves over `seconds`, from `time`. */
function dragged(
  pan: Pan,
  x: number,
  by: number,
  { time = 0, steps = 10, seconds = 0.2 } = {},
): Pan {
  let moving = press(pan, x, time);
  for (let index = 1; index <= steps; index++) {
    moving = move(
      moving,
      x + (by * index) / steps,
      time + (seconds * index) / steps,
    );
  }
  return moving;
}

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
    assert.equal(isPanning(within), false);
    assert.equal(leftAt(within, 0.2), 590);
    const lifted = release(within, 0.2);
    assert.equal(leftAt(lifted, 5), 590);
  });

  it('follows the finger 1:1 from where it crossed the slop', () => {
    const start = openingPan(TABLET);
    const crossed = move(press(start, 600, 0), 600 - SLOP - 1, 0.01);
    assert.equal(isPanning(crossed), true);
    assert.equal(leftAt(crossed, 0.01), 590);
    const on = move(crossed, 600 - SLOP - 1 - 200, 0.1);
    assert.equal(leftAt(on, 0.1), 790);
  });

  it('stops at the world’s ends however far the finger goes', () => {
    const pan = dragged(openingPan(TABLET), 1000, 2000);
    assert.equal(leftAt(pan, 0.2), 0);
  });

  it('glides on after a quick release, decaying to rest, and not after a still one', () => {
    const pan = dragged(openingPan(TABLET), 800, -200, { seconds: 0.1 });
    const at = leftAt(pan, 0.1);
    const gliding = release(pan, 0.1);
    assert.equal(isMoving(gliding, 0.1), true);
    const soon = leftAt(gliding, 0.2);
    const later = leftAt(gliding, 0.3);
    const rest = leftAt(gliding, 5);
    assert.ok(at < soon && soon < later && later < rest);
    assert.ok(soon - at > later - soon, 'the glide slows');
    assert.equal(isMoving(gliding, 5), false);
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

describe('a key', () => {
  it('steps the crop by a share of the screen, eased over the step’s time', () => {
    const pan = step(openingPan(TABLET), 1, 1);
    const across = STEP_ACROSS * TABLET.width;
    const halfway = leftAt(pan, 1 + STEP_DURATION / 2);
    assert.ok(halfway > 590 && halfway < 590 + across);
    assert.equal(leftAt(pan, 1 + STEP_DURATION), 590 + across);
  });

  it('adds up quick presses, and stops at the world’s end', () => {
    const wide = { ...TABLET, world: 4 * TABLET.width };
    const opening = leftAt(openingPan(wide), 0);
    const twice = step(step(openingPan(wide), -1, 0), -1, 0.1);
    const across = STEP_ACROSS * TABLET.width;
    assert.equal(leftAt(twice, 1), opening - 2 * across);
    const past = step(step(twice, -1, 1), -1, 1.1);
    assert.equal(leftAt(past, 2), 0);
  });
});

describe('a resize', () => {
  it('keeps the ground point at the screen’s centre there, across a new zoom', () => {
    const view = { ...TABLET };
    const panned = step(openingPan(view), 1, 0);
    const centre =
      (leftAt(panned, 1) + view.width / 2 - view.world / 2) / view.unit;
    const turned: View = { width: 820, world: 1640 * 1.2, unit: 120 };
    const there = recrop(panned, turned, 1);
    const after =
      (leftAt(there, 1) + turned.width / 2 - turned.world / 2) / turned.unit;
    assert.ok(Math.abs(after - centre) < 1e-9);
  });

  it('keeps the opening crop centred, and holds the crop inside the new world', () => {
    const turned: View = { width: 820, world: 1640, unit: 70 };
    assert.equal(leftAt(recrop(openingPan(TABLET), turned, 0), 0), 410);
    const atEnd = dragged(openingPan(TABLET), 1000, -2000);
    const narrow: View = { width: 820, world: 900, unit: 30 };
    assert.equal(leftAt(recrop(release(atEnd, 5), narrow, 5), 5), 80);
  });

  it('lets a pressed finger pan on from the new crop', () => {
    const pressed = dragged(openingPan(TABLET), 600, -100);
    const turned: View = { width: 820, world: 1640, unit: 70 };
    const there = recrop(pressed, turned, 0.2);
    const left = leftAt(there, 0.2);
    assert.equal(leftAt(move(there, 400, 0.3), 0.3), left + 100);
  });
});
