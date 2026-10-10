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

/** A cover's place on the canvas: its centre, its side, and its tilt in degrees. */
type Slot = { x: number; y: number; size: number; turn: number };

/**
 * Hand-tuned rather than seeded, so the composition is judged once, not
 * re-rolled whenever a release reshuffles it. Any prefix of two or more must
 * compose: the first slot, the largest, is the newest cover's, and each later
 * one sits under those before it in the emptiest stretch they leave. Canvas units.
 */
const SLOTS: readonly Slot[] = [
  { x: 470, y: 330, size: 400, turn: -4 },
  { x: 830, y: 280, size: 330, turn: 6 },
  { x: 160, y: 300, size: 300, turn: -8 },
  { x: 1120, y: 520, size: 250, turn: -5 },
  { x: 1110, y: 90, size: 230, turn: 9 },
  { x: 60, y: 580, size: 240, turn: 7 },
  { x: 330, y: 20, size: 220, turn: 5 },
  { x: 720, y: 610, size: 230, turn: -7 },
  { x: 30, y: 60, size: 200, turn: -10 },
  { x: 700, y: 30, size: 190, turn: -3 },
];

if (SLOTS.length !== COLLAGE_SIZE) {
  throw new Error(
    `music-collage.ts has ${SLOTS.length} slots for collages of up to ${COLLAGE_SIZE} covers.`,
  );
}

function coverStyle({ x, y, size, turn }: Slot, depth: number): string {
  return [
    `left: ${x - size / 2}px`,
    `top: ${y - size / 2}px`,
    `width: ${size}px`,
    `height: ${size}px`,
    `transform: rotate(${turn}deg)`,
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
