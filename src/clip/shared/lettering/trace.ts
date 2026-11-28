import { noise, type Pen, type Point, reseed } from '@/clip/shared/ink';

import type { Stroke } from './glyph';

/**
 * `points` boiled: the stroke's two ends nudged by up to `wobble` and every
 * point between moved by the blend of the two, so a letter shivers as one
 * piece instead of fraying.
 */
export function boiledPoints(
  pen: Pen,
  points: Stroke,
  seed: number,
  wobble: number,
  [offsetX, offsetY]: readonly [number, number] = [0, 0],
): Point[] {
  const key = reseed(seed, pen.boil);
  const startX = noise(key, 0) * wobble;
  const startY = noise(key, 1) * wobble;
  const endX = noise(key, 2) * wobble;
  const endY = noise(key, 3) * wobble;
  const last = Math.max(1, points.length - 1);
  return points.map(([x, y], n): Point => {
    const f = n / last;
    return [
      x + offsetX + startX + (endX - startX) * f,
      y + offsetY + startY + (endY - startY) * f,
    ];
  });
}

/** Adds `points`, boiled, to the context's current path. */
export function traceBoiled(
  pen: Pen,
  points: Stroke,
  seed: number,
  wobble: number,
  offset?: readonly [number, number],
): void {
  traceOnto(pen.ctx, boiledPoints(pen, points, seed, wobble, offset));
}

/** Adds `points` to `ctx`'s current path as one open line. */
export function traceOnto(
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
): void {
  for (const [n, [x, y]] of points.entries()) {
    if (n === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}
