import type { Point } from '@/clip/shared/ink';

/** One pen movement: a polyline the pen draws without lifting. */
export type Stroke = readonly Point[];

/**
 * A character as pen movements, in a box one cap-height tall: `y` runs from 0
 * at the cap line to 1 on the baseline (a tail or a comma dips below it), `x`
 * from 0 to `setWidth`. The strokes are listed in the order a hand writes them.
 */
export type Glyph = {
  /** How far the pen moves on after it, before the gap between letters. */
  setWidth: number;
  strokes: readonly Stroke[];
};

// Points a full turn of an arc is cut into: enough that the straight pieces
// read as a curve at the largest size a scene sets.
const ARC_STEPS = 40;

/**
 * Points along an ellipse round `(cx, cy)`, from `from` to `to` degrees — 0 is
 * to the right and 90 straight down, so a growing angle turns clockwise on the
 * stage. `to` below `from` runs the other way.
 */
export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
): Point[] {
  const steps = Math.max(2, Math.ceil((Math.abs(to - from) / 360) * ARC_STEPS));
  return Array.from({ length: steps + 1 }, (_, n) => {
    const angle = ((from + ((to - from) * n) / steps) * Math.PI) / 180;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)] as const;
  });
}

/** A stroke through the points whose coordinates `xy` lists in pairs: `line(x0, y0, x1, y1, …)`. */
export function line(...xy: readonly number[]): Point[] {
  const points: Point[] = [];
  for (let n = 0; n + 1 < xy.length; n += 2) {
    points.push([xy[n] ?? 0, xy[n + 1] ?? 0]);
  }
  return points;
}

/** A dot: a stroke too short to be anything but the pen's round end. */
export const dot = (x: number, y: number): Stroke => [
  [x, y],
  [x + 0.01, y + 0.02],
];
