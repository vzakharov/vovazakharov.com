/**
 * The crop: which stretch of the world, in world px, the screen shows. The
 * world is laid out once per screen size and the screen pans across it, so
 * everything here is the crop's left edge as a function of the clock, in
 * seconds, and of the finger and keys that set it moving: a drag follows the
 * finger 1:1 once past `SLOP`, lagging it by the slop, stops dead at the
 * world's ends, and glides on from its release velocity, easing to rest
 * before an end; a held key turns it at a steady cruise,
 * eased in and out, stepped frame by frame through `tick`; a resize re-crops
 * it round the ground point at the screen's centre. Screen x and world x
 * convert through `worldOf` and `screenOf` alone. A crop with a `turn` is a
 * heading instead: `left` is the heading times the lens's `arc`, it has no
 * ends and wraps once round, and its keys cruise at `TURN_CRUISE`.
 */

import {
  type Course,
  cruise,
  type Cruised,
  type Direction,
  type Paced,
} from './cruise';
import type { Lefted, Point } from './geometry';
import { type Camera, SPREAD } from './ground';

/**
 * What a crop is taken across: the world's width and the screen's, in CSS
 * px, and the clump's size in px, which ties a world px to the ground.
 */
export type View = Pick<Camera, 'width' | 'world' | 'unit'>;

/**
 * A heading's crop: its keys' cruise in px per second, and how many px a full
 * turn spans, both multiples of the lens's `arc`.
 */
export type Turn = Cruised & { around: number };

/** A crop's `turn`, when it is a heading's rather than a stretch of the world. */
type Turned = { turn?: Turn };

/**
 * A finger at `x` across the screen, in CSS px, at `sampledAt` on the scene's
 * clock, in seconds.
 */
type Sample = Pick<Point, 'x'> & { sampledAt: number };

/**
 * A finger on the screen, pressed at `downAt` across it: the crop at `left`
 * as of its latest sample; `panning` once it has moved past `SLOP`, and its
 * velocity across in px per second, measured only from the samples after
 * that, so none until the first of them.
 */
type Pressing = Lefted & {
  kind: 'press';
  downAt: number;
  last: Sample;
  velocity: number | undefined;
  panning: boolean;
};

/** How long something takes, in seconds. */
export type Lasting = { over: number };

/** A glide from `start` to `goal`, beginning at `began` and taking `over` seconds. */
type Gliding = Lasting & {
  kind: 'glide';
  start: number;
  goal: number;
  began: number;
};

/**
 * The arrow keys turning the crop: at `left` as of the last `tick`, its left
 * edge moving at `pace` px per second.
 */
type Keying = Lefted & Paced & { kind: 'keys' };

type Resting = Lefted & { kind: 'rest' };

/** Which of the two arrow keys are held. */
type Held = { leftward: boolean; rightward: boolean };

const NONE_HELD: Held = { leftward: false, rightward: false };

/**
 * A crop, over the view it is taken across, how it moves, and the arrow keys
 * held, whatever moves it: while a key is held and no finger is down, the
 * keys turn it, at a stand with both held.
 */
export type Pan = View &
  Turned & {
    held: Held;
    motion: Resting | Gliding | Pressing | Keying;
  };

/** Which way a key turns the crop: -1 leftward, 1 rightward. */
export type { Direction } from './cruise';

/**
 * How far, in CSS px, a finger moves before its press pans rather than taps:
 * as far as a child's tap drifts, which runs to 11–24 px.
 */
export const SLOP = 24;

/**
 * A glide's time constant, in seconds: it carries the crop on by its release
 * velocity times this, decaying, and rests after `GLIDE_SPANS` of them.
 */
const GLIDE_TAU = 0.325;
const GLIDE_SPANS = 6;
/** The fastest a glide sets off, and the slowest a release that still glides, in px per second. */
const GLIDE_FASTEST = 5000;
const GLIDE_SLOWEST = 40;
/**
 * How long a finger's velocity is averaged over, in seconds, and how long it
 * may rest before its release, which then glides no farther.
 */
const VELOCITY_WINDOW = 0.05;
const STILL_AFTER = 0.1;

/**
 * A held key's cruise, in screen widths a second, and how long, in seconds,
 * the crop takes to reach it from rest and to come back to rest: a steady
 * acceleration either way, so the crop's position eases in and out.
 */
export const CRUISE_ACROSS = 0.5;
export const KEY_EASE = 0.25;
/**
 * A held key's turn of the heading, in radians a second, the same on every
 * screen: the meadow slides by as fast in px as it did at 0.38 a second
 * through the opening crop's pinhole, a tablet's half a screen width a
 * second, its angles `SPREAD` times as wide.
 */
export const TURN_CRUISE = 0.38 * SPREAD;

/** The turn of a heading seen at `arc` px across the screen to the radian. */
export function turnOf(arc: number): Turn {
  return { cruise: TURN_CRUISE * arc, around: 2 * Math.PI * arc };
}

/**
 * `left` held inside the world: from 0 to the world's width less the
 * screen's, centred where the world is narrower than the screen.
 */
export function clampLeft({ world, width }: View, left: number): number {
  const most = world - width;
  return most <= 0 ? most / 2 : Math.min(most, Math.max(0, left));
}

/** `left` held inside the world, or once round a heading's turn. */
function inside(view: View & Turned, left: number): number {
  const { turn } = view;
  if (!turn) return clampLeft(view, left);
  return left - turn.around * Math.floor(left / turn.around);
}

/** The crop at rest at `left`, held inside the world, no key held. */
export function restingAt(view: View & Turned, left: number): Pan {
  return {
    ...view,
    held: NONE_HELD,
    motion: { kind: 'rest', left: inside(view, left) },
  };
}

/** The crop a visit opens on: the world's middle at the screen's. */
export function openingPan(view: View): Pan {
  return restingAt(view, (view.world - view.width) / 2);
}

/** How far along its way a glide is `u` of its time in, from 0 to 1. */
function glided(u: number): number {
  return (1 - Math.exp(-GLIDE_SPANS * u)) / (1 - Math.exp(-GLIDE_SPANS));
}

/** How far along a glide `time` is, from 0 to 1. */
function glideShare({ began, over }: Gliding, time: number): number {
  return Math.min(1, Math.max(0, (time - began) / over));
}

/** The crop's left edge at `time`, in world px; a key's turn as of its last `tick`. */
export function leftAt(pan: Pan, time: number): number {
  const { motion } = pan;
  if (motion.kind !== 'glide') return motion.left;
  const { start, goal } = motion;
  return inside(pan, start + (goal - start) * glided(glideShare(motion, time)));
}

/** How fast the crop's left edge moves on its own at `time`, in px per second. */
function paceAt({ motion }: Pan, time: number): number {
  if (motion.kind === 'keys') return motion.pace;
  if (motion.kind !== 'glide') return 0;
  const u = glideShare(motion, time);
  if (u >= 1) return 0;
  const slope =
    (GLIDE_SPANS * Math.exp(-GLIDE_SPANS * u)) / (1 - Math.exp(-GLIDE_SPANS));
  return ((motion.goal - motion.start) * slope) / motion.over;
}

/** Where the world has `x`, across the screen in CSS px, under the crop at `time`. */
export function worldOf(pan: Pan, time: number, x: number): number {
  return leftAt(pan, time) + x;
}

/** Where across the screen, in CSS px, the crop at `time` shows the world's `x`. */
export function screenOf(pan: Pan, time: number, x: number): number {
  return x - leftAt(pan, time);
}

/**
 * A finger pressed at `x` at `time`: the crop stops where it stands, a
 * glide's or a key's turn with it; a held key turns it again after the lift.
 */
export function press(pan: Pan, x: number, time: number): Pan {
  return {
    ...pan,
    motion: {
      kind: 'press',
      left: leftAt(pan, time),
      downAt: x,
      last: { x, sampledAt: time },
      velocity: undefined,
      panning: false,
    },
  };
}

/**
 * A panning finger's velocity, as it `was`, with a step of `across` px over
 * `span` seconds: the first step past the slop sets it, and each later one
 * blends in by its share of `VELOCITY_WINDOW`.
 */
function blended(
  was: number | undefined,
  across: number,
  span: number,
): number | undefined {
  if (span <= 0) return was;
  const now = across / span;
  if (was === undefined) return now;
  return was + (now - was) * Math.min(1, span / VELOCITY_WINDOW);
}

/**
 * The pressed finger moved to `x` at `time`: once past `SLOP` from where it
 * pressed, the crop follows it 1:1 from the slop's line, so the ground under
 * the press lags the finger by the slop and no more. At a world's end the
 * crop stops and drops the overshoot, so the finger turning back moves it at
 * once. The crossing step counts toward no velocity, so a lift then never
 * glides.
 */
export function move(pan: Pan, x: number, time: number): Pan {
  const { motion } = pan;
  if (motion.kind !== 'press') return pan;
  const { last, velocity: was, panning, downAt, left } = motion;
  const velocity = panning
    ? blended(was, x - last.x, time - last.sampledAt)
    : undefined;
  const crossed = !panning && Math.abs(x - downAt) > SLOP;
  const from = crossed ? downAt + Math.sign(x - downAt) * SLOP : last.x;
  return {
    ...pan,
    motion: {
      ...motion,
      ...((panning || crossed) && {
        left: inside(pan, left - (x - from)),
        panning: true,
      }),
      last: { x, sampledAt: time },
      velocity,
    },
  };
}

/**
 * The finger lifted at `time`: a tap leaves the crop where it stands, and a
 * pan glides on from the finger's velocity past the slop, easing to rest at
 * the world's end where it would pass one. With a key held, the keys take
 * the crop over instead, from the finger's pace no faster than their cruise.
 */
export function release(pan: Pan, time: number): Pan {
  const { motion, turn } = pan;
  if (motion.kind !== 'press') return pan;
  const start = leftAt(pan, time);
  const still = time - motion.last.sampledAt > STILL_AFTER;
  const velocity = still ? 0 : -(motion.velocity ?? 0);
  if (isHeld(pan)) return keyedFrom(pan, start, velocity);
  if (Math.abs(velocity) < GLIDE_SLOWEST) return restingAt(pan, start);
  const fastest =
    Math.sign(velocity) * Math.min(GLIDE_FASTEST, Math.abs(velocity));
  const coast = start + fastest * GLIDE_TAU;
  // A heading's glide is left unwrapped, so it turns the short way round.
  const goal = turn ? coast : clampLeft(pan, coast);
  return {
    ...pan,
    motion: {
      kind: 'glide',
      start,
      goal,
      began: time,
      over: GLIDE_TAU * GLIDE_SPANS,
    },
  };
}

/** The held-key flag `direction` names. */
function heldFlag(direction: Direction): keyof Held {
  return direction < 0 ? 'leftward' : 'rightward';
}

/** Which way the held keys ask the crop to turn: -1, 1, or 0 for both or neither. */
function heading({ held }: Pan): number {
  return Number(held.rightward) - Number(held.leftward);
}

/** Whether either arrow key is held. */
function isHeld({ held }: Pan): boolean {
  return held.leftward || held.rightward;
}

/** The keys turning `pan` from `left`, setting off at `pace` held to their cruise. */
function keyedFrom(pan: Pan, left: number, pace: number): Pan {
  const fastest = cruiseOf(pan);
  return {
    ...pan,
    motion: {
      kind: 'keys',
      left,
      pace: Math.min(fastest, Math.max(-fastest, pace)),
    },
  };
}

/** A held key's cruise, in px per second. */
function cruiseOf({ turn, width }: Pan): number {
  return turn ? turn.cruise : CRUISE_ACROSS * width;
}

/**
 * The arrow key for `direction` went down at `time`. A key already held
 * changes nothing, so its repeats do not restart the turn; a glide hands its
 * pace on to the keys, no faster than their cruise, so the key takes over
 * without a jolt. A finger on the screen keeps the crop until it lifts.
 */
export function holdKey(pan: Pan, direction: Direction, time: number): Pan {
  const flag = heldFlag(direction);
  if (pan.held[flag]) return pan;
  const held = { ...pan.held, [flag]: true };
  const { motion } = pan;
  if (motion.kind === 'press' || motion.kind === 'keys') {
    return { ...pan, held };
  }
  return keyedFrom({ ...pan, held }, leftAt(pan, time), paceAt(pan, time));
}

/**
 * The arrow key for `direction` came up: the crop eases to rest unless the
 * other is still held, which then turns it its own way.
 */
export function letGoKey(pan: Pan, direction: Direction): Pan {
  const flag = heldFlag(direction);
  if (!pan.held[flag]) return pan;
  return { ...pan, held: { ...pan.held, [flag]: false } };
}

/**
 * The keys' turn `seconds` on, by `cruise`: the pace eases toward the cruise
 * the held keys ask (none for both or neither), and toward a world's end
 * brakes to rest exactly there; a heading has none. Once no key is held and
 * the pace is spent, the crop rests. Anything but a key's turn, and a turn
 * that stands still, is returned as the same object.
 */
export function tick(pan: Pan, seconds: number): Pan {
  const { motion, turn } = pan;
  if (motion.kind !== 'keys' || seconds <= 0) return pan;
  const low = turn ? -Infinity : clampLeft(pan, -Infinity);
  const high = turn ? Infinity : clampLeft(pan, Infinity);
  const toward = heading(pan);
  const course: Course<number> = {
    cruise: cruiseOf(pan),
    ease: KEY_EASE,
    toward: () => toward,
    room: (left, way) => (way > 0 ? high - left : left - low),
    step: (left, by) => {
      const next = left + by;
      const held = Math.min(high, Math.max(low, next));
      return { at: held, stopped: held !== next };
    },
  };
  const { left: setOff, pace: setOffPace } = motion;
  const { at, pace } = cruise(
    course,
    { at: setOff, pace: setOffPace },
    seconds,
  );
  const left = inside(pan, at);
  if (!isHeld(pan) && pace === 0) return restingAt(pan, left);
  if (left === setOff && pace === setOffPace) return pan;
  return { ...pan, motion: { ...motion, left, pace } };
}

/**
 * The crop taken across `view` at `time`, a resize or a turn: the ground
 * point at the screen's centre stays there, in the clump's size so it holds
 * across a new zoom, held inside the new world. A heading taken across a new
 * `turn` keeps its angle, which is all a phone's turn is. A glide stops; the
 * held keys turn on from the new crop at a pace in the new screen's widths, or
 * at the same angle a second; a pressed finger pans on from the new crop.
 */
export function recrop(pan: Pan, view: View & Turned, time: number): Pan {
  const { motion, width, world, unit, held, turn } = pan;
  const left = leftAt(pan, time);
  const centre = (left + width / 2 - world / 2) / unit;
  const ratio =
    turn && view.turn ? view.turn.around / turn.around : view.width / width;
  const there =
    turn && view.turn
      ? inside(view, left * ratio)
      : clampLeft(view, view.world / 2 + centre * view.unit - view.width / 2);
  if (motion.kind === 'press') {
    return {
      ...view,
      held,
      motion: { ...motion, left: there },
    };
  }
  if (motion.kind === 'keys') {
    const pace = motion.pace * ratio;
    return { ...view, held, motion: { ...motion, left: there, pace } };
  }
  return restingAt(view, there);
}
