/**
 * Where a flier is and which way its body points, frame by frame: the one
 * step `InsectView` takes each frame, pure so a test flies it the same way.
 */

import type { Span } from './flight';
import type { Point } from './geometry';
import type { InsectKind } from './insect-genes';
import {
  bodyTurn,
  flyingTurn,
  pivot,
  restTurn,
  turned,
  type Turns,
  wrap,
} from './insect-motion';
import {
  type Carried,
  flightPoint,
  type Fluttering,
  heading,
  type Path,
  phaseBow,
} from './insect-paths';

/**
 * How fast each kind's body turns at the most, in radians a second: a
 * butterfly 0.18 rad in a 60 Hz frame, a bee twice that, a fly snapping
 * round at 0.6 — each above the fastest its pivot at take-off turns it.
 */
const TURN_RATE = {
  butterfly: 10.8,
  fly: 36,
  bee: 21.6,
} as const satisfies Record<InsectKind, number>;
/** A flight shorter than this, in units of the insect's size, goes nowhere and has no heading of its own. */
const GOING_NOWHERE = 0.3;

/**
 * How near a half turn a settling turn is as short one way round as the
 * other, in radians: that near, it turns the way that unwinds its leg.
 */
const EVEN = 0.35;

/**
 * What a leg fixes as it sets off, how far its flight bows and to which
 * side, and its turns; and how far its body has turned round since, each way signed.
 */
type SetOff = { bow: number; turns: Turns; wound: number };

/**
 * How a flier's body is held from one frame to the next: which way its
 * flight heads, in radians from +x; how its body was turned, and when, in ms
 * on the scene's clock, `-Infinity` before its first frame; and what its
 * leg fixed as it set off, `undefined` until the leg's first frame.
 */
export type Steering = {
  facing: number;
  turn: number;
  at: number;
  setOff: SetOff | undefined;
};

/**
 * One frame's leg as the flier flies it: its timing, what it carried over,
 * where it set off and where its perch stands this frame, where it aims
 * (where its perch stood as it took aim), how its body sat as the leg set
 * off (`undefined` flying in), whether it lands on a seat, and its size in
 * the points' units.
 */
export type Course = {
  leg: Span;
  carried: Carried;
  start: Point;
  end: Point;
  aim: Point;
  sat: number | undefined;
  perched: boolean;
  size: number;
  motion: Fluttering;
};

/** `held` as a new leg finds it: turned as it was, with nothing of its leg fixed yet. */
export const startLeg = (held: Steering): Steering => ({
  ...held,
  setOff: undefined,
});

/** How far round a run of turns swings between its furthest either way, starting from 0. */
function sweep(turns: readonly number[]): number {
  let [round, least, most] = [0, 0, 0];
  for (const turn of turns) {
    round += turn;
    [least, most] = [Math.min(least, round), Math.max(most, round)];
  }
  return most - least;
}

/**
 * A settling turn of `landed` on a leg that has turned its body `wound`
 * round: the short way, but near a half turn the way that unwinds the leg,
 * so a flier that turned right round to set off turns back to settle rather
 * than on round a whole turn.
 */
function unwinding(landed: number, wound: number): number {
  const [short, other = short] = evenly(landed);
  return Math.sign(short) === Math.sign(wound) ? other : short;
}

/** The ways round a turn of `turn` may go: the short way, and near a half turn the other too. */
function evenly(turn: number): [number] | [number, number] {
  if (Math.abs(turn) < Math.PI - EVEN) return [turn];
  return [turn, turn - Math.sign(turn) * Math.PI * 2];
}

/**
 * What a leg fixes as it sets off: how far its flight bows, and to the side
 * that swings its body round the least over the leg — turning from how it
 * sat into its heading, along its curve, and into its rest facing; with
 * nothing between them, the side its phase picks. A flight's curve turns it
 * on the way its take-off turned it, so a leg setting off far from the way
 * its body sat bows less, never carrying it on past `EVEN` of a half turn.
 */
function setOffFor(course: Course, still: boolean, facing: number): SetOff {
  const { leg, carried, start, aim, sat, perched, motion } = course;
  const flown = (bow: number) => {
    const path: Path = { ...leg, ...carried, start, end: aim, bow };
    const [from, to] = still
      ? [facing, facing]
      : [
          heading(path, leg.departs, motion),
          heading(path, leg.arrives, motion),
        ];
    const flying = flyingTurn(from, path, leg.departs, motion);
    const turns = turned(undefined, sat, leg, leg.departs, flying, perched);
    const landing = flyingTurn(to, path, leg.arrives, motion);
    return { turns, lift: -turns.lifted, curve: wrap(to - from), landing };
  };
  const off = Math.abs(flown(0).lift);
  const sides = phaseBow(motion.phase) === -1 ? [-1, 1] : [1, -1];
  const candidates = sides.flatMap((side) => {
    const curving = Math.abs(flown(side).curve);
    const room = 2 * (Math.PI - EVEN - off);
    const bow = side * (curving > room ? Math.max(0, room) / curving : 1);
    const { turns, curve, landing } = flown(bow);
    return evenly(turns.lifted).map((lifted, way) => {
      const lift = -lifted;
      const settle = perched
        ? unwinding(wrap(restTurn(landing) - landing), lift + curve)
        : 0;
      return {
        bow,
        turns: { ...turns, lifted },
        wound: 0,
        swings: sweep([lift, curve, settle]),
        way,
      };
    });
  });
  // The first of the least, so a tie keeps the short way and its phase's side.
  const [first, ...rest] = candidates.toSorted((a, b) => a.way - b.way);
  let best = first;
  for (const each of rest) {
    if (!best || each.swings < best.swings - 1e-9) best = each;
  }
  if (!best) throw new Error('a leg sets off some way');
  const { bow, turns, wound } = best;
  return { bow, turns, wound };
}

/**
 * `held` brought to `now` along `course`: where the flight has it, and its
 * body's turn. It turns on the spot for its leg's `pivot` before its flight
 * moves it, so it flies off facing the way it goes, and its body follows the
 * turn its leg gives it no faster than its kind's `TURN_RATE`, so no blend
 * of a take-off, a curve and a landing ever spins it.
 */
export function steer(
  held: Steering,
  course: Course,
  now: number,
): { steering: Steering; point: Point } {
  const { leg, carried, start, end, aim, sat, perched, size, motion } = course;
  // A flight going nowhere keeps the heading it had, and a landed flier the
  // one it landed on, which its rest facing turns from however its perch sways.
  const still =
    Math.hypot(aim.x - start.x, aim.y - start.y) <= size * GOING_NOWHERE;
  const setOff = held.setOff ?? setOffFor(course, still, held.facing);
  const { bow, wound } = setOff;
  const turning = pivot(leg, setOff.turns);
  // A flight cut short that has to turn stops to, and flies on only as fast
  // as it still goes the way it was going.
  const path: Path = {
    ...leg,
    ...carried,
    start,
    end,
    bow,
    departs: leg.departs + turning,
    speed:
      turning > 0
        ? carried.speed * Math.max(0, Math.cos(setOff.turns.lifted))
        : carried.speed,
  };
  const point = flightPoint(path, now, motion);
  const facing =
    still || (perched && now >= leg.arrives)
      ? held.facing
      : heading({ ...path, end: aim }, now, motion);
  const flying = flyingTurn(facing, path, now, motion);
  const found = turned(setOff.turns, sat, leg, now, flying, perched);
  const turns =
    found.landed === undefined || setOff.turns.landed !== undefined
      ? found
      : { ...found, landed: unwinding(found.landed, wound) };
  const wanted = bodyTurn(leg, now, flying, turns);
  const most = (TURN_RATE[motion.kind] * Math.max(0, now - held.at)) / 1000;
  const turn = Number.isFinite(most)
    ? wrap(
        held.turn + Math.max(-most, Math.min(most, wrap(wanted - held.turn))),
      )
    : wanted;
  return {
    steering: {
      facing,
      turn,
      at: now,
      setOff: {
        bow,
        turns,
        wound: wound + (Number.isFinite(most) ? wrap(turn - held.turn) : 0),
      },
    },
    point,
  };
}
