/**
 * Where a bed draws a thing standing on the ground this frame: the beds lay
 * everything out once at the opening eye and draw it at that size, and this
 * is what places it through the view (`ofGround`), scales it by `zoom`, sorts
 * it by the row it stands on, hides it near the eye (`cull`) and sets it
 * under the near hills past the ground's top row (`behindHills`).
 */

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { Ground, LayeredPoint } from '../../model/ground';
import { behindHills, cull, ofGround, type Placed, type View } from './view';

/**
 * The depth a thing past the ground's top row is drawn about: between the
 * far hills (-5) and the near hills (-4) of `paint-backdrop.ts`'s `DEPTHS`,
 * so the near hills cover it from the foot up.
 */
const BEHIND_HILLS = -4.5;
/**
 * How much of a unit of depth a px down the screen, or a part's `nearer`,
 * is worth behind the hills: small enough that every row of the tallest
 * screen keeps inside the half unit between the two ranges.
 */
const BEHIND_SQUEEZE = 1e-4;

/**
 * A thing's place on the screen this frame: where its foot stands, in CSS
 * px, the row it sorts by (`depth`, its foot's screen row), whether it is
 * drawn at all and whether behind the near hills, and how far ahead of the
 * eye it stands: `Infinity` while no view placed it.
 */
export type BedPlace = LayeredPoint &
  Pick<Placed, 'zoom' | 'ahead'> & { drawn: boolean; behind: boolean };

/** A bed object's place on the screen as last placed. */
export type Standing = { stands: BedPlace };

/** Where `view` draws a thing whose foot stands on `foot`. */
export function bedPlace(view: View, foot: Ground): BedPlace {
  const placed = ofGround(view, foot);
  return {
    ...pick(placed, 'x', 'y', 'zoom', 'ahead'),
    depth: placed.y,
    drawn: !cull(placed),
    behind: behindHills(placed),
  };
}

/** A thing drawn where the layout stands it, as no view has placed it yet. */
export function layoutPlace({ x, y }: Point): BedPlace {
  return {
    x,
    y,
    zoom: 1,
    ahead: Infinity,
    depth: y,
    drawn: true,
    behind: false,
  };
}

/** A thing not drawn, as it waits for a place. */
export const UNPLACED: BedPlace = {
  x: 0,
  y: 0,
  zoom: 1,
  ahead: Infinity,
  depth: 0,
  drawn: false,
  behind: false,
};

/** What a bed object takes its place through. */
type Stands = {
  setPosition: (x: number, y: number) => unknown;
  setDepth: (depth: number) => unknown;
  setVisible: (visible: boolean) => unknown;
};

/**
 * The depth `place` draws a part at, `nearer` than the thing itself so the
 * parts of one thing keep their order among themselves: its row, or behind
 * the hills that row squeezed under the near hills.
 */
export function depthOf(place: BedPlace, nearer = 0): number {
  const row = place.depth + nearer;
  return place.behind ? BEHIND_HILLS + row * BEHIND_SQUEEZE : row;
}

/** Stands `object` at `place`, drawn `nearer` in depth than the thing itself (`depthOf`). */
export function standAt(object: Stands, place: BedPlace, nearer = 0): void {
  object.setPosition(place.x, place.y);
  object.setDepth(depthOf(place, nearer));
  object.setVisible(place.drawn);
}
