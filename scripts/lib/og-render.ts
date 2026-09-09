/**
 * How an Open Graph card is rasterized: the canvas every card shares, and the
 * Chromium screenshot of a staged page. The page is whatever a card kind
 * produces — a letterbox around an authored SVG, or a laid-out HTML card — so
 * this file knows the frame and nothing about what goes in it.
 *
 * Bare Node can run this file, relying on its type stripping, so it stays free
 * of syntax the stripper cannot erase and every relative import carries its
 * `.ts` extension.
 */

/* eslint-disable no-console -- stdout is the calling script's interface: the
   render log is what a human runs it for. The rule stays `error` in the app,
   where a stray log ships to a user. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { Sized } from '../../src/shared/content/image-dimensions.ts';
import { REPO_ROOT } from './content-tree.ts';
import type { Renderable } from './render-manifest.ts';

/**
 * 1200×630 is what X's `summary_large_image` crops to, and the chart's native
 * 980×640 would lose its title row and x-axis to that crop. Letterboxing into
 * the ratio costs padding and loses nothing.
 */
export const CANVAS: Sized = { width: 1200, height: 630 };

/** Doubled so the card stays sharp where a consumer renders it at 2×. */
export const SCALE = 2;

/**
 * The PNG's real pixel size, and the size the page is laid out at — scaling
 * `CANVAS` by a device pixel ratio instead widens the bottom-row loss the chart
 * page's padding guards against.
 */
export const PIXELS: Sized = {
  width: CANVAS.width * SCALE,
  height: CANVAS.height * SCALE,
};

/** `globals.css`'s `--background`, so a card's inset extends its own plate. */
export const CANVAS_BACKGROUND = '#ffffff';

/**
 * A document for Chromium to screenshot, with the files it references written
 * beside it under the names it uses — a `file://` document's reach outside its
 * own directory is not something to depend on.
 */
export type StagedPage = {
  page: string;
  files: Record<string, string | Buffer>;
};

export type Card = Renderable & StagedPage;

export function renderCard(card: Card, chromium: string): void {
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
  const pagePath = path.join(stagingDir, 'card.html');

  for (const [name, content] of Object.entries(card.files)) {
    fs.writeFileSync(path.join(stagingDir, name), content);
  }
  fs.writeFileSync(pagePath, card.page);

  fs.mkdirSync(path.dirname(card.outputPath), { recursive: true });

  execFileSync(
    chromium,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      // Without it `--screenshot` can fire before a referenced image has
      // painted, yielding a blank card.
      '--virtual-time-budget=10000',
      `--window-size=${PIXELS.width},${PIXELS.height}`,
      `--screenshot=${card.outputPath}`,
      `file://${pagePath}`,
    ],
    { stdio: 'inherit' },
  );

  console.log(
    `  rendered ${path.relative(REPO_ROOT, card.outputPath)} ` +
      `(${PIXELS.width}×${PIXELS.height})`,
  );
}
