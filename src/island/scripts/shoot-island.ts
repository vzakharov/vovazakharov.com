/**
 * Shoots stills of `/island` at places, heights, headings and hours you name,
 * in the fine look by default, which `play-island` and `film-descent` — plain
 * — do not reach.
 *
 *   pnpm shoot:island --set beauty                  # build, then shoot the set
 *   pnpm shoot:island --no-build --set beauty       # reuse sites/vova/out
 *   pnpm shoot:island --no-build --shot a:44,10,560,0,15,3
 *   pnpm shoot:island --no-build --look plain --set beauty
 *
 * The backend is WebGL2 by default, where the fine look draws everything but
 * the rippled sea. `--backend webgpu` asks for SwiftShader's Vulkan, whose
 * device a container without a GPU loses at the first tile upload (`Instance
 * dropped`, then `createBuffer failed`), so the move never settles: it is for
 * a machine with a GPU.
 *
 * Options: `--world N` (default 0, Earth), `--out <dir>` (default
 * tmp/island-shots), `--size WxH` (default 1600x1000, scale 1), `--look
 * plain|swift|fine` (default fine), `--backend webgl2|webgpu` (default webgl2; the
 * run fails when the page draws on the other), `--set <name>` (known: see
 * `SHOT_SETS`), and any number of `--shot
 * name:lat,lon,height[,headingDeg[,lookDeg[,hours]]]`. Units: lat, lon, heading
 * (clockwise from north) and look (degrees above the pitch the height gives)
 * are degrees, converted to the radians the hook takes; height is metres;
 * hours are the hook's `setTime` hours past the opening's sun (24 a day), and
 * are unset when omitted, keeping the clock. A shot keeps no heading, look or
 * hour from the one before: each sets its own (north, 0, and the last hour).
 *
 * Writes `<out>/<name>.jpg` (quality 85) and prints one line per shot. Under
 * software raster a move takes tens of seconds, so run nothing beside it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { LOOKS } from '@/island/shared/play';

import {
  buildExport,
  call,
  openPlay,
  type Screen,
  settle,
  shoot,
  VOVA_EXPORT,
  worldArgument,
} from './lib/play-tab';
import {
  aimOf,
  parseShot,
  parseSize,
  SHOT_SETS,
  shotSpecs,
  type Spot,
} from './lib/shoot-args';

import { flag, given } from '@/kernel/scripts/lib/argv';
import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { launch, WEBGPU_FLAGS } from '@/scene/scripts/lib/cdp';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const JPEG_QUALITY = 85;
/** Frames stepped before the screenshot. */
const FRAMES_PER_SHOT = 2;
/** How long a move gets to bring its tiles in under the software rasterizer. */
const SETTLE_MS = 600_000;
const BACKENDS = ['webgl2', 'webgpu'] as const;

const oneOf = <Value extends string>(
  name: string,
  values: readonly Value[],
  fallback: Value,
): Value => {
  const asked = flag(name) ?? fallback;
  const found = values.find((value) => value === asked);
  if (found === undefined) {
    throw new Error(`--${name} ${asked}: expected ${values.join('|')}`);
  }
  return found;
};

function requestedShots(): readonly Spot[] {
  const setName = flag('set');
  const set = setName === undefined ? [] : SHOT_SETS[setName];
  if (set === undefined) {
    throw new Error(
      `--set ${String(setName)}: known sets are ${Object.keys(SHOT_SETS).join(', ')}`,
    );
  }
  const shots = [
    ...set,
    ...shotSpecs(process.argv).map((spec) => parseShot(spec)),
  ];
  if (shots.length === 0) {
    throw new Error('Nothing to shoot: give --set <name> or --shot <spec>');
  }
  return shots;
}

async function main(): Promise<void> {
  if (given('help')) {
    process.stdout.write(
      'See the header of src/island/scripts/shoot-island.ts for the options.\n',
    );
    return;
  }
  const world = worldArgument('0');
  const look = oneOf('look', LOOKS, 'fine');
  const backend = oneOf('backend', BACKENDS, 'webgl2');
  const size = parseSize(flag('size') ?? '1600x1000');
  const out = path.resolve(
    flag('out') ?? path.join(REPO_ROOT, 'tmp/island-shots'),
  );
  const shots = requestedShots();
  const screen: Screen = { name: 'shoot', ...size, ratio: 1, mobile: false };

  buildExport();
  fs.mkdirSync(out, { recursive: true });
  const browser = await launch(backend === 'webgpu' ? WEBGPU_FLAGS : []);
  const errors: string[] = [];
  try {
    await withPrintOrigin(
      { serve: 'export', dir: VOVA_EXPORT },
      async (origin) => {
        const tab = await openPlay(browser, origin, screen, errors, world);
        const drawn = await tab.evaluate(call('backend'), z.string());
        if (drawn !== backend) {
          throw new Error(
            `Asked for the ${backend} backend, the page drew on ${drawn}`,
          );
        }
        await tab.evaluate(call('setLook', look), z.unknown());
        await inTurn(shots, async (spot) => {
          const { name, latDeg, lonDeg, height, hours } = spot;
          const aim = aimOf(spot);
          if (hours !== undefined) {
            await tab.evaluate(call('setTime', hours), z.unknown());
          }
          const place = call('moveTo', latDeg, lonDeg, height);
          await settle(tab, place, `${name} moveTo`, SETTLE_MS);
          const turn = call('turnTo', aim.heading);
          await settle(tab, turn, `${name} turnTo`, SETTLE_MS);
          const lookUp = call('lookTo', aim.look);
          await settle(tab, lookUp, `${name} lookTo`, SETTLE_MS);
          const file = path.join(out, `${name}.jpg`);
          await shoot(tab, FRAMES_PER_SHOT, file, undefined, {
            format: 'jpeg',
            quality: JPEG_QUALITY,
          });
          const times = await tab.evaluate(
            call('frameMs'),
            z.array(z.number()),
          );
          const last = times.at(-1);
          process.stdout.write(
            `${name}  ${drawn}  ${last === undefined ? 'n/a' : last.toFixed(0)} ms  ${path.relative(REPO_ROOT, file)}\n`,
          );
        });
      },
    );
  } finally {
    await browser.close();
  }
  if (errors.length > 0) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
