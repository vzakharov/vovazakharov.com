/**
 * Traces the island's coastline out of the board's map into the committed
 * `entities/coast/model/coast.json`: the webp is decoded by the tree's headless
 * Chromium (no image library in the dependencies), the pixels traced in Node,
 * and the rings written in kilometres on the island plane.
 *
 * `pnpm trace:island [--overlay <png>]` — the overlay draws every traced ring
 * over the map, for checking the trace by eye.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { format } from 'prettier';
import { z } from 'zod';

import type { Coast } from '@/island/shared/globe';
import {
  type Ring,
  signedArea,
  smoothCoast,
  type SmoothOptions,
  traceCoast,
  type TraceOptions,
} from '@/island/entities/coast';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { launch, openTab, type Tab } from '@/scene/scripts/lib/cdp';

const MAP = path.join(
  REPO_ROOT,
  'docs/plans/world-game-zoltan-syama/board/images/map-zoltan-syama.webp',
);
const OUT = path.join(REPO_ROOT, 'src/island/entities/coast/model/coast.json');

/** The main body's east–west extent (contract, call 1). */
const MAIN_BODY_KM = 5000;

const OPTIONS: TraceOptions = {
  paperCell: 16,
  paperWindow: 4,
  inkRatio: 0.6,
  inkClosing: 1,
  colourBlur: 2,
  minChroma: 0.05,
  maxShade: 0.92,
  inkClearance: 2,
  coastReach: 6,
  peelDepth: 8,
  minColouredShare: 0.1,
  islandFloor: 60,
  blurRadius: 1,
  tolerance: 0.9,
  seaStrokes: [
    // The inlet between Блаблания and Фейсис runs on as a strait between two
    // coastlines a pixel apart, to the round pool where they meet: the
    // inlet's head, sea rather than a lake.
    {
      path: [
        [698.5, 198],
        [698.5, 240],
        [696, 248],
      ],
      radius: 1,
    },
    {
      path: [
        [695.5, 248],
        [695.5, 250],
      ],
      radius: 3,
    },
  ],
};

/** In pixels of the drawing. */
const SMOOTHING: SmoothOptions = {
  minArea: 60,
  resampleStep: 1,
  sigma: 3,
  tolerance: 0.3,
};

const Evaluated = z.object({
  result: z.object({ value: z.unknown().optional() }),
  exceptionDetails: z
    .object({ exception: z.object({ description: z.string() }).optional() })
    .optional(),
});

/** Evaluates an expression that resolves to a promise, awaiting it. */
async function settle<Parsed>(
  tab: Tab,
  expression: string,
  schema: z.ZodType<Parsed>,
): Promise<Parsed> {
  const reply = Evaluated.parse(
    await tab.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    }),
  );
  if (reply.exceptionDetails) {
    throw new Error(reply.exceptionDetails.exception?.description ?? 'threw');
  }
  return schema.parse(reply.result.value);
}

/** Page-side: the image as a bitmap, from a data URL so the canvas stays
 * readable, and `base64` to carry bytes back out. */
const BITMAP = (base64: string) => `
  const blob = await (await fetch('data:image/webp;base64,${base64}')).blob();
  const bitmap = await createImageBitmap(blob, {
    colorSpaceConversion: 'none',
    premultiplyAlpha: 'none',
  });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0);
  // Chunked, since spreading the whole array overflows the call stack.
  const base64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  };`;

const Decoded = z.object({
  width: z.number(),
  height: z.number(),
  rgba: z.string(),
});

async function decode(tab: Tab, base64: string) {
  const { width, height, rgba } = await settle(
    tab,
    `(async () => {${BITMAP(base64)}
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      return { width: canvas.width, height: canvas.height, rgba: base64(data) };
    })()`,
    Decoded,
  );
  return { width, height, data: Buffer.from(rgba, 'base64') };
}

async function overlay(
  tab: Tab,
  base64: string,
  rings: Ring[],
): Promise<Buffer> {
  const png = await settle(
    tab,
    `(async () => {${BITMAP(base64)}
      context.lineWidth = 1.5;
      const trace = (ring, colour) => {
        context.strokeStyle = colour;
        context.beginPath();
        ring.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y));
        context.closePath();
        context.stroke();
        context.fillStyle = colour;
        for (const [x, y] of ring) context.fillRect(x - 1, y - 1, 2, 2);
      };
      ${JSON.stringify(rings)}.forEach((ring, i) => {
        trace(ring, i === 0 ? '#e00000' : '#0040ff');
      });
      const png = await canvas.convertToBlob({ type: 'image/png' });
      return base64(new Uint8Array(await png.arrayBuffer()));
    })()`,
    z.string(),
  );
  return Buffer.from(png, 'base64');
}

function bounds(ring: Ring) {
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

const metres = (km: number) => Math.round(km * 1000) / 1000;

/**
 * Pixels to the island plane: kilometres from the main body's bounding-box
 * centre, `y` flipped to north, each ring reversed so that land on screen's
 * clockwise becomes the plane's counter-clockwise.
 */
function toPlane(rings: Ring[]): Coast {
  const [main] = rings;
  if (!main) throw new Error('the trace found no land');
  const { left, right, top, bottom } = bounds(main);
  const kmPerPixel = MAIN_BODY_KM / (right - left);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  return {
    kmPerPixel,
    rings: rings.map((ring) =>
      ring
        .map(([x, y]): [number, number] => [
          metres((x - cx) * kmPerPixel),
          metres((cy - y) * kmPerPixel),
        ])
        .toReversed(),
    ),
  };
}

async function run(): Promise<void> {
  const { values } = parseArgs({ options: { overlay: { type: 'string' } } });
  const base64 = (await readFile(MAP)).toString('base64');
  const browser = await launch();
  try {
    const tab = await openTab(browser, (message) => {
      throw new Error(message);
    });
    const raster = await decode(tab, base64);
    const traced = traceCoast(raster, OPTIONS);
    for (const ring of traced) {
      const area = signedArea(ring);
      if (area < SMOOTHING.minArea) {
        const { left, top } = bounds(ring);
        process.stdout.write(
          `  dropped: ${area.toFixed(0)} px² at x ${left.toFixed(0)}, ` +
            `y ${top.toFixed(0)}\n`,
        );
      }
    }
    const rings = smoothCoast(traced, SMOOTHING);
    const coast = toPlane(rings);
    const json = await format(JSON.stringify(coast), { parser: 'json' });
    await writeFile(OUT, json);

    const vertices = coast.rings.reduce((sum, ring) => sum + ring.length, 0);
    process.stdout.write(
      `${String(raster.width)}×${String(raster.height)} px; ` +
        `${String(coast.rings.length)} rings, ${String(vertices)} vertices; ` +
        `${coast.kmPerPixel.toFixed(4)} km/px; ${String(json.length)} bytes\n`,
    );
    for (const [i, ring] of rings.entries()) {
      const { left, right, top, bottom } = bounds(ring);
      process.stdout.write(
        `  #${String(i)} x ${left.toFixed(0)}–${right.toFixed(0)}, ` +
          `y ${top.toFixed(0)}–${bottom.toFixed(0)}, ` +
          `${String(ring.length)} vertices, ` +
          `${signedArea(ring).toFixed(0)} px²\n`,
      );
    }

    if (values.overlay !== undefined) {
      await writeFile(
        path.resolve(values.overlay),
        await overlay(tab, base64, rings),
      );
    }
  } finally {
    await browser.close();
  }
}

await run();
