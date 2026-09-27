/**
 * An insect's motion as pure functions of the scene's clock in ms, so every
 * frame is set from the clock and a leg's timing alone. Points are wherever
 * the scene measures them; the model never says where a perch stands.
 */

import type { Span } from './flight';
import type { Point } from './geometry';
import { type Phased, smooth } from './motion';

/** A leg's flight on screen: from where the scene last drew it to its perch. */
export type Path = Span & { start: Point; end: Point };

/** How far a flight's flutter lifts it at most, in the points' units. */
export type Fluttering = Phased & { flutter: number };

/** How far a flight bows sideways, as a share of the distance flown. */
const ARC = 0.3;
/** How many flutter bobs a second a flight makes. */
const FLUTTER_RATE = 2.2;
/** The steepest bank into the turn, in radians. */
export const MAX_TILT = 0.35;
/** One wing stroke in the air, and one slow open and close at rest, in ms. */
const BEAT_AIR = 160;
const BEAT_REST = 2600;
/** The least the wings close to at rest, as a share of fully open. */
const REST_CLOSE = 0.3;
/** How long the beat takes to speed up at take-off, and to calm at landing. */
const TAKE_OFF = 220;
const SETTLE = 500;
/** How long a landing's bob lasts, and how deep it goes, as a share of the insect's size. */
export const LANDING = 450;
const LANDING_DEPTH = 0.12;
/** How much of its bank into a turn a flier shows as a turn of its own. */
const BANK_TURN = 0.6;
/**
 * How far off facing up the screen a flier settles on its perch, in radians,
 * how long it takes to turn there after landing, and to turn into its
 * heading at take-off, in ms: slow enough that a turn right round never
 * moves it more than about 0.2 rad in a 16 ms frame.
 */
export const REST_LEAN = 0.45;
const SETTLE_TURN = 700;
const LIFT_TURN = 450;

/** How far through its flight a path is at `now`, eased in and out. */
function progress({ departs, arrives }: Span, now: number): number {
  const flight = arrives - departs;
  return flight <= 0 ? 1 : smooth((now - departs) / flight);
}

/** Which side a flight bows to, -1 or 1, read off the insect's phase. */
const bowOf = (phase: number) => (Math.sin(phase) < 0 ? -1 : 1);

/** The cubic's four points: out from the start and in to the end, both bowed one way. */
type Cubic = readonly [Point, Point, Point, Point];

function controls({ start, end }: Path, phase: number): Cubic {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bow = bowOf(phase) * ARC;
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

/**
 * Where a flight is at `now`: along a cubic bowed to one side, eased in and
 * out, with a flutter lifting it up and down that dies away at both ends —
 * so it is exactly at `start` until it departs and exactly at `end` once it
 * arrives.
 */
export function flightPoint(
  path: Path,
  now: number,
  { phase, flutter }: Fluttering,
): Point {
  const u = progress(path, now);
  const { x, y } = bezier(controls(path, phase), u);
  const elapsed = (now - path.departs) / 1000;
  // `sin(π)` is not quite 0 in floating point, and the ends must be exact.
  if (u <= 0 || u >= 1) return { x, y };
  const lift =
    flutter *
    Math.sin(Math.PI * u) *
    Math.sin(Math.PI * 2 * FLUTTER_RATE * elapsed + phase);
  return { x, y: y - lift };
}

/**
 * The direction a flight faces at `now`, in radians from the +x axis: along
 * the curve, and at either end the way the curve leaves or meets it, so the
 * insect lands facing the way it came in.
 */
export function heading(path: Path, now: number, { phase }: Phased): number {
  const [p0, p1, p2, p3] = controls(path, phase);
  const u = progress(path, now);
  const v = 1 - u;
  const a = 3 * v * v;
  const b = 6 * v * u;
  const c = 3 * u * u;
  const dx = a * (p1.x - p0.x) + b * (p2.x - p1.x) + c * (p3.x - p2.x);
  const dy = a * (p1.y - p0.y) + b * (p2.y - p1.y) + c * (p3.y - p2.y);
  return Math.atan2(dy, dx);
}

/**
 * The bank into the turn at `now`, in radians, positive turning clockwise on
 * a screen whose y points down: the whole bowed curve turns one way, so the
 * bank rises from 0 at take-off to `MAX_TILT` mid-flight and settles to 0 at
 * landing.
 */
export function tilt(path: Path, now: number, { phase }: Phased): number {
  if (path.start.x === path.end.x && path.start.y === path.end.y) return 0;
  return -bowOf(phase) * MAX_TILT * Math.sin(Math.PI * progress(path, now));
}

/**
 * How far the wings are open at `now`, from 0 (closed up) to 1 (flat open):
 * a fast beat in the air, a slow open and close at rest, easing from one to
 * the other at take-off and landing, so the beat never jumps.
 */
export function wingBeat(
  { departs, arrives }: Span,
  now: number,
  { phase }: Phased,
): number {
  const air = 0.5 + 0.5 * Math.cos((Math.PI * 2 * now) / BEAT_AIR + phase);
  const rest =
    1 -
    (1 - REST_CLOSE) *
      (0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / BEAT_REST + phase));
  const aloft = Math.min(
    smooth((now - departs) / TAKE_OFF),
    1 - smooth((now - arrives) / SETTLE),
  );
  return rest + (air - rest) * aloft;
}

/**
 * How far a landing sinks the insect at `now`, in units of its size and
 * positive down: a dip, a smaller rise and back after it arrives, 0 before and once
 * `LANDING` has passed.
 */
export function landingBob({ arrives }: Span, now: number): number {
  const elapsed = now - arrives;
  if (elapsed < 0 || elapsed >= LANDING) return 0;
  const t = elapsed / LANDING;
  return LANDING_DEPTH * Math.sin(Math.PI * 2 * t) * (1 - t) ** 2;
}

/** `angle` brought round into (-π, π]. */
export const wrap = (angle: number) =>
  angle - Math.PI * 2 * Math.round(angle / (Math.PI * 2));

/**
 * The way a flier's body points in flight, in radians clockwise from up the
 * screen: along `facing` (a heading from +x), leaning into its bank.
 */
export function flyingTurn(
  facing: number,
  path: Path,
  now: number,
  motion: Phased,
): number {
  return wrap(facing + Math.PI / 2 + tilt(path, now, motion) * BANK_TURN);
}

/**
 * The way a flier faces settled on its perch, for the flying turn it landed
 * on: up the screen, leaning toward the way it came in by at most
 * `REST_LEAN`, and continuous all the way round, so a landing heading either
 * side of straight down settles the same way.
 */
export function restTurn(landing: number): number {
  return REST_LEAN * Math.sin(landing);
}

/**
 * How a leg turns the body off its flying turn, each part fixed once so a
 * swaying perch never re-decides which way round it goes: `lifted`, how far
 * off it the body sat as the leg set off; `landed`, how far its rest facing
 * is off the turn it landed on, `undefined` until it lands and on a leg away.
 */
export type Turns = { lifted: number; landed: number | undefined };

/**
 * `turns` brought up to `now`, for a body flying at `flying`: on a leg's
 * first frame (`turns` undefined) `lifted` is fixed from `sat`, how the body
 * was turned as the leg set off (`undefined` coming in from off screen), and
 * on its first frame past arrival at a perch `landed` is fixed from the turn
 * it landed on. Otherwise `turns` comes back as it was.
 */
export function turned(
  turns: Turns | undefined,
  sat: number | undefined,
  { arrives }: Span,
  now: number,
  flying: number,
  perched: boolean,
): Turns {
  const held = turns ?? {
    lifted: sat === undefined ? 0 : wrap(sat - flying),
    landed: undefined,
  };
  if (!perched || now < arrives || held.landed !== undefined) return held;
  return { ...held, landed: wrap(restTurn(flying) - flying) };
}

/**
 * The body's turn at `now`, in radians clockwise from up the screen: its
 * flying turn, starting off the way it sat and settling to its rest facing,
 * every blend an offset fixed in `turns`, so it never spins at ±π.
 */
export function bodyTurn(
  { departs, arrives }: Span,
  now: number,
  flying: number,
  { lifted, landed = 0 }: Turns,
): number {
  const lift = smooth((now - departs) / LIFT_TURN);
  const rest = smooth((now - arrives) / SETTLE_TURN);
  return wrap(flying + lifted * (1 - lift) + landed * rest);
}
