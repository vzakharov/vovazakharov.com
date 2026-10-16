/**
 * Where a bed draws a thing standing on the ground this frame: the beds lay
 * everything out once at the opening eye and draw it at that size, and this
 * is what places it through the view (`ofGround`), scales it by `zoom`, sorts
 * it by the row it stands on, hides it near the eye (`cull`) and, past the
 * brow (`behindHills`), sinks it under the brow (`sunk`) until too little of
 * it shows to draw (`sunkAway`), and hides what stands off the screen's sides
 * (`offSides`).
 */

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { LayeredPoint } from '../../model/ground';
import type { Footed } from '../../model/placement';
import { DEPTHS } from './backdrop-depths';
import type { Laid } from './clump-layout';
import {
  behindHills,
  cull,
  ofGround,
  type Placed,
  placedAt,
  sunk,
  sunkAway,
  type View,
} from './view';

/**
 * The depth a thing past the ground's top row is drawn about: midway between
 * the near hills and the ground, so it stands over the hills and the ground
 * covers it from the foot up as it sinks (`sunk`).
 */
const BEHIND_HILLS = (DEPTHS.nearHills + DEPTHS.ground) / 2;
/**
 * How much of a unit of depth a px down the screen, or a part's `nearer`,
 * is worth past the ground's top row: small enough that every row of the
 * tallest screen keeps inside the half unit either side of `BEHIND_HILLS`.
 */
const BEHIND_SQUEEZE = 1e-4;

/**
 * How far past a screen side, in drawn heights, a thing's foot may stand and
 * still be drawn: past a mushroom's shadow (0.81) and cap (0.66) with a
 * squash's stretch, and a tuft's blades (`BLADE_OVERHANG`, 3 of its 2 sizes).
 */
export const SIDE_OVERHANG = 1.5;

/**
 * Whether a thing `height` CSS px tall, its foot drawn by `view` at `x`,
 * stands more than `SIDE_OVERHANG` past a screen side. Phaser tessellates
 * every visible Graphics, on screen or not, so one behind the eye is hidden.
 */
function offSides(
  view: View,
  { x }: Pick<Point, 'x'>,
  height: number,
): boolean {
  const overhang = SIDE_OVERHANG * height;
  return x < -overhang || x > view.width + overhang;
}

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
 * tall as laid out `opening` ahead of the eye, in the clump's size, or else
 * where the opening crop's pinhole stands it (`ofGround`): given a height, it
 * is not drawn once it has sunk away (`sunkAway`) or while it stands off the
 * screen's sides (`offSides`).
 */
export function bedPlace(
  view: View,
  foot: Point,
  height?: number,
  opening?: number,
): BedPlace {
  const placed =
    opening === undefined
      ? ofGround(view, foot)
      : placedAt(view, foot, 0, opening);
  const shown = sunk(view, placed);
  const drawnHeight = height === undefined ? undefined : height * shown.zoom;
  const gone =
    drawnHeight !== undefined &&
    (sunkAway(view, shown, drawnHeight) || offSides(view, shown, drawnHeight));
  return {
    ...pick(shown, 'x', 'y', 'zoom', 'ahead', 'distance'),
    depth: placed.y,
    drawn: !cull(placed) && !gone,
    behind: behindHills(view, placed),
  };
}

/**
 * A bed object as something to sit on: where the layout stands its foot, in
 * world px at the opening eye, and its place on the screen this frame. A bed
 * draws it flat at its foot, so a point laid out on it is drawn where
 * `onHost` puts it. `foot` is where it stands on the plane, and `opening`
 * how far ahead of the eye, in the clump's size, it is laid out, so a world
 * px laid out on it spans `opening / focal` of the clump's size.
 */
export type Host = Standing &
  Pick<Footed, 'foot'> &
  Pick<Laid, 'opening'> & { laidFoot: Point };

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
function layoutPlace({ x, y }: Point): BedPlace {
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
 * Where a thing standing on `foot`, laid out at `laid` (`opening` ahead of
 * the eye, as `bedPlace` takes it), is drawn: through `view`, or where the
 * layout stands it while a bed has followed no view yet.
 */
export function viewedOrLaid(
  view: View | undefined,
  foot: Point,
  laid: Point,
  height?: number,
  opening?: number,
): BedPlace {
  return view ? bedPlace(view, foot, height, opening) : layoutPlace(laid);
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
