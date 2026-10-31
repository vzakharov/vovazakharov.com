/**
 * The music section's social card and its podcast cover, covers scattered at
 * different sizes and angles — with no text but a band where one is given — as
 * a page for `og-render.ts` to screenshot.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  CANVAS,
  PUBLIC_DIR,
  SCALE,
} from '@/kernel/shared/config/index.node-safe';
import type { Sized, Titled } from '@/kernel/shared/typings';

import { COLLAGE_SIZE } from '@/music/shared/catalogue';

import {
  escapeHtml,
  INK,
  type StagedPage,
} from '@/kernel/scripts/lib/og-render';

/** Words laid across the covers in a band, for a card that names more than the covers do. */
export type CollageBand = Titled & { line: string };

/** A cover's place on the canvas: its centre, the length of its edge, and its tilt. */
type Slot = { cx: number; cy: number; edge: number; degrees: number };

/** A canvas, where the covers fall on it, and how far down a band sits. */
type Layout = { canvas: Sized; slots: readonly Slot[]; bandTop: number };

/**
 * Hand-tuned rather than seeded, so the composition is judged once, not
 * re-rolled whenever a release reshuffles it. Any prefix of two or more must
 * compose: the first slot, the largest, is the newest cover's, and each later
 * one sits under those before it in the emptiest stretch they leave. Canvas units.
 */
const LAYOUTS = {
  /** The social card. */
  card: {
    canvas: CANVAS,
    slots: [
      { cx: 470, cy: 330, edge: 400, degrees: -4 },
      { cx: 830, cy: 280, edge: 330, degrees: 6 },
      { cx: 160, cy: 300, edge: 300, degrees: -8 },
      { cx: 1120, cy: 520, edge: 250, degrees: -5 },
      { cx: 1110, cy: 90, edge: 230, degrees: 9 },
      { cx: 60, cy: 580, edge: 240, degrees: 7 },
      { cx: 330, cy: 20, edge: 220, degrees: 5 },
      { cx: 720, cy: 610, edge: 230, degrees: -7 },
      { cx: 30, cy: 60, edge: 200, degrees: -10 },
      { cx: 700, cy: 30, edge: 190, degrees: -3 },
    ],
    bandTop: 380,
  },
  /** The podcast cover, which Apple wants square and 1400–3000 px a side. */
  square: {
    canvas: { width: 1500, height: 1500 },
    slots: [
      { cx: 560, cy: 560, edge: 620, degrees: -4 },
      { cx: 1130, cy: 470, edge: 520, degrees: 6 },
      { cx: 1060, cy: 1080, edge: 500, degrees: -6 },
      { cx: 420, cy: 1150, edge: 480, degrees: 5 },
      { cx: 130, cy: 420, edge: 380, degrees: -9 },
      { cx: 1400, cy: 1300, edge: 360, degrees: 8 },
      { cx: 760, cy: 1400, edge: 340, degrees: -7 },
      { cx: 1420, cy: 90, edge: 320, degrees: -5 },
      { cx: 110, cy: 1400, edge: 330, degrees: 8 },
      { cx: 720, cy: 60, edge: 300, degrees: 4 },
    ],
    bandTop: 1180,
  },
} as const satisfies Record<string, Layout>;

type CollageShape = keyof typeof LAYOUTS;

export type MusicCollageOptions = { band?: CollageBand; shape?: CollageShape };

for (const [shape, { slots }] of Object.entries<Layout>(LAYOUTS)) {
  if (slots.length !== COLLAGE_SIZE) {
    throw new Error(
      `music-collage.ts has ${slots.length} ${shape} slots for collages of up to ${COLLAGE_SIZE} covers.`,
    );
  }
}

function coverStyle({ cx, cy, edge, degrees }: Slot, depth: number): string {
  return [
    `left: ${cx - edge / 2}px`,
    `top: ${cy - edge / 2}px`,
    `width: ${edge}px`,
    `height: ${edge}px`,
    `transform: rotate(${degrees}deg)`,
    `z-index: ${depth}`,
  ].join('; ');
}

/**
 * `covers` are site-root paths under `public/`, newest first, staged under their
 * own names — they share one directory, so the names are distinct.
 */
export function musicCollage(
  covers: readonly string[],
  { band, shape = 'card' }: MusicCollageOptions = {},
): StagedPage {
  const { canvas, slots, bandTop }: Layout = LAYOUTS[shape];
  const bandHtml =
    band === undefined
      ? ''
      : `    <div class="band"><h1>${escapeHtml(band.title)}</h1><p>${escapeHtml(band.line)}</p></div>\n`;
  const images = covers.flatMap((cover, index) => {
    const slot = slots[index];

    return slot === undefined
      ? []
      : [
          `    <img src="${path.basename(cover)}" alt="" style="${coverStyle(slot, slots.length - index)}" />`,
        ];
  });

  return {
    page: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html { zoom: ${SCALE}; }
      html, body { margin: 0; padding: 0; }
      body {
        position: relative;
        width: ${canvas.width}px;
        height: ${canvas.height}px;
        overflow: hidden;
        background: ${INK};
      }
      img {
        position: absolute;
        display: block;
        box-shadow: 0 10px 36px rgb(0 0 0 / 0.6);
      }
      .band {
        position: absolute;
        left: 0;
        right: 0;
        top: ${bandTop}px;
        z-index: ${slots.length + 1};
        padding: 26px 64px 30px;
        background: rgb(11 11 11 / 0.84);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      }
      h1 { margin: 0; font-size: 68px; font-weight: 700; line-height: 1.1; }
      p { margin: 12px 0 0; font-size: 30px; line-height: 1.3; color: rgb(255 255 255 / 0.78); }
    </style>
  </head>
  <body>
${images.join('\n')}
${bandHtml}  </body>
</html>
`,
    files: Object.fromEntries(
      covers.map((cover) => [
        path.basename(cover),
        fs.readFileSync(path.join(PUBLIC_DIR, cover)),
      ]),
    ),
    pixels: { width: canvas.width * SCALE, height: canvas.height * SCALE },
  };
}
