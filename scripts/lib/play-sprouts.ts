/**
 * Spores sown and sprouted, `play-mushrooms.ts`'s run on a fresh meadow: the
 * opening clump's front cap tapped three times, one of its dots picked up,
 * and a cloud tapped. It fails where a tap leaves no dot, one off its
 * parent or one no tap reaches, where a pick-up leaves the dot or opens the flower picker, where a
 * spore sprouts before the dark sets in, or where one is still lying, or its
 * sprout is not up or not its parent's species, once the window has passed;
 * how they look is for the eye, in the frames.
 */

import { z } from 'zod';

import { SPROUT_WINDOW_MS } from '../../src/pages/mushrooms/model/sprouting.ts';
import { darkAt } from '../../src/pages/mushrooms/model/weather.ts';
import { SPORE_REACH } from '../../src/pages/mushrooms/ui/scene/mushroom-room.ts';
import {
  type Controls,
  type Expect,
  FRAME_MS,
  inTurn,
  type Page,
  Point,
  Shower,
  Sprouts,
  State,
  tapCloud,
  timedSteps,
} from './mushroom-probe.ts';

/** How many spores the play sows. */
const TAPS = 3;
/** Frames between two taps on the cap, a puff's worth. */
const BETWEEN = 12;
/** Frames from the last tap to the look at the dots, the falls landed. */
const LANDED = 60;
/** Frames the harness's clock may run past a moment, its slack. */
const SEEK = 30;
/** Frames after the sprouts are up drawn one by one. */
const TIMED = 24;
/**
 * How far off its parent's foot, in `SPORE_REACH`es, a spore may lie on
 * the screen: the reach is laid out at the clump's front foot, and the
 * ground nearer the eye stands larger.
 */
const SLACK = 1.5;

export async function playSprouts(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const read = async () => page.evaluate('__probe.sprouts()', Sprouts);
  const front = await page.evaluate(
    `__probe.state().mushrooms.reduce((front, id) => (__probe.depth(id) > __probe.depth(front) ? id : front))`,
    z.string().optional(),
  );
  const cap =
    front === undefined
      ? null
      : await page.evaluate(
          `__probe.mushroom(${JSON.stringify(front)})`,
          Point.nullable(),
        );
  if (front === undefined || cap === null) {
    expect(false, 'no tap reaches the front cap');
    return;
  }

  await inTurn(
    Array.from({ length: TAPS }, (_, index) => index),
    async () => {
      await page.tap(cap);
      await page.step(BETWEEN);
    },
  );
  await page.step(LANDED);
  const sown = await read();
  expect(
    sown.spores.length === TAPS,
    `${String(TAPS)} taps on ${front} sowed ${String(sown.spores.length)} spores`,
  );
  for (const { id, parent, shown, at, apart } of sown.spores) {
    note(`${id} of ${parent}: ${apart?.toFixed(2) ?? 'no parent'} apart`);
    expect(parent === front, `${id} is of ${parent}, not ${front}`);
    expect(shown, `${id} is not drawn once landed`);
    expect(at !== null, `no tap reaches ${id}: something is drawn over it`);
    expect(
      apart !== null && apart <= SPORE_REACH * SLACK,
      `${id} lies ${apart?.toFixed(2) ?? 'with no parent'} clump sizes off ${parent}`,
    );
  }
  await page.shoot('sprouts-1-sown');

  const picked = sown.spores.find(({ at }) => at !== null);
  if (!picked?.at) {
    expect(false, 'no tap reaches a spore');
    return;
  }
  await page.tap(picked.at);
  await page.step(BETWEEN);
  const left = await read();
  expect(
    left.spores.length === sown.spores.length - 1 &&
      left.spores.every(({ id }) => id !== picked.id),
    `a tap on ${picked.id} did not pick it up`,
  );
  expect(!left.planting, `a tap on ${picked.id} opened the flower picker`);
  await page.shoot('sprouts-2-picked');

  if ((await tapCloud(page, expect)) === undefined) return;
  const { span } = await page.evaluate('__probe.rain()', Shower);
  if (span === null) {
    expect(false, 'a tap on a cloud started no shower');
    return;
  }
  const framesTo = async (moment: number) => {
    const { clock } = await page.evaluate('__probe.state()', State);
    return Math.max(0, Math.floor((moment - clock * 1000) / FRAME_MS));
  };
  await page.step((await framesTo(darkAt(span))) - 1);
  const dry = await read();
  expect(
    dry.spores.length === left.spores.length,
    `${String(left.spores.length - dry.spores.length)} spores sprouted before the dark set in`,
  );
  await page.step((await framesTo(darkAt(span) + SPROUT_WINDOW_MS)) + SEEK);
  const up = await read();
  const cost = page.rendered.at(-1) ?? Number.NaN;
  note(
    `rain: ${String(up.sprouts.length)} sprouts, ${String(up.spores.length)} spores left, its frame ${cost.toFixed(1)} ms`,
  );
  expect(
    up.spores.length === 0,
    `${String(up.spores.length)} spores still lying past the window`,
  );
  expect(
    up.sprouts.length === left.spores.length,
    `${String(left.spores.length)} spores came up as ${String(up.sprouts.length)} sprouts`,
  );
  for (const { id, parent, ofParent, shown } of up.sprouts) {
    expect(ofParent, `${id} is not of ${parent}'s species`);
    expect(shown, `${id} is not up past the window`);
  }
  await page.shoot('sprouts-3-up');

  // The frames after the sprouts are up drawn one by one, for the run's
  // frame budget: the long steps around them each draw a single frame.
  await timedSteps(page, TIMED);
}
