import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import type { Pose, Quad, Taken } from '@/cube/entities/world';
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
   * Puts the eye at `pose`, `moving` in the rooms around it and the pill
   * `taken` off its shelf, and saves the frame as `file`.
   */
  shoot: (
    file: string,
    pose: Pose,
    moving?: readonly Quad[],
    taken?: Taken | null,
  ) => Promise<void>;
  /** Stops the page's clock at `ms` since the epoch. */
  setClock: (ms: number) => Promise<void>;
  /**
   * Shoots each of `frames` in turn, small, and saves them as one sheet,
   * `columns` across, read left to right and top to bottom.
   */
  sheet: (
    file: string,
    frames: readonly SheetFrame[],
    columns: number,
  ) => Promise<void>;
};

/** One frame of a sheet: what `shoot` takes, and the pill's line shown over it. */
export type SheetFrame = {
  pose: Pose;
  moving: readonly Quad[];
  taken: Taken | null;
  prompt: Parameters<CubePlayHook['setPill']>[0];
};

/** How much smaller than the page a sheet's frame is. */
const SHEET_SCALE = 0.3;

/** Page source that tiles the `images` (base64 WebP) `columns` across into one. */
const tiled = (images: readonly string[], columns: number): string => `
  (async () => {
    const images = await Promise.all(${JSON.stringify(images)}.map(async (data) => {
      const image = new Image();
      image.src = 'data:image/webp;base64,' + data;
      await image.decode();
      return image;
    }));
    const [{ width, height }] = images;
    const canvas = document.createElement('canvas');
    canvas.width = width * ${String(columns)};
    canvas.height = height * Math.ceil(images.length / ${String(columns)});
    const context = canvas.getContext('2d');
    images.forEach((image, index) => {
      context.drawImage(
        image,
        (index % ${String(columns)}) * width,
        Math.floor(index / ${String(columns)}) * height,
      );
    });
    return canvas.toDataURL('image/webp', 0.82).split(',')[1];
  })()`;

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
    const stage = async (
      pose: Pose,
      moving: readonly Quad[],
      taken: Taken | null,
    ): Promise<void> => {
      await tab.evaluate(
        call('setPose', source(pose), source(moving), source(taken)),
        z.unknown(),
        { awaitPromise: true },
      );
    };
    const save = (file: string, data: string): void => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      process.stdout.write(`shot ${path.relative(REPO_ROOT, file)}\n`);
    };
    const shot = z.object({ data: z.string() });
    await script({
      shoot: async (file, pose, moving = [], taken = null) => {
        await stage(pose, moving, taken);
        const { data } = shot.parse(
          await tab.send('Page.captureScreenshot', { format: 'png' }),
        );
        save(file, data);
      },
      sheet: async (file, frames, columns) => {
        const images: string[] = [];
        for (const { pose, moving, taken, prompt } of frames) {
          await stage(pose, moving, taken);
          await tab.evaluate(call('setPill', source(prompt)), z.unknown(), {
            awaitPromise: true,
          });
          const { data } = shot.parse(
            await tab.send('Page.captureScreenshot', {
              format: 'webp',
              quality: 90,
              clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: SHEET_SCALE },
            }),
          );
          images.push(data);
        }
        await tab.evaluate(call('setPill', 'null'), z.unknown(), {
          awaitPromise: true,
        });
        save(
          file,
          await tab.evaluate(tiled(images, columns), z.string(), {
            awaitPromise: true,
          }),
        );
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
