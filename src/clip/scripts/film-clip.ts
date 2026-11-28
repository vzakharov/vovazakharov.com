/**
 * Films «Хорошо!» frame by frame: the vova export's clip page opened with
 * `?film` at 1920×1080, each frame drawn at its exact time and screenshotted,
 * piped into ffmpeg as H.264 with the song under it as AAC.
 *
 *   pnpm film:clip                       # build the vova export, film the whole song
 *   pnpm film:clip --no-build            # film the export already in sites/vova/out
 *   pnpm film:clip --from 28 --to 42.3   # that stretch alone, its sound with it
 *   pnpm film:clip --out tmp/clip/v1.mp4 # elsewhere than tmp/clip/horowo-<from>-<to>.mp4
 */

import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import { PAGE_ROUTES } from '@/kernel/shared/config/index.node-safe';

import { FILM_HOOK, FILM_QUERY } from '@/clip/shared/film';
import { SONG_SECONDS } from '@/clip/shared/score';

import { CLIP_TMP, songFile } from './lib/song-file';

import { flag, given } from '@/kernel/scripts/lib/argv';
import { withPrintOrigin } from '@/kernel/scripts/lib/print-origin';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { launch, openTab, type Tab } from '@/scene/scripts/lib/cdp';
import { watchPageErrors } from '@/scene/scripts/lib/page-errors';

const FPS = 30;
const SIZE = { width: 1920, height: 1080 } as const;
const FROM = Number(flag('from') ?? 0);
const TO = Math.min(SONG_SECONDS, Number(flag('to') ?? SONG_SECONDS));
const OUT = path.resolve(
  REPO_ROOT,
  flag('out') ??
    path.join(CLIP_TMP, `horowo-${String(FROM)}-${String(TO)}.mp4`),
);
const VOVA_EXPORT = path.join(REPO_ROOT, 'sites/vova/out');
/** How long the page gets to install its hook once it has loaded. */
const HOOK_TIMEOUT_MS = 30_000;
const POLL_MS = 250;

const hook = `window.${FILM_HOOK}`;

function buildExport(): void {
  if (given('no-build')) return;
  const built = spawnSync('pnpm', ['build', 'vova'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
  if (built.status !== 0) throw new Error('The vova build failed');
}

/** Polls until the page has installed its hook, failing past the deadline. */
async function hooked(tab: Tab, deadline: number): Promise<void> {
  const there = await tab.evaluate(
    `typeof ${hook}?.draw === 'function'`,
    z.boolean(),
  );
  if (there) return;
  if (Date.now() > deadline) {
    throw new Error(`The clip page installed no ${hook} (@/clip/shared/film)`);
  }
  await sleep(POLL_MS);
  return hooked(tab, deadline);
}

/** The encoder: PNG frames on stdin, the song's stretch from `song`, an mp4 out. */
function encoder(song: string) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  return spawn(
    'ffmpeg',
    [
      ['-hide_banner', '-loglevel', 'error', '-y'],
      ['-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'],
      ['-ss', String(FROM), '-t', String(TO - FROM), '-i', song],
      ['-map', '0:v', '-map', '1:a'],
      ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18'],
      ['-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k'],
      ['-shortest', '-movflags', '+faststart', OUT],
    ].flat(),
    { stdio: ['pipe', 'ignore', 'inherit'] },
  );
}

type Encoder = ReturnType<typeof encoder>;

/** Draws, shoots and encodes frame `n` of `frames`, then the ones after it. */
async function shootFrom(
  tab: Tab,
  ffmpeg: Encoder,
  n: number,
  frames: number,
  started: number,
): Promise<void> {
  if (n >= frames) return;
  const t = FROM + n / FPS;
  // The frame is drawn, then one animation frame passes so the compositor
  // holds it before the screenshot.
  await tab.evaluate(
    `${hook}.draw(${String(t)}) && new Promise((done) => requestAnimationFrame(() => done(true)))`,
    z.literal(true),
    { awaitPromise: true },
  );
  const { data } = z
    .object({ data: z.string() })
    .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
  if (!ffmpeg.stdin.write(Buffer.from(data, 'base64'))) {
    await once(ffmpeg.stdin, 'drain');
  }
  if (n % FPS === 0) {
    const rate = (Date.now() - started) / (n + 1) / 1000;
    process.stdout.write(
      `frame ${String(n)}/${String(frames)} at ${t.toFixed(2)} s, ${rate.toFixed(2)} s a frame\n`,
    );
  }
  return shootFrom(tab, ffmpeg, n + 1, frames, started);
}

async function film(
  origin: string,
  song: string,
  errors: string[],
): Promise<void> {
  const report = (message: string) => {
    errors.push(message);
  };
  const browser = await launch();
  const ffmpeg = encoder(song);
  const exited = new Promise<number | null>((resolve) => {
    ffmpeg.on('exit', resolve);
  });
  try {
    const tab = await openTab(browser, report);
    await watchPageErrors(tab, report);
    await tab.send('Emulation.setDeviceMetricsOverride', {
      ...SIZE,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await tab.send('Page.navigate', {
      url: `${origin}${PAGE_ROUTES.horowoClip}?${FILM_QUERY}`,
    });
    await hooked(tab, Date.now() + HOOK_TIMEOUT_MS);
    await tab.evaluate(`${hook}.ready()`, z.literal(true), {
      awaitPromise: true,
    });
    await shootFrom(tab, ffmpeg, 0, Math.round((TO - FROM) * FPS), Date.now());
  } finally {
    ffmpeg.stdin.end();
    await browser.close();
  }
  const code = await exited;
  if (code !== 0) errors.push(`ffmpeg exited ${String(code)}`);
}

async function main(): Promise<void> {
  if (!(TO > FROM))
    throw new Error(`Nothing to film from ${String(FROM)} to ${String(TO)}`);
  buildExport();
  const song = await songFile();
  const errors: string[] = [];
  await withPrintOrigin({ serve: 'export', dir: VOVA_EXPORT }, async (origin) =>
    film(origin, song, errors),
  );
  for (const line of errors) process.stderr.write(`${line}\n`);
  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`${path.relative(REPO_ROOT, OUT)}\n`);
}

await main();
