import {
  CENTRE,
  EAST,
  NORTH,
  planeToWorld,
  R,
  scaled,
  sum,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import { type Eye, MAX_HEIGHT, MIN_HEIGHT, type Vec2 } from './eye';
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
function fovFor(aspect: number): number {
  const half = Math.tan(FOV / 2);
  return 2 * Math.atan(half / Math.min(1, Math.max(Number.EPSILON, aspect)));
}

/** Ground across one screen height, in heights, looking straight down. */
export const groundPerScreen = (aspect: number) =>
  2 * Math.tan(fovFor(aspect) / 2);

/** How far below the horizon the eye looks at `MIN_HEIGHT`. */
export const GROUND_PITCH = (10 * Math.PI) / 180;

/**
 * The share of the way up, in the logarithm of height, from which the eye
 * looks straight down: about 3,000 km and above.
 */
const STRAIGHT_DOWN_FROM = 0.85;

/**
 * How far below the horizon the eye looks at `height`, radians: from
 * `GROUND_PITCH` at the ground, smoothly to straight down at
 * `STRAIGHT_DOWN_FROM`.
 */
export function pitchAt(height: number): number {
  const share =
    Math.log(height / MIN_HEIGHT) / Math.log(MAX_HEIGHT / MIN_HEIGHT);
  const t = Math.min(1, Math.max(0, share / STRAIGHT_DOWN_FROM));
  const eased = t * t * (3 - 2 * t);
  return GROUND_PITCH + (Math.PI / 2 - GROUND_PITCH) * eased;
}

/**
 * The world tangent at plane point `(x, y)` that plane direction `(dx, dy)`
 * runs along, unit length. The map stretches only across the radius, by
 * `sin(d/R) / (d/R)`, so the two parts are bent separately.
 */
function tangentAt(x: number, y: number, [dx, dy]: Vec2): Vec3 {
  const d = Math.hypot(x, y);
  if (d === 0) return unit(sum(scaled(EAST, dx), scaled(NORTH, dy)));
  const angle = d / R;
  const out = sum(scaled(EAST, x / d), scaled(NORTH, y / d));
  const across = sum(scaled(EAST, -y / d), scaled(NORTH, x / d));
  const radial = (dx * x + dy * y) / d;
  const sideways = (dx * -y + dy * x) / d;
  const outward = sum(
    scaled(CENTRE, -Math.sin(angle)),
    scaled(out, Math.cos(angle)),
  );
  return unit(
    sum(
      scaled(outward, radial),
      scaled(across, (sideways * Math.sin(angle)) / angle),
    ),
  );
}

/**
 * The camera `eye` sees through: at its height over its floor, facing its
 * heading and pitched down by `pitchAt` — straight at the planet's centre
 * from orbit, near level at the ground — on a screen `aspect` wide per unit
 * of height.
 */
export function poseOf(eye: Eye, aspect: number): Pose {
  return poseFrom(
    planeToWorld(eye.x, eye.y, eye.floor + eye.height),
    tangentAt(eye.x, eye.y, [Math.sin(eye.heading), Math.cos(eye.heading)]),
    eye.height,
    aspect,
  );
}

/**
 * The camera at world `position`, `height` over its floor, facing tangent
 * `ahead` and pitched down by `pitchAt`, on a screen `aspect` wide per unit
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
