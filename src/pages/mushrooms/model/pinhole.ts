/**
 * The lens a camera is: where on its screen an eye sees a point on the plane,
 * and back. `ground.ts` fits the camera; this reads it as a pinhole.
 */

import type { Raised } from './eye-height';
import type { Aloft } from './flight-frame';
import { alongAzimuth, type Point, wrap } from './geometry';
import {
  type Camera,
  CLUMP_DISTANCE,
  type Eye,
  type Eyed,
  HORIZON_DOWN,
  type Scaling,
  SPREAD,
} from './ground';

/**
 * The lens `camera` is, in CSS px: the screen point straight ahead on the
 * horizon (`x` the screen's middle, `y` the horizon's row); `focal`, the
 * opening crop's pinhole's focal length, which the ground's bend and a
 * distance's scale are measured in; and `arc`, the px across the screen to a
 * radian of the plane's azimuth.
 */
export type Pinhole = Point & Record<'focal' | 'arc', number>;

export function pinholeOf({ width, groundTop, ground, unit }: Camera): Pinhole {
  const focal = unit * CLUMP_DISTANCE;
  return {
    x: width / 2,
    y: groundTop + ground * HORIZON_DOWN,
    focal,
    arc: focal / SPREAD,
  };
}

/**
 * How much the screen bends the ground down at `x` across it: the ground's
 * rows go by distance from the eye, so a circle round it is a straight row,
 * and below the horizon every row is drawn this many times as far down at
 * `x` as at the middle, a fixed curve on the screen, the opening crop's
 * pinhole's own for the circle of the clump's distance.
 */
export function bendAt(pinhole: Pinhole, x: number): number {
  return Math.hypot(1, (x - pinhole.x) / pinhole.focal);
}

/**
 * A plane point as an eye sees it: where on the screen, in CSS px, how big
 * one of the clump's size stands there, and `ahead`, its distance from the
 * eye less the screen's bend there, in the clump's size, the distance a
 * thing of its drawn size stands at the screen's middle.
 */
export type Viewed = Point & Scaling & { ahead: number };

/**
 * Where `camera` shows `point` on the plane, `height` above it in the clump's
 * size, to `eye` standing `camera.eyeHeight` above it: across by its azimuth off the heading the shorter way
 * round, `arc` px to the radian, so a thing behind the eye stands off the
 * screen's side; down by its distance, bent (`bendAt`).
 */
export function viewOf(
  camera: Camera & Raised,
  eye: Eye,
  point: Point,
  height: number,
): Viewed {
  const pinhole = pinholeOf(camera);
  const dx = point.x - eye.x;
  const dy = point.y - eye.y;
  const distance = Math.hypot(dx, dy);
  const x = pinhole.x + pinhole.arc * wrap(Math.atan2(dx, dy) - eye.heading);
  const bend = bendAt(pinhole, x);
  const scale = (pinhole.focal * bend) / distance;
  return {
    x,
    y: pinhole.y + (camera.eyeHeight - height) * scale,
    scale,
    ahead: distance / bend,
  };
}

/**
 * `viewOf` run backwards for the ground: the plane point `eye` sees under
 * `screen`, in CSS px; none at or above the horizon.
 */
export function planeSeen(
  camera: Camera & Raised,
  eye: Eye,
  screen: Point,
): Point | undefined {
  const pinhole = pinholeOf(camera);
  const below = screen.y - pinhole.y;
  if (below <= 0) return undefined;
  const distance =
    (pinhole.focal * bendAt(pinhole, screen.x) * camera.eyeHeight) / below;
  return alongSight(camera, eye, screen.x, distance);
}

/** The plane point `distance` from `eye` along the azimuth it sees at `x` across `camera`'s screen. */
export function alongSight(
  camera: Camera,
  eye: Eye,
  x: number,
  distance: number,
): Point {
  const pinhole = pinholeOf(camera);
  const azimuth = eye.heading + (x - pinhole.x) / pinhole.arc;
  return alongAzimuth(eye, azimuth, distance);
}

/**
 * The `Aloft` `view` draws at the screen's `at`, in CSS px, `distance` from
 * its eye in the clump's size: on the plane along the sight at `at.x`, at the
 * height that draws it at `at.y` — `viewOf` run backwards at a known distance.
 */
export function aloftAt(
  view: Camera & Eyed & Raised,
  at: Point,
  distance: number,
): Aloft {
  const pinhole = pinholeOf(view);
  const scale = (pinhole.focal * bendAt(pinhole, at.x)) / distance;
  return {
    ...alongSight(view, view.eye, at.x, distance),
    h: view.eyeHeight - (at.y - pinhole.y) / scale,
  };
}
