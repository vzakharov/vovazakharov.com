import { R, scaled, sum } from '@/island/shared/globe';

import type { Eye } from './globe-eye';
import { pitchFor } from './look';
import { pitchAt, type Pose, poseFrom } from './pose';

/**
 * The camera `eye` sees through: at its height over its floor above its
 * point, facing its heading, pitched as the planar eye's is and then raised
 * by its look, within the limits `pitchFor` sets.
 */
export function poseOf(eye: Eye, aspect: number): Pose {
  const pose = poseFrom(
    scaled(eye.at, R + eye.floor + eye.height),
    eye.ahead,
    eye.height,
    aspect,
  );
  const raise = pitchAt(eye.height) - pitchFor(eye.height, eye.look);
  const cos = Math.cos(raise);
  const sin = Math.sin(raise);
  return {
    ...pose,
    forward: sum(scaled(pose.forward, cos), scaled(pose.up, sin)),
    up: sum(scaled(pose.up, cos), scaled(pose.forward, -sin)),
  };
}
