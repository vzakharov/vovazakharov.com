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

/**
 * A cloud aloft: the azimuth it stands at as the visit opens, how fast it
 * drifts rightward round the sky in radians a second, its height on the
 * screen and its size.
 */
export type Cloud = Pick<Circle, 'y' | 'r'> & {
  azimuth: number;
  drift: number;
};

/**
 * The clouds the opening screen shows, across and down it and by its short
 * side, and how far each drifts a second, in CSS px across the screen's
 * middle. Each leads a lane of clouds round the sky at its pace.
 */
const OPENING_CLOUDS = [
  [0.16, 0.14, 0.06, 7],
  [0.5, 0.08, 0.045, 4],
  [0.68, 0.24, 0.05, 5.5],
] as const;
/** How many clouds the opening screen shows, which `skyClouds` lists first. */
export const OPENING_CLOUD_COUNT = OPENING_CLOUDS.length;
/** The seed the clouds round the sky are shaped from, the same on every visit. */
const CLOUD_SEED = 0xc1_0d;
/** The rows, as shares of the screen's height, and the sizes, as shares of its short side, a cloud round the sky is drawn between. */
const CLOUD_ROWS = [0.08, 0.24] as const;
const CLOUD_SIZES = [0.045, 0.06] as const;

/**
 * The sky's clouds: the opening screen's three where it has always shown
 * them, each leading a lane evenly round the sky that drifts together at
 * the leader's pace, the lane's clouds no farther apart than the screen is
 * wide in azimuth. So whatever the heading and however long the visit, every
 * lane has a cloud on the screen, and the screen shows at least the three
 * the visit opened on. A lane's others stand as high and as large as the
 * opening three run, from `CLOUD_SEED`.
 */
export function skyClouds(camera: Camera): Cloud[] {
  const { width, height } = camera;
  const short = Math.min(width, height);
  const { focal } = pinholeOf(camera);
  const random = mulberry32(CLOUD_SEED);
  const shown = azimuthAt(camera, width) - azimuthAt(camera, 0);
  const lane = Math.ceil(TURN / shown);
  const leaders = OPENING_CLOUDS.map(([across, down, size, speed]) => ({
    azimuth: azimuthAt(camera, width * across),
    drift: speed / focal,
    y: height * down,
    r: short * size,
  }));
  const followers = leaders.flatMap(({ azimuth, drift }) =>
    Array.from({ length: lane - 1 }, (_, index) => ({
      azimuth: wrapAngle(azimuth + ((index + 1) * TURN) / lane),
      drift,
      y: height * between(random, ...CLOUD_ROWS),
      r: short * between(random, ...CLOUD_SIZES),
    })),
  );
  return [...leaders, ...followers];
}

/** Where `cloud` has drifted round the sky by `t`, in seconds, as its azimuth. */
export function driftedAzimuth({ azimuth, drift }: Cloud, t: number): number {
  return wrapAngle(azimuth + drift * t);
}
