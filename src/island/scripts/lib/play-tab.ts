/**
 * Driving `/island?play` from a script over CDP: opening it on an emulated
 * screen, waiting out its hook, and calling the hook against deadlines, so a
 * call that never resolves fails rather than hanging the run.
 */

import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import {
  type IslandPlayHook,
  PLAY_HOOK,
  PLAY_QUERY,
} from '@/island/shared/play';

import { type Browser, openTab, type Tab } from '@/scene/scripts/lib/cdp';
import { watchPageErrors } from '@/scene/scripts/lib/page-errors';

const POLL_MS = 250;
/** One frame of the page's seeded clock at 60 fps. */
const FRAME_MS = 1000 / 60;
/** How long the page gets to install the hook once it has loaded. */
const HOOK_TIMEOUT_MS = 30_000;
/** How long a hook promise gets: tiles fill and upload under the software rasterizer. */
const SETTLE_TIMEOUT_MS = 120_000;

export type Screen = {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly ratio: number;
  readonly mobile: boolean;
};

export const hook = `window.${PLAY_HOOK}`;

/** A hook method called with `args`, as page source. */
export const call = (method: keyof IslandPlayHook, ...args: number[]): string =>
  `${hook}.${method}(${args.map(String).join(', ')})`;

/** Polls `expression` until it is true, failing with `missing` past the deadline. */
async function until(
  tab: Tab,
  expression: string,
  missing: string,
  deadline: number,
): Promise<void> {
  if (await tab.evaluate(`Boolean(${expression})`, z.boolean())) return;
  if (Date.now() > deadline) throw new Error(missing);
  await sleep(POLL_MS);
  return until(tab, expression, missing, deadline);
}

/** Awaits the promise `source` returns in the page, failing past the deadline. */
export async function settle(
  tab: Tab,
  source: string,
  label: string,
): Promise<void> {
  const timer = new AbortController();
  const { signal } = timer;
  const late = async () => {
    await sleep(SETTLE_TIMEOUT_MS, undefined, { signal });
    throw new Error(
      `${label} did not settle in ${String(SETTLE_TIMEOUT_MS / 1000)} s`,
    );
  };
  const settled = async () => {
    try {
      await tab.evaluate(source, z.unknown(), { awaitPromise: true });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(`${label} rejected: ${error.message}`, { cause: error });
    }
  };
  try {
    await Promise.race([settled(), late()]);
  } finally {
    timer.abort();
  }
}

/**
 * Opens `/island?play` on `screen`, reporting page errors to `errors`, and
 * resolves once the hook's `ready()` has: the scene has drawn its first frame.
 */
export async function openPlay(
  browser: Browser,
  origin: string,
  screen: Screen,
  errors: string[],
): Promise<Tab> {
  const report = (message: string) => {
    errors.push(`${screen.name}: ${message}`);
  };
  const tab = await openTab(browser, report);
  await watchPageErrors(tab, report);
  const { width, height, ratio, mobile } = screen;
  await tab.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: ratio,
    mobile,
  });
  if (mobile) {
    await tab.send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5,
    });
  }
  await tab.send('Page.navigate', { url: `${origin}/island?${PLAY_QUERY}` });
  await until(
    tab,
    `document.readyState === 'complete'`,
    `/island?${PLAY_QUERY} never finished loading`,
    Date.now() + HOOK_TIMEOUT_MS,
  );
  await until(
    tab,
    `typeof ${hook}?.ready === 'function'`,
    `/island?${PLAY_QUERY} exposes no ${hook} ${String(HOOK_TIMEOUT_MS / 1000)} s after loading — the page installs no play hook (IslandPlayHook, @/island/shared/play)`,
    Date.now() + HOOK_TIMEOUT_MS,
  );
  await settle(tab, call('ready'), 'ready()');
  return tab;
}

/** Steps the seeded clock `frames` frames of `ms` each, then writes a PNG of the screen to `file`. */
export async function shoot(
  tab: Tab,
  frames: number,
  file: string,
  ms = FRAME_MS,
): Promise<void> {
  await tab.evaluate(
    `(() => { for (let i = 0; i < ${String(frames)}; i += 1) ${call('step', ms)}; return true; })()`,
    z.boolean(),
  );
  const { data } = z
    .object({ data: z.string() })
    .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
}
