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
 * convert through `worldOf` and `screenOf` alone.
 */

import type { Lefted, Point } from './geometry';
import type { Camera } from './ground';

/**
 * What a crop is taken across: the world's width and the screen's, in CSS
 * px, and the clump's size in px, which ties a world px to the ground.
 */
export type View = Pick<Camera, 'width' | 'world' | 'unit'>;

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

/** A glide from `start` to `goal`, beginning at `began` and taking `over` seconds. */
type Gliding = {
  kind: 'glide';
  start: number;
  goal: number;
  began: number;
  over: number;
};

/**
 * The arrow keys turning the crop: at `left` as of the last `tick`, its left
 * edge moving at `pace` px per second.
 */
type Keying = Lefted & { kind: 'keys'; pace: number };

type Resting = Lefted & { kind: 'rest' };

/** Which of the two arrow keys are held. */
type Held = { leftward: boolean; rightward: boolean };

const NONE_HELD: Held = { leftward: false, rightward: false };

/**
 * A crop, over the view it is taken across, how it moves, and the arrow keys
 * held, whatever moves it: while a key is held and no finger is down, the
 * keys turn it, at a stand with both held.
 */
export type Pan = View & {
  held: Held;
  motion: Resting | Gliding | Pressing | Keying;
};

/** Which way a key turns the crop: -1 leftward, 1 rightward. */
export type Direction = -1 | 1;

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
 * The longest stretch of time one `tick` integrates, in seconds, so a frame
 * after the tab was away does not leap; and the longest sub-step it takes,
 * so the braking at the world's ends comes out the same at any frame rate.
 */
const LONGEST_TICK = 0.1;
const SUBSTEP = 1 / 240;

/**
 * `left` held inside the world: from 0 to the world's width less the
 * screen's, centred where the world is narrower than the screen.
 */
export function clampLeft({ world, width }: View, left: number): number {
  const most = world - width;
  return most <= 0 ? most / 2 : Math.min(most, Math.max(0, left));
}

/** The crop at rest at `left`, held inside the world, no key held. */
export function restingAt(view: View, left: number): Pan {
  return {
    ...view,
    held: NONE_HELD,
    motion: { kind: 'rest', left: clampLeft(view, left) },
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
export function leftAt({ motion }: Pan, time: number): number {
  if (motion.kind !== 'glide') return motion.left;
  const { start, goal } = motion;
  return start + (goal - start) * glided(glideShare(motion, time));
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
 * The pressed finger moved to `x` at `time`: once it is past `SLOP` from
 * where it pressed, the crop follows it 1:1 from the slop's line, so the
 * ground under the press lags the finger by the slop and no more, and not at
 * all before. At a world's end the crop stops and the finger's overshoot is
 * dropped, so the finger turning back moves the crop at once. The step that
 * crosses the slop counts toward no velocity, so a release then never glides.
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
        left: clampLeft(pan, left - (x - from)),
        panning: true,
      }),
      last: { x, sampledAt: time },
      velocity,
    },
  };
}

/**
 * The finger lifted at `time`: a tap leaves the crop where it stands, and a
 * pan glides on from the finger's velocity past the slop, easing to rest at the world's end
 * where it would pass one. With a key held, the keys take the crop over
 * instead, from the finger's pace no faster than their cruise.
 */
export function release(pan: Pan, time: number): Pan {
  const { motion } = pan;
  if (motion.kind !== 'press') return pan;
  const start = leftAt(pan, time);
  const still = time - motion.last.sampledAt > STILL_AFTER;
  const velocity = still ? 0 : -(motion.velocity ?? 0);
  if (isHeld(pan)) return keyedFrom(pan, start, velocity);
  if (Math.abs(velocity) < GLIDE_SLOWEST) return restingAt(pan, start);
  const fastest =
    Math.sign(velocity) * Math.min(GLIDE_FASTEST, Math.abs(velocity));
  const goal = clampLeft(pan, start + fastest * GLIDE_TAU);
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
  const cruise = CRUISE_ACROSS * pan.width;
  return {
    ...pan,
    motion: {
      kind: 'keys',
      left,
      pace: Math.min(cruise, Math.max(-cruise, pace)),
    },
  };
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
 * The keys' turn `seconds` on, the most of `LONGEST_TICK`: the pace eases at
 * one steady rate toward the cruise the held keys ask (none for both or
 * neither), and toward a world's end brakes on the curve that brings it to
 * rest exactly there. Each sub-step is integrated exactly, so away from the
 * ends a frame's length changes nothing, and near them the sub-steps keep
 * any two frame rates within a fraction of a px. Once no key is held and the
 * pace is spent, the crop rests. Anything but a key's turn, and a turn that
 * stands still, is returned as the same object.
 */
export function tick(pan: Pan, seconds: number): Pan {
  const { motion, width } = pan;
  if (motion.kind !== 'keys' || seconds <= 0) return pan;
  const cruise = CRUISE_ACROSS * width;
  const rate = cruise / KEY_EASE;
  const low = clampLeft(pan, -Infinity);
  const high = clampLeft(pan, Infinity);
  const toward = heading(pan);
  const span = Math.min(seconds, LONGEST_TICK);
  const count = Math.ceil(span / SUBSTEP);
  const each = span / count;
  const { left: setOff, pace: setOffPace } = motion;
  let left = setOff;
  let pace = setOffPace;
  for (let index = 0; index < count; index++) {
    const ahead = toward > 0 ? high - left : left - low;
    const wanted =
      toward * Math.min(cruise, Math.sqrt(2 * rate * Math.max(0, ahead)));
    // Toward an end faster than the steady rate can stop in the room left,
    // as a glide handed on can be, the crop brakes as hard as it must.
    const room = pace > 0 ? high - left : left - low;
    const slowing =
      Math.sign(wanted) !== Math.sign(pace) ||
      Math.abs(wanted) < Math.abs(pace);
    const braking = pace !== 0 && slowing && room > 0;
    const easing = braking ? Math.max(rate, pace ** 2 / (2 * room)) : rate;
    const gap = wanted - pace;
    const reached = Math.abs(gap) / easing;
    if (reached >= each) {
      const next = pace + Math.sign(gap) * easing * each;
      left += ((pace + next) / 2) * each;
      pace = next;
    } else {
      left += ((pace + wanted) / 2) * reached + wanted * (each - reached);
      pace = wanted;
    }
    const inside = Math.min(high, Math.max(low, left));
    if (inside !== left) {
      left = inside;
      pace = 0;
    }
  }
  if (!isHeld(pan) && pace === 0) return restingAt(pan, left);
  if (left === setOff && pace === setOffPace) return pan;
  return { ...pan, motion: { ...motion, left, pace } };
}

/**
 * The crop taken across `view` at `time`, a resize or a turn: the ground
 * point at the screen's centre stays there, in the clump's size so it holds
 * across a new zoom, held inside the new world. A glide stops; the held keys
 * turn on from the new crop at a pace in the new screen's widths; a pressed
 * finger pans on from the new crop.
 */
export function recrop(pan: Pan, view: View, time: number): Pan {
  const { motion, width, world, unit, held } = pan;
  const centre = (leftAt(pan, time) + width / 2 - world / 2) / unit;
  const there = clampLeft(
    view,
    view.world / 2 + centre * view.unit - view.width / 2,
  );
  if (motion.kind === 'press') {
    return {
      ...view,
      held,
      motion: { ...motion, left: there },
    };
  }
  if (motion.kind === 'keys') {
    const pace = (motion.pace * view.width) / width;
    return { ...view, held, motion: { ...motion, left: there, pace } };
  }
  return restingAt(view, there);
}
