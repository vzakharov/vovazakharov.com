/**
 * Plays `/island` on a phone and a desktop screen: opens `/island?play`, waits
 * for the scene, then puts the eye at each of five heights — orbit, 1,000 km,
 * 10 km, 100 m, 2 m — steps a few frames on the page's seeded clock and shoots
 * `<screen>-<height>.png`. It fails on any page error or console error, and
 * prints per screen the renderer's backend and the median frame time beside
 * the machine's load average,
 * which is what a slow median has to be read against.
 *
 *   pnpm play:island                       # build the vova export, then play it
 *   pnpm play:island --no-build            # play the one already in sites/vova/out
 *   pnpm play:island --screens phone       # only those screens
 *   pnpm play:island --out tmp/island      # frames there instead
 *
 * The page drives itself through the hook `@/island/shared/play` declares; a
 * hook call that returns a promise is settled by polling, so a call that never
 * resolves fails on a deadline rather than hanging the run.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import {
  type IslandPlayHook,
  PLAY_HOOK,
  PLAY_QUERY,
} from '@/island/shared/play';

import { flag, given } from '@/kernel/scripts/lib/argv';
import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import {
  type Browser,
  launch,
  openTab,
  type Tab,
} from '@/scene/scripts/lib/cdp';

const OUT = path.join(REPO_ROOT, 'sites/vova/out');
const FRAMES = path.resolve(
  flag('out') ??
    path.join(
      REPO_ROOT,
      'docs/remove-before-merging/island/bite-1-descent/frames',
    ),
);
const POLL_MS = 250;
const FRAME_MS = 1000 / 60;
/** Frames stepped at each height before its shot. */
const FRAMES_PER_HEIGHT = 5;
/** How long the page gets to install the hook once it has loaded. */
const HOOK_TIMEOUT_MS = 30_000;
/** How long a hook promise gets: tiles fill and upload under the software rasterizer. */
const SETTLE_TIMEOUT_MS = 120_000;

const SCREENS = [
  { name: 'phone', width: 390, height: 844, ratio: 3, mobile: true },
  { name: 'desktop', width: 1440, height: 900, ratio: 1, mobile: false },
] as const;

type Screen = (typeof SCREENS)[number];

/** Each height by the name its frame is filed under, in metres above the ground. */
const HEIGHTS = [
  ['orbit', 20_000_000],
  ['1000km', 1_000_000],
  ['10km', 10_000],
  ['100m', 100],
  ['2m', 2],
] as const;

const hook = `window.${PLAY_HOOK}`;

/** A hook method called with `args`, as page source. */
const call = (method: keyof IslandPlayHook, ...args: number[]): string =>
  `${hook}.${method}(${args.map(String).join(', ')})`;

const Settled = z.object({
  done: z.boolean().optional(),
  error: z.string().optional(),
});

const ConsoleCalled = z.object({
  type: z.string(),
  args: z.array(
    z.object({
      value: z.unknown().optional(),
      description: z.string().optional(),
    }),
  ),
});

const LogEntry = z.object({
  entry: z.object({
    level: z.string(),
    text: z.string(),
    url: z.string().optional(),
  }),
});

function median(values: readonly number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const [low, high] = [sorted[middle - 1], sorted[middle]];
  if (high === undefined) return Number.NaN;
  return sorted.length % 2 === 0 && low !== undefined ? (low + high) / 2 : high;
}

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

/** Starts the promise `source` returns in the page and waits for it to settle. */
async function settle(tab: Tab, source: string, label: string): Promise<void> {
  await tab.evaluate(
    `(() => { const s = (window.__settled = {}); Promise.resolve().then(() => ${source}).then(() => { s.done = true; }, (e) => { s.error = String(e && e.stack ? e.stack : e); }); return true; })()`,
    z.boolean(),
  );
  const deadline = Date.now() + SETTLE_TIMEOUT_MS;
  const poll = async (): Promise<void> => {
    const { done, error } = await tab.evaluate('window.__settled', Settled);
    if (error !== undefined) throw new Error(`${label} rejected: ${error}`);
    if (done === true) return;
    if (Date.now() > deadline) {
      throw new Error(
        `${label} did not settle in ${String(SETTLE_TIMEOUT_MS / 1000)} s`,
      );
    }
    await sleep(POLL_MS);
    return poll();
  };
  return poll();
}

async function open(
  browser: Browser,
  origin: string,
  screen: Screen,
  errors: string[],
): Promise<Tab> {
  const report = (message: string) => {
    errors.push(`${screen.name}: ${message}`);
  };
  const tab = await openTab(browser, report);
  tab.on('Runtime.consoleAPICalled', (params) => {
    const { type, args } = ConsoleCalled.parse(params);
    if (type !== 'error') return;
    report(
      `console.error: ${args.map((arg) => arg.description ?? String(arg.value)).join(' ')}`,
    );
  });
  // Errors the browser logs itself: a failed load, a blocked request.
  tab.on('Log.entryAdded', (params) => {
    const { entry } = LogEntry.parse(params);
    if (entry.level === 'error') {
      report(
        `${entry.text}${entry.url === undefined ? '' : ` (${entry.url})`}`,
      );
    }
  });
  await tab.send('Log.enable');
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
  return tab;
}

type Played = { readonly frames: number[]; readonly backend: string };

async function play(tab: Tab, screen: Screen): Promise<Played> {
  await until(
    tab,
    `typeof ${hook}?.ready === 'function'`,
    `/island?${PLAY_QUERY} exposes no ${hook} ${String(HOOK_TIMEOUT_MS / 1000)} s after loading — the page installs no play hook (IslandPlayHook, @/island/shared/play)`,
    Date.now() + HOOK_TIMEOUT_MS,
  );
  await settle(tab, call('ready'), 'ready()');
  const shootAt = async ([height, ...rest]: ReadonlyArray<
    (typeof HEIGHTS)[number]
  >): Promise<void> => {
    if (height === undefined) return;
    const [name, metres] = height;
    await settle(
      tab,
      call('setHeight', metres),
      `setHeight(${String(metres)})`,
    );
    await tab.evaluate(
      `(() => { for (let i = 0; i < ${String(FRAMES_PER_HEIGHT)}; i += 1) ${call('step', FRAME_MS)}; return true; })()`,
      z.boolean(),
    );
    const { data } = z
      .object({ data: z.string() })
      .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
    fs.writeFileSync(
      path.join(FRAMES, `${screen.name}-${name}.png`),
      Buffer.from(data, 'base64'),
    );
    process.stdout.write(`${screen.name}: shot ${name}\n`);
    await shootAt(rest);
  };
  await shootAt(HEIGHTS);
  return {
    frames: await tab.evaluate(call('frameMs'), z.array(z.number())),
    backend: await tab.evaluate(call('backend'), z.string()),
  };
}

async function main(): Promise<void> {
  if (!given('no-build')) {
    const built = spawnSync('pnpm', ['build', 'vova'], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
    if (built.status !== 0) throw new Error('The vova build failed');
  }
  fs.mkdirSync(FRAMES, { recursive: true });
  const browser = await launch();
  const errors: string[] = [];
  const failures: string[] = [];
  // One screen after another, since they all drive the one browser.
  const playFrom = async (
    origin: string,
    [screen, ...rest]: readonly Screen[],
  ): Promise<void> => {
    if (screen === undefined) return;
    const tab = await open(browser, origin, screen, errors);
    try {
      const { frames, backend } = await play(tab, screen);
      const load = os
        .loadavg()
        .map((average) => average.toFixed(2))
        .join(' / ');
      process.stdout.write(
        `${screen.name}: ${backend}, frame median ${median(frames).toFixed(1)} ms over ${String(frames.length)} frames, load average ${load} on ${String(os.cpus().length)} cores\n`,
      );
      if (frames.length === 0)
        failures.push(`${screen.name}: frameMs() timed no frame`);
    } catch (error) {
      failures.push(
        `${screen.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await browser.send('Target.disposeBrowserContext', {
        browserContextId: tab.contextId,
      });
    }
    return playFrom(origin, rest);
  };
  try {
    const only = flag('screens')?.split(',');
    await withPrintOrigin({ serve: 'export', dir: OUT }, async (origin) =>
      playFrom(
        origin,
        SCREENS.filter(({ name }) => only?.includes(name) ?? true),
      ),
    );
  } finally {
    await browser.close();
    for (const line of [...errors, ...failures]) {
      process.stderr.write(`${line}\n`);
    }
    process.stdout.write(`Frames in ${path.relative(REPO_ROOT, FRAMES)}/\n`);
  }
  if (errors.length > 0 || failures.length > 0) process.exitCode = 1;
}

await main();
