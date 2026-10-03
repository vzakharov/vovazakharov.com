/**
 * A shower, `play-mushrooms.ts`'s run on a fresh meadow: a cloud tapped
 * starts the rain; mid-shower the flowers are shut and drops fall; dry, the
 * flowers are open again; and the eye turned round, the rainbow shows
 * opposite the sun. The frames the heads close over, the mid-shower ones and
 * those they reopen over are each timed against the frame budget. Every
 * moment is found on `model/weather.ts`'s own clock functions and the
 * closing's steps (`closingStep`), so the play follows the shower's timing
 * as it changes.
 */

import { z } from 'zod';

import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  RAIN_MS,
  rainbow,
  wetness,
} from '../../src/pages/mushrooms/model/weather.ts';
import { closingStep } from '../../src/pages/mushrooms/ui/scene/flower-closing.ts';
import { median, overBudget } from './frame-budget.ts';
import {
  Clouds,
  type Controls,
  type Expect,
  inTurn,
  type Page,
  Shower,
  Sun,
} from './mushroom-probe.ts';

const FRAME_MS = 1000 / 60;
/** A shower as the model starts it, its clock counted from the tap. */
const SPAN = { startedAt: 0, stopsAt: RAIN_MS };
/** The first frame from the tap, from `from` on, at which `holds` does. */
const frameWhen = (from: number, holds: (ms: number) => boolean): number =>
  holds(from * FRAME_MS) ? from : frameWhen(from + 1, holds);

const MID = Math.round(RAIN_MS / 2 / FRAME_MS);
const STOP = Math.ceil(RAIN_MS / FRAME_MS);
const RAINBOW_FULL = frameWhen(STOP, (ms) => rainbow(SPAN, ms) === 1);
const DRY = frameWhen(STOP, (ms) => wetness(SPAN, ms) === 0);
/** Frames timed one by one mid-shower, the drops falling. */
const TIMED = 24;
/**
 * Frames a flower bed takes past its last closing step to repaint every head
 * at it: it repaints a few heads a frame, so this is the harness's slack, not
 * the shower's clock.
 */
const REPAINT = 30;
/** How far shut the flowers are asked to be, a step of `closingStep`, at `ms` from the tap. */
const closingAt = (ms: number): number => closingStep(wetness(SPAN, ms));
/** The last frame of the closing, from the tap: the heads repainted shut. */
const SHUT_BY = frameWhen(1, (ms) => closingAt(ms) === 1) + REPAINT;
/** The last frame of the reopening, from the tap: the heads repainted open. */
const OPEN_BY = frameWhen(STOP, (ms) => closingAt(ms) === 0) + REPAINT;
/** How far shut the flowers must be, on average, mid-shower. */
const SHUT = 0.5;
/** How far open again, dry. */
const OPEN = 0.05;

/** Frames a released `→` is left to glide to rest, the harness's slack. */
const SETTLE = 60;
/** Frames of `→` traced between looks at where the rainbow stands. */
const CHUNK = 6;
/** Frames `→` turns the eye once round, past which the rainbow is not looked for. */
const ROUND = Math.ceil(((2 * Math.PI) / TURN_CRUISE) * 60);

/**
 * `→` held till the rainbow's middle is in the screen's middle third, or
 * the eye has gone once round; returns the frames it was held.
 */
async function turnToRainbow(page: Page): Promise<number> {
  const width = await page.evaluate('innerWidth', z.number());
  await page.key('ArrowRight', 'keyDown');
  const hold = async (held: number): Promise<number> => {
    const [middle = null] = (
      await page.trace(CHUNK, '__probe.rainbowAt()', Sun)
    ).slice(-1);
    const centred =
      middle !== null && Math.abs(middle - width / 2) <= width / 6;
    return centred || held + CHUNK >= ROUND ? held + CHUNK : hold(held + CHUNK);
  };
  const held = await hold(0);
  await page.key('ArrowRight', 'keyUp');
  return held;
}

/** `frames` frames stepped one by one, each drawn; returns each one's update in ms. */
async function timedSteps(page: Page, frames: number): Promise<number[]> {
  const from = page.rendered.length;
  await inTurn(
    Array.from({ length: frames }, (_, index) => index),
    async () => page.step(1),
  );
  return page.rendered.slice(from);
}

export async function playRain(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const shower = async () => page.evaluate('__probe.rain()', Shower);
  const cloud = (await page.evaluate('__probe.clouds()', Clouds)).find(
    (point) => point !== null,
  );
  if (!cloud) {
    expect(false, 'no cloud a tap reaches on the screen');
    return;
  }
  const budget = (span: string, timed: readonly number[]) => {
    const slow = overBudget(timed);
    expect(slow === undefined, `${span}: ${slow ?? ''}`);
    return `median ${median(timed).toFixed(1)} ms over ${String(timed.length)} frames`;
  };
  await page.tap(cloud);
  const first = await timedSteps(page, 1);
  const started = await shower();
  expect(
    started.raining,
    `a tap on the cloud at (${cloud.x.toFixed(0)}, ${cloud.y.toFixed(0)}) started no rain`,
  );
  if (!started.raining) return;

  // The heads repaint as they close: frames 1 to `SHUT_BY` from the tap.
  const closingFrames = [...first, ...(await timedSteps(page, SHUT_BY - 1))];
  note(`closing: ${budget('closing', closingFrames)}`);

  await page.step(MID - TIMED - SHUT_BY);
  const timed = await timedSteps(page, TIMED);
  const mid = await shower();
  note(
    `mid-shower: ${String(mid.drops)} drops, closing ${mid.closing.toFixed(2)}, ${budget('mid-shower', timed)}`,
  );
  expect(mid.drops > 0, 'mid-shower, no drop in the air');
  expect(
    mid.closing >= SHUT,
    `mid-shower, the flowers are shut only ${mid.closing.toFixed(2)} on average`,
  );
  await page.shoot('rain-1-mid');

  // The heads repaint as they reopen: from the rain's stop to `OPEN_BY`.
  await page.step(STOP - MID);
  const reopening = await timedSteps(page, OPEN_BY - STOP);
  note(`reopening: ${budget('reopening', reopening)}`);

  // Dry, in the opening view, where the flowers stand.
  await page.step(Math.max(DRY + REPAINT - OPEN_BY, 1));
  const dry = await shower();
  expect(!dry.raining, 'the rain did not stop at its end');
  expect(
    dry.wetness === 0,
    `dry, the sky is still ${dry.wetness.toFixed(2)} wet`,
  );
  expect(
    dry.closing <= OPEN,
    `dry, the flowers are still shut ${dry.closing.toFixed(2)} on average`,
  );
  await page.shoot('rain-2-dry');

  // The rainbow stands opposite the sun, mostly behind the opening view:
  // the eye is turned on `→` till it stands in the middle third.
  const turnedFor = await turnToRainbow(page);
  await page.step(
    SETTLE + Math.max(RAINBOW_FULL - DRY - REPAINT - turnedFor - SETTLE, 0),
  );
  const after = await shower();
  const rainbowAt = await page.evaluate('__probe.rainbowAt()', Sun);
  expect(after.rainbow > 0, 'no rainbow once the rain stopped');
  expect(
    rainbowAt !== null,
    `→ held ${String(turnedFor)} frames did not bring the rainbow onto the screen`,
  );
  note(
    `rainbow ${after.rainbow.toFixed(2)} at ${rainbowAt?.toFixed(0) ?? 'no'} px after ${String(turnedFor)} frames of →`,
  );
  await page.shoot('rain-3-rainbow');
}
