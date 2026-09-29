/**
 * The camera a screen shows the meadow through, and the frame on the ground
 * it lays the meadow out in: both a pure function of the screen in CSS px,
 * the frame the same for a screen and its turn (`frameFor`).
 */

import type { Sized } from '@/shared/typings';

import {
  type Camera,
  fitCamera,
  foreshortening,
  type Frame,
  FRAME_DEPTH,
  frameFor,
  type Lens,
} from '../../model/ground';
import { geneBounds } from '../../model/mushroom-genes';
import { maxReach } from '../../model/mushroom-pose';
import { OPENING_FEET } from '../../model/placement';
import { extremes, placeOf } from './clump-layout';
import { TAP_RADIUS } from './sky-layout';
import { VIEWPORTS } from './viewports';

/** How close, in CSS pixels, a cap may come to the side of the screen. */
export const EDGE_MARGIN = 12;

/**
 * The least a frame reaches across, as a camera lays the ground out: room
 * for six mushrooms however narrow the screen or its turn.
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
 * them, the opening clump's two first: how far their caps
 * reach either side of the middle, whatever their genes, and the smallest
 * any stands, which no frame's width changes.
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
 * The zoom floor: the least clump size a camera stands the meadow at, the
 * narrowest cap the genes allow, where a mushroom stands smallest, being
 * `2 × TAP_RADIUS` across by its gene there; a cap drawn narrower than a
 * finger is padded to one (`fingerPad`).
 */
const ZOOM_FLOOR =
  (2 * TAP_RADIUS) /
  (geneBounds('capWidth')[0] *
    Math.min(...UNIT_PLACES.map(({ size }) => size)));

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

/** The camera the meadow on a screen `width` by `height` is shown through. */
export function meadowCamera(width: number, height: number): Camera {
  return fitCamera({ width, height }, LENS);
}

/** The frame the meadow on `screen` is laid out in, the same as on its turn. */
export function meadowFrame(screen: Sized): Frame {
  return frameFor(screen, LENS);
}

/**
 * How many px down the screen a step of the clump's size into the distance
 * takes, per px a thing of the clump's size stands across there
 * (`foreshortening`), from the flattest to the steepest camera of every
 * screen the sweeps and the play run cover, held either way. A rule kept on
 * the ground over the span holds on the screen through every camera in it.
 */
export const FORESHORTENING = ((): readonly [number, number] => {
  const spans = VIEWPORTS.flatMap(([, width, height]) =>
    [meadowCamera(width, height), meadowCamera(height, width)].map((camera) =>
      foreshortening(camera),
    ),
  );
  return [Math.min(...spans), Math.max(...spans)];
})();
