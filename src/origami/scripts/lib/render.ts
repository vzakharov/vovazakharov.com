/**
 * Renders folded models to PNGs in headless Chromium: bundles `render-page.ts`
 * into a page under the output directory, opens it over CDP, and screenshots
 * one `show` per shot. Any exception or `console.error` on the page fails
 * the run — a WebGL page that broke draws a blank PNG otherwise, and exits 0.
 */
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

import type { Design } from '@/origami/entities/design';

import type { Framing, RenderInput } from './render-page.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { launch, openTab } from '@/scene/scripts/lib/cdp';

export type { View } from './render-page.ts';

/** One frame's size, not the page's. */
const WIDTH = 900;
const HEIGHT = 700;
const COLUMNS = 2;
const READY_TIMEOUT_MS = 30_000;
const POLL_MS = 50;

/** A PNG to write at `file`: each frame a model, in engine coordinates, from
 * a view. */
export type Shot = {
  readonly file: string;
  readonly frames: readonly Framing[];
};

const ConsoleCall = z.object({
  type: z.string(),
  args: z.array(
    z.object({ value: z.unknown(), description: z.string().optional() }),
  ),
});

async function page(): Promise<string> {
  const bundle = await build({
    entryPoints: [path.resolve(import.meta.dirname, 'render-page.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
    minify: true,
    tsconfig: path.resolve(REPO_ROOT, 'tsconfig.json'),
    logLevel: 'warning',
  });
  const [script] = bundle.outputFiles;
  if (!script) throw new Error('esbuild produced no output');
  // `</script` inside the bundle would end the inline tag early.
  const inline = script.text.replaceAll('</script', String.raw`<\/script`);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>html, body { margin: 0; overflow: hidden; } canvas { display: block; }</style>
</head>
<body>
<script>${inline}</script>
</body>
</html>
`;
}

/**
 * Draws every shot in turn, in one fresh Chromium whose page is written into
 * `dir`, and closes it however the run ends.
 */
export async function render(
  design: Design,
  dir: string,
  shots: readonly Shot[],
): Promise<void> {
  await mkdir(dir, { recursive: true });
  const html = path.join(dir, 'render.html');
  await writeFile(html, await page());

  const browser = await launch();
  try {
    const errors: string[] = [];
    const tab = await openTab(browser, (message) => {
      errors.push(message);
    });
    tab.on('Runtime.consoleAPICalled', (params) => {
      const { type, args } = ConsoleCall.parse(params);
      if (type === 'error') {
        errors.push(
          args
            .map(({ value, description }) =>
              typeof value === 'string'
                ? value
                : (description ?? JSON.stringify(value)),
            )
            .join(' '),
        );
      }
    });
    const healthy = () => {
      if (errors.length > 0) {
        throw new Error(`render page failed:\n${errors.join('\n')}`);
      }
    };

    await tab.send('Page.navigate', { url: pathToFileURL(html).href });
    const ready = async (deadline: number): Promise<void> => {
      healthy();
      if (await tab.evaluate('globalThis.ready === true', z.boolean())) return;
      if (Date.now() > deadline) throw new Error('render page never got ready');
      await sleep(POLL_MS);
      return ready(deadline);
    };
    await ready(Date.now() + READY_TIMEOUT_MS);

    const { colors, display } = design;
    const shoot = async ([shot, ...rest]: readonly Shot[]): Promise<void> => {
      if (!shot) return;
      const { frames, file } = shot;
      const input: RenderInput[] = frames.map(({ model, view }) => ({
        model: {
          ...model,
          pieces: model.pieces.map((piece) => ({
            ...piece,
            world: piece.world.map((point) => display(point)),
          })),
        },
        view,
        colors,
      }));
      const columns = Math.min(frames.length, COLUMNS);
      await tab.send('Emulation.setDeviceMetricsOverride', {
        width: WIDTH * columns,
        height: HEIGHT * Math.ceil(frames.length / columns),
        deviceScaleFactor: 1,
        mobile: false,
      });
      await tab.evaluate(
        `globalThis.show(${JSON.stringify(input)}, ${columns})`,
        z.literal(true),
      );
      healthy();
      const { data } = z
        .object({ data: z.string() })
        .parse(await tab.send('Page.captureScreenshot', { format: 'png' }));
      await writeFile(file, Buffer.from(data, 'base64'));
      return shoot(rest);
    };
    await shoot(shots);
  } finally {
    await browser.close();
  }
}
