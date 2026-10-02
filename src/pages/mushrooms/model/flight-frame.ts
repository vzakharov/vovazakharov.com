/**
 * The leg's frame: the space an insect's leg is steered in, and timed in. It
 * is the opening layout's pinhole stood at the eye and turned to a centre
 * azimuth fixed as the leg sets off, so at the opening eye facing the clump
 * it is the layout itself, and the leg is flown as the layout flies it.
 * Turning the eye moves no framed point; walking moves them by true parallax.
 */

import { pick } from '@/shared/lib/collections';

import type { Place } from './flight';
import { alongAzimuth, type Point, wrap } from './geometry';
import { type Eye, EYE_HEIGHT, type Eyed, SPREAD } from './ground';

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
    ...alongAzimuth(eye, azimuth, distance),
    h: EYE_HEIGHT - ((framed.y - y) * framed.forward) / focal,
  };
}

/**
 * Where a `Place` stands on the plane, so a leg to or from it can be framed
 * with its other end: the `aloft` it was placed from, the `frame` it was
 * placed in, in the units of `Places`, and `near`, the least forward distance
 * a place is measured at.
 */
export type Pose = { aloft: Aloft; frame: EyeFrame; near: number };

/**
 * `aloft` as the `Place` a leg to or from it is timed by, posed in `frame`:
 * where the frame turned to the eye's heading stands it (`framedOf`), and
 * its forward distance there, kept out at `near`, as the forward falls to
 * nothing and below straight behind the eye. A point farther round than
 * `FRAME_MARGIN` off the heading is placed at that margin, as far away, off
 * the screen's side rather than where the frame's tangent blows up; a leg to
 * it is framed with its other end (`pairFramed`).
 */
export function placeOf(frame: EyeFrame, near: number, aloft: Aloft): Place {
  const { heading } = frame.eye;
  const off = wrap(azimuthOf(frame.eye, aloft) - heading);
  const kept = Math.min(Math.max(off, -FRAME_MARGIN), FRAME_MARGIN);
  // Centred `off − kept` past the heading, the frame sees `aloft` `kept` off it.
  const { x, y, forward } = framedOf(frame, heading + off - kept, aloft);
  return {
    x,
    y,
    fromEye: Math.max(near, forward),
    pose: { aloft, frame, near },
  };
}

/** `place`'s forward distance from its eye in the frame turned to the eye's heading, kept out at `near`. */
function headingForward({ aloft, frame, near }: Pose): number {
  return Math.max(near, framedOf(frame, frame.eye.heading, aloft).forward);
}

/**
 * A leg's two posed ends as it is drawn: `ends`, both framed in the first's
 * frame at the centre `centreOf` sets the leg, each forward kept out at
 * `near`, and `placed`, a point in that frame placed afresh (`placeOf`).
 */
export type PairFrame = {
  ends: readonly [Place, Place];
  placed: (framed: Framed) => Place;
};

/**
 * The frame the leg from `here` to `there` is drawn in (`PairFrame`);
 * `undefined` unless both are posed. Where both stand within `FRAME_MARGIN`
 * of the heading the centre is the heading, so they come back as placed.
 */
export function pairFramed(here: Place, there: Place): PairFrame | undefined {
  const [from, to] = [here.pose, there.pose];
  if (!from || !to) return undefined;
  const { frame, near, aloft: start } = from;
  const centre = centreOf(frame.eye, start, to.aloft);
  const framed = (aloft: Aloft): Place => {
    const { x, y, forward } = framedOf(frame, centre, aloft);
    return { x, y, fromEye: Math.max(near, forward) };
  };
  return {
    ends: [framed(start), framed(to.aloft)],
    placed: (point) => placeOf(frame, near, unframed(frame, centre, point)),
  };
}

/**
 * `there`, an away spot, moved along its sight to stand as deep as `here`
 * in the frame turned to the eye's heading, as a leg leaving from `here` is
 * drawn to it: its height over the eye's scaled with its distance, so the
 * screen draws it where it did. Unposed, its `fromEye` is `here`'s.
 */
export function levelWith(here: Place, there: Place): Place {
  const [from, to] = [here.pose, there.pose];
  if (!from || !to) return { ...there, ...pick(here, 'fromEye') };
  const { aloft, frame, near } = to;
  const { eye } = frame;
  const scale = headingForward(from) / headingForward(to);
  return placeOf(frame, near, {
    x: eye.x + (aloft.x - eye.x) * scale,
    y: eye.y + (aloft.y - eye.y) * scale,
    h: EYE_HEIGHT - (EYE_HEIGHT - aloft.h) * scale,
  });
}
