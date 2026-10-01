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
  CLUMP_DISTANCE,
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

/** The camera a frame is drawn through, and the eye it looks from. */
export type View = Camera & { eye: Eye };

/**
 * Something the view places each frame: how many times its opening size it
 * is drawn, its opening distance over its distance now (a flower's tap
 * circle is `TAP_RADIUS` times it, as its container is), and `distance`, how
 * far from the eye it stands on the plane, in the clump's size, whichever
 * way the eye looks.
 */
export type Placed = Viewed & { zoom: number; distance: number };

/** A bed that re-places what it holds through each frame's view. */
export type Following = { follow: (view: View) => void };

/**
 * How near the eye, in the clump's size, a thing is no longer drawn: every
 * mushroom's head has sunk below the screen's foot by then, so hiding it
 * never pops. As far out as that holds (the tallest head leaves the foot at
 * about 0.61 of `CLUMP_DISTANCE`), because a mushroom below the foot still
 * costs the frame its drawing: walking into the forest under the software
 * rasterizer keeps the 26 ms budget only from about 0.58 on.
 */
export const V_NEAR = 0.58 * CLUMP_DISTANCE;

/**
 * How far from the eye, in the clump's size, the meadow's brow stands: the
 * ground's top row straight ahead of the opening eye. A thing standing
 * farther, whichever way, sinks behind the brow (`sunk`), which covers it
 * from the foot up.
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
  return {
    ...viewed,
    zoom: opening / viewed.ahead,
    distance: Math.hypot(plane.x - view.eye.x, plane.y - view.eye.y),
  };
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

/** Whether a thing stands farther from the eye than the brow, and sinks behind it. */
export function behindHills({ distance }: Pick<Placed, 'distance'>): boolean {
  return distance > D_SEE;
}

/**
 * The meadow's brow at `x` across `camera`'s screen: the row the circle
 * `D_SEE` round the eye stands on there, the ground's top row at the
 * screen's middle and lower toward its edges, since a screen row is a depth
 * along the heading and the circle's depth falls off it. Where a thing goes
 * under, at its own x, whichever way the eye looks; the same on every
 * heading, so the brow stands still on the screen as the eye turns.
 */
export function browRow(camera: Camera, x: number): number {
  const { x: middle, y: horizon, focal } = pinholeOf(camera);
  return (
    horizon + (camera.groundTop - horizon) * Math.hypot(1, (x - middle) / focal)
  );
}

/** The brow's lowest row on `camera`'s screen, at its edges. */
export function browLowest(camera: Camera): number {
  return browRow(camera, 0);
}

/**
 * Where `view` draws `placed`: where it is placed, up to the brow; past it,
 * sunk as far below the brow at its own x (`browRow`) as its foot would stand
 * above it, so its foot never stands above the brow, nor on the hills
 * beyond. It sinks as it recedes and rises as it nears, with no jump where
 * it crosses the brow, and the brow, drawn over it, covers it from the foot
 * up (`depthOf`).
 */
export function sunk(view: View, placed: Placed): Placed {
  if (!behindHills(placed)) return placed;
  return { ...placed, y: 2 * browRow(view, placed.x) - placed.y };
}

/**
 * Whether `placed`, as `sunk` draws it, has sunk below the brow: hidden for
 * a thing drawn over everything in the meadow, as an insect is, which
 * nothing would cover there.
 */
export function buried(view: View, placed: Placed): boolean {
  return behindHills(placed) && placed.y > browRow(view, placed.x);
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
 * that less than `SHOWN_LEAST` of it shows over the brow at its x, and is
 * better not drawn.
 */
export function sunkAway(view: View, placed: Placed, height: number): boolean {
  const cover = browRow(view, placed.x);
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
