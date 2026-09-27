/**
 * An insect's motion as pure functions of the scene's clock in ms, so every
 * frame is set from the clock and a leg's timing alone. Points are wherever
 * the scene measures them; the model never says where a perch stands.
 */

import type { Leg, Perch, Span } from './flight';
import type { Point } from './geometry';
import { type Phased, smooth } from './motion';

/**
 * What a leg carries over from the one before as it sets off: `launch`, how
 * far aloft the flier was, from 0 sitting on its perch to 1 in the air, so a
 * leg that starts mid-flight flies on rather than taking off again; `drink`,
 * how far into a drink it was, so a drink cut short curls up rather than
 * vanishing.
 */
export type Carried = { launch: number; drink: number };

/** A leg as the motion reads it: its timing and what it carried over. */
export type Launched = Span & Carried;

/** A leg with its stay: where it goes and when it leaves. */
export type Stay = Launched & Pick<Leg, 'to' | 'leaves'>;

/** A leg's flight on screen: from where the scene last drew it to its perch. */
export type Path = Launched & { start: Point; end: Point };

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
/**
 * A drink's slow flex of the wings, held half shut: its period in ms and the
 * least and most it opens, as shares of fully open.
 */
const BEAT_DRINK = 1800;
const DRINK_OPEN = [0.35, 0.6] as const;
/** How long the proboscis takes to uncurl, and to curl back up, in ms. */
const UNCURL = 600;
const CURL = 400;
/** One sip in and out while drinking, in ms, and how far it draws the proboscis back. */
const SIP = 900;
const SIP_DEPTH = 0.15;
/** How fast a flight leaves mid-air, as a share of its average speed. */
const LAUNCH_SPEED = 1.5;
/** How long a landing's bob lasts, and how deep it goes, as a share of the insect's size. */
export const LANDING = 450;
const LANDING_DEPTH = 0.12;
/** When a drink starts: once the landing's bob is half done, in ms after landing. */
const DRINK_DELAY = LANDING / 2;
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

/**
 * How far through its flight a path is at `now`, eased in to the end and out
 * from the start in proportion to how far aloft it set off: from a perch it
 * leaves at rest, mid-air at `LAUNCH_SPEED`.
 */
function progress({ departs, arrives, launch }: Launched, now: number): number {
  const flight = arrives - departs;
  if (flight <= 0) return 1;
  const u = Math.min(1, Math.max(0, (now - departs) / flight));
  // A cubic Hermite from 0 to 1, leaving at `slope` and arriving at rest;
  // monotonic for any slope up to 3.
  const slope = launch * LAUNCH_SPEED;
  return slope * u * (1 - u) ** 2 + u * u * (3 - 2 * u);
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
 * How far aloft a leg has the flier at `now`, from 0 on its perch to 1 in the
 * air: rising at take-off from however far aloft it set off, and falling as
 * it settles after landing.
 */
export function aloft(
  { departs, arrives, launch }: Launched,
  now: number,
): number {
  return Math.min(
    Math.max(launch, smooth((now - departs) / TAKE_OFF)),
    1 - smooth((now - arrives) / SETTLE),
  );
}

/**
 * How far into a drink a leg has the flier at `now`, from 0 to 1: at a
 * flower it rises once the landing's bob is half done and falls back to 0
 * just before the stay is over; whatever drink the leg carried over falls
 * away as it sets off. A leg to a cap never drinks.
 */
export function drinking(stay: Stay, now: number): number {
  const { departs, arrives, leaves, drink, to } = stay;
  const carried = drink * (1 - smooth((now - departs) / CURL));
  if (to.kind !== 'flower') return carried;
  const atFlower =
    smooth((now - arrives - DRINK_DELAY) / UNCURL) *
    (1 - smooth((now - leaves + CURL) / CURL));
  return Math.max(carried, atFlower);
}

/**
 * How far out the proboscis is at `now`, from 0 curled up to 1 reaching into
 * the flower: out with the drink, drawn a little back and forth with each sip.
 */
export function proboscis(stay: Stay, now: number): number {
  const sip = 0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / SIP);
  return drinking(stay, now) * (1 - SIP_DEPTH * sip);
}

/** What a leg starting at `now` carries over from `leg`, the one it cuts short or follows. */
export function carriedFrom(leg: Stay, now: number): Carried {
  return { launch: aloft(leg, now), drink: drinking(leg, now) };
}

/** A slow wave from 0 to 1 and back over `period` ms, starting at 0. */
const wave = (now: number, period: number, phase: number) =>
  0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / period + phase);

/**
 * How far the wings are open at `now`, from 0 (closed up) to 1 (flat open):
 * a fast beat in the air, and at rest a slow open and close on a cap or a
 * half-shut flex while drinking, easing between them with `aloft` and
 * `drinking`, so the beat never jumps.
 */
export function wingBeat(leg: Stay, now: number, { phase }: Phased): number {
  const air = 1 - wave(now, BEAT_AIR, phase);
  const rest = 1 - (1 - REST_CLOSE) * wave(now, BEAT_REST, phase);
  const [least, most] = DRINK_OPEN;
  const sipping = least + (most - least) * wave(now, BEAT_DRINK, phase);
  const still = rest + (sipping - rest) * drinking(leg, now);
  return still + (air - still) * aloft(leg, now);
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

/** A flower perch: the one a butterfly drinks at. */
type FlowerPerch = Extract<Perch, { kind: 'flower' }>;

/** How far a flower's head sags under a drinking butterfly, as a share of its radius. */
const DIP_DEPTH = 0.18;
/** How fast the head's bounce dies away, and how often it bounces, a second. */
const DIP_DAMPING = 6;
const DIP_RATE = 2.2;
/** How far the petals flicker as a butterfly leaves, in radians, and how fast, a second. */
const FLICKER = 0.12;
const FLICKER_RATE = 7;
/** How long after a butterfly leaves its flower moves no more, in ms. */
const DIP_AFTER = 1200;

/** A head's damped bounce `since` seconds after a butterfly lands or leaves, from 1 toward 0. */
function bounce(since: number): number {
  return (
    Math.exp(-DIP_DAMPING * since) * Math.cos(Math.PI * 2 * DIP_RATE * since)
  );
}

/**
 * What a butterfly on `leg` does at `now` to the flower under it, or the one
 * it has just left: the head's sag, in shares of its radius and positive
 * down, and the petals' flicker, in radians. Landing, the head bounces down
 * to a sag it holds through the drink; leaving, it springs back up past its
 * place and settles while the petals flicker, and after `DIP_AFTER` the
 * flower is left alone. `undefined` while no flower is under it.
 */
export function drinkDip(
  { from, to, departs, arrives }: Leg,
  now: number,
): (FlowerPerch & { dip: number; flicker: number }) | undefined {
  if (to.kind === 'flower' && now >= arrives) {
    const since = (now - arrives) / 1000;
    return { ...to, dip: DIP_DEPTH * (1 - bounce(since)), flicker: 0 };
  }
  const since = (now - departs) / 1000;
  if (from.kind !== 'flower' || since < 0 || since * 1000 >= DIP_AFTER) {
    return undefined;
  }
  const flicker =
    FLICKER *
    Math.exp(-DIP_DAMPING * since) *
    Math.sin(Math.PI * 2 * FLICKER_RATE * since);
  return { ...from, dip: DIP_DEPTH * bounce(since), flicker };
}
