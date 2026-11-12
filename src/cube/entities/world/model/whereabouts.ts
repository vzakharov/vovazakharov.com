import type { WithEye } from '@/cube/shared/lib/vec';

import type { Gazing, Pose } from './pose';

/**
 * An eye outside the cube: where it is in the world frame, in metres, and its
 * gaze, with `roll`, radians the head is tipped clockwise about that gaze.
 */
export type Outside = Gazing & WithEye & { roll: number };

/** Where an eye is: in a room of the cube, or outside it. */
export type Whereabouts = Pose | Outside;

export const isOutside = (at: Whereabouts): at is Outside => 'eye' in at;
