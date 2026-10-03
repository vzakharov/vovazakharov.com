/**
 * A shower, `play-mushrooms.ts`'s run on a fresh meadow: a cloud tapped
 * starts the rain; mid-shower the flowers are shut and drops fall, within
 * the frame budget; dry, the flowers are open again; and the eye turned
 * round, the rainbow shows opposite the sun. Every moment is found on
 * `model/weather.ts`'s own clock functions, so the play follows the shower's
 * timing as it changes.
 */

import { z } from 'zod';

import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  RAIN_MS,
  rainbow,
  wetness,
} from '../../src/pages/mushrooms/model/weather.ts';
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
 * Frames a flower bed takes past the dry moment to repaint every head open:
 * it repaints a few heads a frame, so this is the harness's slack, not the
 * shower's clock.
 */
const REPAINT = 30;
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
  await page.tap(cloud);
  await page.step(1);
  const started = await shower();
  expect(
    started.raining,
    `a tap on the cloud at (${cloud.x.toFixed(0)}, ${cloud.y.toFixed(0)}) started no rain`,
  );
  if (!started.raining) return;

  await page.step(MID - TIMED - 1);
  const from = page.rendered.length;
  await inTurn(
    Array.from({ length: TIMED }, (_, index) => index),
    async () => page.step(1),
  );
  const timed = page.rendered.slice(from);
  const slow = overBudget(timed);
  expect(slow === undefined, `mid-shower: ${slow ?? ''}`);
  const mid = await shower();
  note(
    `mid-shower: ${String(mid.drops)} drops, closing ${mid.closing.toFixed(2)}, median ${median(timed).toFixed(1)} ms over ${String(TIMED)} frames`,
  );
  expect(mid.drops > 0, 'mid-shower, no drop in the air');
  expect(
    mid.closing >= SHUT,
    `mid-shower, the flowers are shut only ${mid.closing.toFixed(2)} on average`,
  );
  await page.shoot('rain-1-mid');

  // Dry, in the opening view, where the flowers stand.
  await page.step(DRY + REPAINT - MID);
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
