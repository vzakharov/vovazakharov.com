/**
 * The crop: which stretch of the world, in world px, the screen shows. The
 * world is laid out once per screen size and the screen pans across it, so
 * everything here is the crop's left edge as a function of the clock, in
 * seconds, and of the finger and keys that set it moving: a drag follows the
 * finger 1:1 once past `SLOP`, glides on from its release velocity and eases
 * to rest, soft at the world's ends; a held key turns it at a steady cruise,
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
 * A finger on the screen: the crop at `base` since it pressed or crossed the
 * slop at `anchor`, its latest sample, and its velocity across in px per
 * second; `panning` once it has moved past `SLOP`.
 */
type Pressing = {
  kind: 'press';
  base: number;
  anchor: number;
  last: Sample;
  velocity: number;
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
 * edge moving at `pace` px per second, and which of the two keys are held.
 */
type Keying = Lefted & {
  kind: 'keys';
  pace: number;
  leftward: boolean;
  rightward: boolean;
};

type Resting = Lefted & { kind: 'rest' };

/** A crop, over the view it is taken across, and how it moves. */
export type Pan = View & { motion: Resting | Gliding | Pressing | Keying };

/** Which way a key turns the crop: -1 leftward, 1 rightward. */
export type Direction = -1 | 1;

/** How far, in CSS px, a finger moves before its press pans rather than taps. */
export const SLOP = 10;

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

/** The crop at rest at `left`, held inside the world. */
export function restingAt(view: View, left: number): Pan {
  return { ...view, motion: { kind: 'rest', left: clampLeft(view, left) } };
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
export function leftAt({ motion, ...view }: Pan, time: number): number {
  if (motion.kind === 'rest' || motion.kind === 'keys') return motion.left;
  if (motion.kind === 'glide') {
    const { start, goal } = motion;
    return start + (goal - start) * glided(glideShare(motion, time));
  }
  return motion.panning
    ? clampLeft(view, motion.base - (motion.last.x - motion.anchor))
    : motion.base;
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

/** Whether the crop moves on its own at `time`, or a finger pans it. */
export function isMoving(pan: Pan, time: number): boolean {
  const { motion } = pan;
  if (motion.kind === 'glide') return time < motion.began + motion.over;
  if (motion.kind === 'keys') {
    return motion.pace !== 0 || motion.leftward !== motion.rightward;
  }
  return motion.kind === 'press' && motion.panning;
}

/** A finger pressed at `x` at `time`: the crop stops where it stands, a glide's or a key's turn with it. */
export function press(pan: Pan, x: number, time: number): Pan {
  const base = leftAt(pan, time);
  return {
    ...pan,
    motion: {
      kind: 'press',
      base,
      anchor: x,
      last: { x, sampledAt: time },
      velocity: 0,
      panning: false,
    },
  };
}

/**
 * The pressed finger moved to `x` at `time`: the crop follows it 1:1 from
 * where it first crossed `SLOP`, and not at all before.
 */
export function move(pan: Pan, x: number, time: number): Pan {
  const { motion } = pan;
  if (motion.kind !== 'press') return pan;
  const { last, velocity: was, panning, anchor } = motion;
  const span = time - last.sampledAt;
  const velocity =
    span > 0
      ? was + ((x - last.x) / span - was) * Math.min(1, span / VELOCITY_WINDOW)
      : was;
  const crossed = !panning && Math.abs(x - anchor) > SLOP;
  return {
    ...pan,
    motion: {
      ...motion,
      ...(crossed && { anchor: x, panning: true }),
      last: { x, sampledAt: time },
      velocity,
    },
  };
}

/** Whether the pressed finger has moved past `SLOP`, so its press pans rather than taps. */
export function isPanning({ motion }: Pan): boolean {
  return motion.kind === 'press' && motion.panning;
}

/**
 * The finger lifted at `time`: a tap leaves the crop where it stands, and a
 * pan glides on from the finger's velocity, easing to rest at the world's end
 * where it would pass one.
 */
export function release(pan: Pan, time: number): Pan {
  const { motion } = pan;
  if (motion.kind !== 'press') return pan;
  const start = leftAt(pan, time);
  const still = time - motion.last.sampledAt > STILL_AFTER;
  const velocity = still || !motion.panning ? 0 : -motion.velocity;
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
function heldFlag(direction: Direction): 'leftward' | 'rightward' {
  return direction < 0 ? 'leftward' : 'rightward';
}

/**
 * The arrow key for `direction` went down at `time`. A key already turning
 * the crop only adds its flag, so a held key's repeats change nothing; a
 * glide hands its pace on to the keys, no faster than their cruise, so the
 * key takes over without a jolt. A finger on the screen keeps the crop.
 */
export function holdKey(pan: Pan, direction: Direction, time: number): Pan {
  const { motion, width } = pan;
  if (motion.kind === 'press') return pan;
  if (motion.kind === 'keys') {
    return { ...pan, motion: { ...motion, [heldFlag(direction)]: true } };
  }
  const cruise = CRUISE_ACROSS * width;
  const pace = Math.min(cruise, Math.max(-cruise, paceAt(pan, time)));
  return {
    ...pan,
    motion: {
      kind: 'keys',
      left: leftAt(pan, time),
      pace,
      leftward: direction < 0,
      rightward: direction > 0,
    },
  };
}

/** The arrow key for `direction` came up: the crop eases to rest unless the other is still held. */
export function letGoKey(pan: Pan, direction: Direction): Pan {
  const { motion } = pan;
  if (motion.kind !== 'keys') return pan;
  return { ...pan, motion: { ...motion, [heldFlag(direction)]: false } };
}

/**
 * The keys' turn `seconds` on, the most of `LONGEST_TICK`: the pace eases at
 * one steady rate toward the cruise the held keys ask (none for both or
 * neither), and toward a world's end brakes on the curve that brings it to
 * rest exactly there. Each sub-step is integrated exactly, so away from the
 * ends a frame's length changes nothing, and near them the sub-steps keep
 * any two frame rates within a fraction of a px. Once no key is held and the
 * pace is spent, the crop rests. Anything but a key's turn is left as it is.
 */
export function tick(pan: Pan, seconds: number): Pan {
  const { motion, width } = pan;
  if (motion.kind !== 'keys' || seconds <= 0) return pan;
  const cruise = CRUISE_ACROSS * width;
  const rate = cruise / KEY_EASE;
  const low = clampLeft(pan, -Infinity);
  const high = clampLeft(pan, Infinity);
  const heading = Number(motion.rightward) - Number(motion.leftward);
  const span = Math.min(seconds, LONGEST_TICK);
  const count = Math.ceil(span / SUBSTEP);
  const each = span / count;
  let { left, pace } = motion;
  for (let index = 0; index < count; index++) {
    const ahead = heading > 0 ? high - left : left - low;
    const wanted =
      heading * Math.min(cruise, Math.sqrt(2 * rate * Math.max(0, ahead)));
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
  if (heading === 0 && pace === 0) return restingAt(pan, left);
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
  const { motion, width, world, unit } = pan;
  const centre = (leftAt(pan, time) + width / 2 - world / 2) / unit;
  const there = clampLeft(
    view,
    view.world / 2 + centre * view.unit - view.width / 2,
  );
  if (motion.kind === 'press') {
    return {
      ...view,
      motion: { ...motion, base: there, anchor: motion.last.x },
    };
  }
  if (motion.kind === 'keys') {
    const pace = (motion.pace * view.width) / width;
    return { ...view, motion: { ...motion, left: there, pace } };
  }
  return restingAt(view, there);
}
