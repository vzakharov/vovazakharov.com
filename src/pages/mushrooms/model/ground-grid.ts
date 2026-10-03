/** Feet walked over a stretch of ground, for the tests that judge the camera against every one. */

import { type Frame, type Ground, groundOfPlane, scaleAt } from './ground';
import { OPENING_FEET } from './placement';

/** How many steps across and into the distance the frame is walked in. */
const STEPS = 12;

/** A grid of feet over `frame` from edge to edge. */
export function gridOver({ across, near, far }: Frame): Ground[] {
  const steps = Array.from({ length: STEPS + 1 }, (_, step) => step / STEPS);
  return steps.flatMap((down) =>
    steps.map((side) => {
      const z = near + down * (far - near);
      return { x: ((side * 2 - 1) * across) / scaleAt(z), z };
    }),
  );
}

/** The opening feet, and a grid of feet over `frame` from edge to edge. */
export const feetOver = (frame: Frame): Ground[] => [
  ...OPENING_FEET.map((foot) => groundOfPlane(foot)),
  ...gridOver(frame),
];
