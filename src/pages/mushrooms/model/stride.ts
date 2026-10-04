/**
 * The stride: where on the plane the eye stands, in the clump's size, as a
 * function of the clock, in seconds, and of the keys and finger that walk it.
 * Held `↑` or `↓` walks it along its heading at a steady cruise, eased in and
 * out, stepped frame by frame through `tick`; held strafe keys walk it
 * sideways, square to the heading, on a second pace eased the same way, the
 * two sharing the cruise when both are held. A drag sets a point on a line —
 * the heading, or square to it — sample by sample, and the chase's `Gait`
 * says how the eye follows it: in `steps` it walks there, no faster than a
 * held key and braking into it, its feet stepping every unit; in `flight` it
 * stands there at once, as fast as the finger moves, as a drag on the sky
 * sets the heading, while the feet step after it, never faster than a held
 * key walks them. On the lift a quick finger flings the eye on along that
 * line, gliding from the finger's speed to rest as the sky's turn does
 * (`glide.ts`); a finger lifted at rest leaves a flight standing where it is
 * and a walk easing to rest as a let-go key does; a walking, strafing or
 * turning key going down, or a new press, ends either at once, its pace
 * handed on to the keys. The plane has no end. The heading is the turn's,
 * passed in.
 */

import { type Course, cruise, type Cruising, type Direction } from './cruise';
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
import { type Aimed, lineCourse } from './line-course';
import { type Held, KEY_EASE } from './pan';

/** A held key's walk, in the clump's size a second. */
export const STRIDE_CRUISE = 1.6;
/** How far one step carries the eye: two a second at the cruise. */
export const STEP_LENGTH = 0.8;
/**
 * The fastest a fling sets the eye off, and the slowest that still flings it,
 * in the clump's size a second: a quick swipe carries it on past its lift by
 * at most `STRIDE_FLING_FASTEST · GLIDE_TAU`, 2.6 units.
 */
export const STRIDE_FLING_FASTEST = 5 * STRIDE_CRUISE;
const STRIDE_FLING_SLOWEST = STRIDE_CRUISE / 8;
/**
 * The most of a finger's way the feet may still owe, in the clump's size: a
 * tenth of a second at the cruise, so they step through a frame the finger
 * sent no sample in, and stop that soon after it rests.
 */
const UNSTEPPED_MOST = STRIDE_CRUISE / 10;

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
 * How the eye follows a finger on the ground: walking to where it sets the
 * point, step by step at a held key's cruise, or standing there at once.
 */
export type Gait = 'steps' | 'flight';
/** The `gait` a ground drag moves the eye by. */
export type WithGait = { gait: Gait };

/**
 * A drag walking the eye along its line by its `gait`: the point it stood
 * at, its `origin`, when the finger took it, and its `aim`, the point the
 * finger sets, that many units on from the origin along it (back for less
 * than 0); the aim's velocity as of its latest sample; and how much of a
 * flight the feet have yet to step, `unstepped`.
 */
type Chase = Line &
  Sampled &
  Flinging &
  WithGait &
  Aimed & { unstepped: number };

/**
 * A fling gliding the eye on along its line after a quick lift: it carries
 * the eye `carry` units in all (back for less than 0), `spent` seconds into its
 * `GLIDE_OVER`.
 */
type Glide = Line & { carry: number; spent: number };

/**
 * The eye's place on the plane and its pace along the way it walks — the
 * heading, or a chase's line while a drag walks it — with `sidePace` square
 * to the heading and `walked`, the way its feet have stepped, which pace the
 * bob and the footsteps, in the clump's size; a fling's `glide` while
 * one carries it. Keys already held when a drag takes the walk wait for its
 * lift, which flings nothing and hands them the finger's pace.
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
 * A key took the walk from a chase or from a fling: it ends
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

/** The eye stopped dead where it stands: no key held, no chase, no fling. */
export function stoodStill({ at, walked }: Stride): Stride {
  return { ...standingAt(at), walked };
}

/** A strafing key came up: the strafe eases to rest unless the other is held. */
export function letGoStrafe(stride: Stride, direction: Direction): Stride {
  return holding(stride, 'strafe', direction, false);
}

/**
 * A finger takes the walk along `axis` of `heading` at `time` — along it, or
 * `sidewaysOf` it: the eye stops where it stands, a fling with it, as a press
 * stops the crop, and follows the finger from there by `gait`.
 */
export function chaseFrom(
  stride: Stride,
  heading: number,
  axis: Axis,
  time: number,
  gait: Gait,
): Stride {
  const bearing = axis === 'strafe' ? sidewaysOf(heading) : heading;
  const chase: Chase = {
    gait,
    origin: stride.at,
    axis,
    bearing,
    aim: 0,
    unstepped: 0,
    sampledAt: time,
    velocity: undefined,
  };
  return { ...stride, pace: 0, sidePace: 0, chase, glide: undefined };
}

/**
 * The finger moved the chase's point to `aim` units along its line from
 * where the chase began, back for less than 0, at `time`: a sample of the
 * finger's velocity, which a lift flings the eye on by. In `steps` the eye
 * walks there tick by tick; in `flight` it stands there at once, however
 * far that is, the finger's velocity its pace, and the move is owed to the
 * feet, which `tick` steps.
 */
export function chaseTo(stride: Stride, aim: number, time: number): Stride {
  const { chase } = stride;
  if (!chase) return stride;
  if (chase.aim === aim && chase.sampledAt === time) return stride;
  const span = time - chase.sampledAt;
  const velocity = blended(chase.velocity, aim - chase.aim, span);
  const sampled = {
    ...chase,
    aim,
    velocity,
    sampledAt: Math.max(time, chase.sampledAt),
  };
  if (chase.gait === 'steps') return { ...stride, chase: sampled };
  return {
    ...stride,
    at: plus(chase.origin, forwardOf(chase.bearing), aim),
    pace: velocity ?? 0,
    chase: {
      ...sampled,
      unstepped: Math.min(
        UNSTEPPED_MOST,
        chase.unstepped + Math.abs(aim - chase.aim),
      ),
    },
  };
}

/**
 * The finger lifted at `time`. A quick finger flings the eye on along the
 * chase's line from its velocity, no faster than `STRIDE_FLING_FASTEST`; a
 * finger at rest leaves a flight standing where it lifted and a walk easing
 * to rest from its pace; with a walking key held, the keys take over from
 * the pace, the finger's in flight, as `yieldChase` hands it on.
 */
export function liftChase(stride: Stride, time: number): Stride {
  const { chase, held } = stride;
  if (!chase) return stride;
  const finger = flung(chase.velocity, chase.sampledAt, time);
  const walking = chase.gait === 'steps';
  if (Object.values(held).some(Boolean)) {
    return yieldChase(walking ? stride : { ...stride, pace: finger });
  }
  if (Math.abs(finger) < STRIDE_FLING_SLOWEST) {
    return walking
      ? yieldChase(stride)
      : { ...stride, pace: 0, chase: undefined };
  }
  const speed =
    Math.sign(finger) * Math.min(STRIDE_FLING_FASTEST, Math.abs(finger));
  const { axis, bearing } = chase;
  const carry = speed * GLIDE_TAU;
  return {
    ...stride,
    pace: speed,
    chase: undefined,
    glide: { axis, bearing, carry, spent: 0 },
  };
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

/** How far the feet step over `seconds` along a way of `length`: all of it, up to a held key's cruise. */
function feetOver(length: number, seconds: number): number {
  return Math.min(Math.abs(length), STRIDE_CRUISE * seconds);
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
    walked: stride.walked + feetOver(by, seconds),
    glide: over ? undefined : { ...glide, spent: later },
  };
}

/**
 * A walking chase `seconds` on: the eye walks toward the finger's aim at a
 * held key's cruise, braking to rest there, its feet stepping every unit.
 */
function walkingOn(stride: Stride, chase: Chase, seconds: number): Stride {
  const { origin, bearing, aim } = chase;
  let { walked } = stride;
  const course = lineCourse(
    { origin, ahead: forwardOf(bearing), aim },
    { cruise: STRIDE_CRUISE, ease: KEY_EASE },
    (length) => {
      walked += length;
    },
  );
  const { at, pace } = cruise(course, stride, seconds);
  if (at === stride.at && pace === stride.pace) return stride;
  return { ...stride, at, pace, walked };
}

/**
 * A flight's chase `seconds` on: the eye stands where the finger set it, and
 * the feet step on through what they owe at the finger's pace, up to the
 * cruise, so they step through frames between the finger's samples.
 */
function following(stride: Stride, chase: Chase, seconds: number): Stride {
  const { unstepped, velocity } = chase;
  const by = Math.min(unstepped, feetOver((velocity ?? 0) * seconds, seconds));
  if (by === 0) return stride;
  return {
    ...stride,
    walked: stride.walked + by,
    chase: { ...chase, unstepped: unstepped - by },
  };
}

/**
 * The walk `seconds` on, by `cruise`, the keys' along `heading` and square to
 * it: each pace eases toward the cruise the held keys ask; a fling glides on
 * along its line; a walking chase walks toward the finger's aim, and a
 * flight's, which only the finger moves, holds the eye where it stands while
 * its feet catch up. A stride that stands still is returned as the same
 * object.
 */
export function tick(stride: Stride, heading: number, seconds: number): Stride {
  const { at: setOff, chase, glide, held, pace, sidePace, walked } = stride;
  if (seconds <= 0) return stride;
  if (chase?.gait === 'steps') return walkingOn(stride, chase, seconds);
  if (chase) return following(stride, chase, seconds);
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
