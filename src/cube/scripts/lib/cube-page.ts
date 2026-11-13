import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import type { Outside, Pose } from '@/cube/entities/world';
import {
  type CubePlayHook,
  type InsideSet,
  type OutsideLens,
  type OutsideSet,
  PLAY_HOOK,
  PLAY_QUERY,
} from '@/cube/pages/cube/index.node-safe';

import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import {
  launch,
  openTab,
  type Tab,
  WEBGPU_FLAGS,
} from '@/scene/scripts/lib/cdp';
import { watchPageErrors } from '@/scene/scripts/lib/page-errors';

const WIDTH = 1280;
const HEIGHT = 800;
/** How long the page gets to compile, load and install its hook. */
const HOOK_TIMEOUT_MS = 180_000;
const POLL_MS = 500;
const hook = `window.${PLAY_HOOK}`;

/** A hook method called with `args`, as page source. */
const call = (method: keyof CubePlayHook, ...args: string[]): string =>
  `${hook}.${method}(${args.join(', ')})`;

/** Page source for `value`: its JSON, with every bigint a BigInt literal. */
function source(value: unknown): string {
  if (typeof value === 'bigint') return `${String(value)}n`;
  if (Array.isArray(value))
    return `[${value.map((item) => source(item)).join(', ')}]`;
  if (typeof value === 'object' && value !== null) {
    const members = Object.entries(value).map(
      ([key, member]) => `${JSON.stringify(key)}: ${source(member)}`,
    );
    return `{ ${members.join(', ')} }`;
  }
  return JSON.stringify(value);
}

async function until(tab: Tab, expression: string, deadline: number) {
  if (await tab.evaluate(`Boolean(${expression})`, z.boolean())) return;
  if (Date.now() > deadline) {
    throw new Error(`/cube?${PLAY_QUERY}: ${expression} never held`);
  }
  await sleep(POLL_MS);
  await until(tab, expression, deadline);
}

/** What a script does with `/cube` once its hook is up. */
export type CubePage = {
  /**
   * Puts the eye at `pose`, `among` set around it, and saves the frame as
   * `file`.
   */
  shoot: (file: string, pose: Pose, among?: InsideSet) => Promise<void>;
  /**
   * Puts the eye outside the cube at `eye`, seeing through `lens` — the
   * page's own where none is given — with `among` set, and saves the frame
   * as `file`.
   */
  shootOutside: (
    file: string,
    eye: Outside,
    lens?: OutsideLens,
    among?: OutsideSet,
  ) => Promise<void>;
  /** Stops the page's clock at `ms` since the epoch. */
  setClock: (ms: number) => Promise<void>;
};

/**
 * Runs `script` against `/cube?play` on the dev server, in a Chromium that
 * draws WebGPU on SwiftShader — so its frames say what the scene draws, not
 * how fast. Prints the adapter, and fails on any error the page reported.
 */
export async function withCubePage(
  script: (page: CubePage) => Promise<void>,
): Promise<void> {
  const browser = await launch(WEBGPU_FLAGS);
  // A page that reported an error may never draw the frame the script waits
  // for, so the first one ends the run rather than the wait's timeout.
  const failed = Promise.withResolvers<never>();
  failed.promise.catch(() => null);
  const report = (message: string) => {
    failed.reject(new Error(`The page reported an error:\n${message}`));
  };
  const drive = async (tab: Tab): Promise<void> => {
    const deadline = Date.now() + HOOK_TIMEOUT_MS;
    await until(tab, `typeof ${hook}?.ready === 'function'`, deadline);
    await tab.evaluate(call('ready'), z.unknown(), { awaitPromise: true });
    const adapter = await tab.evaluate(call('adapter'), z.string());
    process.stdout.write(`adapter: ${adapter}\n`);
    /** Saves what `set`, a hook call as page source, puts on screen as `file`. */
    const shot = async (file: string, set: string): Promise<void> => {
      await tab.evaluate(set, z.unknown(), { awaitPromise: true });
      const { data } = z
        .object({ data: z.string() })
        .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      process.stdout.write(`shot ${path.relative(REPO_ROOT, file)}\n`);
    };
    await script({
      shoot: async (file, pose, among = {}) =>
        shot(file, call('setPose', source(pose), source(among))),
      shootOutside: async (file, eye, lens, among = {}) =>
        shot(
          file,
          call(
            'setEye',
            source(eye),
            lens ? source(lens) : 'undefined',
            source(among),
          ),
        ),
      setClock: async (ms) => {
        await tab.evaluate(call('setClock', String(ms)), z.unknown());
      },
    });
  };
  try {
    await withPrintOrigin({ serve: 'dev', site: 'vova' }, async (origin) => {
      const tab = await openTab(browser, report);
      await watchPageErrors(tab, report);
      await tab.send('Emulation.setDeviceMetricsOverride', {
        width: WIDTH,
        height: HEIGHT,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await tab.send('Page.navigate', { url: `${origin}/cube?${PLAY_QUERY}` });
      await Promise.race([drive(tab), failed.promise]);
    });
  } finally {
    await browser.close();
  }
}
