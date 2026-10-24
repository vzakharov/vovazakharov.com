/**
 * The shape of a flight, each kind its own: the butterfly's lazy curve, the
 * fly's fast zigzag, the bee's bobbing line. Pure functions of the scene's
 * clock in ms and a leg's timing; points are wherever the scene measures
 * them. Every shape starts exactly at its start and ends exactly at its end,
 * and turns its heading no faster than a body can follow.
 */

import type { Span } from './flight';
import type { Point } from './geometry';
import type { InsectKind, Kinded } from './insect-genes';
import type { Phased } from './motion';

/**
 * What a leg carries over from the one before as it sets off: `launch`, how
 * far aloft the flier was, from 0 sitting on its perch to 1 in the air, so a
 * leg that starts in the air beats on rather than taking off again; `speed`,
 * how fast it was still flying, from 0 still — on a perch, or hovering where
 * a flight through the air came to — to 1 mid-flight, so a leg that cuts a
 * flight short flies on rather than setting off from still; `drink`, how far
 * into a drink it was, so a drink cut short curls up rather than vanishing.
 */
export type Carried = { launch: number; speed: number; drink: number };
/** What a leg carries over from the one before (`Carried`). */
export type CarryingOver = { carried: Carried };

/** A leg as the motion reads it: its timing and what it carried over. */
export type Launched = Span & Carried;

/** Where a flight sets off from, and where its perch stands. */
export type Routed = { start: Point; end: Point };

/**
 * A leg's flight on screen: from where the scene last drew it to its perch,
 * bowed `bow` of its kind's `arc` to one side or the other, from -1 to 1 —
 * or with none, all the way to the side the insect's phase picks.
 */
export type Path = Launched & Routed & { bow?: number };

/** A flier as its path reads it: its kind, and the phase its seed gives it. */
export type Airborne = Phased & Kinded;

/** How far a flight's flutter lifts it at most, in the points' units. */
export type Fluttering = Airborne & { flutter: number };

/**
 * One kind's flight: how far it bows sideways, as a share of the distance
 * flown; how far it zigzags to either side, the same way, and how many
 * swings a leg makes; how many times a second its flutter lifts it; and its
 * steepest bank into the turn, in radians.
 */
type Shape = {
  arc: number;
  zigzag: number;
  swings: number;
  flutterRate: number;
  bank: number;
};

/** The steepest bank into the turn any kind makes, in radians: the butterfly's. */
export const MAX_TILT = 0.35;

/**
 * Each kind's flight. The butterfly bows wide and flutters slowly; the fly
 * flies nearly straight but zigzags, faster than its flutter bobs, so its
 * body wiggles about its way rather than swinging with each zigzag; the bee
 * holds a nearly straight line and bobs.
 */
export const PATH_SHAPES = {
  butterfly: {
    arc: 0.3,
    zigzag: 0,
    swings: 0,
    flutterRate: 2.2,
    bank: MAX_TILT,
  },
  fly: {
    arc: 0.06,
    zigzag: 0.07,
    swings: 2,
    flutterRate: 5,
    bank: 0.1,
  },
  bee: {
    arc: 0.1,
    zigzag: 0,
    swings: 0,
    flutterRate: 3.2,
    bank: 0.15,
  },
} as const satisfies Record<InsectKind, Shape>;

/**
 * The most a flight's flutter lifts it, as a share of the distance flown: a
 * short hop bobs less, so its bob never reads as flying the other way.
 */
const FLUTTER_REACH = 0.04;

/** How fast a flight leaves mid-air, as a share of its average speed. */
const LAUNCH_SPEED = 1.5;

/**
 * A cubic Hermite from 0 to 1 over `v` from 0 to 1, leaving at `m0` and
 * arriving at `m1` times its average slope; monotonic for slopes up to 3.
 */
function hermite(v: number, m0: number, m1: number): number {
  return m0 * v * (1 - v) ** 2 + v * v * (3 - 2 * v) - m1 * v * v * (1 - v);
}

/**
 * How far through its flight a path is at `now`, eased in to the end and out
 * from the start in proportion to how fast it set off: from still it leaves
 * at rest, mid-flight at `LAUNCH_SPEED`. A flight that dashes (`Dash`) slows
 * out of its dash to the pace it flies the rest at.
 */
function progress(
  { departs, arrives, speed, dash }: Launched,
  now: number,
): number {
  const flight = arrives - departs;
  if (flight <= 0) return 1;
  const u = Math.min(1, Math.max(0, (now - departs) / flight));
  const slope = speed * LAUNCH_SPEED;
  if (!dash) return hermite(u, slope, 0);
  const { time, way } = dash;
  const pace = (1 - way) / (1 - time) / (way / time);
  return u < time
    ? way * hermite(u / time, slope, pace)
    : way + (1 - way) * hermite((u - time) / (1 - time), 1, 0);
}

/** The side an insect's phase has its flights bow to, -1 or 1, when nothing else picks one. */
export const phaseBow = (phase: number) => (Math.sin(phase) < 0 ? -1 : 1);

/** How far a flight bows, and to which side: its own, or all the way to its insect's phase's. */
const bowOf = ({ bow }: Path, phase: number): number => bow ?? phaseBow(phase);

/** The cubic's four points: out from the start and in to the end, both bowed one way. */
type Cubic = readonly [Point, Point, Point, Point];

function controls(path: Path, { phase, kind }: Airborne): Cubic {
  const { start, end } = path;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bow = bowOf(path, phase) * PATH_SHAPES[kind].arc;
  const side = { x: -dy * bow, y: dx * bow };
  return [
    start,
    { x: start.x + dx / 3 + side.x, y: start.y + dy / 3 + side.y },
    { x: start.x + (2 * dx) / 3 + side.x, y: start.y + (2 * dy) / 3 + side.y },
    end,
  ];
}

function bezier([p0, p1, p2, p3]: Cubic, u: number): Point {
  const v = 1 - u;
  const [a, b, c, d] = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/** The cubic's direction `u` of the way along, unnormalized. */
function tangent([p0, p1, p2, p3]: Cubic, u: number): Point {
  const v = 1 - u;
  const [a, b, c] = [3 * v * v, 6 * v * u, 3 * u * u];
  return {
    x: a * (p1.x - p0.x) + b * (p2.x - p1.x) + c * (p3.x - p2.x),
    y: a * (p1.y - p0.y) + b * (p2.y - p1.y) + c * (p3.y - p2.y),
  };
}

/**
 * The zigzag's swing off the chord `u` of the way along, as a share of the
 * distance flown: `swings` swings under a `sin²` swell, so it and its slope
 * are 0 at both ends and the flight leaves and lands along its curve.
 */
function swing({ zigzag, swings }: Shape, u: number): number {
  return (
    zigzag * Math.sin(Math.PI * u) ** 2 * Math.sin(2 * Math.PI * swings * u)
  );
}

/** Where a flight's line is `u` of the way along: on its bowed cubic, swung across it by its zigzag. */
function lineAt(path: Path, u: number, motion: Airborne): Point {
  const { x, y } = bezier(controls(path, motion), u);
  const across = swing(PATH_SHAPES[motion.kind], u);
  const { start, end } = path;
  return {
    x: x - (end.y - start.y) * across,
    y: y + (end.x - start.x) * across,
  };
}

/**
 * Where a flight is at `now`: along a cubic bowed to one side, eased in and
 * out, zigzagging across it as its kind does, with a flutter lifting it up
 * and down that dies away at both ends — so it is exactly at `start` until
 * it departs and exactly at `end` once it arrives.
 */
export function flightPoint(
  path: Path,
  now: number,
  motion: Fluttering,
): Point {
  const shape = PATH_SHAPES[motion.kind];
  const u = progress(path, now);
  // `sin(π)` is not quite 0 in floating point, and the ends must be exact.
  if (u <= 0 || u >= 1) return bezier(controls(path, motion), u);
  const { x, y } = lineAt(path, u, motion);
  const elapsed = (now - path.departs) / 1000;
  const { start, end } = path;
  const reach = Math.min(
    motion.flutter,
    FLUTTER_REACH * Math.hypot(end.x - start.x, end.y - start.y),
  );
  const lift =
    reach *
    Math.sin(Math.PI * u) *
    Math.sin(Math.PI * 2 * shape.flutterRate * elapsed + motion.phase);
  return { x, y: y - lift };
}

/** Half of one bob of a kind's flutter, in ms. */
const halfBob = ({ kind }: Kinded) => 500 / PATH_SHAPES[kind].flutterRate;

/**
 * How far and which way a flight's line goes over one bob of its flutter
 * about `now`, in the points' units, which is the way the eye reads it
 * going — a zigzag faster than that reads as a wiggle about the way, not a
 * turn of it. Its end moves on by `drift` a ms, the way its perch is moving,
 * since near its end a flight rides its perch as much as it flies.
 */
export function stride(
  path: Path,
  now: number,
  motion: Airborne,
  drift?: Point,
): Point {
  const half = halfBob(motion);
  const { end } = path;
  const { x: dx, y: dy } = drift ?? { x: 0, y: 0 };
  const at = (then: number): Point => {
    const moved = then - now;
    const shifted = {
      ...path,
      end: { x: end.x + dx * moved, y: end.y + dy * moved },
    };
    return lineAt(shifted, progress(path, then), motion);
  };
  const [a, b] = [at(now - half), at(now + half)];
  return { x: b.x - a.x, y: b.y - a.y };
}

/**
 * The direction a flight faces at `now`, in radians from the +x axis: the
 * way of its `stride`. At either end it is the way the line leaves or meets
 * it, so the insect lands facing the way it came in.
 */
export function heading(path: Path, now: number, motion: Airborne): number {
  const { x, y } = stride(path, now, motion);
  if (Math.hypot(x, y) > 1e-9) return Math.atan2(y, x);
  const along = tangent(
    controls(path, motion),
    progress(path, now - halfBob(motion)),
  );
  return Math.atan2(along.y, along.x);
}

/**
 * The bank into the turn at `now`, in radians, positive turning clockwise on
 * a screen whose y points down: the whole bowed curve turns one way, so the
 * bank rises from 0 at take-off to its kind's `bank` mid-flight, for a
 * flight bowed all the way, and settles to 0 at landing.
 */
export function tilt(
  path: Path,
  now: number,
  { phase, kind }: Airborne,
): number {
  if (path.start.x === path.end.x && path.start.y === path.end.y) return 0;
  return (
    -bowOf(path, phase) *
    PATH_SHAPES[kind].bank *
    Math.sin(Math.PI * progress(path, now))
  );
}
