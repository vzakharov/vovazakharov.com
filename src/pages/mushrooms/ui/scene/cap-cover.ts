/**
 * How much of a mushroom the nearer ones hide: read at points spread over
 * its cap (dome and gills) and over its stem as drawn, each point hidden
 * where any nearer mushroom's cap, gills or stem is drawn over it, so a pick
 * and the sweeps over it measure what the eye sees.
 */

import type { Planted } from '../../model/game';
import {
  type Box,
  boxAround,
  containsPoint,
  type Point,
} from '../../model/geometry';
import { openingIndex } from '../../model/placement';
import { boxOf, type Standing, standingAt } from './door-sight';
import type { Placement } from './layout';

/** The parts of a mushroom whose share hidden is held. */
export const PARTS = ['cap', 'stem'] as const;
export type Part = (typeof PARTS)[number];

/** How much of each part of a mushroom the nearer ones may hide together. */
export const MOST_HIDDEN: Readonly<Record<Part, number>> = {
  cap: 0.25,
  stem: 0.5,
};

/** How many points across the wider side of a part's box its share hidden is read at. */
const SPREAD_STEPS = 16;

/** `standing`'s `part` as drawn, on screen. */
export function partOf(
  { drawn: [dome = [], gills = [], stem = []] }: Standing,
  part: Part,
): Point[][] {
  return part === 'cap' ? [dome, gills] : [stem];
}

/** The box round `standing`'s cap and gills as drawn. */
export function capBox(standing: Standing): Box {
  return boxAround(partOf(standing, 'cap').flat());
}

/** What of a part shows past what is drawn in front of it: its points in sight, of how many. */
export type Sighted = { spread: number; shown: readonly Point[] };

/** `shown` without the points any of `covers` holds. */
function pastCovers(
  shown: readonly Point[],
  covers: ReadonlyArray<readonly Point[]>,
): Point[] {
  const boxed = covers.map((cover) => ({ cover, box: boxOf(cover) }));
  return shown.filter(
    (point) =>
      !boxed.some(
        ({ cover, box }) =>
          point.x >= box.left &&
          point.x <= box.right &&
          point.y >= box.top &&
          point.y <= box.bottom &&
          containsPoint(cover, point),
      ),
  );
}

/**
 * The area `outlines` hold together, read at `SPREAD_STEPS` points across
 * its box's wider side, as it shows past `covers`.
 */
export function sighted(
  outlines: ReadonlyArray<readonly Point[]>,
  covers: ReadonlyArray<readonly Point[]>,
): Sighted {
  const { left, right, top, bottom } = boxAround(outlines.flat());
  const step = Math.max(right - left, bottom - top) / SPREAD_STEPS;
  const spread: Point[] = [];
  for (let x = left + step / 2; x < right; x += step) {
    for (let y = top + step / 2; y < bottom; y += step) {
      const point = { x, y };
      if (outlines.some((outline) => containsPoint(outline, point))) {
        spread.push(point);
      }
    }
  }
  if (spread.length === 0) throw new Error('A part holding none of its spread');
  return { spread: spread.length, shown: pastCovers(spread, covers) };
}

/** A part's sight once `covers` are drawn in front of it too. */
export function pastMore(
  { spread, shown }: Sighted,
  covers: ReadonlyArray<readonly Point[]>,
): Sighted {
  return { spread, shown: pastCovers(shown, covers) };
}

/** How much of a part a sight reads as hidden: from 0 to 1. */
export const hiddenOf = ({ spread, shown }: Sighted) =>
  1 - shown.length / spread;

/** How `standing`'s `part` shows past everything `nearer` draws. */
export function partSighted(
  standing: Standing,
  part: Part,
  nearer: readonly Standing[],
): Sighted {
  return sighted(
    partOf(standing, part),
    nearer.flatMap(({ drawn }) => drawn),
  );
}

/** How each of `standing`'s parts shows past everything `nearer` draws. */
export function partsSighted(
  standing: Standing,
  nearer: readonly Standing[],
): Record<Part, Sighted> {
  return {
    cap: partSighted(standing, 'cap', nearer),
    stem: partSighted(standing, 'stem', nearer),
  };
}

/** A mushroom as it stands, and whether it is one of the opening clump. */
export type Among = { standing: Standing; opening: boolean };

/** `mushroom` as the scene stands it in `place` (`standingAt`). */
export function amongAt(place: Placement, mushroom: Planted): Among {
  return {
    standing: standingAt(place, mushroom),
    opening: openingIndex(mushroom.foot) !== undefined,
  };
}

/**
 * Those of `among` whose drawing counts against `one`'s parts: every nearer
 * one but its clump partner, the clump's two crossing by design.
 */
export function hidersOf(
  { standing, opening }: Among,
  among: readonly Among[],
): Standing[] {
  return among
    .filter(
      (other) =>
        other.standing.depth > standing.depth && !(opening && other.opening),
    )
    .map((other) => other.standing);
}
