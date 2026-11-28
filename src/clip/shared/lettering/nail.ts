import type { Point } from '@/clip/shared/ink';

import { layOut, writtenUpTo } from './layout';
import type { Writing } from './write';

/** Where the writing hand's nail is, and which way it is moving. */
export type Nail = {
  /** In the coordinates the writing is drawn in, its place applied. */
  nailTip: Point;
  /** The way the stroke under it runs, in degrees clockwise from rightward. */
  strokeHeading: number;
  /** Whether it is on the wall mid-stroke: not before the first or after the last. */
  pressing: boolean;
};

const DEGREES = 180 / Math.PI;

/**
 * The nail writing `text` at `writing`'s `progress`: at the end of the drawn
 * part of the stroke being written, so a hand drawn there leads the line.
 * Between strokes it jumps, as the writing does. It follows the layout's
 * strokes, which a scratched line wavers about by a few hundredths of a cap.
 */
export function nailAt(text: string, writing: Writing): Nail {
  const {
    progress = 1,
    x = 0,
    y = 0,
    scale = 1,
    rot = 0,
    flip = false,
  } = writing;
  const layout = layOut(text, writing);
  const written = writtenUpTo(layout, progress);
  const current = written.at(-1);
  const [first] = layout.strokes;
  const points = current?.drawn ?? first?.points.slice(0, 1) ?? [];
  const whole = current?.points ?? first?.points ?? [];
  const at = points.at(-1) ?? [0, 0];
  // The way it runs: along its last drawn segment, or its first while unbegun.
  const from = points.at(-2) ?? whole[0] ?? at;
  const to = points.length >= 2 ? at : (whole[1] ?? at);
  const mirror = flip ? -1 : 1;
  const turn = rot / DEGREES;
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
  const placed = ([px, py]: Point): Point => {
    const [sx, sy] = [px * scale * mirror, py * scale];
    return [x + sx * cos - sy * sin, y + sx * sin + sy * cos];
  };
  const [ax, ay] = placed(from);
  const [bx, by] = placed(to);
  return {
    nailTip: placed(at),
    strokeHeading: Math.atan2(by - ay, bx - ax) * DEGREES,
    pressing: progress > 0 && progress < 1 && current !== undefined,
  };
}
