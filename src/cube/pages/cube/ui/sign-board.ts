import {
  measure,
  paintStrokes,
  scriptOf,
  strokes,
} from '@/cube/shared/lettering';
import { cssRgb, type Rgb } from '@/cube/shared/lib/colour';

import { signOf } from '../lib/palette';

/** The board texture's size in pixels, the sign's own 2:1. */
const WIDTH = 512;
const HEIGHT = 256;
const BORDER = 14;
/** The nib's width, as a share of the capitals' height. */
const NIB = 0.15;

/**
 * A sign board on floor `n` as a canvas to upload: `title` over `line`, in a
 * border, on the floor's board colour, inked as `sold` says, both lettered in
 * the floor's script. WebGPU draws no text, so a canvas does it once per floor
 * and kind of sign.
 */
export function drawBoard(
  n: number,
  sold: boolean,
  title: string,
  line: string,
): OffscreenCanvas {
  const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('No 2D canvas to draw a sign on');
  const { board, ink, price: lineInk } = signOf(n, sold);
  context.fillStyle = cssRgb(ink);
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = cssRgb(board);
  context.fillRect(BORDER, BORDER, WIDTH - 2 * BORDER, HEIGHT - 2 * BORDER);
  const script = scriptOf(n);
  /** `text` centred on `height` of the board, its capitals `cap` px or narrower. */
  const write = (text: string, cap: number, colour: Rgb, height: number) => {
    const wide = measure(text, script);
    const fit = Math.min(cap, (WIDTH - 6 * BORDER) / wide);
    paintStrokes(context, strokes(text, script), {
      leftPixel: (WIDTH - wide * fit) / 2,
      baseline: HEIGHT * height + fit / 2,
      pixelsPerUnit: fit,
      nibPixels: fit * NIB,
      inkColour: cssRgb(colour),
    });
  };
  write(title.toUpperCase(), 60, ink, 0.36);
  write(line, 50, lineInk, 0.7);
  return canvas;
}
