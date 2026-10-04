import type { Point } from '../../model/geometry';
import { gathered } from '../../model/ground';
import { alongSight, bendAt, pinholeOf } from '../../model/pinhole';
import { middleOf, rowAt, type View } from './view';

/**
 * The distances along a sight line, in the clump's size, its crossing of a
 * row is sought between, nearest first: geometric, so a crossing near the
 * eye is found as finely, for its size, as one at the meadow's far end.
 */
const SOUGHT = Array.from(
  { length: 49 },
  (_, step) => 0.05 * 4000 ** (step / 48),
);

/** How many halvings pin a crossing down between two of `SOUGHT`'s distances. */
const HALVINGS = 32;

/**
 * The distance from `view`'s eye, along the azimuth it sees at `x` across
 * the screen, to where that sight line first crosses the plane's curve the
 * layout's row `opening` ahead of the opening eye is spread onto; none
 * where it never does within the meadow's reach.
 */
function crossing(view: View, x: number, opening: number): number | undefined {
  const off = (distance: number) =>
    gathered(alongSight(view, view.eye, x, distance)).y - opening;
  let near = 0;
  let before = off(near);
  for (const far of SOUGHT) {
    const after = off(far);
    if (Math.sign(after) !== Math.sign(before)) {
      let [low, high] = [near, far];
      for (let halving = 0; halving < HALVINGS; halving++) {
        const middle = (low + high) / 2;
        if (Math.sign(off(middle)) === Math.sign(before)) low = middle;
        else high = middle;
      }
      return (low + high) / 2;
    }
    [near, before] = [far, after];
  }
  return undefined;
}

/**
 * `ofLayout` run backwards: the point, in the layout's world px, that `view`
 * shows at `screen`, in CSS px, standing over the ground row `footRow`. A
 * row's points stand on one upright curve over the plane, the row the
 * opening crop's pinhole sees `spread`, so this is where the screen's sight
 * line first meets it; none where it never does, nor for a row at or above
 * the horizon.
 */
export function layoutAtRow(
  view: View,
  screen: Point,
  footRow: number,
): Point | undefined {
  const pinhole = pinholeOf(view);
  if (footRow <= pinhole.y) return undefined;
  const { opening, perPx } = rowAt(view, footRow);
  const distance = crossing(view, screen.x, opening);
  if (distance === undefined) return undefined;
  const seen = gathered(alongSight(view, view.eye, screen.x, distance));
  const scale = (pinhole.focal * bendAt(pinhole, screen.x)) / distance;
  const height = view.eyeHeight - (screen.y - pinhole.y) / scale;
  return {
    x: middleOf(view) + seen.x / perPx,
    y: footRow - height / perPx,
  };
}

/**
 * Where `view`'s screen columns at `xs` (CSS px, left to right) meet the
 * layout's row `footRow`, in world px across, cut into runs that each go
 * left to right. The spread wraps a row round to nearly behind the opening
 * eye on either side, so a screen facing the plane's back meets the row's
 * two far ends out of order, its right end at the screen's left; a column
 * that meets the row nowhere also ends a run.
 */
function rowRuns(
  view: View,
  xs: readonly number[],
  footRow: number,
): number[][] {
  const runs: number[][] = [];
  let run: number[] = [];
  for (const x of xs) {
    const met = layoutAtRow(view, { x, y: footRow }, footRow);
    const last = run.at(-1);
    if (!met || (last !== undefined && met.x < last)) {
      if (run.length > 0) runs.push(run);
      run = [];
    }
    if (met) run.push(met.x);
  }
  if (run.length > 0) runs.push(run);
  return runs;
}

/**
 * The stretch of the world, in the layout's px across, that `view`'s screen
 * shows over the ground from its top row to its foot: the least span holding
 * where either edge of the screen meets either row. A screen's upright edge
 * meets a row at one x, which moves one way as the row does, so the two rows
 * bound every row between. `undefined` where an edge meets a row nowhere,
 * or the edges meet it out of order, the screen facing the plane's back:
 * the world's strip spreads less than a half-turn round the opening eye,
 * and a screen less than a half-turn wide that straddles the back sees none
 * of it.
 */
export function layoutShown(
  view: View,
): Record<'left' | 'right', number> | undefined {
  const xs: number[] = [];
  for (const row of [view.groundTop, view.height]) {
    const [run, ...others] = rowRuns(view, [0, view.width], row);
    if (run?.length !== 2 || others.length > 0) return undefined;
    xs.push(...run);
  }
  return { left: Math.min(...xs), right: Math.max(...xs) };
}
