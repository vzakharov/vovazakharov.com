/**
 * The panorama ringing the glade, by azimuth, pure: the sun, its glow and its
 * wash, the clouds and the hills all stand at infinity, so a turn slides them
 * across the screen and a step moves none of them. An azimuth is measured as
 * the eye's heading is, from the plane's `+y` toward its `+x`; the screen
 * shows azimuth `α` at `cx + arc·(α − heading)`, the shorter way round
 * (`pinholeOf`).
 */

import { type Circle, type Point, sample } from '../../model/geometry';
import { type Camera, pinholeOf } from '../../model/ground';
import { between, mulberry32 } from '../../model/random';
import type { Span } from './baking';
import type { View } from './view';

const TURN = Math.PI * 2;

/** `angle` wrapped into `[−π, π)`. */
export function wrapAngle(angle: number): number {
  return angle - TURN * Math.floor((angle + Math.PI) / TURN);
}

/** A line round the panorama: its height down the screen, in CSS px, at each azimuth. */
export type Crest = (azimuth: number) => number;
/** A thing's skyline round the panorama. */
export type WithCrest = { crest: Crest };
/** The azimuth a thing stands at round the panorama. */
export type Azimuthed = { azimuth: number };

/** The cubic from `from` to `to` over `s` in [0, 1], leaving at `out` and arriving at `into`, each per the whole of `s`. */
function hermite(
  from: number,
  out: number,
  to: number,
  into: number,
  s: number,
): number {
  const [s2, s3] = [s * s, s * s * s];
  return (
    (2 * s3 - 3 * s2 + 1) * from +
    (s3 - 2 * s2 + s) * out +
    (3 * s2 - 2 * s3) * to +
    (s3 - s2) * into
  );
}

/**
 * A sine wave round the panorama, as `camera`'s opening view shows it
 * `rate` radians of its phase to a CSS px across the screen, `phase` at the
 * screen's middle: over the opening screen exactly that, and round the rest
 * of the circle at about the pace it runs at the middle, easing between the
 * two with no corner and turning a whole number of times round the circle,
 * so it joins itself. Its value at each azimuth, from −1 to 1.
 */
export function ringWave(camera: Camera, rate: number, phase: number): Crest {
  const { x: middle, arc } = pinholeOf(camera);
  const from = -middle / arc;
  const to = (camera.width - middle) / arc;
  const behind = TURN - (to - from);
  const across = (azimuth: number) => rate * arc * azimuth;
  const pace = (_azimuth: number) => rate * arc;
  const turns = Math.max(
    1,
    Math.round((across(to) - across(from) + rate * arc * behind) / TURN),
  );
  const [leaving, back] = [across(to), across(from) + turns * TURN];
  const [out, into] = [pace(to) * behind, pace(from) * behind];
  return (azimuth) => {
    const at = from + ((((azimuth - from) % TURN) + TURN) % TURN);
    const turned =
      at <= to
        ? across(at)
        : hermite(leaving, out, back, into, (at - to) / behind);
    return Math.sin(turned + phase);
  };
}

/**
 * `crest` across `view`'s screen, `steps` points to its width and `margin`
 * CSS px past either edge, left to right, in CSS px.
 */
export function crestAcross(
  crest: Crest,
  view: View,
  steps: number,
  margin = 0,
): Point[] {
  const { width } = view;
  const count = Math.ceil((steps * (width + 2 * margin)) / width);
  return sample(-margin, width + margin, count, (x) => ({
    x,
    y: crestAt(crest, view, x),
  }));
}

/** How far down `view`'s screen `crest` stands at `x` across it, in CSS px. */
export function crestAt(crest: Crest, view: View, x: number): number {
  const { x: middle, arc } = pinholeOf(view);
  return crest(view.eye.heading + (x - middle) / arc);
}

/** The azimuth the opening eye, looking along heading 0, sees `x` across `camera`'s screen at. */
export function azimuthAt(camera: Camera, x: number): number {
  const { x: middle, arc } = pinholeOf(camera);
  return (x - middle) / arc;
}

/**
 * Where across the screen `view` shows `azimuth`, in CSS px, the shorter way
 * round from the heading: behind the eye is off the screen's side.
 */
export function screenAt(view: View, azimuth: number): number {
  const off = wrapAngle(azimuth - view.eye.heading);
  const { x, arc } = pinholeOf(view);
  return x + arc * off;
}

/** The azimuths `view`'s screen shows, from its left edge to its right. */
export function shownAzimuths(view: View): { from: number; to: number } {
  const { x, arc } = pinholeOf(view);
  const { heading } = view.eye;
  return {
    from: heading - x / arc,
    to: heading + (view.width - x) / arc,
  };
}

/**
 * How far across the screen `view` moves what was laid out round `at`, in
 * CSS px across the opening screen: a picture baked about the sun is drawn
 * this far over from where it was baked.
 */
export function shiftOf(view: View, at: number): number {
  return screenAt(view, azimuthAt(view, at)) - at;
}

/**
 * Where `view` draws the left edge of a picture baked over `home`, across the
 * opening screen, round the opening x `at`, in CSS px; `undefined` where it is
 * wholly off the screen.
 */
export function placedLeft(
  view: View,
  at: number,
  home: Span,
): number | undefined {
  const left = home.left + shiftOf(view, at);
  return left < view.width && left + home.across > 0 ? left : undefined;
}

/**
 * A cloud aloft: the azimuth it stands at as the visit opens, how fast it
 * drifts rightward round the sky in radians a second, its height on the
 * screen and its size.
 */
export type Cloud = Pick<Circle, 'y' | 'r'> &
  Azimuthed & {
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
 * How far round the sky from its leader, in radians, each of a lane's other
 * clouds stands, for a screen `shown` radians wide: the two beside the
 * leader a whole screen off it, so wherever on the opening screen the leader
 * stands neither is on it, and the rest evenly between, no gap wider than
 * the screen.
 */
function laneOffsets(shown: number): number[] {
  const beside = Math.min(shown, TURN / 2);
  const inner = Math.ceil(TURN / beside - 2);
  const pace = inner > 0 ? (TURN - 2 * beside) / inner : 0;
  return Array.from({ length: inner + 1 }, (_, index) => beside + index * pace);
}

/**
 * The sky's clouds: the opening screen's three where it has always shown
 * them, each leading a lane round the sky that drifts together at the
 * leader's pace (`laneOffsets`), the lane's clouds no farther apart than the
 * screen is wide in azimuth. So whatever the heading and however long the
 * visit, every lane has a cloud on the screen, and the opening screen shows
 * the three the visit opened on and no other. A lane's others stand as high
 * and as large as the opening three run, from `CLOUD_SEED`.
 */
export function skyClouds(camera: Camera): Cloud[] {
  const { width, height } = camera;
  const short = Math.min(width, height);
  const { arc } = pinholeOf(camera);
  const random = mulberry32(CLOUD_SEED);
  const offsets = laneOffsets(azimuthAt(camera, width) - azimuthAt(camera, 0));
  const leaders = OPENING_CLOUDS.map(([across, down, size, speed]) => ({
    azimuth: azimuthAt(camera, width * across),
    drift: speed / arc,
    y: height * down,
    r: short * size,
  }));
  const followers = leaders.flatMap(({ azimuth, drift }) =>
    offsets.map((offset) => ({
      azimuth: wrapAngle(azimuth + offset),
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
