import {
  CENTRE,
  EAST,
  NORTH,
  planeToWorld,
  R,
  type Vec3,
} from '@/island/shared/globe';

import { type Eye, MAX_HEIGHT, MIN_HEIGHT, type Vec2 } from './eye';

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

/** The vertical field of view at every height. */
const FOV = (50 * Math.PI) / 180;

/** Ground across one screen height, in heights, looking straight down. */
export const GROUND_PER_SCREEN = 2 * Math.tan(FOV / 2);

/** How far below the horizon the eye looks at `MIN_HEIGHT`. */
export const GROUND_PITCH = (10 * Math.PI) / 180;

/**
 * The share of the way up, in the logarithm of height, from which the eye
 * looks straight down: about 3,000 km and above.
 */
const STRAIGHT_DOWN_FROM = 0.85;

const scaled = (v: Vec3, k: number): Vec3 => [v[0] * k, v[1] * k, v[2] * k];
const sum = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (v: Vec3): Vec3 => scaled(v, 1 / Math.hypot(v[0], v[1], v[2]));

/**
 * How far below the horizon the eye looks at `height`, radians: from
 * `GROUND_PITCH` at the ground, smoothly to straight down at
 * `STRAIGHT_DOWN_FROM`.
 */
function pitchAt(height: number): number {
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
 * from orbit, near level at the ground.
 */
export function poseOf(eye: Eye): Pose {
  const position = planeToWorld(eye.x, eye.y, eye.floor + eye.height);
  const sky = unit(position);
  const ahead = tangentAt(eye.x, eye.y, [
    Math.sin(eye.heading),
    Math.cos(eye.heading),
  ]);
  // The tangent is square to the sky already; this removes rounding only.
  const level = unit(sum(ahead, scaled(sky, -dot(ahead, sky))));
  const pitch = pitchAt(eye.height);
  return {
    position,
    forward: sum(scaled(level, Math.cos(pitch)), scaled(sky, -Math.sin(pitch))),
    up: sum(scaled(sky, Math.cos(pitch)), scaled(level, Math.sin(pitch))),
    fov: FOV,
  };
}
