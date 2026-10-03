/**
 * How many drops fall and where, as pure functions of a random stream and
 * the screen: the steady and the gushed counts, the column a drop falls
 * down, densest under the tapped cloud, how far up its path it shows, and
 * the first point of its path a drawn outline stops it at.
 */

import type { Circle, Point } from '../../model/geometry';
import { between, type Random } from '../../model/random';
import { cloudBox } from './cloud-puffs';

/** The share of the drops that fall in the tapped cloud's span while it shows. */
export const UNDER_CLOUD = 0.5;

/** The most drops ever in the air, the gush's included. */
export const MOST_DROPS = 120;
/** The drops a tap on a cloud while it rains adds under it at once. */
export const GUSH_DROPS = 24;
/** The steady drops in the air in a full downpour, leaving the gush its own room. */
export const STEADY_DROPS = MOST_DROPS - GUSH_DROPS;

/** The drops in the air now: all of them, and those of a gush among them. */
export type DropsInAir = { all: number; gushed: number };

/**
 * How many steady drops to start for `downpour` (0 to 1): up to its share
 * of `STEADY_DROPS`, a gush's drops not counted against it, so a gush adds
 * on top of the steady rain rather than pausing it — within `MOST_DROPS`.
 */
export function steadyToStart(downpour: number, air: DropsInAir): number {
  const steady = Math.round(STEADY_DROPS * downpour) - (air.all - air.gushed);
  return Math.max(0, Math.min(steady, MOST_DROPS - air.all));
}

/** How many drops a gush starts with `all` drops in the air: `GUSH_DROPS`, within `MOST_DROPS`. */
export function gushToStart(all: number): number {
  return Math.max(0, Math.min(GUSH_DROPS, MOST_DROPS - all));
}

/**
 * The tapped cloud's drawn span across a screen `width` wide, clipped to it;
 * `undefined` while the cloud is off the screen or its span clips to nothing.
 */
export function cloudSpan(
  width: number,
  under: Circle | undefined,
): [number, number] | undefined {
  if (!under) return undefined;
  const box = cloudBox(under);
  const left = Math.max(0, box.left);
  const right = Math.min(width, box.right);
  return left < right ? [left, right] : undefined;
}

/**
 * How far above `to` a drop falling `fall` px down to it, drifting rightward
 * `slant` px (more than 0) for each px down, first shows: below the lowest of `clouds` (each where
 * the screen shows it, `undefined` while off it) whose drawn puffs its path
 * passes behind, so rain falls out of a cloud's underside and never over
 * it; all of `fall` where the path passes behind none, and 0 where it is
 * behind one all the way down.
 */
export function shownFrom(
  to: Point,
  fall: number,
  slant: number,
  clouds: ReadonlyArray<Circle | undefined>,
): number {
  let shown = fall;
  for (const cloud of clouds) {
    if (!cloud) continue;
    const { left, right, top, bottom } = cloudBox(cloud);
    // The heights above `to` between which the path stands within the box:
    // within its span across, which a path slanting rightward down crosses
    // from its right edge up to its left one, and between its top and foot.
    const low = Math.max(to.y - bottom, (to.x - right) / slant);
    const high = Math.min(to.y - top, (to.x - left) / slant, fall);
    if (low <= high) shown = Math.min(shown, Math.max(0, low));
  }
  return shown;
}

/**
 * The column across a screen `width` wide a new drop falls down: `share` of
 * them in the tapped cloud `under`'s span while it shows, the rest — and
 * all of them while it does not — anywhere across the screen.
 */
export function dropColumn(
  random: Random,
  width: number,
  under: Circle | undefined,
  share = UNDER_CLOUD,
): number {
  const span = cloudSpan(width, under);
  if (span && random() < share) return between(random, ...span);
  return random() * width;
}

/**
 * How far along the path `from` → `to` it first crosses the closed
 * `outline`'s edge, from 0 at `from` to 1 at `to`; `undefined` where it
 * never does.
 */
export function firstCrossing(
  outline: readonly Point[],
  from: Point,
  to: Point,
): number | undefined {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let first: number | undefined;
  for (const [index, a] of outline.entries()) {
    const b = outline[(index + 1) % outline.length];
    if (!b) continue;
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const across = dx * ey - dy * ex;
    if (across === 0) continue;
    const ax = a.x - from.x;
    const ay = a.y - from.y;
    const along = (ax * ey - ay * ex) / across;
    const onEdge = (ax * dy - ay * dx) / across;
    if (along < 0 || along > 1 || onEdge < 0 || onEdge > 1) continue;
    if (first === undefined || along < first) first = along;
  }
  return first;
}

/** The point `share` of the way from `from` to `to`. */
export function lerpPoint(from: Point, to: Point, share: number): Point {
  return {
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
  };
}
