import { R, scaled } from '@/island/shared/globe';

import type { Eye } from './globe-eye';
import { type Pose, poseFrom } from './pose';

/**
 * The camera `eye` sees through: at its height over its floor above its
 * point, facing its heading, pitched as the planar eye's is.
 */
export const poseOf = (eye: Eye, aspect: number): Pose =>
  poseFrom(
    scaled(eye.at, R + eye.floor + eye.height),
    eye.ahead,
    eye.height,
    aspect,
  );
