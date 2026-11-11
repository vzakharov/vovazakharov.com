import type { Point, Polyline } from '@/cube/shared/lettering';

/** A box with its sides along the axes, by its lower left and upper right. */
export type Frame = { low: Point; high: Point };

/**
 * The part of the segment `a`–`b` inside `frame`, as where along it (0 to 1)
 * it enters and leaves, or `null` when it misses.
 */
function inside(
  a: Point,
  b: Point,
  { low, high }: Frame,
): readonly [number, number] | null {
  let [enter, leave] = [0, 1];
  for (const axis of [0, 1] as const) {
    const from = a[axis];
    const run = b[axis] - from;
    if (run === 0) {
      if (from < low[axis] || from > high[axis]) return null;
    } else {
      const [near, far] = [
        (low[axis] - from) / run,
        (high[axis] - from) / run,
      ].toSorted((x, y) => x - y);
      enter = Math.max(enter, near ?? 0);
      leave = Math.min(leave, far ?? 1);
      if (enter > leave) return null;
    }
  }
  return [enter, leave];
}

const along = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/**
 * `lines` with everything outside `frame` cut away: a stroke that leaves the
 * frame ends at its edge, and one that comes back starts a new stroke there.
 */
export function clipped(lines: readonly Polyline[], frame: Frame): Polyline[] {
  const kept: Point[][] = [];
  for (const line of lines) {
    let run: Point[] = [];
    const close = () => {
      if (run.length > 1) kept.push(run);
      run = [];
    };
    for (const [at, a] of line.slice(0, -1).entries()) {
      const b = line[at + 1] ?? a;
      const span = inside(a, b, frame);
      if (span === null) {
        close();
      } else {
        const [enter, leave] = span;
        if (enter > 0) close();
        if (run.length === 0) run.push(along(a, b, enter));
        run.push(along(a, b, leave));
        if (leave < 1) close();
      }
    }
    close();
  }
  return kept;
}
