/**
 * Plays `/mushrooms` on the four screens it is made for and fails on the first
 * thing that goes wrong: a page error, or a tap whose effect on the meadow is
 * not the one its control promises. `+`, a pick, a tap on a mushroom, `−`
 * with a selection and without, `−` on an empty meadow, a tap on a flower and
 * the mute are each tapped the way a finger does, and a frame of each lands in
 * `tmp/play/<screen>-<step>.png` to look at.
 *
 *   pnpm play:mushrooms             # build the probe export, then play it
 *   pnpm play:mushrooms --no-build  # play the one already in apps/vova/out
 *
 * The page hands its game over only in a build with
 * `NEXT_PUBLIC_MUSHROOM_PROBE` set, which this builds; the game loop is put to
 * sleep and stepped a frame at a time, since a screenshot under the software
 * rasterizer takes about a second and a clock left running would move on
 * between a tap and its frame. `Math.random` is seeded, so every run and every
 * build plays the same meadow.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

import { given } from './lib/argv.ts';
import { type Browser, launch } from './lib/cdp.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'apps/vova/out');
const FRAMES = path.join(ROOT, 'tmp/play');
const FRAME_MS = 1000 / 60;
const POLL_MS = 250;
const SEED = 12_345;

const SCREENS = [
  { name: 'tabL', width: 1180, height: 820, ratio: 2 },
  { name: 'tabP', width: 820, height: 1180, ratio: 2 },
  { name: 'phoneP', width: 390, height: 844, ratio: 3 },
  { name: 'phoneL', width: 844, height: 390, ratio: 3 },
] as const;

type Screen = (typeof SCREENS)[number];

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

/** Swaps `Math.random` for a seeded mulberry32 before the page's own code runs. */
const SEEDED_RANDOM = `(() => {
  let state = ${String(SEED)} >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;

/** Page-side helpers, installed once the game is up. */
const PROBE = `(() => {
  const scene = window.__game.scene.scenes[0];
  const centre = ({ x, y }) => ({ x, y });
  window.__probe = {
    scene,
    state: () => ({
      picking: scene.meadow.picking,
      selected: scene.meadow.selected ?? null,
      mushrooms: scene.meadow.mushrooms.map(({ id }) => id),
      muted: scene.voice.muted,
      clock: scene.clock,
    }),
    controls: () => ({
      plus: centre(scene.layout.plus),
      minus: centre(scene.layout.minus),
      mute: centre(scene.layout.mute),
      picker: scene.layout.picker.map(centre),
    }),
    /** The middle of a mushroom's cap as its hit area has it, on screen. */
    mushroom: (id) => {
      const shown = scene.bed.shown.get(id);
      const points = shown.hit.cap;
      const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
      const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
      return shown.graphics.getWorldTransformMatrix().transformPoint(x, y, {});
    },
    /** The nearest shown flower's head, the one least likely to be covered. */
    flower: () => {
      const shown = [...scene.shownFlowers.entries()]
        .filter(([, flower]) => flower.container.visible)
        .sort(([, a], [, b]) => b.container.depth - a.container.depth)[0];
      if (!shown) return null;
      const [id, flower] = shown;
      const at = flower.head.getWorldTransformMatrix();
      return { id, x: at.tx, y: at.ty };
    },
    /** When a flower was last tapped, \`null\` if never: JSON has no -Infinity. */
    flowerTappedAt: (id) => {
      const { tappedAt } = scene.shownFlowers.get(id);
      return Number.isFinite(tappedAt) ? tappedAt : null;
    },
    /** When \`−\` last shook its head, \`null\` if never. */
    minusRefusedAt: () => {
      const { refusedAt } = scene.controls.minus;
      return Number.isFinite(refusedAt) ? refusedAt : null;
    },
  };
})()`;

const State = z.object({
  picking: z.boolean(),
  selected: z.string().nullable(),
  mushrooms: z.array(z.string()),
  muted: z.boolean(),
  clock: z.number(),
});
const Point = z.object({ x: z.number(), y: z.number() });
const Controls = z.object({
  plus: Point,
  minus: Point,
  mute: Point,
  picker: z.array(Point),
});
const Flower = Point.extend({ id: z.string() }).nullable();
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

type Page = {
  evaluate: <Parsed>(
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed>;
  step: (frames: number) => Promise<void>;
  tap: (point: z.infer<typeof Point>) => Promise<void>;
  shoot: (step: string) => Promise<void>;
};

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
    source: SEEDED_RANDOM,
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
  await evaluate(`${PROBE}; window.__game.loop.sleep(); true`, z.boolean());

  let time = 1000;
  return {
    evaluate,
    step: async (frames) => {
      const from = time;
      time += frames * FRAME_MS;
      await evaluate(
        `for (let t = ${String(from)}; t < ${String(time)}; t += ${String(FRAME_MS)}) window.__game.step(t + ${String(FRAME_MS)}, ${String(FRAME_MS)}); true`,
        z.boolean(),
      );
    },
    tap: async ({ x, y }) => {
      await send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y }],
      });
      await send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    },
    shoot: async (step) => {
      const { data } = z
        .object({ data: z.string() })
        .parse(await send('Page.captureScreenshot', { format: 'png' }));
      fs.writeFileSync(
        path.join(FRAMES, `${screen.name}-${step}.png`),
        Buffer.from(data, 'base64'),
      );
    },
  };
}

/** The whole tap sequence on one screen; each broken promise is a failure. */
async function play(
  page: Page,
  fail: (message: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  const expect = (holds: boolean, message: string) => {
    if (!holds) fail(message);
  };
  const controls = await page.evaluate('__probe.controls()', Controls);
  await page.step(30);
  await page.shoot('0-open');
  const opening = await state();

  await page.tap(controls.plus);
  await page.step(30);
  expect((await state()).picking, '`+` did not open the picker');
  await page.shoot('1-picker');

  const [first] = controls.picker;
  if (first) await page.tap(first);
  await page.step(90);
  const grown = await state();
  expect(
    grown.mushrooms.length === opening.mushrooms.length + 1,
    'a pick grew no mushroom',
  );
  expect(!grown.picking, 'a pick left the picker open');
  expect(
    grown.selected === grown.mushrooms.at(-1),
    'the grown mushroom is not selected',
  );
  await page.shoot('2-grown');

  const [target] = opening.mushrooms;
  if (target !== undefined) {
    await page.tap(
      await page.evaluate(`__probe.mushroom(${JSON.stringify(target)})`, Point),
    );
  }
  await page.step(30);
  expect(
    (await state()).selected === target,
    'a tap on a mushroom did not select it',
  );
  await page.shoot('3-selected');

  await page.tap(controls.minus);
  await page.step(90);
  const thinned = await state();
  expect(
    !thinned.mushrooms.includes(target ?? '') &&
      thinned.mushrooms.length === grown.mushrooms.length - 1,
    '`−` did not take the selected mushroom away',
  );
  await page.shoot('4-removed');

  // Nothing is selected now, so `−` takes the newest, then the last one left.
  await page.tap(controls.minus);
  await page.step(60);
  expect(
    (await state()).mushrooms.join(',') ===
      thinned.mushrooms.slice(0, -1).join(','),
    '`−` with nothing selected did not take the newest away',
  );
  await page.tap(controls.minus);
  await page.step(60);
  expect((await state()).mushrooms.length === 0, '`−` left a mushroom');
  await page.tap(controls.minus);
  await page.step(6);
  const { clock: shookBy } = await state();
  const refusedAt = await page.evaluate(
    '__probe.minusRefusedAt()',
    z.number().nullable(),
  );
  expect(
    refusedAt !== null && shookBy - refusedAt < 1,
    '`−` on an empty meadow did not shake its head',
  );
  await page.shoot('5-refused');

  const flower = await page.evaluate('__probe.flower()', Flower);
  if (flower) {
    await page.tap(flower);
    await page.step(20);
    const { clock } = await state();
    const tappedAt = await page.evaluate(
      `__probe.flowerTappedAt(${JSON.stringify(flower.id)})`,
      z.number().nullable(),
    );
    expect(
      tappedAt !== null && clock - tappedAt < 1,
      'a tap on a flower did not open it',
    );
    await page.shoot('6-flower');
  }

  const { muted } = await state();
  await page.tap(controls.mute);
  await page.step(10);
  expect((await state()).muted !== muted, 'the mute did not toggle');
  await page.shoot('7-muted');
  await page.tap(controls.mute);
  await page.step(10);
  expect((await state()).muted === muted, 'the mute did not toggle back');
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
    const page = await open(browser, origin, screen, errors);
    await play(page, (message) => {
      failures.push(`${screen.name}: ${message}`);
    });
    process.stdout.write(`${screen.name}: played\n`);
    return playFrom(rest);
  };
  try {
    await playFrom(SCREENS);
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
