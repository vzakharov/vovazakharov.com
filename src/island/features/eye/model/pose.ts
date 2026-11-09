import { scaled, sum, unit, type Vec3 } from '@/island/shared/globe';

import { type Eye, pointOf } from './eye';
import { pitchAt, pitchFor } from './look';
import { tangent } from './turns';

/** The camera an eye sees through, in world metres. */
export type Pose = {
  readonly position: Vec3;
  /** Unit vector the camera looks along. */
  readonly forward: Vec3;
  /** Unit vector screen-up points along, square to `forward`. */
  readonly up: Vec3;
  /** Vertical field of view, radians. */
  readonly fov: number;
};

/** The narrower of the two fields of view, on every screen and at every height. */
const FOV = (50 * Math.PI) / 180;

/**
 * The vertical field of view on a screen `aspect` wide per unit of height,
 * radians: `FOV` on a landscape screen, and on a portrait one as wide as
 * keeps the horizontal field `FOV`, so the globe at orbit fits its width.
 */
export function fovFor(aspect: number): number {
  const half = Math.tan(FOV / 2);
  return 2 * Math.atan(half / Math.min(1, Math.max(Number.EPSILON, aspect)));
}

/** Ground across one screen height, in heights, looking straight down. */
export const groundPerScreen = (aspect: number) =>
  2 * Math.tan(fovFor(aspect) / 2);

/**
 * The camera at world `position`, `height` over its floor, facing tangent
 * `ahead` and pitched down by `pitchAt` — straight at the planet's centre
 * from orbit, near level at the ground — on a screen `aspect` wide per unit
 * of height.
 */
export function poseFrom(
  position: Vec3,
  ahead: Vec3,
  height: number,
  aspect: number,
): Pose {
  const sky = unit(position);
  // The tangent is square to the sky already; this removes rounding only.
  const level = tangent(ahead, sky);
  const pitch = pitchAt(height);
  return {
    position,
    forward: sum(scaled(level, Math.cos(pitch)), scaled(sky, -Math.sin(pitch))),
    up: sum(scaled(sky, Math.cos(pitch)), scaled(level, Math.sin(pitch))),
    fov: fovFor(aspect),
  };
}

/**
 * The camera `eye` sees through: at its height over its floor above its
 * point, facing its heading, pitched as `poseFrom` pitches and then raised
 * by its look, within the limits `pitchFor` sets.
 */
export function poseOf(eye: Eye, aspect: number): Pose {
  const pose = poseFrom(pointOf(eye), eye.ahead, eye.height, aspect);
  const raise = pitchAt(eye.height) - pitchFor(eye.height, eye.look);
  const cos = Math.cos(raise);
  const sin = Math.sin(raise);
  return {
    ...pose,
    forward: sum(scaled(pose.forward, cos), scaled(pose.up, sin)),
    up: sum(scaled(pose.up, cos), scaled(pose.forward, -sin)),
  };
}
