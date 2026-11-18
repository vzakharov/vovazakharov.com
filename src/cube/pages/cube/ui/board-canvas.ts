import {
  type Glyph,
  measure,
  paintStrokes,
  placedAt,
  type Polyline,
  scriptOf,
  strokes,
} from '@/cube/shared/lettering';
import { cssRgb, type Rgb } from '@/cube/shared/lib/colour';

/** A board texture's width in pixels, and its height on a board twice as wide as tall. */
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
  /** `text` inked the same way, in the floor's script, after `lead` if given. */
  write: (
    text: string,
    cap: number,
    colour: Rgb,
    height: number,
    lead?: Glyph,
  ) => void;
};

/**
 * A blank board on floor `n` as a canvas to upload, `tall` pixels high:
 * `board` inside a border of `edge`, lettered in the floor's script. WebGPU
 * draws no text, so a canvas does it once per board.
 */
export function letteredBoard(
  n: number,
  board: Rgb,
  edge: Rgb,
  tall = HEIGHT,
): Lettered {
  const canvas = new OffscreenCanvas(WIDTH, tall);
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('No 2D canvas to draw a board on');
  context.fillStyle = cssRgb(edge);
  context.fillRect(0, 0, WIDTH, tall);
  context.fillStyle = cssRgb(board);
  context.fillRect(BORDER, BORDER, WIDTH - 2 * BORDER, tall - 2 * BORDER);
  const script = scriptOf(n);
  const ink: Lettered['ink'] = (lines, wide, cap, colour, height) => {
    const fit = Math.min(cap, (WIDTH - 6 * BORDER) / wide);
    paintStrokes(context, lines, {
      leftPixel: (WIDTH - wide * fit) / 2,
      baseline: tall * height + fit / 2,
      pixelsPerUnit: fit,
      nibPixels: fit * NIB,
      inkColour: cssRgb(colour),
    });
  };
  return {
    canvas,
    ink,
    write: (text, cap, colour, height, lead) => {
      const shift = lead?.advance ?? 0;
      ink(
        [
          ...(lead?.lines ?? []),
          ...placedAt(strokes(text, script), 1, shift),
        ],
        shift + measure(text, script),
        cap,
        colour,
        height,
      );
    },
  };
}
