import { at, type Pen, type Place } from '@/clip/shared/ink';

import {
  fitted,
  palmOf,
  type Pose,
  type PoseName,
  POSES,
  type Reach,
  reaching,
  SOLE,
  STANDARD_BUILD,
} from '../../pose';
import { type Dress, figure } from './figure';

export type Placed = {
  /**
   * Where the puppet is put. The point placed is the floor between its soles,
   * so a dip or a sway in the pose bends the knees instead of lifting the feet.
   */
  place?: Place;
};

export type PuppetOptions = Dress &
  Placed & {
    /** A pose for the standard build, or the name of one of `POSES`; it is refitted to `build`. */
    pose?: Pose | PoseName;
    /**
     * Where each fist closes, in the puppet's units after the refit to `build`
     * — the point a prop offers to be held by. The elbow folds to suit.
     */
    reach?: Reach;
  };

/**
 * Runs `draw` with the origin where a figure in `pose` (already fitted) has
 * its neck when the floor between its soles is at `place`.
 */
export function standing(
  pen: Pen,
  pose: Pose,
  place: Place,
  size: number,
  draw: () => void,
): void {
  const floor = Math.max(pose.footL[1], pose.footR[1]) + SOLE * size;
  const middle = (pose.footL[0] + pose.footR[0]) / 2;
  at(pen, place, () => {
    at(pen, { x: -middle, y: -floor }, draw);
  });
}

/** The puppet: a pose, a body to fit it to, something to wear, a face to pull. */
export function puppet(pen: Pen, options: PuppetOptions = {}): void {
  const {
    pose = 'stand',
    build = STANDARD_BUILD,
    reach = {},
    place = {},
  } = options;
  const rigged = reaching(
    fitted(typeof pose === 'string' ? POSES[pose] : pose, build),
    reach,
    palmOf(build),
  );
  standing(pen, rigged, place, build.size, () => {
    figure(pen, rigged, options);
  });
}
