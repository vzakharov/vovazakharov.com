/**
 * An insect's motion as pure functions of the scene's clock in ms, so every
 * frame is set from the clock and a leg's timing alone. Points are wherever
 * the scene measures them; the model never says where a perch stands.
 */

import type { Leg, Perch, Span } from './flight';
import type { InsectKind } from './insect-genes';
import {
  type Airborne,
  type Carried,
  type Launched,
  type Path,
  tilt,
} from './insect-paths';
import { roundAt, smooth, wave } from './motion';

/** A leg with its stay: where it goes and when it leaves. */
export type Stay = Launched & Pick<Leg, 'to' | 'leaves'>;

/**
 * One kind's wings: one stroke in the air and, for a butterfly, one slow open
 * and close at rest, in ms. A fly's and a bee's beat far faster than a
 * butterfly's, too fast to follow, which the painter blurs.
 */
const BEAT_AIR = { butterfly: 160, fly: 28, bee: 36 } as const satisfies Record<
  InsectKind,
  number
>;
const BEAT_REST = 2600;
/** The least a butterfly's wings close to at rest, as a share of fully open. */
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
/**
 * How far a fly's or a bee's beating wings swing back toward laid over the
 * body, as a share of the way, so in the air they stay mostly spread.
 */
const BUZZ_STROKE = 0.45;
/**
 * A bee's flutter at rest on a flower: every `BUZZ_EVERY` ms its wings lift
 * `BUZZ_OPEN` of the way and lay back again, over `BUZZ_FOR` ms. At rest a
 * wing is drawn as itself rather than blurred, so each stroke takes over
 * 150 ms, slow enough to follow at 60 frames a second.
 */
const BUZZ_EVERY = 1700;
const BUZZ_FOR = 420;
const BUZZ_OPEN = 0.35;
/** How long the proboscis takes to uncurl, and to curl back up, in ms. */
const UNCURL = 600;
const CURL = 400;
/** One sip in and out while drinking, in ms, and how far it draws the proboscis back. */
const SIP = 900;
export const SIP_DEPTH = 0.15;
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
 * How far aloft a leg has the flier at `now`, from 0 on its perch to 1 in the
 * air: rising at take-off from however far aloft it set off, and falling as
 * it settles after landing — never at a spot in the air, which it only
 * hovers at.
 */
export function aloft(
  { departs, arrives, launch, to }: Stay,
  now: number,
): number {
  const settled = to.kind === 'air' ? 0 : smooth((now - arrives) / SETTLE);
  return Math.min(
    Math.max(launch, smooth((now - departs) / TAKE_OFF)),
    1 - settled,
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
  return drinking(stay, now) * (1 - SIP_DEPTH * wave(now, SIP, 0));
}

/**
 * What a leg starting at `now` carries over from `leg`, the one it cuts short
 * or follows: past its arrival the flier is still, wherever it came to.
 */
export function carriedFrom(leg: Stay, now: number): Carried {
  const launch = aloft(leg, now);
  const speed = now < leg.arrives ? launch : 0;
  return { launch, speed, drink: drinking(leg, now) };
}

/**
 * How far the wings are open at `now`, from 0 to 1 and never jumping, easing
 * between the air and the perch with `aloft`. A butterfly's go from closed up
 * (0) to flat open (1): a fast beat in the air, and at rest a slow open and
 * close on a cap or a half-shut flex while drinking, easing between them
 * with `drinking`. A fly's and a bee's go from laid back over the body (0)
 * to spread (1): a buzz of a beat in the air, still at rest — but for a
 * bee's short flutter every so often.
 */
export function wingBeat(leg: Stay, now: number, motion: Airborne): number {
  const { phase, kind } = motion;
  const air =
    kind === 'butterfly'
      ? 1 - wave(now, BEAT_AIR[kind], phase)
      : 1 - BUZZ_STROKE * wave(now, BEAT_AIR[kind], phase);
  const still = restingBeat(leg, now, motion);
  return still + (air - still) * aloft(leg, now);
}

/** How far the wings are open at rest at `now`, as `wingBeat` has them. */
function restingBeat(
  leg: Stay,
  now: number,
  { phase, kind }: Airborne,
): number {
  switch (kind) {
    case 'butterfly': {
      const rest = 1 - (1 - REST_CLOSE) * wave(now, BEAT_REST, phase);
      const [least, most] = DRINK_OPEN;
      const sipping = least + (most - least) * wave(now, BEAT_DRINK, phase);
      return rest + (sipping - rest) * drinking(leg, now);
    }
    case 'fly': {
      return 0;
    }
    case 'bee': {
      const into = roundAt(now, BUZZ_EVERY, phase);
      if (into >= BUZZ_FOR) return 0;
      return BUZZ_OPEN * wave(into, BUZZ_FOR, 0);
    }
    default: {
      return kind satisfies never;
    }
  }
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
  motion: Airborne,
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

/** A flower head's sag, in shares of its radius and positive down, and its petals' flicker, in radians. */
export type Dip = { dip: number; flicker: number };

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
 * it has just left. Landing, the head bounces down to a sag it holds through
 * the drink; leaving, it springs back up past its place and settles while the
 * petals flicker, and after `DIP_AFTER` the flower is left alone. `undefined`
 * while no flower is under it.
 */
export function drinkDip(
  { from, to, departs, arrives }: Leg,
  now: number,
): (FlowerPerch & Dip) | undefined {
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
