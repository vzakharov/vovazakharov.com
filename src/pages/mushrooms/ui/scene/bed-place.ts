/**
 * Where a bed draws a thing standing on the ground this frame: the beds lay
 * everything out once at the opening eye and draw it at that size, and this
 * is what places it through the view (`ofGround`), scales it by `zoom`, sorts
 * it by the row it stands on, hides it near the eye (`cull`) and, past the
 * brow (`behindHills`), sinks it under the brow (`sunk`) until
 * too little of it shows to draw (`sunkAway`).
 */

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { Ground, LayeredPoint } from '../../model/ground';
import {
  behindHills,
  cull,
  ofGround,
  type Placed,
  sunk,
  sunkAway,
  type View,
} from './view';

/**
 * The depth a thing past the ground's top row is drawn about: between the
 * near hills (-4) and the ground (-3) of `paint-backdrop.ts`'s `DEPTHS`, so
 * it stands over the hills and the ground covers it from the foot up as it
 * sinks (`sunk`).
 */
const BEHIND_HILLS = -3.5;
/**
 * How much of a unit of depth a px down the screen, or a part's `nearer`,
 * is worth past the ground's top row: small enough that every row of the
 * tallest screen keeps inside the half unit either side of `BEHIND_HILLS`.
 */
const BEHIND_SQUEEZE = 1e-4;

/**
 * A thing's place on the screen this frame: where its foot is drawn, in CSS
 * px, the row it sorts by (`depth`, the screen row its foot stands on before
 * it sinks, so the farther sorts behind), whether it is drawn at all and
 * whether past the brow, and how far ahead of the eye it stands and how far
 * from it: `Infinity` while no view placed it.
 */
export type BedPlace = LayeredPoint &
  Pick<Placed, 'zoom' | 'ahead' | 'distance'> & {
    drawn: boolean;
    behind: boolean;
  };

/** A bed object's place on the screen as last placed. */
export type Standing = { stands: BedPlace };

/**
 * Where `view` draws a thing whose foot stands on `foot`, `height` world px
 * tall as laid out: given a height, it is not drawn once it has sunk away
 * (`sunkAway`).
 */
export function bedPlace(view: View, foot: Ground, height?: number): BedPlace {
  const placed = ofGround(view, foot);
  const shown = sunk(view, placed);
  const gone =
    height !== undefined && sunkAway(view, shown, height * shown.zoom);
  return {
    ...pick(shown, 'x', 'y', 'zoom', 'ahead', 'distance'),
    depth: placed.y,
    drawn: !cull(placed) && !gone,
    behind: behindHills(placed),
  };
}

/**
 * A bed object as something to sit on: where the layout stands its foot, in
 * world px at the opening eye, and its place on the screen this frame. A bed
 * draws it flat at its foot, so a point laid out on it is drawn where
 * `onHost` puts it.
 */
export type Host = Standing & { laidFoot: Point };

/**
 * Where `host` draws `point`, laid out on it in world px at the opening eye:
 * off its drawn foot by the layout's offset scaled by its `zoom`, as the bed
 * draws its body, at every heading.
 */
export function onHost({ stands, laidFoot }: Host, point: Point): Point {
  return aboutFoot(stands, laidFoot, point);
}

/**
 * Where a thing whose foot, laid out at `laidFoot`, is drawn at `drawn`
 * draws its `point`, laid out on it: off the drawn foot by the layout's
 * offset scaled by the foot's `zoom`.
 */
export function aboutFoot(
  drawn: Point & Pick<Placed, 'zoom'>,
  laidFoot: Point,
  point: Point,
): Point {
  return {
    x: drawn.x + (point.x - laidFoot.x) * drawn.zoom,
    y: drawn.y + (point.y - laidFoot.y) * drawn.zoom,
  };
}

/** A thing drawn where the layout stands it, as no view has placed it yet. */
export function layoutPlace({ x, y }: Point): BedPlace {
  return {
    x,
    y,
    zoom: 1,
    ahead: Infinity,
    distance: Infinity,
    depth: y,
    drawn: true,
    behind: false,
  };
}

/**
 * Where a thing standing on `foot`, laid out at `laid`, is drawn: through
 * `view` (`bedPlace`), or where the layout stands it while a bed has
 * followed no view yet.
 */
export function viewedOrLaid(
  view: View | undefined,
  foot: Ground,
  laid: Point,
  height?: number,
): BedPlace {
  return view ? bedPlace(view, foot, height) : layoutPlace(laid);
}

/** A thing not drawn, as it waits for a place. */
export const UNPLACED: BedPlace = {
  ...layoutPlace({ x: 0, y: 0 }),
  drawn: false,
};

/** What a bed object takes its place through. */
type Stands = {
  setPosition: (x: number, y: number) => unknown;
  setDepth: (depth: number) => unknown;
  setVisible: (visible: boolean) => unknown;
};

/**
 * The depth `place` draws a part at, `nearer` than the thing itself so the
 * parts of one thing keep their order among themselves: its row, or past
 * the ground's top row that row squeezed between the near hills and the
 * ground.
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
