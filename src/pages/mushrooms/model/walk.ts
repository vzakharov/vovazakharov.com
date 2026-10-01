/**
 * The walk: the eye's heading and its place on the plane, as functions of the
 * clock, in seconds, and of the finger and keys that move them. The heading
 * is a `pan.ts` heading crop, its `left` the heading times the lens's `arc`;
 * the place is `stride.ts`'s. One finger moves one of them: a press inside
 * `SLOP` of where it went down taps, and once it moves past it, radially,
 * its axis locks for the rest of the press — within 45° of horizontal it
 * turns, else it steps. A turn keeps the azimuth under the finger 1:1 and
 * glides on from the lift; a step chases the finger's row, no faster than
 * the stride's cruise, and has no glide.
 */

import { pick } from '@/shared/lib/collections';

import type { Direction } from './cruise';
import type { Point } from './geometry';
import {
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
  letGoStep,
  liftChase,
  standingAt,
  type Stride,
  tick as tickStride,
} from './stride';

/**
 * Which axis a press moves once it has crossed the slop: the heading, or the
 * place along it, chasing the finger's row from `reference`, the distance
 * ahead the crossing's row stood at.
 */
type Lock = { axis: 'turn' } | { axis: 'step'; reference: number };

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
    stride: chaseFrom(walk.stride, heading),
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
  const arc = arcOf(pinholeOf(walk.lens), x);
  return {
    ...walk.pan,
    motion: {
      kind: 'press',
      left: leftAt(walk.pan, time),
      downAt: arc,
      last: { x: arc, sampledAt: time },
      velocity: undefined,
      panning: true,
    },
  };
}

/** The finger, locked to `lock`, moved to `point` at `time`. */
function follow(walk: Walk, lock: Lock, point: Point, time: number): Walk {
  if (lock.axis === 'turn') {
    const arc = arcOf(pinholeOf(walk.lens), point.x);
    return { ...walk, pan: move(walk.pan, arc, time) };
  }
  const aim = lock.reference - distanceOfRow(walk.lens, point.y);
  return { ...walk, stride: chaseTo(walk.stride, aim) };
}

/**
 * The pressed finger moved to `point` at `time`. Inside the slop it moves
 * nothing; the sample that first takes it past locks the axis by the way it
 * went, and from the crossing on it moves that axis alone: a turn keeps the
 * azimuth under the crossing under the finger, and a step aims the eye so the
 * crossing's ground row comes under the finger's.
 */
export function moveTo(walk: Walk, point: Point, time: number): Walk {
  const { drag, lens } = walk;
  if (!drag) return walk;
  if (drag.lock) return follow(walk, drag.lock, point, time);
  const dx = point.x - drag.pressedAt.x;
  const dy = point.y - drag.pressedAt.y;
  if (Math.hypot(dx, dy) <= SLOP) return walk;
  const crossing = crossingOf(drag.pressedAt, point);
  const lock: Lock =
    Math.abs(dy) <= Math.abs(dx)
      ? { axis: 'turn' }
      : { axis: 'step', reference: distanceOfRow(lens, crossing.y) };
  const locked: Walk = {
    ...walk,
    drag: { ...drag, lock },
    ...(lock.axis === 'turn' && {
      pan: turningFrom(walk, crossing.x, time),
    }),
  };
  return follow(locked, lock, point, time);
}

/**
 * The finger lifted at `time`: a turn glides on from the finger's velocity, a
 * step finishes its chase and rests; the keys held take over after either.
 */
export function liftAt(walk: Walk, time: number): Walk {
  if (!walk.drag) return walk;
  return {
    ...walk,
    pan: release(walk.pan, time),
    stride: liftChase(walk.stride),
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

/** `←` or `→` went down: the heading turns leftward or rightward while it is held. */
export function holdTurn(walk: Walk, direction: Direction, time: number): Walk {
  return { ...walk, pan: holdKey(walk.pan, direction, time) };
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
