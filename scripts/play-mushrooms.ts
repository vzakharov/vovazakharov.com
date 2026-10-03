/**
 * Plays `/mushrooms` on the five screens it is made for and fails on the first
 * thing that goes wrong: a page error, or a tap whose effect on the meadow is
 * not the one its control promises. Every control and every tappable thing in
 * the meadow is tapped the way a finger does, and the eye is turned and
 * walked by drag and by key and the screen turned — the steps are
 * `lib/play-opening.ts`, `lib/play-meadow.ts`, `lib/play-house.ts`,
 * `lib/play-insects.ts`, `lib/play-buzzers.ts`, `lib/play-walk.ts`,
 * `lib/play-approach.ts`, `lib/play-species.ts`, `lib/play-tufts.ts`,
 * `lib/play-hold.ts`, `lib/play-keys.ts`, `lib/play-veer.ts`,
 * `lib/play-rain.ts` and `lib/play-sprouts.ts` — and a frame of each lands in
 * `tmp/play/<screen>-<step>.png` to look at.
 *
 *   pnpm play:mushrooms             # build the probe export, then play it
 *   pnpm play:mushrooms --no-build  # play the one already in apps/vova/out
 *   pnpm play:mushrooms --no-build --screens tabL,phoneS  # only those screens
 *   pnpm play:mushrooms --no-build --plays walk,tufts     # only those plays
 *
 * The page hands its game over only in a build with
 * `NEXT_PUBLIC_MUSHROOM_PROBE` set, which this builds; the game loop is put to
 * sleep and stepped a frame at a time, since a screenshot under the software
 * rasterizer takes about a second and a clock left running would move on
 * between a tap and its frame. Its tweens are stepped on the same clock, so a
 * puff in a frame is where it is at that frame's game time. `Math.random` is
 * seeded, so every run and every build plays the same meadow. What runs in
 * the page is `lib/mushroom-probe.ts`.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import { flag, given } from './lib/argv.ts';
import { type Browser, launch } from './lib/cdp.ts';
import { WATCH } from './lib/flier-watch.ts';
import { budgetReport } from './lib/frame-budget.ts';
import {
  Controls,
  dragMoves,
  type Expect,
  FRAME_MS,
  inTurn,
  KEY_CODES,
  type Page,
  type Point,
  PROBE,
  seededRandom,
  STEPPED_TWEENS,
} from './lib/mushroom-probe.ts';
import { playApproach } from './lib/play-approach.ts';
import { playPlanting } from './lib/play-buzzers.ts';
import { playHold } from './lib/play-hold.ts';
import { playKeys } from './lib/play-keys.ts';
import { playMap } from './lib/play-map.ts';
import { playMeadow } from './lib/play-meadow.ts';
import { playOpening } from './lib/play-opening.ts';
import { playRain } from './lib/play-rain.ts';
import { playRuns } from './lib/play-runs.ts';
import { playSpecies } from './lib/play-species.ts';
import { playSprouts } from './lib/play-sprouts.ts';
import { playTufts } from './lib/play-tufts.ts';
import { playVeer } from './lib/play-veer.ts';
import { playWalk } from './lib/play-walk.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'apps/vova/out');
const FRAMES = path.join(ROOT, 'tmp/play');
const POLL_MS = 250;
const SEED = 12_345;

const SCREENS = [
  { name: 'tabL', width: 1180, height: 820, ratio: 2 },
  { name: 'tabP', width: 820, height: 1180, ratio: 2 },
  { name: 'phoneP', width: 390, height: 844, ratio: 3 },
  { name: 'phoneL', width: 844, height: 390, ratio: 3 },
  { name: 'phoneS', width: 320, height: 568, ratio: 2 },
] as const;

type Screen = (typeof SCREENS)[number];

/** Each play by the name `--plays` picks it by, in the order they run. */
const PLAYS = [
  ['opening', playOpening],
  ['meadow', playMeadow],
  ['runs', playRuns],
  ['walk', playWalk],
  ['approach', playApproach],
  ['planting', playPlanting],
  ['species', playSpecies],
  ['tufts', playTufts],
  ['hold', playHold],
  ['keys', playKeys],
  ['veer', playVeer],
  ['rain', playRain],
  ['sprouts', playSprouts],
  ['map', playMap],
] as const;

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

/** `apps/vova/out` as GitHub Pages serves it: `/mushrooms` is `mushrooms.html`. */
async function serve(): Promise<http.Server> {
  const server = http.createServer((request, response) => {
    const url = decodeURIComponent(
      new URL(request.url ?? '/', 'http://x').pathname,
    );
    const found = [url, `${url}.html`, path.join(url, 'index.html')]
      .map((candidate) => path.join(OUT, candidate))
      .find(
        (file) =>
          file.startsWith(OUT) &&
          fs.existsSync(file) &&
          fs.statSync(file).isFile(),
      );
    if (found === undefined) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'content-type': TYPES[path.extname(found)] ?? 'application/octet-stream',
    });
    fs.createReadStream(found).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

const Thrown = z.object({
  exceptionDetails: z.object({
    text: z.string(),
    exception: z.object({ description: z.string() }).optional(),
  }),
});
const Evaluated = z.object({
  result: z.object({ value: z.unknown().optional() }),
  exceptionDetails: z
    .object({ exception: z.object({ description: z.string() }).optional() })
    .optional(),
});

async function open(
  browser: Browser,
  origin: string,
  screen: Screen,
  errors: string[],
): Promise<Page> {
  const target = z
    .object({ targetId: z.string() })
    .parse(await browser.send('Target.createTarget', { url: 'about:blank' }));
  const { sessionId } = z
    .object({ sessionId: z.string() })
    .parse(
      await browser.send('Target.attachToTarget', { ...target, flatten: true }),
    );
  const send = async (method: string, params: object = {}) =>
    browser.send(method, params, sessionId);
  browser.on('Runtime.exceptionThrown', (params, from) => {
    if (from !== sessionId) return;
    const { exceptionDetails } = Thrown.parse(params);
    const said =
      exceptionDetails.exception?.description ?? exceptionDetails.text;
    errors.push(`${screen.name}: ${said.split('\n')[0] ?? said}`);
  });
  await send('Runtime.enable');
  await send('Page.enable');
  const { width, height, ratio } = screen;
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: ratio,
    mobile: true,
  });
  await send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5,
  });
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: seededRandom(SEED),
  });
  await send('Page.navigate', { url: `${origin}/mushrooms` });

  const evaluate: Page['evaluate'] = async (expression, schema) => {
    const reply = Evaluated.parse(
      await send('Runtime.evaluate', { expression, returnByValue: true }),
    );
    if (reply.exceptionDetails) {
      throw new Error(
        `${expression}: ${reply.exceptionDetails.exception?.description ?? 'threw'}`,
      );
    }
    return schema.parse(reply.result.value);
  };

  const deadline = Date.now() + 60_000;
  const awaitGame = async (): Promise<void> => {
    if (
      await evaluate(
        'Boolean(window.__game?.scene?.scenes?.[0]?.layout)',
        z.boolean(),
      )
    ) {
      return;
    }
    if (Date.now() > deadline) {
      throw new Error(
        `${screen.name}: no game on the page — is apps/vova/out a probe build?`,
      );
    }
    await sleep(POLL_MS);
    return awaitGame();
  };
  await awaitGame();
  await evaluate(
    `${PROBE}; ${WATCH}; ${STEPPED_TWEENS}; window.__game.loop.sleep(); true`,
    z.boolean(),
  );

  let time = 1000;
  const rendered: number[] = [];
  // A touch is stamped with the frames' clock, as a real finger's event
  // shares its clock with the frames: the crop times a finger's velocity
  // and a glide by the event's own stamp. CDP takes seconds since the epoch.
  const timeOrigin = await evaluate('performance.timeOrigin', z.number());
  const touch = async (
    type: 'touchStart' | 'touchMove' | 'touchEnd',
    touchPoints: ReadonlyArray<z.infer<typeof Point>>,
  ) =>
    send('Input.dispatchTouchEvent', {
      type,
      touchPoints,
      timestamp: (timeOrigin + time) / 1000,
    });
  let turned = false;
  const step: Page['step'] = async (frames) => {
    const from = time;
    time += frames * FRAME_MS;
    // Only the last frame is drawn: every movement is set in `update`, and
    // a frame drawn under the software rasterizer is what the run spends.
    // Counted by frame rather than by summed time, so no step runs a frame
    // twice where the sum falls a hair short. The drawn frame is timed.
    rendered.push(
      await evaluate(
        `(() => { for (let i = 1; i < ${String(frames)}; i += 1) window.__game.headlessStep(${String(from)} + i * ${String(FRAME_MS)}, ${String(FRAME_MS)}); const started = performance.now(); window.__game.step(${String(from + frames * FRAME_MS)}, ${String(FRAME_MS)}); return performance.now() - started; })()`,
        z.number(),
      ),
    );
  };
  const trace: Page['trace'] = async (frames, expression, schema) => {
    const from = time;
    time += frames * FRAME_MS;
    return evaluate(
      `(() => { const seen = []; for (let i = 1; i <= ${String(frames)}; i += 1) { window.__game.headlessStep(${String(from)} + i * ${String(FRAME_MS)}, ${String(FRAME_MS)}); seen.push(${expression}); } return seen; })()`,
      z.array(schema),
    );
  };
  const dragTraced: Page['dragTraced'] = async (
    from,
    to,
    frames,
    expression,
    schema,
  ) => {
    const seen: Array<z.infer<typeof schema>> = [];
    await touch('touchStart', [from]);
    await inTurn(dragMoves(from, to, frames), async (finger) => {
      await step(1);
      await touch('touchMove', [finger]);
      seen.push(await evaluate(expression, schema));
    });
    await touch('touchEnd', []);
    return seen;
  };
  return {
    evaluate,
    rendered,
    step,
    trace,
    tap: async ({ x, y }) => {
      await touch('touchStart', [{ x, y }]);
      await touch('touchEnd', []);
    },
    drag: async (from, to, frames) => {
      await dragTraced(from, to, frames, 'true', z.boolean());
    },
    dragTraced,
    key: async (key, type, { repeat = false } = {}) => {
      await send('Input.dispatchKeyEvent', {
        type,
        // A letter's DOM `key` is what it prints, its `code` where it sits.
        key: key.startsWith('Key')
          ? key.slice('Key'.length).toLowerCase()
          : key,
        code: key,
        windowsVirtualKeyCode: KEY_CODES[key],
        autoRepeat: repeat,
      });
    },
    turn: async () => {
      turned = !turned;
      const across = turned ? height : width;
      await send('Emulation.setDeviceMetricsOverride', {
        width: across,
        height: turned ? width : height,
        deviceScaleFactor: ratio,
        mobile: true,
      });
      // The game refits from a `ResizeObserver`, which the browser runs on
      // its own rendering step rather than on the stepped game loop.
      const until = Date.now() + 10_000;
      const refitted = async (): Promise<void> => {
        if (
          await evaluate(
            `window.__game.scene.scenes[0].layout.width === ${String(across)}`,
            z.boolean(),
          )
        )
          return;
        if (Date.now() > until)
          throw new Error(
            `${screen.name}: the game never refitted to the turn`,
          );
        await sleep(POLL_MS);
        return refitted();
      };
      await refitted();
    },
    shoot: async (name, clip) => {
      const { data } = z.object({ data: z.string() }).parse(
        await send('Page.captureScreenshot', {
          format: 'png',
          ...(clip && { clip: { ...clip, scale: 1 } }),
        }),
      );
      fs.writeFileSync(
        path.join(FRAMES, `${screen.name}-${name}.png`),
        Buffer.from(data, 'base64'),
      );
    },
  };
}

async function main(): Promise<void> {
  if (!given('no-build')) {
    const built = spawnSync('pnpm', ['build:vova'], {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, NEXT_PUBLIC_MUSHROOM_PROBE: '1' },
    });
    if (built.status !== 0) throw new Error('The probe build failed');
  }
  fs.mkdirSync(FRAMES, { recursive: true });
  const server = await serve();
  const address = server.address();
  if (address === null || typeof address === 'string') {
    server.close();
    throw new Error('The OS gave no port to serve the export on.');
  }
  const origin = `http://127.0.0.1:${String(address.port)}`;
  const browser = await launch();
  const errors: string[] = [];
  const failures: string[] = [];
  // One screen after another, since they all drive the one browser.
  const playFrom = async ([
    screen,
    ...rest
  ]: readonly Screen[]): Promise<void> => {
    if (screen === undefined) return;
    const fail = (message: string) => {
      failures.push(`${screen.name}: ${message}`);
    };
    const note = (line: string) => {
      process.stdout.write(`${screen.name}: ${line}\n`);
    };
    const expect: Expect = (holds, message) => {
      if (!holds) fail(message);
    };
    // A fresh meadow for each play, in `PLAYS`' order.
    const only = flag('plays')?.split(',');
    const frames: number[] = [];
    await inTurn(
      PLAYS.filter(([name]) => only?.includes(name) ?? true),
      async ([name, playOn]) => {
        const on = await open(browser, origin, screen, errors);
        if (name !== 'meadow') await on.step(30);
        await playOn(
          on,
          await on.evaluate('__probe.controls()', Controls),
          expect,
          note,
        );
        frames.push(...on.rendered);
      },
    );
    // A screen that timed nothing has a broken probe, not a slow frame.
    if (frames.length === 0) fail('no rendered frame was timed');
    note(`rendered-frame JS, ${budgetReport(frames)}`);
    process.stdout.write(`${screen.name}: played\n`);
    return playFrom(rest);
  };
  try {
    // `--screens tabL,phoneS` plays only those.
    const only = flag('screens')?.split(',');
    await playFrom(SCREENS.filter(({ name }) => only?.includes(name) ?? true));
  } finally {
    await browser.close();
    server.close();
    // Before a thrown error surfaces, so a crash still reports what led to it.
    for (const line of [...errors, ...failures]) {
      process.stderr.write(`${line}\n`);
    }
    process.stdout.write(`Frames in ${path.relative(ROOT, FRAMES)}/\n`);
  }
  if (errors.length > 0 || failures.length > 0) process.exitCode = 1;
}

await main();
