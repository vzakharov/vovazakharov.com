import type { Glyph } from '@/cube/shared/lettering';

import { signOf } from '../lib/palette';
import { letteredBoard } from './board-canvas';

/**
 * A sign board on floor `n` as a canvas to upload: `title` over `line`, `lead`
 * before it if given, on the floor's board colour, inked as `sold` says, one
 * per floor and kind of sign.
 */
export function drawBoard(
  n: number,
  sold: boolean,
  title: string,
  line: string,
  lead?: Glyph,
): OffscreenCanvas {
  const { board, ink, price } = signOf(n, sold);
  const { canvas, write } = letteredBoard(n, board, ink);
  write(title.toUpperCase(), 60, ink, 0.36);
  write(line, 50, price, 0.7, lead);
  return canvas;
}
