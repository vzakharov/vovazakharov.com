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
export type Inking = {
  /** The canvas pixel the strokes' origin lands on. */
  left: number;
  /** The canvas row of the strokes' y = 0: their baseline. */
  baseline: number;
  /** Pixels to one unit of the strokes. */
  unit: number;
  /** The nib's width, in pixels. */
  nib: number;
  /** A CSS colour. */
  ink: string;
};

/**
 * Inks `lines` on `pen` with a round nib. The strokes' y runs upward and a
 * canvas's downward, so a point `(x, y)` lands at
 * `(left + x · unit, baseline − y · unit)`.
 */
export function paintStrokes(
  pen: Pen,
  lines: readonly Polyline[],
  { left, baseline, unit, nib, ink }: Inking,
): void {
  pen.lineWidth = nib;
  pen.lineCap = 'round';
  pen.lineJoin = 'round';
  pen.strokeStyle = ink;
  pen.beginPath();
  for (const line of lines) {
    for (const [at, [x, y]] of line.entries()) {
      const [px, py] = [left + x * unit, baseline - y * unit];
      if (at === 0) pen.moveTo(px, py);
      else pen.lineTo(px, py);
    }
  }
  pen.stroke();
}
