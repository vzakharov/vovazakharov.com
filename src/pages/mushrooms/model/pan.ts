/**
 * The crop: which stretch of the world, in world px, the screen shows. The
 * world is laid out once per screen size and the screen pans across it, so
 * everything here is the crop's left edge as a pure function of the clock, in
 * seconds, and of the finger and keys that set it moving: a drag follows the
 * finger 1:1 once past `SLOP`, glides on from its release velocity and eases
 * to rest, soft at the world's ends; a key steps it, eased; a resize re-crops
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

/** How an easing crop comes to rest: decaying as a glide, or eased as a key's step. */
type Curve = 'glide' | 'step';

/** A crop moving on its own from `start` to `goal`, beginning at `began` and taking `over` seconds. */
type Easing = {
  kind: 'ease';
  start: number;
  goal: number;
  began: number;
  over: number;
  curve: Curve;
};

type Resting = Lefted & { kind: 'rest' };

/** A crop, over the view it is taken across, and how it moves. */
export type Pan = View & { motion: Resting | Easing | Pressing };

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

/** How far a key's step moves the crop, as a share of the screen's width, and how long it eases. */
export const STEP_ACROSS = 0.4;
export const STEP_DURATION = 0.25;

/**
 * `left` held inside the world: from 0 to the world's width less the
 * screen's, centred where the world is narrower than the screen.
 */
export function clampLeft({ world, width }: View, left: number): number {
  const most = world - width;
  return most <= 0 ? most / 2 : Math.min(most, Math.max(0, left));
}

/** The crop at rest at `left`, held inside the world. */
function restingAt(view: View, left: number): Pan {
  return { ...view, motion: { kind: 'rest', left: clampLeft(view, left) } };
}

/** The crop a visit opens on: the world's middle at the screen's. */
export function openingPan(view: View): Pan {
  return restingAt(view, (view.world - view.width) / 2);
}

/** How far along its way an easing crop is `u` of its time in, from 0 to 1. */
function eased(curve: Curve, u: number): number {
  if (curve === 'step') return 1 - (1 - u) ** 3;
  return (1 - Math.exp(-GLIDE_SPANS * u)) / (1 - Math.exp(-GLIDE_SPANS));
}

/** The crop's left edge at `time`, in world px. */
export function leftAt({ motion, ...view }: Pan, time: number): number {
  if (motion.kind === 'rest') return motion.left;
  if (motion.kind === 'ease') {
    const u = Math.min(1, Math.max(0, (time - motion.began) / motion.over));
    return motion.start + (motion.goal - motion.start) * eased(motion.curve, u);
  }
  return motion.panning
    ? clampLeft(view, motion.base - (motion.last.x - motion.anchor))
    : motion.base;
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
  if (motion.kind === 'ease') return time < motion.began + motion.over;
  return motion.kind === 'press' && motion.panning;
}

/** A finger pressed at `x` at `time`: the crop stops where it stands. */
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
      kind: 'ease',
      start,
      goal,
      began: time,
      over: GLIDE_TAU * GLIDE_SPANS,
      curve: 'glide',
    },
  };
}

/**
 * A key's step at `time`, `direction` -1 leftward and 1 rightward: the crop
 * eases `STEP_ACROSS` of the screen on from wherever a step still easing was
 * heading, so quick presses add up, held inside the world.
 */
export function step(pan: Pan, direction: -1 | 1, time: number): Pan {
  const { motion, width } = pan;
  const start = leftAt(pan, time);
  const stepping =
    motion.kind === 'ease' &&
    motion.curve === 'step' &&
    time < motion.began + motion.over;
  const base = stepping ? motion.goal : start;
  const goal = clampLeft(pan, base + direction * STEP_ACROSS * width);
  return {
    ...pan,
    motion: {
      kind: 'ease',
      start,
      goal,
      began: time,
      over: STEP_DURATION,
      curve: 'step',
    },
  };
}

/**
 * The crop taken across `view` at `time`, a resize or a turn: the ground
 * point at the screen's centre stays there, in the clump's size so it holds
 * across a new zoom, held inside the new world. A glide or a step stops; a
 * pressed finger pans on from the new crop.
 */
export function recrop(pan: Pan, view: View, time: number): Pan {
  const { motion, width, world, unit } = pan;
  const centre = (leftAt(pan, time) + width / 2 - world / 2) / unit;
  const there = clampLeft(
    view,
    view.world / 2 + centre * view.unit - view.width / 2,
  );
  if (motion.kind !== 'press') return restingAt(view, there);
  return {
    ...view,
    motion: { ...motion, base: there, anchor: motion.last.x },
  };
}
