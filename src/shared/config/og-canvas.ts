/**
 * The frame every Open Graph card is rendered into, here rather than beside the
 * renderer because a site whose avatar is a card publishes the PNG's size in its
 * metadata, and the two must not drift.
 *
 * Bare Node imports this file from the render scripts, so it stays free of
 * syntax type stripping cannot erase and of value imports.
 */

import type { Sized } from '../typings/index.ts';

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
