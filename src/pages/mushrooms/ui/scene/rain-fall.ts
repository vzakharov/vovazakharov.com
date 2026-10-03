/**
 * Where a drop falls, as pure functions of a random stream and the screen:
 * the column it falls down, densest under the tapped cloud, and the first
 * point of its path a drawn outline stops it at.
 */

import type { Circle, Point } from '../../model/geometry';
import { between, type Random } from '../../model/random';
import { CLOUD_SPREAD } from './rain-sky';

/** The share of the drops that fall in the tapped cloud's span while it shows. */
export const UNDER_CLOUD = 0.5;

/**
 * The tapped cloud's drawn span across a screen `width` wide, clipped to it;
 * `undefined` while the cloud is off the screen or its span clips to nothing.
 */
export function cloudSpan(
  width: number,
  under: Circle | undefined,
): [number, number] | undefined {
  if (!under) return undefined;
  const left = Math.max(0, under.x - CLOUD_SPREAD * under.r);
  const right = Math.min(width, under.x + CLOUD_SPREAD * under.r);
  return left < right ? [left, right] : undefined;
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
