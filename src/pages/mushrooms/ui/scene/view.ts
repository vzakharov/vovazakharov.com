/**
 * The view a frame is drawn through: the camera fitted to the screen and the
 * eye walking the plane. Every bed object is laid out once at the opening
 * eye, in world px, and drawn at that size; each frame places it through the
 * view and scales it by `zoom`, so a step or a turn re-places objects and
 * rebakes nothing.
 */

import type { Point } from '../../model/geometry';
import {
  type Camera,
  type Eye,
  EYE_HEIGHT,
  type Ground,
  OPENING_EYE,
  pinholeOf,
  planeOf,
  type Viewed,
  viewOf,
  zAt,
} from '../../model/ground';
import { seamReach } from './skyline';

/** The camera a frame is drawn through, and the eye it looks from. */
export type View = Camera & { eye: Eye };

/**
 * Something the view places each frame: how many times its opening size it
 * is drawn, its opening distance over its distance now. A flower's tap
 * circle is `TAP_RADIUS` times it, as its container is.
 */
export type Placed = Viewed & { zoom: number };

/** A bed that re-places what it holds through each frame's view. */
export type Following = { follow: (view: View) => void };

/**
 * How near the eye, in the clump's size, a thing is no longer drawn: every
 * mushroom's head has sunk below the screen's foot by then, so hiding it
 * never pops.
 */
export const V_NEAR = 2;

/**
 * How far ahead, in the clump's size, the ground meets the hills: the
 * ground's top row at the opening eye. A thing standing farther sinks behind
 * the ground's top row (`sunk`), which covers it from the foot up.
 */
export const D_SEE = planeOf({ x: 0, z: zAt(0) }).y;

export function viewAt(camera: Camera, eye: Eye): View {
  return { ...camera, eye };
}

/** `plane`, `height` above the plane, as `view` places a thing laid out `opening` ahead of the opening eye. */
function placedAt(
  view: View,
  plane: Point,
  height: number,
  opening: number,
): Placed {
  const viewed = viewOf(view, view.eye, plane, height);
  return { ...viewed, zoom: opening / viewed.ahead };
}

/** Where `view` places a thing standing on `foot`, `height` above the ground in the clump's size. */
export function ofGround(view: View, foot: Ground, height = 0): Placed {
  const plane = planeOf(foot);
  return placedAt(view, plane, height, plane.y);
}

/**
 * Where `view` places `point`, in world px as the opening eye lays it out,
 * standing over the ground row `footRow` (world px down the screen, below the
 * horizon): the point stands on the plane at that row's distance, as high
 * over it as it stands over the row. Exact for a thing whose foot is on that
 * row; at the opening eye, the point less the opening crop's left.
 */
export function ofLayout(view: View, point: Point, footRow: number): Placed {
  const pinhole = pinholeOf(view);
  const opening = (pinhole.focal * EYE_HEIGHT) / (footRow - pinhole.y);
  const perPx = opening / pinhole.focal;
  const across = point.x - (view.world - view.width) / 2 - pinhole.x;
  return placedAt(
    view,
    { x: OPENING_EYE.x + across * perPx, y: OPENING_EYE.y + opening },
    (footRow - point.y) * perPx,
    opening,
  );
}

/** Whether a thing `ahead` of the eye is too near, or behind it, to be drawn. */
export function cull({ ahead }: Pick<Viewed, 'ahead'>): boolean {
  return ahead < V_NEAR;
}

/** Whether a thing `ahead` of the eye stands past the ground's top row, behind the near hills. */
export function behindHills({ ahead }: Pick<Viewed, 'ahead'>): boolean {
  return ahead > D_SEE;
}

/**
 * Where `view` draws `placed`: where it is placed, up to the ground's top
 * row; past it, sunk as far below that row as its foot would stand above it,
 * so its foot never stands on the hills above the ground, whatever their
 * crest does there. It sinks as it recedes and rises as it nears, with no
 * jump where it crosses the row, and whatever is drawn over the ground's top
 * rows covers it from the foot up (`depthOf`).
 */
export function sunk(view: View, placed: Placed): Placed {
  if (!behindHills(placed)) return placed;
  const { focal } = pinholeOf(view);
  const lift = focal * EYE_HEIGHT * (1 / D_SEE - 1 / placed.ahead);
  return { ...placed, y: placed.y + 2 * lift };
}

/**
 * Whether `placed`, as `sunk` draws it, has sunk below the ground's top row:
 * hidden for a thing drawn over everything in the meadow, as an insect is,
 * which nothing would cover there.
 */
export function buried(view: View, placed: Placed): boolean {
  return behindHills(placed) && placed.y > view.groundTop;
}

/**
 * The share of a sunk thing's drawn height that must still show over the
 * ground for it to be drawn: under it, what pokes up is a sliver of petal
 * tips or a cap's rim, less than a recognisable head, and reads as a speck.
 * A thing that small is a few px at the seam, so hiding it does not pop.
 */
export const SHOWN_LEAST = 0.2;

/**
 * Whether `placed`, as `sunk` draws it `height` CSS px tall, has sunk so far
 * that less than `SHOWN_LEAST` of it shows over the ground, which covers it
 * from the seam's lowest row down (`seamReach`), and is better not drawn.
 */
export function sunkAway(view: View, placed: Placed, height: number): boolean {
  const cover = view.groundTop + seamReach(view);
  return (
    behindHills(placed) && cover - (placed.y - height) < SHOWN_LEAST * height
  );
}

/**
 * Whether `point`, on the screen in CSS px, stands on `view`'s screen at
 * least `inset` px inside its edges; a negative inset lets it overhang them.
 */
export function onScreen(view: View, { x, y }: Point, inset = 0): boolean {
  return (
    x >= inset &&
    x <= view.width - inset &&
    y >= inset &&
    y <= view.height - inset
  );
}
