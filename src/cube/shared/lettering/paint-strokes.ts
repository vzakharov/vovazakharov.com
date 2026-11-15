import type { Polyline } from './polyline';

/** What a stroke painter asks of a 2D canvas context, on or off screen. */
export type Pen = Pick<
  CanvasRenderingContext2D,
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
  | 'lineWidth'
  | 'lineCap'
  | 'lineJoin'
  | 'strokeStyle'
>;

/** Where strokes land on a canvas, and what they are inked with. */
type Inking = {
  /** The canvas pixel the strokes' origin lands on. */
  leftPixel: number;
  /** The canvas row of the strokes' y = 0: their baseline. */
  baseline: number;
  /** Pixels to one unit of the strokes. */
  pixelsPerUnit: number;
  /** The nib's width, in pixels. */
  nibPixels: number;
  /** A CSS colour. */
  inkColour: string;
};

/**
 * Inks `lines` on `pen` with a round nib. The strokes' y runs upward and a
 * canvas's downward, so a point `(x, y)` lands at
 * `(leftPixel + x · pixelsPerUnit, baseline − y · pixelsPerUnit)`.
 */
export function paintStrokes(
  pen: Pen,
  lines: readonly Polyline[],
  { leftPixel, baseline, pixelsPerUnit, nibPixels, inkColour }: Inking,
): void {
  pen.lineWidth = nibPixels;
  pen.lineCap = 'round';
  pen.lineJoin = 'round';
  pen.strokeStyle = inkColour;
  pen.beginPath();
  for (const line of lines) {
    for (const [at, [x, y]] of line.entries()) {
      const px = leftPixel + x * pixelsPerUnit;
      const py = baseline - y * pixelsPerUnit;
      if (at === 0) pen.moveTo(px, py);
      else pen.lineTo(px, py);
    }
  }
  pen.stroke();
}
