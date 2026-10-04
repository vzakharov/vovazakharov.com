/**
 * Dusk, played on a fresh meadow, its two mushrooms furnished with every
 * window and a door so their windows light, and a butterfly released: the sun
 * tapped and shot by day, half way and at dusk; a firefly tapped and shot
 * flaring; the butterfly shot roosting (`play-roost.ts`); a mouse's own run
 * shot (`play-night-run.ts`); the map opened at dusk and shot; the eye turned
 * so the moon crosses the fixed stars, and shot; the moon tapped and the
 * morning shot. Fails where the meadow does not open in full day, a tap on
 * the sun does not turn the light toward dusk and reach it, the moon leaves
 * the screen on a short turn, or a tap on the moon does not bring the day
 * back. `playDark` is the opening on a dark page, which must stand at full
 * dusk from the first frame. How it looks is for the eye.
 */

import { z } from 'zod';

import { DUSK_MS } from '../../src/pages/mushrooms/model/dusk.ts';
import {
  type Controls,
  DuskShown,
  Fireflies,
  Point,
  State,
  SunAt,
} from './mushroom-probe-answers.ts';
import {
  type Expect,
  FRAME_MS,
  inTurn,
  type Page,
  tapSun,
} from './mushroom-probe-drive.ts';
import { shootNightRun } from './play-night-run.ts';
import { releaseButterfly, shootRoosting } from './play-roost.ts';

/** Frames to half a full turn of the light. */
const HALF = Math.round(DUSK_MS / 2 / FRAME_MS);
/** Frames the harness's clock may run past a moment, its slack. */
const SLACK = 20;
/** Frames the turning key is held: a short look aside, the moon still on the screen. */
const TURN = 30;
/** Frames for the turn to come to rest. */
const REST = 60;
/** Frames for the house picker to open, and for a furnishing's pop to settle. */
const OPEN = 30;
const SETTLE = 45;
/** Frames from a tap on a firefly to its flare's height. */
const FLARING = 15;
/** Taps tried before the fireflies count as uncatchable. */
const FLARE_TRIES = 4;
/** Frames between tries: a firefly over a cap or a door yields it the tap, and circles out. */
const CIRCLING = 40;

/**
 * A firefly near the screen's middle tapped at full dusk and shot flaring
 * (`dusk-flare`). One drawn over a mushroom gives the tap to the mushroom,
 * so a miss deselects and tries again once it has circled on. Fails where
 * none is lit, or none flares in `FLARE_TRIES`.
 */
async function shootFlare(
  page: Page,
  expect: Expect,
  note: (line: string) => void,
  tries = 1,
): Promise<void> {
  const { width, height } = await page.evaluate(
    '__probe.eye()',
    z.object({ width: z.number(), height: z.number() }),
  );
  const off = ({ x, y }: z.infer<typeof Point>) =>
    Math.hypot(x - width / 2, y - height / 2);
  const lit = await page.evaluate('__probe.fireflies()', Fireflies);
  const tapped = lit
    .filter(({ x, y }) => x > 0 && x < width && y > 0 && y < height)
    .toSorted((a, b) => off(a) - off(b))[0];
  if (tries === 1) note(`fireflies lit: ${String(lit.length)}`);
  if (!tapped) {
    expect(false, 'no firefly lit on the screen at dusk');
    return;
  }
  await page.tap(tapped);
  await page.step(FLARING);
  const after = await page.evaluate('__probe.fireflies()', Fireflies);
  const flared = after.find(({ index }) => index === tapped.index);
  note(
    `firefly ${String(tapped.index)} on ${String(tapped.host)}: flare ${String(flared?.flare ?? null)}`,
  );
  if (flared !== undefined && flared.flare > 0.5) {
    await page.shoot('dusk-flare');
    return;
  }
  if (tries === FLARE_TRIES) {
    expect(false, `no tapped firefly flared in ${String(FLARE_TRIES)} tries`);
    return;
  }
  await page.evaluate(
    "__probe.scene.dispatch({ kind: 'deselect' })",
    z.unknown(),
  );
  await page.step(CIRCLING);
  await shootFlare(page, expect, note, tries + 1);
}

/** Every piece the house picker offers put into each of the opening's mushrooms, the newest first, and the picker closed and the mushroom let go, so no glow of a selection lies over the windows. */
async function furnish(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
): Promise<void> {
  const pick = async (at: z.infer<typeof Point>) => {
    await page.tap(at);
    await page.step(6);
  };
  await page.tap(controls.house);
  await page.step(OPEN);
  await inTurn(controls.housePicker, pick);
  const { mushrooms } = await page.evaluate('__probe.state()', State);
  const older = mushrooms.at(-2);
  const at =
    older === undefined
      ? null
      : await page.evaluate(
          `__probe.mushroom(${JSON.stringify(older)})`,
          Point.nullable(),
        );
  if (at) {
    await pick(at);
    await inTurn(controls.housePicker, pick);
  }
  await pick(controls.house);
  await page.evaluate(
    "__probe.scene.dispatch({ kind: 'deselect' })",
    z.unknown(),
  );
  await page.step(SETTLE);
  const { houses, furnishing } = await page.evaluate('__probe.state()', State);
  expect(
    !furnishing && houses.every(({ windows }) => windows.length > 0),
    `the houses were left ${JSON.stringify(houses)}, the picker ${furnishing ? 'open' : 'shut'}`,
  );
}

export async function playDusk(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const dusk = async () => page.evaluate('__probe.dusk()', DuskShown);
  const sunAt = async () => page.evaluate('__probe.sunAt()', SunAt);
  await furnish(page, controls, expect);
  const butterfly = await releaseButterfly(page, controls);
  const day = await dusk();
  expect(day.level === 0, `opened at dusk ${String(day.level)}, not day`);
  await page.shoot('dusk-day');
  const sun = await tapSun(page, expect);
  if (!sun) return;
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
  await shootFlare(page, expect, note);
  if (butterfly === undefined)
    expect(false, 'no butterfly came at the release');
  else await shootRoosting(page, butterfly, expect, note);
  await shootNightRun(page, expect, note);
  // The map, opened at dusk, under the wash as the meadow is.
  await page.tap(controls.map);
  await page.step(OPEN);
  await page.shoot('dusk-map');
  await page.tap(controls.map);
  await page.step(OPEN);
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
