/**
 * The stride: where on the plane the eye stands, in the clump's size, as a
 * function of the clock, in seconds, and of the keys and finger that walk it.
 * Held `↑` or `↓` walks it along its heading at a steady cruise, eased in and
 * out, stepped frame by frame through `tick`; held strafe keys walk it
 * sideways, square to the heading, on a second pace eased the same way, the
 * two sharing the cruise when both are held. A drag sets a point on a line —
 * the heading, or square to it — for it to chase, no faster than the cruise,
 * braking into it. On the lift a quick finger flings the eye on along that
 * line, gliding from the finger's speed to rest as the sky's turn does
 * (`glide.ts`), and a finger lifted at rest leaves the chase to ease to rest
 * over the cruise's own ease; a walking, strafing or turning key going down,
 * or a new press, ends either at once, its pace handed on to the keys. The
 * plane has no end, so nothing but a chase's target stops the walk. The
 * heading is the turn's, passed in.
 */

import {
  type Course,
  cruise,
  type Cruising,
  type Direction,
  wayOf,
} from './cruise';
import type { Point } from './geometry';
import {
  blended,
  type Flinging,
  flung,
  GLIDE_OVER,
  GLIDE_TAU,
  glided,
  glidePace,
  type Sampled,
} from './glide';
import { type Held, KEY_EASE } from './pan';

/** A held key's walk, in the clump's size a second. */
export const STRIDE_CRUISE = 1.6;
/** How far one step carries the eye: two a second at the cruise. */
export const STEP_LENGTH = 0.8;
/**
 * The fastest a fling sets the eye off, and the slowest that still flings it,
 * in the clump's size a second: a quick swipe carries it on by at most
 * `STRIDE_FLING_FASTEST · GLIDE_TAU`, 2.6, about as far as a swipe across a
 * third of the screen lays its ground.
 */
const STRIDE_FLING_FASTEST = 5 * STRIDE_CRUISE;
const STRIDE_FLING_SLOWEST = STRIDE_CRUISE / 8;

/** Which of the stepping and strafing keys are held, the strafe's as the turn's are. */
type Steps = Held & { forward: boolean; back: boolean };

const NONE_HELD: Steps = {
  forward: false,
  back: false,
  leftward: false,
  rightward: false,
};

/** Which way a held key walks the eye: along the heading, or square to it. */
type Axis = 'step' | 'strafe';

/** The heading a quarter turn to the right of `heading`: the way a strafe walks on. */
export function sidewaysOf(heading: number): number {
  return heading + Math.PI / 2;
}

/** The line a finger walks the eye along: its `axis`, and its heading, its `bearing`. */
type Line = { axis: Axis; bearing: number };

/**
 * A drag walking the eye along its line: the point it stood at, its
 * `origin`, when the finger took it, and its `aim`, the target that many
 * units on from the origin along it (back for less than 0); the aim's
 * velocity as of its latest sample, and `lifted` once the finger is up.
 */
type Chase = Line &
  Sampled &
  Flinging & {
    origin: Point;
    aim: number;
    lifted: boolean;
  };

/**
 * A fling gliding the eye on along its line after a quick lift: it carries
 * the eye `carry` units in all (back for less than 0), `spent` seconds into its
 * `GLIDE_OVER`.
 */
type Glide = Line & { carry: number; spent: number };

/**
 * The eye's place on the plane and its pace along the way it walks — the
 * heading, or a chase's line while a drag walks it — with `sidePace` square
 * to the heading and `walked` in the clump's size; a fling's `glide` while
 * one carries it. Keys already held when a drag takes the walk wait for its
 * chase to end, and such a lift flings nothing.
 */
export type Stride = Cruising<Point> & {
  sidePace: number;
  walked: number;
  held: Steps;
  chase: Chase | undefined;
  glide: Glide | undefined;
};

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

export function standingAt(at: Point): Stride {
  return {
    at,
    pace: 0,
    sidePace: 0,
    walked: 0,
    held: NONE_HELD,
    chase: undefined,
    glide: undefined,
  };
}

function heldFlag(axis: Axis, direction: Direction): keyof Steps {
  if (axis === 'strafe') return direction < 0 ? 'leftward' : 'rightward';
  return direction < 0 ? 'back' : 'forward';
}

function holding(
  stride: Stride,
  axis: Axis,
  direction: Direction,
  held: boolean,
): Stride {
  const flag = heldFlag(axis, direction);
  if (stride.held[flag] === held) return stride;
  const taken = held ? yieldChase(stride) : stride;
  return { ...taken, held: { ...taken.held, [flag]: held } };
}

/**
 * A key took the walk from a chase, lifted or not, or from a fling: it ends
 * where the eye stands, its pace carried on along its axis, no faster than
 * the cruise, for the keys to ease from, so the take-over has no jolt.
 */
export function yieldChase(stride: Stride): Stride {
  const line = stride.chase ?? stride.glide;
  if (!line) return stride;
  const pace = Math.max(-STRIDE_CRUISE, Math.min(STRIDE_CRUISE, stride.pace));
  const strafing = line.axis === 'strafe';
  return {
    ...stride,
    pace: strafing ? 0 : pace,
    sidePace: strafing ? pace : 0,
    chase: undefined,
    glide: undefined,
  };
}

/**
 * The stepping key for `direction` went down: `1` for `↑`, walking on, `-1`
 * for `↓`, walking back, taking the walk from any chase. A key already held
 * changes nothing, so its repeats do not restart the walk.
 */
export function holdStep(stride: Stride, direction: Direction): Stride {
  return holding(stride, 'step', direction, true);
}

/** The stepping key for `direction` came up: the walk eases to rest unless the other is held. */
export function letGoStep(stride: Stride, direction: Direction): Stride {
  return holding(stride, 'step', direction, false);
}

/** A strafing key went down: `1` walks the eye to its right, `-1` to its left, taking the walk from any chase. Its repeats change nothing. */
export function holdStrafe(stride: Stride, direction: Direction): Stride {
  return holding(stride, 'strafe', direction, true);
}

/** A strafing key came up: the strafe eases to rest unless the other is held. */
export function letGoStrafe(stride: Stride, direction: Direction): Stride {
  return holding(stride, 'strafe', direction, false);
}

/**
 * A finger takes the walk along `axis` of `heading` at `time` — along it, or
 * `sidewaysOf` it: the eye stops where it stands, a fling with it, as a press
 * stops the crop, and chases a target that starts there.
 */
export function chaseFrom(
  stride: Stride,
  heading: number,
  axis: Axis,
  time: number,
): Stride {
  const bearing = axis === 'strafe' ? sidewaysOf(heading) : heading;
  const chase: Chase = {
    origin: stride.at,
    axis,
    bearing,
    aim: 0,
    lifted: false,
    sampledAt: time,
    velocity: undefined,
  };
  return { ...stride, pace: 0, sidePace: 0, chase, glide: undefined };
}

/**
 * The finger moved the chase's target to `aim` units along its heading
 * from where the chase began, back for less than 0, at `time`: a sample of
 * the target's velocity, which a lift flings the eye on by.
 */
export function chaseTo(stride: Stride, aim: number, time: number): Stride {
  const { chase } = stride;
  if (!chase || chase.lifted) return stride;
  if (chase.aim === aim && chase.sampledAt === time) return stride;
  const span = time - chase.sampledAt;
  const velocity = blended(chase.velocity, aim - chase.aim, span);
  return {
    ...stride,
    chase: {
      ...chase,
      aim,
      velocity,
      sampledAt: Math.max(time, chase.sampledAt),
    },
  };
}

/**
 * The finger lifted at `time`. A quick finger flings the eye on along the
 * chase's line from the faster of its own pace and the target's velocity
 * that way, no faster than `STRIDE_FLING_FASTEST`. Otherwise, or with a
 * walking key held, the chase eases to rest over the cruise's ease, braking
 * short of its target rather than running on to it, then the eye rests or
 * walks on by the keys held.
 */
export function liftChase(stride: Stride, time: number): Stride {
  const { chase, held, pace } = stride;
  if (!chase || chase.lifted) return stride;
  const lifted = { ...stride, chase: { ...chase, lifted: true } };
  if (Object.values(held).some(Boolean)) return lifted;
  const finger = flung(chase.velocity, chase.sampledAt, time);
  const faster =
    Math.sign(pace) === Math.sign(finger) && Math.abs(pace) > Math.abs(finger);
  const launch = faster ? pace : finger;
  if (Math.abs(launch) < STRIDE_FLING_SLOWEST) return lifted;
  const speed =
    Math.sign(launch) * Math.min(STRIDE_FLING_FASTEST, Math.abs(launch));
  const { axis, bearing } = chase;
  const carry = speed * GLIDE_TAU;
  return {
    ...stride,
    pace: speed,
    chase: undefined,
    glide: { axis, bearing, carry, spent: 0 },
  };
}

/** How far the eye has come along a chase's heading from where it began. */
function progress({ origin, bearing }: Chase, at: Point): number {
  return dot(plus(at, origin, -1), forwardOf(bearing));
}

/**
 * How far the eye at `at` can walk `direction` along a chase's heading before
 * it must rest: at its target, or with no end when the target lies behind.
 */
function chaseRoom(chase: Chase, at: Point, direction: Direction): number {
  const left = (chase.aim - progress(chase, at)) * direction;
  return left > 0 ? left : Infinity;
}

/** The course a held key walks along `heading`, asking `toward`. */
function keyed(
  heading: number,
  toward: number,
  covered: (length: number) => void,
): Course<Point> {
  const ahead = forwardOf(heading);
  return {
    cruise: STRIDE_CRUISE,
    ease: KEY_EASE,
    toward: () => toward,
    room: () => Infinity,
    step: (at, by) => {
      if (by === 0) return { at, stopped: false };
      covered(Math.abs(by));
      return { at: plus(at, ahead, by), stopped: false };
    },
  };
}

/** The course a drag's `chase` walks, braking into its target; once lifted it asks for rest. */
function chased(
  chase: Chase,
  covered: (length: number) => void,
): Course<Point> {
  const ahead = forwardOf(chase.bearing);
  return {
    cruise: STRIDE_CRUISE,
    ease: KEY_EASE,
    toward: (at) =>
      chase.lifted ? 0 : Math.sign(chase.aim - progress(chase, at)),
    room: (at, direction) => chaseRoom(chase, at, direction),
    step: (at, by) => {
      if (by === 0) return { at, stopped: false };
      const direction = wayOf(by);
      const most = chaseRoom(chase, at, direction);
      const length = Math.min(Math.abs(by), most);
      covered(length);
      return {
        at: plus(at, facing(ahead, direction), length),
        stopped: Math.abs(by) >= most,
      };
    },
  };
}

/**
 * What the held keys ask of each axis, -1 to 1 (none for both of a pair or
 * neither): a step and a strafe held together share the cruise, so the eye
 * walks the diagonal at the pace it walks either.
 */
function asked(held: Steps): Record<Axis, number> {
  const step = Number(held.forward) - Number(held.back);
  const strafe = Number(held.rightward) - Number(held.leftward);
  const share = step !== 0 && strafe !== 0 ? Math.SQRT1_2 : 1;
  return { step: step * share, strafe: strafe * share };
}

/** A drag's walk `seconds` on, braking into its target or, lifted, to rest; over once lifted and at rest. */
function chasing(stride: Stride, chase: Chase, seconds: number): Stride {
  let { walked } = stride;
  const covered = (length: number): void => {
    walked += length;
  };
  const { at, pace } = cruise(chased(chase, covered), stride, seconds);
  const over = chase.lifted && pace === 0;
  if (!over && at === stride.at && pace === stride.pace) return stride;
  return { ...stride, at, pace, walked, chase: over ? undefined : chase };
}

/** A fling's glide `seconds` on along its line, over and at rest once its time is up. */
function gliding(stride: Stride, glide: Glide, seconds: number): Stride {
  const { bearing, carry, spent } = glide;
  const later = Math.min(GLIDE_OVER, spent + seconds);
  const by = carry * (glided(later / GLIDE_OVER) - glided(spent / GLIDE_OVER));
  const over = later >= GLIDE_OVER;
  return {
    ...stride,
    at: plus(stride.at, forwardOf(bearing), by),
    pace: carry * glidePace(later / GLIDE_OVER),
    walked: stride.walked + Math.abs(by),
    glide: over ? undefined : { ...glide, spent: later },
  };
}

/**
 * The walk `seconds` on, by `cruise`, the keys' along `heading` and square to
 * it, or a drag's along its own line: each pace eases toward the cruise the
 * held keys ask, or toward the chase's target, and brakes to rest exactly at
 * a chase's target; a lifted chase eases to rest, and once there is over; a
 * fling glides on along its line. A stride
 * that stands still is returned as the same object.
 */
export function tick(stride: Stride, heading: number, seconds: number): Stride {
  const { at: setOff, chase, glide, held, pace, sidePace, walked } = stride;
  if (seconds <= 0) return stride;
  if (chase) return chasing(stride, chase, seconds);
  if (glide) return gliding(stride, glide, seconds);
  const toward = asked(held);
  const stepping = toward.step !== 0 || pace !== 0;
  const strafing = toward.strafe !== 0 || sidePace !== 0;
  if (!stepping && !strafing) return stride;
  let along = 0;
  let across = 0;
  const { at: stepped, pace: nextPace } = stepping
    ? cruise(
        keyed(heading, toward.step, (length) => {
          along += length;
        }),
        stride,
        seconds,
      )
    : stride;
  const { at, pace: nextSidePace } = strafing
    ? cruise(
        keyed(sidewaysOf(heading), toward.strafe, (length) => {
          across += length;
        }),
        { at: stepped, pace: sidePace },
        seconds,
      )
    : { at: stepped, pace: sidePace };
  if (at === setOff && nextPace === pace && nextSidePace === sidePace) {
    return stride;
  }
  return {
    ...stride,
    at,
    pace: nextPace,
    sidePace: nextSidePace,
    // The two axes are square, so a frame's path is their hypotenuse.
    walked: walked + Math.hypot(along, across),
  };
}
