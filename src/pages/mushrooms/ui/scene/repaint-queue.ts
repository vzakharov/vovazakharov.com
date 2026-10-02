/**
 * Which hazy things a frame repaints. A thing is painted at the haze of where
 * it stood when last drawn, and walking up to a misty back-row mushroom must
 * clear it, but a repaint costs up to a millisecond: so a frame repaints only
 * the few nearest whose haze has drifted far enough from their paint to see.
 * Light stays as painted.
 */

import {
  type Camera,
  CLUMP_DISTANCE,
  type Hazed,
  project,
  scaleAt,
  type Viewed,
} from '../../model/ground';
import { smooth } from '../../model/motion';
import { D_SEE, type Placed } from './view';

/** How far a thing's haze drifts from its paint before it is repainted. */
export const HAZE_DRIFT = 0.04;

/** How many things a frame repaints at the most. */
export const REPAINTS_PER_FRAME = 2;

/**
 * How much paler than the ground's haze a thing stands as it sinks behind the
 * brow, at the most, and how far past `D_SEE`, in the clump's size, it gets
 * there: about as far as a back-row mushroom takes to sink away, so it pales
 * as it goes under rather than after.
 */
export const BROW_PALE = 0.2;
const PALE_SPAN = 1.2;

/** How much paler a thing `distance` from the eye stands for sinking behind the brow: none up to `D_SEE`, easing up to `BROW_PALE`. */
export function browPale(distance: number): number {
  return BROW_PALE * smooth((distance - D_SEE) / PALE_SPAN);
}

/**
 * The haze on a thing `ahead` of the eye and `distance` from it, in the
 * clump's size: the opening eye's haze on the ground row as far ahead, so a
 * thing stands as hazy at the opening as the layout painted it; past the
 * brow, paler still (`browPale`).
 */
export function hazeAhead(
  camera: Camera,
  { ahead, distance }: Pick<Placed, 'ahead' | 'distance'>,
): number {
  const [near, far] = [scaleAt(0), scaleAt(1)];
  const z = (CLUMP_DISTANCE / ahead - near) / (far - near);
  // The ground's haze runs on past `MAX_HAZE` beyond its top row; a colour
  // mixed toward the air past all of it would overshoot.
  return Math.min(1, project(camera, { x: 0, z }).haze + browPale(distance));
}

/** A thing's haze now, as it was `painted`, and how far `ahead` it stands. */
export type Hazing = Hazed & Pick<Viewed, 'ahead'> & { painted: number };

/**
 * Those of `things` a frame repaints: the `most` nearest whose haze has
 * drifted `HAZE_DRIFT` or more from their paint.
 */
export function repaintsDue<Thing extends Hazing>(
  things: readonly Thing[],
  most = REPAINTS_PER_FRAME,
): Thing[] {
  return things
    .filter(({ haze, painted }) => Math.abs(haze - painted) >= HAZE_DRIFT)
    .toSorted((one, other) => one.ahead - other.ahead)
    .slice(0, most);
}
