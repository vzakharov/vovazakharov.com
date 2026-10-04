/**
 * A ground drag walks in steps however far its ground stands: a quarter-second
 * swipe from just under the horizon, where the ground under the finger is
 * farthest, to the foot of the screen walks the eye no further than the
 * cruise for that quarter second and the fling past the lift, in a few steps.
 */

import { z } from 'zod';

import {
  GLIDE_OVER,
  GLIDE_TAU,
} from '../../src/pages/mushrooms/model/glide.ts';
import {
  STRIDE_CRUISE,
  STRIDE_FLING_FASTEST,
} from '../../src/pages/mushrooms/model/stride.ts';
import { Eye, Point } from './mushroom-probe-answers.ts';
import type { Expect, Page } from './mushroom-probe-drive.ts';
import { FPS, OVER, turned } from './play-walk-checks.ts';

/** How long the swipe takes, in seconds. */
const SWIPE_SECONDS = 0.25;
/** How far under the ground's top row, and over the screen's foot, in CSS px, the swipe runs. */
const INSET = 4;
/** Fewer footsteps than this the swipe walks. */
const STEPS_FEWER = 4;

/**
 * The swipe's ends: a bare point `INSET` under the ground's top row, nothing
 * drawn over it and no tuft under it, nearest the middle, and the screen's
 * foot under it; `null` where that row has no bare point.
 */
const HORIZON_SWIPE = `(() => {
  const { width, height, camera } = __probe.scene.layout;
  const y = camera.groundTop + ${String(INSET)};
  for (let column = 0; column <= 16; column++) {
    const off = Math.ceil(column / 2) * (column % 2 === 0 ? 1 : -1);
    const point = { x: width * (0.5 + (0.4 * off) / 8), y };
    const bare = __probe.topAt(point) === null && !__probe.scene.grass?.at(__probe.toWorld(point));
    if (bare) return { from: point, to: { x: point.x, y: height - ${String(INSET)} } };
  }
  return null;
})()`;
const HorizonSwipe = z.object({ from: Point, to: Point }).nullable();

export async function playHorizonSwipe(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const ends = await page.evaluate(HORIZON_SWIPE, HorizonSwipe);
  if (ends === null) {
    note('no bare ground under the horizon: the horizon swipe is not played');
    return;
  }
  const { from, to } = ends;
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  const pressed = await eye();
  await page.drag(from, to, Math.round(FPS * SWIPE_SECONDS));
  await page.step(Math.ceil(GLIDE_OVER * FPS) + 1);
  const rested = await eye();
  const went = Math.hypot(rested.x - pressed.x, rested.y - pressed.y);
  const most = STRIDE_CRUISE * SWIPE_SECONDS + STRIDE_FLING_FASTEST * GLIDE_TAU;
  const steps = rested.steps - pressed.steps;
  expect(
    went <= most * OVER,
    `a ${String(SWIPE_SECONDS)} s swipe from the horizon (y ${from.y.toFixed(0)} to ${to.y.toFixed(0)}) walked the eye ${went.toFixed(3)} units, past the ${most.toFixed(3)} a cruise and a fling go`,
  );
  expect(
    steps < STEPS_FEWER,
    `a ${String(SWIPE_SECONDS)} s swipe from the horizon took ${String(steps)} footsteps, not fewer than ${String(STEPS_FEWER)}`,
  );
  expect(
    turned(pressed.heading, rested.heading) === 0,
    'a swipe from the horizon turned the eye',
  );
  note(
    `a ${String(SWIPE_SECONDS)} s swipe from the horizon (y ${from.y.toFixed(0)} to ${to.y.toFixed(0)}, x ${from.x.toFixed(0)}) walked ${went.toFixed(3)} units in ${String(steps)} footsteps (at most ${most.toFixed(3)})`,
  );
}
