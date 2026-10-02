/**
 * The view a frame is drawn through: the camera fitted to the screen and the
 * eye walking the plane. Every bed object is laid out once at the opening
 * eye, in world px, and drawn at that size; each frame places it through the
 * view and scales it by `zoom`, so a step or a turn re-places objects and
 * rebakes nothing.
 */

import type { Point } from '../../model/geometry';
import {
  bendAt,
  type Camera,
  CLUMP_DISTANCE,
  type Eye,
  EYE_HEIGHT,
  type Eyed,
  gathered,
  type Ground,
  pinholeOf,
  planeOf,
  scaleAt,
  spread,
  type Viewed,
  viewOf,
  zAt,
} from '../../model/ground';

/** The camera a frame is drawn through, and the eye it looks from. */
export type View = Camera & Eyed;

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
export function placedAt(
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
  return placedAt(
    view,
    planeOf(foot),
    height,
    CLUMP_DISTANCE / scaleAt(foot.z),
  );
}

/**
 * How the opening crop's pinhole stands the layout's ground row `footRow`
 * (world px down the screen, below the horizon): `opening`, its distance
 * ahead of `OPENING_EYE`, the plane's origin, and how many of the clump's
 * size a world px spans on it.
 */
export function rowAt(
  camera: Camera,
  footRow: number,
): { opening: number; perPx: number } {
  const pinhole = pinholeOf(camera);
  const opening = (pinhole.focal * EYE_HEIGHT) / (footRow - pinhole.y);
  return { opening, perPx: opening / pinhole.focal };
}

/** The world px across `camera`'s layout of the opening crop's middle. */
export function middleOf(camera: Camera): number {
  return (camera.world - camera.width) / 2 + pinholeOf(camera).x;
}

/**
 * Where `view` places `point`, in world px as the opening eye lays it out,
 * standing over the ground row `footRow`: the opening crop's pinhole stands
 * it at that row's distance, as high over it as it stands over the row, and
 * the plane has it `spread` from there. Exact for a thing whose foot is on
 * that row. A thing drawn round a foot is drawn about the foot's place
 * (`onHost`), not point by point through here: the spread widens a span
 * across the plane that the screen narrows back only at the opening eye.
 */
export function ofLayout(view: View, point: Point, footRow: number): Placed {
  const { opening, perPx } = rowAt(view, footRow);
  return placedAt(
    view,
    spread({ x: (point.x - middleOf(view)) * perPx, y: opening }),
    (footRow - point.y) * perPx,
    opening,
  );
}

/**
 * The ground at `plane` as the opening eye lays it out, `ofLayout`'s ground
 * run backwards: where across, in world px, and the row it stands on;
 * none for ground the opening crop's pinhole sees at or behind its eye.
 */
export function layoutOfPlane(camera: Camera, plane: Point): Point | undefined {
  const seen = gathered(plane);
  if (!(seen.y > 0)) return undefined;
  const pinhole = pinholeOf(camera);
  const perPx = seen.y / pinhole.focal;
  return {
    x: middleOf(camera) + seen.x / perPx,
    y: pinhole.y + (pinhole.focal * EYE_HEIGHT) / seen.y,
  };
}

/** Whether a thing `ahead` of the eye is too near to be drawn. */
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
 * screen's middle, bent lower toward its edges as every row is (`bendAt`).
 * Where a thing goes under, at its own x, whichever way the eye looks; the
 * same on every heading, so the brow stands still on the screen as the eye
 * turns.
 */
export function browRow(camera: Camera, x: number): number {
  const pinhole = pinholeOf(camera);
  return pinhole.y + (camera.groundTop - pinhole.y) * bendAt(pinhole, x);
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
 * Where `view` draws `placed`, a thing in the air over the ground point
 * `foot`: lowered as far as `sunk` lowers the foot, so it goes under the brow
 * by the ground under it, as a thing standing there does, not by its own
 * height over that ground.
 */
export function sunkOver(view: View, placed: Placed, foot: Placed): Placed {
  const drawn = sunk(view, foot);
  return drawn === foot
    ? placed
    : { ...placed, y: placed.y + drawn.y - foot.y };
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
export function sunkAway(
  view: View,
  placed: Pick<Placed, 'x' | 'y' | 'distance'>,
  height: number,
): boolean {
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
