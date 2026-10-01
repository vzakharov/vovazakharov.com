/**
 * Where a bed draws a thing standing on the ground this frame: the beds lay
 * everything out once at the opening eye and draw it at that size, and this
 * is what places it through the view (`ofGround`), scales it by `zoom`, sorts
 * it by the row it stands on, hides it near the eye (`cull`) and fades it at
 * the hills' foot (`fade`).
 */

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { Ground, LayeredPoint } from '../../model/ground';
import type { Translucent } from './ink';
import { cull, fade, ofGround, type Placed, type View } from './view';

/**
 * A thing's place on the screen this frame: where its foot stands, in CSS
 * px, the depth it is drawn at, whether it is drawn at all and how opaque,
 * and how far ahead of the eye it stands: `Infinity` while no view placed it.
 */
export type BedPlace = LayeredPoint &
  Pick<Placed, 'zoom' | 'ahead'> &
  Translucent & { drawn: boolean };

/** A bed object's place on the screen as last placed. */
export type Standing = { stands: BedPlace };

/** Where `view` draws a thing whose foot stands on `foot`. */
export function bedPlace(view: View, foot: Ground): BedPlace {
  const placed = ofGround(view, foot);
  const alpha = fade(placed);
  return {
    ...pick(placed, 'x', 'y', 'zoom', 'ahead'),
    depth: placed.y,
    drawn: !cull(placed) && alpha > 0,
    alpha,
  };
}

/** A thing drawn where the layout stands it, as no view has placed it yet. */
export function layoutPlace({ x, y }: Point): BedPlace {
  return { x, y, zoom: 1, ahead: Infinity, depth: y, drawn: true, alpha: 1 };
}

/** A thing not drawn, as it waits for a place. */
export const UNPLACED: BedPlace = {
  x: 0,
  y: 0,
  zoom: 1,
  ahead: Infinity,
  depth: 0,
  drawn: false,
  alpha: 1,
};

/** What a bed object takes its place through. */
type Stands = {
  setPosition: (x: number, y: number) => unknown;
  setDepth: (depth: number) => unknown;
  setVisible: (visible: boolean) => unknown;
  setAlpha: (alpha: number) => unknown;
};

/**
 * Stands `object` at `place`, drawn `nearer` in depth than the thing itself
 * so the parts of one thing keep their order among themselves.
 */
export function standAt(object: Stands, place: BedPlace, nearer = 0): void {
  object.setPosition(place.x, place.y);
  object.setDepth(place.depth + nearer);
  object.setVisible(place.drawn);
  object.setAlpha(place.alpha);
}
