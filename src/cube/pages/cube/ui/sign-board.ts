import { cssRgb, type Rgb, signOf } from '../lib/palette';

/** The board texture's size in pixels, the sign's own 2:1. */
const WIDTH = 512;
const HEIGHT = 256;
const BORDER = 14;
const FONT = 'system-ui, sans-serif';

/**
 * A sign board on floor `n` as a canvas to upload: `title` over `line`, in a
 * border, on the floor's board colour, inked as `sold` says. WebGPU draws no
 * text, so the browser's canvas does it once per floor and kind of sign.
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
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  /** `text` centred at `height` of the board, shrunk from `size` px to fit. */
  const write = (
    text: string,
    size: number,
    weight: number,
    colour: Rgb,
    height: number,
  ) => {
    const font = (px: number) => `${String(weight)} ${String(px)}px ${FONT}`;
    context.font = font(size);
    const room = WIDTH - 6 * BORDER;
    const wide = context.measureText(text).width;
    if (wide > room) context.font = font(Math.floor((size * room) / wide));
    context.fillStyle = cssRgb(colour);
    context.fillText(text, WIDTH / 2, HEIGHT * height);
  };
  write(title.toUpperCase(), 76, 800, ink, 0.36);
  write(line, 64, 700, lineInk, 0.7);
  return canvas;
}
