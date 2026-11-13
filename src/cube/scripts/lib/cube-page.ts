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
import { inTurn } from '@/scene/scripts/lib/in-turn';
import { watchPageErrors } from '@/scene/scripts/lib/page-errors';

/** The page's viewport, which every frame is the size of. */
export const VIEWPORT = { width: 1280, height: 800 };
const { width: WIDTH, height: HEIGHT } = VIEWPORT;
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
   * Stages a frame and saves it as `file`.
   */
  shoot: (file: string, ...staged: Staged) => Promise<void>;
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

/** What a frame is staged with: the eye's pose, and what is set around it. */
export type Staged = readonly [pose: Pose, among?: InsideSet];

/** One frame of a sheet: what it is staged with, and the pill's line shown over it. */
export type SheetFrame = {
  staged: Staged;
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
    /** Runs `set`, a hook call as page source, to its end. */
    const run = async (set: string): Promise<void> => {
      await tab.evaluate(set, z.unknown(), { awaitPromise: true });
    };
    /** The hook call that stages a frame, as page source. */
    const stage = (...[pose, among = {}]: Staged): string =>
      call('setPose', source(pose), source(among));
    const save = (file: string, data: string): void => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      process.stdout.write(`shot ${path.relative(REPO_ROOT, file)}\n`);
    };
    const captured = z.object({ data: z.string() });
    /** Saves what `set` puts on screen as `file`. */
    const shot = async (file: string, set: string): Promise<void> => {
      await run(set);
      const { data } = captured.parse(
        await tab.send('Page.captureScreenshot', { format: 'png' }),
      );
      save(file, data);
    };
    await script({
      shoot: async (file, ...staged) => shot(file, stage(...staged)),
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
      sheet: async (file, frames, columns) => {
        const images: string[] = [];
        await inTurn(frames, async ({ staged, prompt }) => {
          await run(stage(...staged));
          await run(call('setPill', source(prompt)));
          const { data } = captured.parse(
            await tab.send('Page.captureScreenshot', {
              format: 'webp',
              quality: 90,
              clip: {
                x: 0,
                y: 0,
                width: WIDTH,
                height: HEIGHT,
                scale: SHEET_SCALE,
              },
            }),
          );
          images.push(data);
        });
        await run(call('setPill', 'null'));
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
