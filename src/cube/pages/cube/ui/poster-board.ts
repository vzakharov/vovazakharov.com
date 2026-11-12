import {
  paintPoster,
  POSTER_TALL,
  POSTER_WIDE,
  posterOf,
} from '@/cube/entities/poster';
import type { BoardShape } from '@/cube/entities/world';

/** The texture's width in pixels; its height keeps the sheet's proportions. */
const WIDTH = 1024;

/**
 * A landing room's poster on its wall: the sheet's own size, its middle at
 * 1.35 m on floor 1, so it hangs from 60 cm to 2.1 m.
 */
export const POSTER: BoardShape = {
  width: POSTER_WIDE,
  height: POSTER_TALL,
  hungAt: 0.27,
};

/** Floor `n`'s poster as a canvas to upload. */
export function drawPoster(n: number): OffscreenCanvas {
  const scale = WIDTH / POSTER_WIDE;
  const canvas = new OffscreenCanvas(WIDTH, Math.round(POSTER_TALL * scale));
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('No 2D canvas to paint a poster on');
  paintPoster(context, posterOf(n), scale);
  return canvas;
}
