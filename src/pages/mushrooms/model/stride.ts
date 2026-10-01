/**
 * The stride: where on the plane the eye stands, in the clump's size, as a
 * function of the clock, in seconds, and of the keys and finger that walk it.
 * Held `↑` or `↓` walks it along its heading at a steady cruise, eased in and
 * out, stepped frame by frame through `tick`; a vertical drag sets a point on
 * the heading for it to chase, no faster than the cruise, and on the lift it
 * finishes the chase and rests, a step having no glide. It never leaves the
 * glade: walked into the rim it slides along it, braking to rest where the
 * rim turns square to the walk. The heading is the turn's, passed in.
 */

import {
  type Course,
  cruise,
  type Cruising,
  type Direction,
  type Placed,
} from './cruise';
import type { Circle, Point } from './geometry';
import { KEY_EASE } from './pan';

/** A held key's walk, in the clump's size a second. */
export const STRIDE_CRUISE = 1.6;
/** How far one step carries the eye: two a second at the cruise. */
export const STEP_LENGTH = 0.8;
/** The ground the eye may walk: it holds the whole opening view, with room to step back. */
export const GLADE: Circle = { x: 0, y: 8, r: 12 };
/** How far inside the glade's rim the eye keeps. */
export const RIM_KEEP = 0.5;

/** The radius of the disc the eye's own point keeps to. */
const REACH = GLADE.r - RIM_KEEP;

/** Which of the two stepping keys are held. */
type Steps = { forward: boolean; back: boolean };

const NONE_HELD: Steps = { forward: false, back: false };

/**
 * A drag walking the eye: the point it stood at, its `origin`, when the
 * finger took it, the heading it chases along, its `bearing`, and its `aim`,
 * the target that many units on from the origin along it (back for less
 * than 0); `lifted` once the finger is up.
 */
type Chase = { origin: Point; bearing: number; aim: number; lifted: boolean };

/**
 * The eye's place on the plane and its pace along the way it walks, how far
 * it has walked in all, in the clump's size, the keys held, and the drag that
 * walks it, if one does; while one does, the keys wait for it to finish.
 */
export type Stride = Cruising<Point> & {
  walked: number;
  held: Steps;
  chase: Chase | undefined;
};

/** A walk's landing, how far along its path it came, and whether the rim ended it. */
type Walked = Placed<Point> & { covered: number; ended: boolean };

/** The unit step straight along `heading`: `+y` at 0, turning toward `+x`. */
export function forwardOf(heading: number): Point {
  return { x: Math.sin(heading), y: Math.cos(heading) };
}

function plus(at: Point, by: Point, times: number): Point {
  return { x: at.x + by.x * times, y: at.y + by.y * times };
}

/** Unit `way`, turned round for -1. */
function facing(way: Point, direction: Direction): Point {
  return { x: way.x * direction, y: way.y * direction };
}

function dot(one: Point, other: Point): number {
  return one.x * other.x + one.y * other.y;
}

/** How far `other` stands turned from `one`, positive turning from `+x` toward `+y`. */
function cross(one: Point, other: Point): number {
  return one.x * other.y - one.y * other.x;
}

/** `at` from the glade's centre. */
function fromCentre(at: Point): Point {
  return { x: at.x - GLADE.x, y: at.y - GLADE.y };
}

/** The point on the eye's rim at unit `normal` from the glade's centre. */
function onRim(normal: Point): Point {
  return plus(GLADE, normal, REACH);
}

/** How far the ray from `at` along unit `way` runs before it meets the eye's rim. */
function toRim(at: Point, way: Point): number {
  const off = fromCentre(at);
  const along = dot(off, way);
  const past = dot(off, off) - REACH ** 2;
  return Math.max(0, -along + Math.sqrt(Math.max(0, along ** 2 - past)));
}

/**
 * Where the ray from `at` along unit `way` meets the rim, as the unit normal
 * there, and the angle the slide along the rim then turns through before the
 * rim stands square to `way`.
 */
function meeting(
  at: Point,
  way: Point,
): { ray: number; normal: Point; slide: number } {
  const ray = toRim(at, way);
  const off = fromCentre(plus(at, way, ray));
  const length = Math.hypot(off.x, off.y);
  const normal = { x: off.x / length, y: off.y / length };
  // `atan2` keeps a head-on slide's near-zero angle exact, where `acos` loses it.
  const slide = Math.atan2(Math.abs(cross(normal, way)), dot(normal, way));
  return { ray, normal, slide };
}

/**
 * How far the eye at `at` can walk along unit `way` before it must rest, in
 * the clump's size: the ray's distance to the rim, then the slide along it
 * to where the rim stands square to the walk.
 */
export function roomAhead(at: Point, way: Point): number {
  const { ray, slide } = meeting(at, way);
  return ray + REACH * slide;
}

/**
 * The eye walked `length` from `at` along unit `way`: straight to the rim,
 * then sliding along it, the move projected onto its tangent, no farther
 * than where the rim stands square to the walk, which ends it.
 */
function walk(at: Point, way: Point, length: number): Walked {
  const { ray, normal, slide } = meeting(at, way);
  if (length <= ray) {
    return { at: plus(at, way, length), covered: length, ended: false };
  }
  const turned = (length - ray) / REACH;
  if (turned >= slide) {
    return { at: onRim(way), covered: ray + REACH * slide, ended: true };
  }
  const sense = Math.sign(cross(normal, way));
  const cos = Math.cos(sense * turned);
  const sin = Math.sin(sense * turned);
  const swung = {
    x: normal.x * cos - normal.y * sin,
    y: normal.x * sin + normal.y * cos,
  };
  return { at: onRim(swung), covered: length, ended: false };
}

/** `at`, or the nearest point to it the eye may stand on. */
function inGlade(at: Point): Point {
  const off = fromCentre(at);
  const length = Math.hypot(off.x, off.y);
  if (length <= REACH) return at;
  return onRim({ x: off.x / length, y: off.y / length });
}

/** The eye standing at `at`, or the nearest point of the glade to it. */
export function standingAt(at: Point): Stride {
  return {
    at: inGlade(at),
    pace: 0,
    walked: 0,
    held: NONE_HELD,
    chase: undefined,
  };
}

/** The held-key flag `direction` names. */
function heldFlag(direction: Direction): keyof Steps {
  return direction < 0 ? 'back' : 'forward';
}

/**
 * The stepping key for `direction` went down: `1` for `↑`, walking on, `-1`
 * for `↓`, walking back. A key already held changes nothing, so its repeats
 * do not restart the walk.
 */
export function holdStep(stride: Stride, direction: Direction): Stride {
  const flag = heldFlag(direction);
  if (stride.held[flag]) return stride;
  return { ...stride, held: { ...stride.held, [flag]: true } };
}

/** The stepping key for `direction` came up: the walk eases to rest unless the other is held. */
export function letGoStep(stride: Stride, direction: Direction): Stride {
  const flag = heldFlag(direction);
  if (!stride.held[flag]) return stride;
  return { ...stride, held: { ...stride.held, [flag]: false } };
}

/**
 * A finger takes the walk along `heading`: the eye stops where it stands, as
 * a press stops the crop, and chases a target that starts there.
 */
export function chaseFrom(stride: Stride, heading: number): Stride {
  const chase = { origin: stride.at, bearing: heading, aim: 0, lifted: false };
  return { ...stride, pace: 0, chase };
}

/**
 * The finger moved the chase's target to `aim` units along its heading
 * from where the chase began, back for less than 0.
 */
export function chaseTo(stride: Stride, aim: number): Stride {
  const { chase } = stride;
  if (!chase || chase.lifted || chase.aim === aim) return stride;
  return { ...stride, chase: { ...chase, aim } };
}

/** The finger lifted: the eye finishes its chase, then rests or walks on by the keys held. */
export function liftChase(stride: Stride): Stride {
  const { chase } = stride;
  if (!chase || chase.lifted) return stride;
  return { ...stride, chase: { ...chase, lifted: true } };
}

/** How far the eye has come along a chase's heading from where it began. */
function progress({ origin, bearing }: Chase, at: Point): number {
  return dot(plus(at, origin, -1), forwardOf(bearing));
}

/**
 * How far the eye at `at` can walk `direction` along a chase's heading before
 * it must rest: at its target, or where the rim stops it short of it.
 */
function chaseRoom(chase: Chase, at: Point, direction: Direction): number {
  const way = facing(forwardOf(chase.bearing), direction);
  const rim = roomAhead(at, way);
  const left = (chase.aim - progress(chase, at)) * direction;
  if (left <= 0) return rim;
  const { ray, slide } = meeting(at, way);
  if (left <= ray) return left;
  // Past the ray the eye slides, and its progress along the way is the rim
  // point's: the target's progress names the normal the slide stops at.
  const square =
    (left - ray + dot(fromCentre(plus(at, way, ray)), way)) / REACH;
  if (square >= 1) return rim;
  return ray + REACH * Math.max(0, slide - Math.acos(Math.max(-1, square)));
}

/** The course a held key walks along `heading`, asking `toward`. */
function keyed(
  heading: number,
  toward: number,
  covered: (length: number) => void,
): Course<Point> {
  const ahead = forwardOf(heading);
  const way = (direction: Direction): Point => facing(ahead, direction);
  return {
    cruise: STRIDE_CRUISE,
    ease: KEY_EASE,
    toward: () => toward,
    room: (at, direction) => roomAhead(at, way(direction)),
    step: (at, by) => {
      if (by === 0) return { at, stopped: false };
      const {
        at: landed,
        covered: length,
        ended,
      } = walk(at, way(by > 0 ? 1 : -1), Math.abs(by));
      covered(length);
      return { at: landed, stopped: ended };
    },
  };
}

/** The course a drag's `chase` walks, braking into its target. */
function chased(
  chase: Chase,
  covered: (length: number) => void,
): Course<Point> {
  const ahead = forwardOf(chase.bearing);
  return {
    cruise: STRIDE_CRUISE,
    ease: KEY_EASE,
    toward: (at) => Math.sign(chase.aim - progress(chase, at)),
    room: (at, direction) => chaseRoom(chase, at, direction),
    step: (at, by) => {
      if (by === 0) return { at, stopped: false };
      const direction: Direction = by > 0 ? 1 : -1;
      const most = chaseRoom(chase, at, direction);
      const {
        at: landed,
        covered: length,
        ended,
      } = walk(at, facing(ahead, direction), Math.min(Math.abs(by), most));
      covered(length);
      return { at: landed, stopped: ended || Math.abs(by) >= most };
    },
  };
}

/**
 * The walk `seconds` on, by `cruise`, the keys' along `heading` or a drag's
 * along its own: the pace eases toward the cruise the held keys ask (none
 * for both or neither), or toward the chase's target, and brakes to rest
 * exactly at the target or the rim's end of the slide. A lifted chase that
 * has come to rest is over. A stride that stands still is returned as the
 * same object.
 */
export function tick(stride: Stride, heading: number, seconds: number): Stride {
  const { chase, held, pace: setOffPace, at: setOff } = stride;
  const toward = Number(held.forward) - Number(held.back);
  if (seconds <= 0 || (!chase && toward === 0 && setOffPace === 0)) {
    return stride;
  }
  let { walked } = stride;
  const covered = (length: number): void => {
    walked += length;
  };
  const course = chase
    ? chased(chase, covered)
    : keyed(heading, toward, covered);
  const { at, pace } = cruise(course, stride, seconds);
  const over = chase?.lifted === true && pace === 0;
  if (!over && at === setOff && pace === setOffPace) return stride;
  return { ...stride, at, pace, walked, chase: over ? undefined : chase };
}
