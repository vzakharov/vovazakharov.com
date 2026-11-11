/**
 * Shoots `/cube` through floor 1's hole from both sides, on the dev server:
 * from floor 1 looking down into it, and from the floor-2 room beneath looking
 * up. Chromium runs WebGPU on SwiftShader, so the frames say what the scene
 * draws, not how fast. It fails on any page error, and prints the adapter.
 *
 *   pnpm play:cube                   # frames to tmp/cube/
 *   pnpm play:cube --out <dir>       # frames there instead
 */

import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import { holeQuarter, planted, type Pose } from '@/cube/entities/world';
import {
  type CubePlayHook,
  PLAY_HOOK,
  PLAY_QUERY,
} from '@/cube/pages/cube/index.node-safe';

import { flag } from '@/kernel/scripts/lib/argv';
import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import {
  launch,
  openTab,
  type Tab,
  WEBGPU_FLAGS,
} from '@/scene/scripts/lib/cdp';
import { watchPageErrors } from '@/scene/scripts/lib/page-errors';

const FRAMES = path.resolve(flag('out') ?? path.join(REPO_ROOT, 'tmp/cube'));
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
const source = ({ n, x, y, u, v, eyeAbove, yaw, elevation }: Pose): string =>
  `{ n: ${String(n)}, x: ${String(x)}n, y: ${String(y)}n, u: ${String(u)}, v: ${String(v)}, eyeAbove: ${String(eyeAbove)}, yaw: ${String(yaw)}, elevation: ${String(elevation)} }`;

async function until(tab: Tab, expression: string, deadline: number) {
  if (await tab.evaluate(`Boolean(${expression})`, z.boolean())) return;
  if (Date.now() > deadline) {
    throw new Error(`/cube?${PLAY_QUERY}: ${expression} never held`);
  }
  await sleep(POLL_MS);
  await until(tab, expression, deadline);
}

/** The two shots by file name, around the hole floor 1's room (0, 0) holds. */
async function shots(): Promise<ReadonlyArray<readonly [string, Pose]>> {
  const quarter = await holeQuarter(planted, 1, 0n, 0n);
  if (quarter === null) throw new Error('Floor 1 has no hole');
  const { qx, qy } = quarter;
  // The hole's middle in floor 1's room sides; the eye stands west of it. At
  // 0.18 back, the room's north-west corner sits on the camera plane, and
  // SwiftShader clips the slab around it with depth loose enough to let the
  // tops of floor 2's walls through as a line.
  const u = qx * 0.5 + 0.25;
  const v = qy * 0.5 + 0.25;
  const back = 0.24;
  const down: Pose = {
    n: 1,
    x: 0n,
    y: 0n,
    u: u - back,
    v,
    eyeAbove: 0.32,
    yaw: 0,
    elevation: -Math.atan2(0.32, back),
  };
  // Floor 2's room under that quarter, its own hole-side ceiling half a side up.
  const reach = 0.24;
  const up: Pose = {
    n: 2,
    x: BigInt(qx),
    y: BigInt(qy),
    u: 0.5 - reach,
    v: 0.5,
    eyeAbove: 0.16,
    yaw: 0,
    elevation: Math.atan2(0.5 - 0.16, reach),
  };
  return [
    ['floor-1-down.png', down],
    ['floor-2-up.png', up],
  ];
}

/** Shoots each of `planned` in turn, since they all move the one eye. */
async function shoot(
  tab: Tab,
  [shot, ...rest]: ReadonlyArray<readonly [string, Pose]>,
): Promise<void> {
  if (shot === undefined) return;
  const [name, pose] = shot;
  await tab.evaluate(call('setPose', source(pose)), z.unknown(), {
    awaitPromise: true,
  });
  const { data } = z
    .object({ data: z.string() })
    .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
  const file = path.join(FRAMES, name);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  process.stdout.write(`shot ${path.relative(REPO_ROOT, file)}\n`);
  await shoot(tab, rest);
}

async function main(): Promise<void> {
  fs.mkdirSync(FRAMES, { recursive: true });
  const planned = await shots();
  const browser = await launch(WEBGPU_FLAGS);
  const errors: string[] = [];
  const report = (message: string) => {
    errors.push(message);
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
      const deadline = Date.now() + HOOK_TIMEOUT_MS;
      await until(tab, `typeof ${hook}?.ready === 'function'`, deadline);
      await tab.evaluate(call('ready'), z.unknown(), { awaitPromise: true });
      const adapter = await tab.evaluate(call('adapter'), z.string());
      process.stdout.write(`adapter: ${adapter}\n`);
      await shoot(tab, planned);
    });
  } finally {
    await browser.close();
  }
  if (errors.length > 0) {
    throw new Error(`The page reported errors:\n${errors.join('\n')}`);
  }
}

await main();
