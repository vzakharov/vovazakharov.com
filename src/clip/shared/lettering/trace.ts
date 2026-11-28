import { noise, type Pen, reseed } from '@/clip/shared/ink';

import type { Stroke } from './glyph';

/**
 * Adds `points` to the context's current path, boiled: the stroke's two ends
 * are nudged by up to `wobble` and every point between moves by the blend of
 * the two, so a letter shivers as one piece instead of fraying.
 */
export function traceBoiled(
  pen: Pen,
  points: Stroke,
  seed: number,
  wobble: number,
  [offsetX, offsetY]: readonly [number, number] = [0, 0],
): void {
  const { ctx, boil } = pen;
  const key = reseed(seed, boil);
  const startX = noise(key, 0) * wobble;
  const startY = noise(key, 1) * wobble;
  const endX = noise(key, 2) * wobble;
  const endY = noise(key, 3) * wobble;
  const last = Math.max(1, points.length - 1);
  for (const [n, [x, y]] of points.entries()) {
    const f = n / last;
    const px = x + offsetX + startX + (endX - startX) * f;
    const py = y + offsetY + startY + (endY - startY) * f;
    if (n === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
}
