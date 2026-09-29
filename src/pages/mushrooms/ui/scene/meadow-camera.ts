/**
 * The camera a screen shows the meadow through, and the frame on the ground
 * it lays the meadow out in: the frame a pure function of the screen in CSS
 * px (`frameFor`), and the camera of the screen and the feet the meadow has
 * used, which it keeps in view wherever they were used.
 */

import type { Sized } from '@/shared/typings';

import {
  type Camera,
  fitCamera,
  type Frame,
  FRAME_DEPTH,
  frameFor,
  type Ground,
  type Lens,
  widestOf,
} from '../../model/ground';
import { GENE_RANGES, OPENING_SPECIES } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import { OPENING_FEET } from '../../model/placement';
import { extremes, placeOf } from './clump-layout';
import { TAP_RADIUS } from './sky-layout';

/** How close, in CSS pixels, a cap may come to the side of the screen. */
export const EDGE_MARGIN = 12;

/**
 * The least a frame reaches across, as a camera lays the ground out: room
 * for six mushrooms however narrow the screen.
 */
const LEAST_ACROSS = 0.87;

/**
 * How far any cap reaches left and right of its foot, per unit of size, once
 * `splay` turns it.
 */
function sideReach(splay: number): [left: number, right: number] {
  const { toward, away } = maxReach(splay);
  return splay < 0 ? [toward, away] : [away, toward];
}

/** A camera of the clump's size 1, centred on 0. */
const UNIT_CAMERA: Camera = {
  width: 0,
  height: 0,
  groundTop: 0,
  ground: 1,
  midline: 0,
  unit: 1,
};

/**
 * Every place at the extremes of a frame 1 across as `UNIT_CAMERA` shows
 * them, the opening clump's two first: how far their caps reach either side
 * of the middle, whatever their genes, and the smaller of the clump's two,
 * which no frame's width changes.
 */
const UNIT_PLACES = extremes({ across: 1, ...FRAME_DEPTH }).map((foot) =>
  placeOf(UNIT_CAMERA, foot),
);

/** How far the caps of `places` reach either side of the middle, the farthest. */
function reachOf(places: typeof UNIT_PLACES): number {
  return Math.max(
    ...places.map(({ x, size, splay }) => {
      const [left, right] = sideReach(splay);
      return Math.max(left * size - x, x + right * size);
    }),
  );
}

/**
 * How wide the opening clump's narrowest cap is by its genes, where the
 * clump's smaller one stands, in the clump's size.
 */
export const CLUMP_NARROWEST =
  GENE_RANGES[OPENING_SPECIES].capWidth[0] *
  Math.min(
    ...UNIT_PLACES.slice(0, OPENING_FEET.length).map(({ size }) => size),
  );

/**
 * The zoom floor: the clump size at which the clump's narrowest cap is
 * `2 × TAP_RADIUS` across by its gene, the least a camera stands the meadow
 * at but on a short screen (`floorOn`). A cap drawn narrower than a finger
 * there, or on a phone's far rows where the forest stands smaller with depth,
 * is padded to one (`fingerPad`).
 */
export const ZOOM_FLOOR = (2 * TAP_RADIUS) / CLUMP_NARROWEST;

/**
 * What every screen's camera shows: the opening clump's caps, every cap
 * standing on its frame's side, and the zoom floor.
 */
const LENS: Lens = {
  reach: reachOf(UNIT_PLACES.slice(0, OPENING_FEET.length)),
  beyond: reachOf(UNIT_PLACES.slice(OPENING_FEET.length)) - 1,
  margin: EDGE_MARGIN,
  floor: ZOOM_FLOOR,
  least: LEAST_ACROSS,
};

/**
 * How far across, in the clump's size at its front foot, a camera shows the
 * ground to keep the cap of every mushroom standing on `feet` inside the
 * edge margin, as a cap on the frame's side stands: 0 for none.
 */
export function capsAcross(feet: readonly Ground[]): number {
  return feet.length > 0 ? widestOf(feet) + LENS.beyond : 0;
}

/**
 * The camera the meadow on a screen `width` by `height` is shown through,
 * showing `shown` across besides: zoomed out where the screen is narrower
 * than the one the meadow used its feet on.
 */
export function meadowCamera(width: number, height: number, shown = 0): Camera {
  return fitCamera({ width, height }, LENS, shown);
}

/** The frame the meadow on `screen` is laid out in. */
export function meadowFrame(screen: Sized): Frame {
  return frameFor(screen, LENS);
}
