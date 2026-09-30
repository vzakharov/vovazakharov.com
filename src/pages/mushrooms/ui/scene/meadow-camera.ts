/**
 * The camera a screen shows the meadow through, a pure function of the
 * screen in CSS px, and the frame on the ground the meadow is laid out in,
 * the world's, the same on every screen.
 */

import {
  type Camera,
  fitCamera,
  type Frame,
  FRAME_DEPTH,
  type Lens,
} from '../../model/ground';
import { GENE_RANGES, OPENING_SPECIES } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import { OPENING_FEET } from '../../model/placement';
import { extremes, placeOf } from './clump-layout';
import { TAP_RADIUS } from './tap-reach';

/** How close, in CSS pixels, a cap may come to the side of the screen. */
export const EDGE_MARGIN = 12;

/**
 * The least ground a screen shows across either side of its middle, as a
 * camera lays the ground out: room for six mushrooms however narrow the
 * screen.
 */
const LEAST_ACROSS = 0.87;

/**
 * How far the world's frame reaches either side of the ground's middle, as a
 * camera lays the ground out, on every screen: twice the 2.882 a tablet held
 * sideways (1180×820 CSS px) shows at the size it composes the clump at, caps
 * inside the edge margin, so that tablet shows half the world at a time.
 */
export const WORLD_ACROSS = 5.764;

/** The frame on the ground the meadow is laid out in, the world's. */
export const MEADOW_FRAME: Frame = { across: WORLD_ACROSS, ...FRAME_DEPTH };

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
  world: 0,
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
const CLUMP_NARROWEST =
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
  across: WORLD_ACROSS,
};

/** The camera the meadow on a screen `width` by `height` is shown through. */
export function meadowCamera(width: number, height: number): Camera {
  return fitCamera({ width, height }, LENS);
}
