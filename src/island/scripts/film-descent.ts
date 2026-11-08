/**
 * Films `/island`'s descent: one continuous fall from orbit to two metres over
 * the head of the inlet between Блаблания and Фейсис, shot frame by frame on
 * the page's seeded clock — each frame waits until every tile its view
 * selects is uploaded, so the film is as smooth as the scene however slowly
 * the machine renders it — then encoded with ffmpeg into an H.264 mp4 per
 * screen, and a still from it as `<screen>-thumb.webp`.
 *
 *   pnpm film:island                          # build the vova export, then film it
 *   pnpm film:island --no-build               # film the one already in sites/vova/out
 *   pnpm film:island --screens desktop,phone  # those screens (default: desktop)
 *   pnpm film:island --seconds 30 --fps 30    # the fall's length and rate
 *   pnpm film:island --thumb-at 3000          # the still from 3 km up (default: 50 km)
 *   pnpm film:island --out tmp/descent        # frames and films there
 *   pnpm film:island --world 2                # world #2's fall, files prefixed world2-
 *
 * The landing is a place on our world; on another the fall comes down over
 * the same plane point, wherever that is on its land or sea.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { MAX_HEIGHT, MIN_HEIGHT } from '@/island/features/eye';

import {
  buildExport,
  call,
  openPlay,
  type Screen,
  settle,
  shoot,
  VOVA_EXPORT,
  worldArgument,
  worldPrefix,
} from './lib/play-tab';

import { flag } from '@/kernel/scripts/lib/argv';
import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { launch } from '@/scene/scripts/lib/cdp';

const DIR = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/island-descent'),
);
const SECONDS = Number(flag('seconds') ?? 25);
const FPS = Number(flag('fps') ?? 30);
const THUMB_AT = Number(flag('thumb-at') ?? 50_000);
/** Still frames at orbit before the fall and at the ground after it. */
const HOLD_SECONDS = 1;
const WORLD = worldArgument();

/**
 * 720p on the desktop and the phone at twice its density: the software
 * rasterizer spends seconds a frame at that size, and more pixels than these
 * cost hours a film.
 */
const SCREENS: readonly Screen[] = [
  { name: 'desktop', width: 1280, height: 720, ratio: 1, mobile: false },
  { name: 'phone', width: 390, height: 844, ratio: 2, mobile: true },
];

/** The plane point the eye lands over: the beach at the inlet's head, looking north along the water. */
const LANDING = [499_000, 1_113_200] as const;
/** The plane point under the eye at orbit: the island's centre. */
const START = [0, 0] as const;
/**
 * How fast the eye closes on `LANDING` as it falls: the plane offset shrinks
 * as height to this power, so above 1 the landing drifts to the screen's
 * middle rather than holding still off it.
 */
const DRIFT_POWER = 1.4;

/** Smoothstep's quintic: still at both ends, so the fall starts and stops gently. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** The eye `t` of the way through the fall, as plane `x`, `y` and height. */
function descentAt(t: number): readonly [number, number, number] {
  const span = Math.log(MAX_HEIGHT / MIN_HEIGHT);
  const height = MAX_HEIGHT * Math.exp(-span * ease(t));
  const drift = (height / MAX_HEIGHT) ** DRIFT_POWER;
  return [
    LANDING[0] + (START[0] - LANDING[0]) * drift,
    LANDING[1] + (START[1] - LANDING[1]) * drift,
    height,
  ];
}

/** Each frame's `t`: a hold at 0, the fall, a hold at 1. */
function timeline(): number[] {
  const hold = Math.round(HOLD_SECONDS * FPS);
  const fall = Math.round(SECONDS * FPS);
  return [
    ...Array.from({ length: hold }, () => 0),
    ...Array.from({ length: fall }, (_, i) => i / (fall - 1)),
    ...Array.from({ length: hold }, () => 1),
  ];
}

function ffmpeg(args: readonly string[]): void {
  const run = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-loglevel', 'error', '-y', ...args],
    {
      stdio: ['ignore', 'ignore', 'inherit'],
    },
  );
  if (run.status !== 0) throw new Error(`ffmpeg ${args.join(' ')} failed`);
}

async function film(
  browser: Awaited<ReturnType<typeof launch>>,
  origin: string,
  screen: Screen,
  errors: string[],
): Promise<void> {
  const name = `${worldPrefix(WORLD)}${screen.name}`;
  const frames = path.join(DIR, `${name}-frames`);
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  const tab = await openPlay(browser, origin, screen, errors, WORLD);
  const ts = timeline();
  const thumb = ts.findIndex((t) => descentAt(t)[2] <= THUMB_AT);
  const started = Date.now();
  try {
    const shootFrom = async (i: number): Promise<void> => {
      const t = ts[i];
      if (t === undefined) return;
      const [x, y, m] = descentAt(t);
      await settle(tab, call('moveTo', x, y, m), `frame ${String(i)}`);
      // One drawn frame per video frame, the clock advanced by the video's.
      await shoot(
        tab,
        1,
        path.join(frames, `${String(i).padStart(5, '0')}.png`),
        1000 / FPS,
      );
      if (i % FPS === 0) {
        const rate = (Date.now() - started) / (i + 1) / 1000;
        process.stdout.write(
          `${screen.name}: frame ${String(i)}/${String(ts.length)}, ${m.toFixed(0)} m up, ${rate.toFixed(2)} s a frame\n`,
        );
      }
      return shootFrom(i + 1);
    };
    await shootFrom(0);
  } finally {
    await browser.send('Target.disposeBrowserContext', {
      browserContextId: tab.contextId,
    });
  }
  if (errors.length > 0) return;
  const mp4 = path.join(DIR, `${name}.mp4`);
  ffmpeg(
    [
      ['-framerate', String(FPS)],
      ['-i', path.join(frames, '%05d.png')],
      ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18'],
      ['-pix_fmt', 'yuv420p', '-movflags', '+faststart'],
      // yuv420p needs even sides.
      ['-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'],
      [mp4],
    ].flat(),
  );
  ffmpeg(
    [
      ['-i', path.join(frames, `${String(thumb).padStart(5, '0')}.png`)],
      ['-quality', '90'],
      [path.join(DIR, `${name}-thumb.webp`)],
    ].flat(),
  );
  process.stdout.write(
    `${screen.name}: ${path.relative(REPO_ROOT, mp4)}, still from frame ${String(thumb)}\n`,
  );
}

async function main(): Promise<void> {
  buildExport();
  fs.mkdirSync(DIR, { recursive: true });
  const only = new Set((flag('screens') ?? 'desktop').split(','));
  const browser = await launch();
  const errors: string[] = [];
  const filmFrom = async (
    origin: string,
    [screen, ...rest]: readonly Screen[],
  ): Promise<void> => {
    if (screen === undefined) return;
    await film(browser, origin, screen, errors);
    return filmFrom(origin, rest);
  };
  try {
    await withPrintOrigin(
      { serve: 'export', dir: VOVA_EXPORT },
      async (origin) =>
        filmFrom(
          origin,
          SCREENS.filter(({ name }) => only.has(name)),
        ),
    );
  } finally {
    await browser.close();
    for (const line of errors) process.stderr.write(`${line}\n`);
  }
  if (errors.length > 0) process.exitCode = 1;
}

await main();
