/**
 * Dusk, played on a fresh meadow: the sun tapped and shot by day, half way
 * and at dusk; the eye turned so the moon crosses the fixed stars, and shot;
 * the moon tapped and the morning shot. Fails where the meadow does not open
 * in full day, a tap on the sun does not turn the light toward dusk and reach
 * it, the moon leaves the screen on a short turn, or a tap on the moon does
 * not bring the day back. `playDark` is the opening on a dark page, which
 * must stand at full dusk from the first frame. How it looks is for the eye.
 */

import { z } from 'zod';

import { DUSK_MS } from '../../src/pages/mushrooms/model/dusk.ts';
import { type Controls, DuskShown, SunAt } from './mushroom-probe-answers.ts';
import { type Expect, FRAME_MS, type Page } from './mushroom-probe-drive.ts';

/** Frames to half a full turn of the light. */
const HALF = Math.round(DUSK_MS / 2 / FRAME_MS);
/** Frames the harness's clock may run past a moment, its slack. */
const SLACK = 20;
/** Frames the turning key is held: a short look aside, the moon still on the screen. */
const TURN = 30;
/** Frames for the turn to come to rest. */
const REST = 60;

export async function playDusk(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const dusk = async () => page.evaluate('__probe.dusk()', DuskShown);
  const sunAt = async () => page.evaluate('__probe.sunAt()', SunAt);
  const day = await dusk();
  expect(day.level === 0, `opened at dusk ${String(day.level)}, not day`);
  const sun = await sunAt();
  await page.shoot('dusk-day');
  if (!sun) {
    expect(false, 'no sun on the screen to tap');
    return;
  }
  await page.tap(sun);
  await page.step(HALF);
  const mid = await dusk();
  note(`half way: ${mid.level.toFixed(2)} toward ${mid.toward}`);
  expect(
    mid.toward === 'dusk' && mid.level > 0 && mid.level < 1,
    'the sun’s tap did not turn the light toward dusk',
  );
  await page.shoot('dusk-mid');
  await page.step(HALF + SLACK);
  expect((await dusk()).level === 1, 'the light never reached dusk');
  await page.shoot('dusk-dusk');
  // Turned toward the moon's side, so it crosses the screen's middle.
  const width = await page.evaluate('__probe.eye().width', z.number());
  const toward = sun.x < width / 2 ? 'ArrowLeft' : 'ArrowRight';
  await page.key(toward, 'keyDown');
  await page.step(TURN);
  await page.key(toward, 'keyUp');
  await page.step(REST);
  const moon = await sunAt();
  note(`moon from ${String(sun.x)} to ${String(moon?.x ?? null)}`);
  await page.shoot('dusk-moon');
  if (!moon || moon.x === sun.x) {
    expect(false, 'the moon left the screen, or never moved, on a short turn');
    return;
  }
  await page.tap(moon);
  await page.step(HALF);
  const fading = await dusk();
  expect(
    fading.toward === 'day' && fading.level < 1,
    'the moon’s tap did not turn the light toward day',
  );
  await page.step(HALF + SLACK);
  expect((await dusk()).level === 0, 'the light never came back to day');
  await page.shoot('dusk-morning');
}

/** The meadow on a dark page: at full dusk from the first frame. */
export async function playDark(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
): Promise<void> {
  const opened = await page.evaluate('__probe.dusk()', DuskShown);
  expect(
    opened.level === 1 && opened.toward === 'dusk',
    `a dark page opened at ${String(opened.level)}, not dusk`,
  );
  await page.shoot('dusk-dark-open');
}
