/**
 * The panorama ringing the glade, by azimuth, pure: the sun, its glow and its
 * wash, the clouds and the hills all stand at infinity, so a turn slides them
 * across the screen and a step moves none of them. An azimuth is measured as
 * the eye's heading is, from the plane's `+y` toward its `+x`; the screen
 * shows azimuth `α` at `cx + F·tan(α − heading)` (`pinholeOf`).
 */

import type { Circle } from '../../model/geometry';
import { type Camera, pinholeOf } from '../../model/ground';
import { between, mulberry32 } from '../../model/random';
import type { View } from './view';

const TURN = Math.PI * 2;

/** `angle` wrapped into `[−π, π)`. */
export function wrapAngle(angle: number): number {
  return angle - TURN * Math.floor((angle + Math.PI) / TURN);
}

/** The azimuth the opening eye, looking along heading 0, sees `x` across `camera`'s screen at. */
export function azimuthAt(camera: Camera, x: number): number {
  const { x: middle, focal } = pinholeOf(camera);
  return Math.atan((x - middle) / focal);
}

/**
 * Where across the screen `view` shows `azimuth`, in CSS px; `undefined`
 * where it lies behind the eye, a quarter turn or more off the heading.
 */
export function screenAt(view: View, azimuth: number): number | undefined {
  const off = wrapAngle(azimuth - view.eye.heading);
  if (Math.abs(off) >= Math.PI / 2) return undefined;
  const { x, focal } = pinholeOf(view);
  return x + focal * Math.tan(off);
}

/** The azimuths `view`'s screen shows, from its left edge to its right. */
export function shownAzimuths(view: View): { from: number; to: number } {
  const { x, focal } = pinholeOf(view);
  const { heading } = view.eye;
  return {
    from: heading + Math.atan(-x / focal),
    to: heading + Math.atan((view.width - x) / focal),
  };
}

/**
 * How far across the screen `view` moves what was laid out round `at`, in
 * CSS px across the opening screen: a picture baked about the sun is drawn
 * this far over from where it was baked. `undefined` where `at` is behind the
 * eye, so the picture is hidden.
 */
export function shiftOf(view: View, at: number): number | undefined {
  const x = screenAt(view, azimuthAt(view, at));
  return x === undefined ? undefined : x - at;
}

/** A cloud aloft: the azimuth it stands at as the visit opens, its height on the screen and its size. */
export type Cloud = Pick<Circle, 'y' | 'r'> & { azimuth: number };

/** The clouds the opening screen shows, across and down it and by its short side. */
const OPENING_CLOUDS = [
  [0.16, 0.14, 0.06],
  [0.5, 0.08, 0.045],
  [0.68, 0.24, 0.05],
] as const;
/** How many clouds stand round the rest of the sky, behind and beside the opening screen. */
const CLOUDS_ROUND = 5;
/** The seed the clouds round the sky are placed from, the same on every visit. */
const CLOUD_SEED = 0xc1_0d;
/** How far from its own slot's middle a cloud round the sky may stand, as a share of a slot. */
const CLOUD_JITTER = 0.3;

/**
 * The sky's clouds: the opening screen's three where it has always shown
 * them, then `CLOUDS_ROUND` round the rest of the sky, one to each slot of
 * the arc the opening screen does not show, as high and as large as the
 * opening three run.
 */
export function skyClouds(camera: Camera): Cloud[] {
  const { width, height } = camera;
  const short = Math.min(width, height);
  const opening = OPENING_CLOUDS.map(([across, down, size]) => ({
    azimuth: azimuthAt(camera, width * across),
    y: height * down,
    r: short * size,
  }));
  const random = mulberry32(CLOUD_SEED);
  const shown = azimuthAt(camera, width);
  const slot = (TURN - 2 * shown) / CLOUDS_ROUND;
  const round = Array.from({ length: CLOUDS_ROUND }, (_, index) => ({
    azimuth: wrapAngle(
      shown +
        slot * (index + 0.5 + between(random, -CLOUD_JITTER, CLOUD_JITTER)),
    ),
    y: height * between(random, 0.08, 0.24),
    r: short * between(random, 0.045, 0.06),
  }));
  return [...opening, ...round];
}

/** How far a cloud drifts each second, in CSS px across the screen's middle, by its place among the clouds. */
const CLOUD_SPEEDS = [7, 4, 5.5];

/** Where `cloud` has drifted round the sky by `t`, in seconds, as its azimuth: rightward, at its own pace. */
export function driftedAzimuth(
  camera: Camera,
  cloud: Cloud,
  index: number,
  t: number,
): number {
  const speed = CLOUD_SPEEDS[index % CLOUD_SPEEDS.length] ?? 5;
  return wrapAngle(cloud.azimuth + (speed * t) / pinholeOf(camera).focal);
}
