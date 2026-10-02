/**
 * The leg's frame: the space an insect's leg is steered in, and timed in. It
 * is the opening layout's pinhole stood at the eye and turned to a centre
 * azimuth fixed as the leg sets off, so at the opening eye facing the clump
 * it is the layout itself, and the leg is flown as the layout flies it.
 * Turning the eye moves no framed point; walking moves them by true parallax.
 */

import type { Point } from './geometry';
import { type Eye, EYE_HEIGHT, type Eyed, SPREAD } from './ground';
import { wrap } from './insect-motion';

/** A point in the air: a plane point and its height over the plane, both in the clump's size. */
export type Aloft = Point & { h: number };

/** An `Aloft` in a leg's frame: across and down in the units of its `EyeFrame`, and `forward`, its distance ahead of the eye along the frame’s centre, in the clump's size. */
export type Framed = Point & { forward: number };

/**
 * The frame an eye draws a leg in, in some unit of the screen: the `eye`,
 * the pinhole's `focal` length, and where the frame's centre sight meets the
 * horizon (`x`, `y`).
 */
export type EyeFrame = Point & Eyed & { focal: number };

/**
 * How far off a leg's centre, in plane azimuth, either end may stand:
 * `tan 0.9` (1.26 focal lengths) at the frame's edge, well inside its one
 * singular line at `SPREAD · π/2`. Twice it exceeds π, so any chord fits.
 */
export const FRAME_MARGIN = SPREAD * 0.9;

/** The plane azimuth of `point` from `eye`, turned from its `+y` toward its `+x`. */
export function azimuthOf(eye: Point, point: Point): number {
  return Math.atan2(point.x - eye.x, point.y - eye.y);
}

/**
 * The centre azimuth of a leg from `from` to `to` as `eye` sets it off: the
 * eye's heading, clamped so both ends, taken the short way round, lie within
 * `FRAME_MARGIN` of it. Facing anything on the screen the clamp does not
 * bite, so the leg's frame is the screen's own crop; only the eye's heading
 * reproduces the layout's bow sides, a chord-derived centre does not.
 */
export function centreOf(eye: Eye, from: Point, to: Point): number {
  const start = azimuthOf(eye, from);
  const end = start + wrap(azimuthOf(eye, to) - start);
  const low = Math.min(start, end);
  const high = Math.max(start, end);
  const middle = (low + high) / 2;
  const heading = middle + wrap(eye.heading - middle);
  return Math.min(Math.max(heading, high - FRAME_MARGIN), low + FRAME_MARGIN);
}

/**
 * `aloft` in the frame `centre` stands at `frame`'s eye: across by the
 * tangent of its gathered azimuth off `centre`, down by its height over its
 * forward distance. Defined only within `SPREAD · π/2` of `centre`.
 */
export function framedOf(
  frame: EyeFrame,
  centre: number,
  aloft: Aloft,
): Framed {
  const { eye, focal, x, y } = frame;
  const distance = Math.hypot(aloft.x - eye.x, aloft.y - eye.y);
  const theta = wrap(azimuthOf(eye, aloft) - centre) / SPREAD;
  const forward = distance * Math.cos(theta);
  return {
    x: x + focal * Math.tan(theta),
    y: y + ((EYE_HEIGHT - aloft.h) * focal) / forward,
    forward,
  };
}

/** `framedOf` run backwards: the `Aloft` the frame `centre` at `frame`'s eye stands at `framed`. */
export function unframed(
  frame: EyeFrame,
  centre: number,
  framed: Framed,
): Aloft {
  const { eye, focal, x, y } = frame;
  const theta = Math.atan((framed.x - x) / focal);
  const azimuth = centre + SPREAD * theta;
  const distance = framed.forward / Math.cos(theta);
  return {
    x: eye.x + distance * Math.sin(azimuth),
    y: eye.y + distance * Math.cos(azimuth),
    h: EYE_HEIGHT - ((framed.y - y) * framed.forward) / focal,
  };
}
