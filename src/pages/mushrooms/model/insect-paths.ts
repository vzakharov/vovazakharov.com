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

/** A leg as the motion reads it: its timing and what it carried over. */
export type Launched = Span & Carried;

/** A leg's flight on screen: from where the scene last drew it to its perch. */
export type Path = Launched & { start: Point; end: Point };

/** A flier as its path reads it: its kind, and the phase its seed gives it. */
export type Airborne = Phased & Kinded;

/** How far a flight's flutter lifts it at most, in the points' units. */
export type Fluttering = Airborne & { flutter: number };

/**
 * One kind's flight: how far it bows sideways, as a share of the distance
 * flown; how far it zigzags to either side, the same way, how many swings a
 * leg makes, and how much of each swing the body turns into; how many times
 * a second its flutter lifts it; and its steepest bank into the turn, in
 * radians.
 */
type Shape = {
  arc: number;
  zigzag: number;
  swings: number;
  follow: number;
  flutterRate: number;
  bank: number;
};

/** The steepest bank into the turn any kind makes, in radians: the butterfly's. */
export const MAX_TILT = 0.35;

/**
 * Each kind's flight. The butterfly bows wide and flutters slowly; the fly
 * flies nearly straight but zigzags, its body turning only a third of the
 * way into each swing — as far as it can on its shortest dart without
 * turning more than 0.2 rad a frame; the bee holds a nearly straight line
 * and bobs.
 */
export const PATH_SHAPES = {
  butterfly: {
    arc: 0.3,
    zigzag: 0,
    swings: 0,
    follow: 0,
    flutterRate: 2.2,
    bank: MAX_TILT,
  },
  fly: {
    arc: 0.06,
    zigzag: 0.07,
    swings: 2,
    follow: 0.3,
    flutterRate: 5,
    bank: 0.1,
  },
  bee: {
    arc: 0.1,
    zigzag: 0,
    swings: 0,
    follow: 0,
    flutterRate: 3.2,
    bank: 0.15,
  },
} as const satisfies Record<InsectKind, Shape>;

/** How fast a flight leaves mid-air, as a share of its average speed. */
const LAUNCH_SPEED = 1.5;

/**
 * How far through its flight a path is at `now`, eased in to the end and out
 * from the start in proportion to how fast it set off: from still it leaves
 * at rest, mid-flight at `LAUNCH_SPEED`.
 */
function progress({ departs, arrives, speed }: Launched, now: number): number {
  const flight = arrives - departs;
  if (flight <= 0) return 1;
  const u = Math.min(1, Math.max(0, (now - departs) / flight));
  // A cubic Hermite from 0 to 1, leaving at `slope` and arriving at rest;
  // monotonic for any slope up to 3.
  const slope = speed * LAUNCH_SPEED;
  return slope * u * (1 - u) ** 2 + u * u * (3 - 2 * u);
}

/** Which side a flight bows to, -1 or 1, read off the insect's phase. */
const bowOf = (phase: number) => (Math.sin(phase) < 0 ? -1 : 1);

/** The cubic's four points: out from the start and in to the end, both bowed one way. */
type Cubic = readonly [Point, Point, Point, Point];

function controls({ start, end }: Path, { phase, kind }: Airborne): Cubic {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bow = bowOf(phase) * PATH_SHAPES[kind].arc;
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
 * distance flown, and its rate of change along `u`: `swings` swings under a
 * `sin²` swell, so it and its slope are 0 at both ends and the flight leaves
 * and lands along its curve.
 */
function swing({ zigzag, swings }: Shape, u: number): [number, number] {
  const swell = Math.sin(Math.PI * u) ** 2;
  const swelling = Math.PI * Math.sin(2 * Math.PI * u);
  const wave = Math.sin(2 * Math.PI * swings * u);
  const waving = 2 * Math.PI * swings * Math.cos(2 * Math.PI * swings * u);
  return [zigzag * swell * wave, zigzag * (swelling * wave + swell * waving)];
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
  const { x, y } = bezier(controls(path, motion), u);
  // `sin(π)` is not quite 0 in floating point, and the ends must be exact.
  if (u <= 0 || u >= 1) return { x, y };
  const elapsed = (now - path.departs) / 1000;
  const [across] = swing(shape, u);
  const lift =
    motion.flutter *
    Math.sin(Math.PI * u) *
    Math.sin(Math.PI * 2 * shape.flutterRate * elapsed + motion.phase);
  const { start, end } = path;
  return {
    x: x - (end.y - start.y) * across,
    y: y + (end.x - start.x) * across - lift,
  };
}

/**
 * The direction a flight faces at `now`, in radians from the +x axis: along
 * the curve, turned `follow` of the way into each zigzag, and at either end
 * the way the curve leaves or meets it, so the insect lands facing the way
 * it came in.
 */
export function heading(path: Path, now: number, motion: Airborne): number {
  const shape = PATH_SHAPES[motion.kind];
  const u = progress(path, now);
  const along = tangent(controls(path, motion), u);
  const [, turning] = swing(shape, u);
  const across = turning * shape.follow;
  const { start, end } = path;
  return Math.atan2(
    along.y + (end.x - start.x) * across,
    along.x - (end.y - start.y) * across,
  );
}

/**
 * The bank into the turn at `now`, in radians, positive turning clockwise on
 * a screen whose y points down: the whole bowed curve turns one way, so the
 * bank rises from 0 at take-off to its kind's `bank` mid-flight and settles
 * to 0 at landing.
 */
export function tilt(
  path: Path,
  now: number,
  { phase, kind }: Airborne,
): number {
  if (path.start.x === path.end.x && path.start.y === path.end.y) return 0;
  return (
    -bowOf(phase) *
    PATH_SHAPES[kind].bank *
    Math.sin(Math.PI * progress(path, now))
  );
}
