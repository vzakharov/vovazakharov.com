import {
  measure,
  paintStrokes,
  type Polyline,
  scriptOf,
  strokes,
} from '@/cube/shared/lettering';
import { cssRgb, type Rgb } from '@/cube/shared/lib/colour';

/** A board texture's size in pixels, a board's own 2:1. */
const WIDTH = 512;
const HEIGHT = 256;
const BORDER = 14;
/** The nib's width, as a share of the capitals' height. */
const NIB = 0.15;

/** A board being lettered: its canvas, and the two ways ink goes on it. */
type Lettered = {
  canvas: OffscreenCanvas;
  /**
   * `lines`, `wide` em across, centred on `height` of the board, an em `cap`
   * px or as few as fit them between the borders.
   */
  ink: (
    lines: readonly Polyline[],
    wide: number,
    cap: number,
    colour: Rgb,
    height: number,
  ) => void;
  /** `text` inked the same way, in the floor's script. */
  write: (text: string, cap: number, colour: Rgb, height: number) => void;
};

/**
 * A blank board on floor `n` as a canvas to upload: `board` inside a border
 * of `edge`, lettered in the floor's script. WebGPU draws no text, so a canvas
 * does it once per board.
 */
export function letteredBoard(n: number, board: Rgb, edge: Rgb): Lettered {
  const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('No 2D canvas to draw a board on');
  context.fillStyle = cssRgb(edge);
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = cssRgb(board);
  context.fillRect(BORDER, BORDER, WIDTH - 2 * BORDER, HEIGHT - 2 * BORDER);
  const script = scriptOf(n);
  const ink: Lettered['ink'] = (lines, wide, cap, colour, height) => {
    const fit = Math.min(cap, (WIDTH - 6 * BORDER) / wide);
    paintStrokes(context, lines, {
      leftPixel: (WIDTH - wide * fit) / 2,
      baseline: HEIGHT * height + fit / 2,
      pixelsPerUnit: fit,
      nibPixels: fit * NIB,
      inkColour: cssRgb(colour),
    });
  };
  return {
    canvas,
    ink,
    write: (text, cap, colour, height) => {
      ink(strokes(text, script), measure(text, script), cap, colour, height);
    },
  };
}
