/**
 * The music section's social card, covers scattered at different sizes and
 * angles with no text, as a page for `og-render.ts` to screenshot.
 */

import fs from 'node:fs';
import path from 'node:path';

import { CANVAS, SCALE } from '@/shared/config/index.node-safe';
import { PUBLIC_DIR } from '@/shared/content/collections';

import { COLLAGE_SIZE } from '@/pages/music/lib/pictures';

import { INK, type StagedPage } from './og-render.ts';

/** A cover's place on the canvas: its centre, the length of its edge, and its tilt. */
type Slot = { cx: number; cy: number; edge: number; degrees: number };

/**
 * Hand-tuned rather than seeded, so the composition is judged once, not
 * re-rolled whenever a release reshuffles it. Any prefix of two or more must
 * compose: the first slot, the largest, is the newest cover's, and each later
 * one sits under those before it in the emptiest stretch they leave. Canvas units.
 */
const SLOTS: readonly Slot[] = [
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
];

if (SLOTS.length !== COLLAGE_SIZE) {
  throw new Error(
    `music-collage.ts has ${SLOTS.length} slots for collages of up to ${COLLAGE_SIZE} covers.`,
  );
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
export function musicCollage(covers: readonly string[]): StagedPage {
  const images = covers.flatMap((cover, index) => {
    const slot = SLOTS[index];

    return slot === undefined
      ? []
      : [
          `    <img src="${path.basename(cover)}" alt="" style="${coverStyle(slot, SLOTS.length - index)}" />`,
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
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        overflow: hidden;
        background: ${INK};
      }
      img {
        position: absolute;
        display: block;
        box-shadow: 0 10px 36px rgb(0 0 0 / 0.6);
      }
    </style>
  </head>
  <body>
${images.join('\n')}
  </body>
</html>
`,
    files: Object.fromEntries(
      covers.map((cover) => [
        path.basename(cover),
        fs.readFileSync(path.join(PUBLIC_DIR, cover)),
      ]),
    ),
  };
}
