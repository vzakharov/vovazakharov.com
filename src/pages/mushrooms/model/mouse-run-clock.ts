/**
 * A mouse's run as a pure function of its own clock: its legs from the
 * peek in its own doorway to its target's door shutting behind it, where
 * its runner stands on the plane between the two doors' fronts, and how
 * wide it is along the way. Plane lengths are in the clump's size, times in
 * seconds.
 */

import type { Point, Wide } from './geometry';
import { type DoorPlace, onStem } from './house';
import { PEEK_DUCK, PEEK_RISE, smooth } from './motion';

/** How fast a mouse runs along the plane, at full pace. */
export const RUN_PACE = 0.6;

/** A run's legs, in order, and `over` once its door has shut behind it. */
export const RUN_LEGS = [
  'peek',
  'leave',
  'run',
  'enter',
  'close',
  'over',
] as const;
export type RunLeg = (typeof RUN_LEGS)[number];

/**
 * The leg a run begins in: `peek` from a door at rest, `leave` from a
 * sinking house in a hurry, `run` from the ground where a run re-targeted.
 */
export type RunOpening = Extract<RunLeg, 'peek' | 'leave' | 'run'>;

/**
 * What a run is fixed at when it starts: how far it runs on the plane, the
 * leg it opens with, and whether its target was called and holds its door
 * open from the start.
 */
export type RunCourse = {
  runLength: number;
  opening: RunOpening;
  calling: boolean;
};

/** How long the mouse looks toward its target from the doorway before it goes. */
const RUN_LOOK = 0.5;
/** How long a hop down from the sill takes, and back up into the target's. */
const HOP_DOWN = 0.25;
const HOP_UP = 0.25;
/** How long the target door takes to shut behind the mouse. */
const RUN_SHUT = 0.3;
/** The run's shortest span, and how long it takes to reach full pace and to slow from it. */
const RUN_LEAST = 0.4;
const RUN_EASE = 0.15;
/** How quickly a called door swings open to wait. */
const CALL_OPEN = 0.18;
/** How high a hop arcs over the line from sill to ground, in the runner's width. */
const HOP_ARC = 0.3;

/** Each leg's span in `course`, in `RUN_LEGS` order, `over` lasting for ever. */
function spans({ runLength, opening }: RunCourse): Record<RunLeg, number> {
  return {
    peek: opening === 'peek' ? PEEK_RISE + RUN_LOOK : 0,
    leave: opening === 'run' ? 0 : HOP_DOWN,
    run: Math.max(RUN_LEAST, runLength / RUN_PACE),
    enter: HOP_UP,
    close: RUN_SHUT,
    over: Infinity,
  };
}

/** How long `course` takes from its start until its target's door has shut: then the mouse is counted in. */
export function runDuration(course: RunCourse): number {
  const span = spans(course);
  return span.peek + span.leave + span.run + span.enter + span.close;
}

/** How far along `span` a run is `t` into it, from 0 to 1, easing up to pace and down from it over `RUN_EASE`. */
function eased(t: number, span: number): number {
  const ramp = Math.min(RUN_EASE, span / 2);
  const whole = span - ramp;
  const clamped = Math.min(span, Math.max(0, t));
  const covered =
    clamped < ramp
      ? (clamped * clamped) / (2 * ramp)
      : clamped <= span - ramp
        ? ramp / 2 + (clamped - ramp)
        : whole - (span - clamped) ** 2 / (2 * ramp);
  return covered / whole;
}

/**
 * Where a run is at a moment of its clock: its leg; its `progress` along
 * the way from its start's front to its target's (0 to 1); how far its
 * runner stands from the ground toward the `sill` of the door it is at (0 to
 * 1) and how far up a hop's arc (`bounce`, 0 to 1); how far its head is out
 * of its start's doorway (`headOut`, as `peek` is), and how far each door
 * stands open (0 shut, 1 open); whether its `runner` is out on the ground to
 * be drawn; and how far it has `travelled` on the plane, for its stride.
 */
export type RunMoment = {
  leg: RunLeg;
  progress: number;
  sill: number;
  bounce: number;
  headOut: number;
  fromOpen: number;
  toOpen: number;
  runner: boolean;
  travelled: number;
};

/**
 * Where `course` has its mouse `elapsed` seconds after it began: it peeks
 * out and looks toward its target, hops down to the ground, runs at
 * `RUN_PACE` from front to front, hops up into the target's doorway, and
 * the door shuts behind it. Each door opens and shuts smoothly round the
 * legs that use it; a called target's opens at once and waits.
 */
export function runAt(elapsed: number, course: RunCourse): RunMoment {
  const span = spans(course);
  let leg: RunLeg = 'over';
  let t = 0;
  let begun = 0;
  for (const name of RUN_LEGS) {
    if (elapsed < begun + span[name]) {
      leg = name;
      t = elapsed - begun;
      break;
    }
    begun += span[name];
  }
  const fromDoor = course.opening !== 'run';
  const progress =
    leg === 'run'
      ? eased(t, span.run)
      : RUN_LEGS.indexOf(leg) > RUN_LEGS.indexOf('run')
        ? 1
        : 0;
  const peeking = leg === 'peek' ? smooth(t / PEEK_RISE) : 0;
  const fromOpen = {
    peek: peeking,
    leave: course.opening === 'peek' ? 1 : smooth((2 * t) / HOP_DOWN),
    run: fromDoor ? 1 - smooth(t / PEEK_DUCK) : 0,
    enter: 0,
    close: 0,
    over: 0,
  }[leg];
  const opening = {
    peek: 0,
    leave: 0,
    run: smooth((t - span.run + PEEK_DUCK) / PEEK_DUCK),
    enter: 1,
    close: 1 - smooth(t / RUN_SHUT),
    over: 0,
  }[leg];
  const waiting =
    course.calling && leg !== 'close' && leg !== 'over'
      ? smooth(elapsed / CALL_OPEN)
      : 0;
  const sill = {
    peek: 1,
    leave: 1 - smooth(t / HOP_DOWN),
    run: 0,
    enter: smooth(t / HOP_UP),
    close: 1,
    over: 1,
  }[leg];
  const hop = leg === 'leave' ? t / HOP_DOWN : leg === 'enter' ? t / HOP_UP : 0;
  return {
    leg,
    progress,
    sill,
    bounce: Math.sin(Math.PI * hop),
    headOut: peeking,
    fromOpen,
    toOpen: Math.max(opening, waiting),
    runner: leg === 'leave' || leg === 'run' || leg === 'enter',
    travelled: progress * course.runLength,
  };
}

/**
 * One end of a run: the plane point in front of its door the runner leaves
 * or reaches, its door's width, and how high its sill stands off the ground,
 * both in the clump's size. A run re-targeted from the ground starts at its
 * runner's point with its width there and no sill.
 */
export type RunEnd = Wide & { front: Point; sillHeight: number };

/** The run's end at a door seated at `door` on a mushroom of `size` in the clump's, with its `front` on the plane. */
export function endOf(front: Point, door: DoorPlace, size: number): RunEnd {
  return {
    front,
    across: door.width * size,
    sillHeight: onStem(door)({ x: 0, y: 0 }).y * size,
  };
}

/** How long a tapped runner's jump lasts, and how high it goes, in the runner's width. */
const TAP_HOP = 0.3;
const TAP_HOP_HEIGHT = 0.5;

/**
 * How high a runner jumps `since` seconds after a tap, in its width, on top
 * of where its run has it: a single arc over `TAP_HOP`, nothing before the
 * tap or after it lands. The run's own clock never reads it.
 */
export const hop = (since: number): number =>
  since >= 0 && since < TAP_HOP
    ? TAP_HOP_HEIGHT * Math.sin((Math.PI * since) / TAP_HOP)
    : 0;

/** The runner's width `progress` of the way from `from` to `to`: its own door's, easing into the target's. */
export const widthAlong = (from: Wide, to: Wide, progress: number): number =>
  from.across + (to.across - from.across) * progress;

/**
 * Where a runner stands for `moment` between `from` and `to`, all on the
 * plane in the clump's size: its point on the ground, how high it is off
 * it, its width, and the unit way from start to target it faces.
 */
export type Runner = Wide & { point: Point; up: number; heading: Point };

export function runnerAt(
  { progress, sill, bounce }: RunMoment,
  from: RunEnd,
  to: RunEnd,
): Runner {
  const across = widthAlong(from, to, progress);
  const dx = to.front.x - from.front.x;
  const dy = to.front.y - from.front.y;
  const way = Math.hypot(dx, dy);
  const end = progress < 0.5 ? from : to;
  return {
    point: {
      x: from.front.x + dx * progress,
      y: from.front.y + dy * progress,
    },
    up: sill * end.sillHeight + bounce * HOP_ARC * across,
    across,
    heading: way === 0 ? { x: 1, y: 0 } : { x: dx / way, y: dy / way },
  };
}
