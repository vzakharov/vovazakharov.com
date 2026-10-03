/**
 * The walk: the eye's heading and its place on the plane, as functions of the
 * clock, in seconds, and of the finger and keys that move them. The heading
 * is a `pan.ts` heading crop, its `left` the heading times the lens's `arc`;
 * the place is `stride.ts`'s. One finger moves one of them: a press inside
 * `SLOP` of where it went down taps, and once it moves past it, radially,
 * its axis locks for the rest of the press — within 45° of horizontal it
 * turns if it went down above the ground, on the hills or the sky, and
 * strafes if it went down on the ground; else it steps. A turn keeps the
 * azimuth under the finger 1:1 and glides on from the lift; a step chases
 * the finger's row, and a strafe slides the ground under the finger with
 * it, both no faster than the stride's cruise, and on the lift fling on from
 * the finger's speed as a turn glides (`glide.ts`), or, the finger lifted at
 * rest, ease to rest; any arrow key going down ends a step's or a strafe's
 * chase or fling and takes over.
 */

import { pick } from '@/shared/lib/collections';

import type { Direction } from './cruise';
import type { Point } from './geometry';
import {
  bendAt,
  type Camera,
  type Eye,
  EYE_HEIGHT,
  OPENING_EYE,
  type Pinhole,
  pinholeOf,
} from './ground';
import {
  holdKey,
  leftAt,
  letGoKey,
  move,
  type Pan,
  press,
  recrop,
  release,
  restingAt,
  SLOP,
  tick as tickPan,
  type Turn,
  turnOf,
  type View,
} from './pan';
import {
  chaseFrom,
  chaseTo,
  holdStep,
  holdStrafe as holdStrafeKey,
  letGoStep,
  letGoStrafe as letGoStrafeKey,
  liftChase,
  standingAt,
  type Stride,
  tick as tickStride,
  yieldChase,
} from './stride';

/**
 * Which axis a press moves once it has crossed the slop: the heading; the
 * place along it, chasing the finger's row from `reference`, the distance
 * ahead the crossing's row stood at; or the place square to it, sliding the
 * ground `reference` straight ahead, the ground under the crossing's, as far
 * across as the finger has come from `from`, the crossing's screen x.
 */
type Lock =
  | { axis: 'turn' }
  | { axis: 'step'; reference: number }
  | { axis: 'strafe'; reference: number; from: number };

/**
 * A finger down on the meadow: where on the screen it was pressed, in CSS px,
 * `since` when on the scene's clock, and the axis it moves once it has
 * crossed the slop; none before.
 */
type Drag = { pressedAt: Point; since: number; lock: Lock | undefined };

/**
 * The walk over the camera it is seen through: the heading's crop, the
 * stride, and the finger pressed, if one is.
 */
export type Walk = {
  lens: Camera;
  pan: Pan;
  stride: Stride;
  drag: Drag | undefined;
};

/** The heading's crop `camera` takes. */
function panView(camera: Camera): View & { turn: Turn } {
  const { width, world, unit } = camera;
  return { width, world, unit, turn: turnOf(pinholeOf(camera).arc) };
}

/** The walk a visit opens on: the opening eye, at rest. */
export function openingWalk(camera: Camera): Walk {
  return {
    lens: camera,
    pan: restingAt(
      panView(camera),
      OPENING_EYE.heading * pinholeOf(camera).arc,
    ),
    stride: standingAt(pick(OPENING_EYE, 'x', 'y')),
    drag: undefined,
  };
}

/**
 * The walk seen through `camera` at `time`, a resize or a phone's turn: the
 * heading keeps its angle and the eye its place; a pressed finger keeps its
 * lock.
 */
export function refit(walk: Walk, camera: Camera, time: number): Walk {
  return {
    ...walk,
    lens: camera,
    pan: recrop(walk.pan, panView(camera), time),
  };
}

/** The heading at `time`, in radians, from 0 up to a full turn. */
export function headingAt({ lens, pan }: Walk, time: number): number {
  return leftAt(pan, time) / pinholeOf(lens).arc;
}

/** The eye at `time`: the stride's place as of its last `tickWalk`, and the heading then. */
export function eyeAt(walk: Walk, time: number): Eye {
  const { x, y } = walk.stride.at;
  return { x, y, heading: headingAt(walk, time) };
}

/**
 * A screen x, in CSS px, as the heading's crop measures it: its azimuth from
 * straight ahead, times `arc`, which is its px off the screen's middle. A
 * turn that moves this by the finger's change keeps the azimuth under the
 * finger exactly.
 */
function arcOf(pinhole: Pinhole, x: number): number {
  return x - pinhole.x;
}

/**
 * How far from the eye, in the clump's size, the ground under screen row
 * `y` stands at the screen's middle, a row above the seam counting as the
 * seam's: the farthest ground the screen shows.
 */
export function distanceOfRow(camera: Camera, y: number): number {
  const pinhole = pinholeOf(camera);
  const row = Math.max(y, camera.groundTop);
  return (pinhole.focal * EYE_HEIGHT) / (row - pinhole.y);
}

/**
 * A finger pressed at `point` at `time`: the heading and the eye both stop
 * where they stand — a glide, a key's turn and a key's walk with them — and
 * the press waits to see which axis it moves.
 */
export function pressAt(walk: Walk, point: Point, time: number): Walk {
  const pinhole = pinholeOf(walk.lens);
  const heading = headingAt(walk, time);
  return {
    ...walk,
    pan: press(walk.pan, arcOf(pinhole, point.x), time),
    stride: chaseFrom(walk.stride, heading, 'step', time),
    drag: { pressedAt: point, since: time, lock: undefined },
  };
}

/** Where on the slop's circle round `from` the way to `to` crosses it. */
function crossingOf(from: Point, to: Point): Point {
  const reach = Math.hypot(to.x - from.x, to.y - from.y);
  return {
    x: from.x + ((to.x - from.x) * SLOP) / reach,
    y: from.y + ((to.y - from.y) * SLOP) / reach,
  };
}

/**
 * The pan pressed and already turning from screen x `x` at `time`, its
 * crossing step behind it, so the finger's next sample turns it 1:1 from
 * there and the crossing counts toward no glide.
 */
function turningFrom(walk: Walk, x: number, time: number): Pan {
  return press(walk.pan, arcOf(pinholeOf(walk.lens), x), time, true);
}

/**
 * The widest azimuth off the heading a strafe brings its ground to, in
 * radians: short of square, where the way across runs out to infinity.
 */
const STRAFE_WIDEST = 1.3;

function clampAzimuth(azimuth: number): number {
  return Math.max(-STRAFE_WIDEST, Math.min(STRAFE_WIDEST, azimuth));
}

function follow(walk: Walk, lock: Lock, point: Point, time: number): Walk {
  const { lens, pan, stride } = walk;
  switch (lock.axis) {
    case 'turn': {
      return { ...walk, pan: move(pan, arcOf(pinholeOf(lens), point.x), time) };
    }
    case 'step': {
      const aim = lock.reference - distanceOfRow(lens, point.y);
      return { ...walk, stride: chaseTo(stride, aim, time) };
    }
    case 'strafe': {
      // The ground `reference` ahead under the crossing's azimuth stands
      // `reference · tan` of it across; the eye goes against the finger so
      // that ground comes to the finger's azimuth.
      const pinhole = pinholeOf(lens);
      const from = arcOf(pinhole, lock.from) / pinhole.arc;
      const to = clampAzimuth(arcOf(pinhole, point.x) / pinhole.arc);
      const aim = lock.reference * (Math.tan(from) - Math.tan(to));
      return { ...walk, stride: chaseTo(stride, aim, time) };
    }
    default: {
      return lock satisfies never;
    }
  }
}

/**
 * The axis a press that went down at `pressedAt` and crossed the slop at
 * `crossing` locks: within 45° of horizontal it turns if it went down above
 * the ground's top edge, and strafes if it went down on the ground; else it
 * steps.
 */
export function lockOf(
  camera: Camera,
  pressedAt: Point,
  crossing: Point,
): Lock['axis'] {
  const dx = Math.abs(crossing.x - pressedAt.x);
  const dy = Math.abs(crossing.y - pressedAt.y);
  if (dy > dx) return 'step';
  return pressedAt.y < camera.groundTop ? 'turn' : 'strafe';
}

function lockAt(camera: Camera, axis: Lock['axis'], crossing: Point): Lock {
  if (axis === 'turn') return { axis };
  const ahead = distanceOfRow(camera, crossing.y);
  if (axis === 'step') return { axis, reference: ahead };
  // The ground under the crossing stands `ahead` times the screen's bend
  // there from the eye, along its azimuth: this far straight ahead.
  const pinhole = pinholeOf(camera);
  const azimuth = arcOf(pinhole, crossing.x) / pinhole.arc;
  const distance = ahead * bendAt(pinhole, crossing.x);
  return {
    axis,
    reference: distance * Math.cos(azimuth),
    from: crossing.x,
  };
}

function locking(walk: Walk, lock: Lock, crossing: Point, time: number): Walk {
  const { drag, stride } = walk;
  const locked = { ...walk, drag: drag && { ...drag, lock } };
  if (lock.axis === 'turn') {
    return { ...locked, pan: turningFrom(walk, crossing.x, time) };
  }
  // The chase starts afresh at the crossing, so its step past the slop
  // counts toward no fling, as a turn's counts toward no glide.
  return {
    ...locked,
    stride: chaseFrom(stride, headingAt(walk, time), lock.axis, time),
  };
}

/**
 * The pressed finger moved to `point` at `time`. Inside the slop it moves
 * nothing; the sample that first takes it past locks the axis by the way it
 * went and where it went down (`lockOf`), and from the crossing on it moves
 * that axis alone: a turn keeps the azimuth under the crossing under the
 * finger, a step aims the eye so the crossing's ground row comes under the
 * finger's, and a strafe aims it so the crossing's ground follows the finger
 * across.
 */
export function moveTo(walk: Walk, point: Point, time: number): Walk {
  const { drag, lens } = walk;
  if (!drag) return walk;
  if (drag.lock) return follow(walk, drag.lock, point, time);
  const { pressedAt } = drag;
  if (Math.hypot(point.x - pressedAt.x, point.y - pressedAt.y) <= SLOP) {
    return walk;
  }
  const crossing = crossingOf(pressedAt, point);
  const lock = lockAt(lens, lockOf(lens, pressedAt, crossing), crossing);
  return follow(locking(walk, lock, crossing, time), lock, point, time);
}

/**
 * The finger lifted at `time`: a turn glides on from the finger's velocity, a
 * step or a strafe flings on from it, or eases to rest where the finger left
 * it at rest; the keys held take over after either.
 */
export function liftAt(walk: Walk, time: number): Walk {
  if (!walk.drag) return walk;
  return {
    ...walk,
    pan: release(walk.pan, time),
    stride: liftChase(walk.stride, time),
    drag: undefined,
  };
}

/**
 * How long, in seconds, the finger has been held at `time` without leaving
 * the slop: a long press while it lasts. None once it has crossed, or with
 * no finger down.
 */
export function heldStill({ drag }: Walk, time: number): number | undefined {
  return drag && !drag.lock ? time - drag.since : undefined;
}

/**
 * `←` or `→` went down: the heading turns leftward or rightward while it is
 * held, and the stride's chase or fling, if any, ends where it stands.
 */
export function holdTurn(walk: Walk, direction: Direction, time: number): Walk {
  const pan = holdKey(walk.pan, direction, time);
  if (pan === walk.pan) return walk;
  return { ...walk, pan, stride: yieldChase(walk.stride) };
}

export function letGoTurn(walk: Walk, direction: Direction): Walk {
  return { ...walk, pan: letGoKey(walk.pan, direction) };
}

/** `↑` or `↓` went down: the eye walks on or back while it is held. */
export function holdWalk(walk: Walk, direction: Direction): Walk {
  return { ...walk, stride: holdStep(walk.stride, direction) };
}

export function letGoWalk(walk: Walk, direction: Direction): Walk {
  return { ...walk, stride: letGoStep(walk.stride, direction) };
}

/** Shift with `←` or `→` went down: the eye walks to its left or right while it is held. */
export function holdStrafe(walk: Walk, direction: Direction): Walk {
  return { ...walk, stride: holdStrafeKey(walk.stride, direction) };
}

export function letGoStrafe(walk: Walk, direction: Direction): Walk {
  return { ...walk, stride: letGoStrafeKey(walk.stride, direction) };
}

/**
 * The walk `seconds` on, to `time`: the keys' turn, then the stride along the
 * heading it left. A walk that stands still is returned as the same object.
 */
export function tickWalk(walk: Walk, seconds: number, time: number): Walk {
  const pan = tickPan(walk.pan, seconds);
  const turned = pan === walk.pan ? walk : { ...walk, pan };
  const stride = tickStride(walk.stride, headingAt(turned, time), seconds);
  return stride === walk.stride ? turned : { ...turned, stride };
}
