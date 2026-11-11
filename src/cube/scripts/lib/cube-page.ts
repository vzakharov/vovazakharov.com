import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import type { Pose } from '@/cube/entities/world';
import {
  type CubePlayHook,
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

/** Page source for `pose`, its rooms as BigInt literals. */
const source = (pose: Pose): string => {
  const { n, x, y, u, v, eyeAbove, scale, yaw, elevation } = pose;
  return `{ n: ${String(n)}, x: ${String(x)}n, y: ${String(y)}n, u: ${String(u)}, v: ${String(v)}, eyeAbove: ${String(eyeAbove)}, scale: ${String(scale)}, yaw: ${String(yaw)}, elevation: ${String(elevation)} }`;
};

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
  /** Puts the eye at `pose` and saves the frame as `file`. */
  shoot: (file: string, pose: Pose) => Promise<void>;
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
    await script({
      shoot: async (file, pose) => {
        await tab.evaluate(call('setPose', source(pose)), z.unknown(), {
          awaitPromise: true,
        });
        const { data } = z
          .object({ data: z.string() })
          .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
        process.stdout.write(`shot ${path.relative(REPO_ROOT, file)}\n`);
      },
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
