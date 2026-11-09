/**
 * Plays `/island` on a phone and a desktop screen: opens `/island?play`, waits
 * for the scene, then puts the eye at each of the world's shots
 * (`lib/shot-sets.ts`), sets the hour a shot names, steps a few frames on the
 * page's seeded clock and shoots `<screen>-<shot>.png`. It fails on any page
 * error or console error, and
 * prints per screen the ms the world's field took to build, the renderer's
 * backend and the median frame time beside
 * the machine's load average, which is what a slow median has to be read
 * against.
 *
 *   pnpm play:island                       # build the vova export, then play it
 *   pnpm play:island --no-build            # play the one already in sites/vova/out
 *   pnpm play:island --screens phone       # only those screens
 *   pnpm play:island --out tmp/island      # frames there instead
 *   pnpm play:island --world 2             # world #2, frames prefixed world2-
 *

 * The page drives itself through the hook `@/island/shared/play` declares; a
 * hook call that returns a promise is awaited against a deadline, so a call
 * that never resolves fails rather than hanging the run.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import {
  buildExport,
  call,
  hook,
  openPlay,
  type Screen,
  settle,
  shoot,
  VOVA_EXPORT,
  worldArgument,
  worldPrefix,
} from './lib/play-tab';
import { type Shot, shotsFor } from './lib/shot-sets';

import { flag } from '@/kernel/scripts/lib/argv';
import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { launch, type Tab } from '@/scene/scripts/lib/cdp';
import { median } from '@/scene/scripts/lib/median';

const FRAMES = path.resolve(
  flag('out') ??
    path.join(
      REPO_ROOT,
      'docs/remove-before-merging/island/bite-1-descent/frames',
    ),
);
/** Frames stepped at each place before its shot. */
const FRAMES_PER_SHOT = 5;
const WORLD = worldArgument();

const SCREENS: readonly Screen[] = [
  { name: 'phone', width: 390, height: 844, ratio: 3, mobile: true },
  { name: 'desktop', width: 1440, height: 900, ratio: 1, mobile: false },
];

type Played = { readonly frames: number[]; readonly backend: string };

async function play(tab: Tab, screen: Screen): Promise<Played> {
  const shootAt = async ([shot, ...rest]: readonly Shot[]): Promise<void> => {
    if (shot === undefined) return;
    const { name, place, hours } = shot;
    if (hours !== undefined)
      await tab.evaluate(`${call('setTime', hours)}, true`, z.boolean());
    await settle(tab, place, place.slice(hook.length + 1));
    await shoot(
      tab,
      FRAMES_PER_SHOT,
      path.join(FRAMES, `${worldPrefix(WORLD)}${screen.name}-${name}.png`),
    );
    process.stdout.write(`${screen.name}: shot ${name}\n`);
    await shootAt(rest);
  };
  await shootAt(shotsFor(WORLD));
  return {
    frames: await tab.evaluate(call('frameMs'), z.array(z.number())),
    backend: await tab.evaluate(call('backend'), z.string()),
  };
}

async function main(): Promise<void> {
  buildExport();
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
    const tab = await openPlay(browser, origin, screen, errors, WORLD);
    try {
      const built = await tab.evaluate(call('buildMs'), z.number());
      process.stdout.write(
        `${screen.name}: world #${WORLD} built in ${built.toFixed(0)} ms\n`,
      );
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
    await withPrintOrigin(
      { serve: 'export', dir: VOVA_EXPORT },
      async (origin) =>
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
