import {
  at,
  ellipse,
  ink,
  noise,
  type Path,
  path,
  type Pen,
} from '@/clip/shared/ink';

import {
  type Audience,
  EAR_ROOT,
  type EarFlight,
  earFlights,
  earRise,
  RUMBLE,
  type Seat,
  seats,
} from '../model/crowd';
import { AUDIENCE_PALETTE } from './palette-bunny';

// A head's back, its centre at the origin, 100 wide.
const HEAD = ellipse([0, 0], 50, 46);
const HEAD_BACK_EAR = (side: number): Path =>
  path(
    `M ${side * 14},-30 C ${side * 10},-90 ${side * 22},-150 ${side * 36},-180 C ${side * 48},-150 ${side * 46},-90 ${side * 34},-26 Z`,
  );
const EARS = { [-1]: HEAD_BACK_EAR(-1), 1: HEAD_BACK_EAR(1) };
const earOn = (side: number): Path => (side < 0 ? EARS[-1] : EARS[1]);
// A rocket ear's exhaust, pointing down from the origin, and its hot core;
// drawn at size, since the ink's wobble would grow with any scale.
const exhaust = (width: number, length: number): Path =>
  path(
    `M ${-width},0 C ${-width},${length * 0.45} ${-width * 0.2},${length * 0.8} 0,${length} C ${width * 0.2},${length * 0.8} ${width},${length * 0.45} ${width},0 Z`,
  );
const FLAME = exhaust(14, 70);
const FLAME_CORE = exhaust(7, 36);
const PUFF = ellipse([0, 0], 12);
// How long a twitch lasts and how often an ear may twitch, in seconds.
const TWITCH = 0.35;
const TWITCH_EVERY = 2.2;

/** The ear on `side` of head `n`, turned by a twitch now and then. */
function earTurn(seed: number, n: number, side: number, t: number): number {
  const slot = Math.floor(t / TWITCH_EVERY);
  const key = n * 2 + (side + 1) / 2;
  if (noise(seed + slot, key) < 0.55) return 0;
  const start =
    slot * TWITCH_EVERY + (noise(seed + slot, key + 1000) + 1) * 0.8;
  const into = (t - start) / TWITCH;
  if (into < 0 || into > 1) return 0;
  return side * 14 * Math.sin(into * Math.PI);
}

// How thick the rim light is, in a head's own units.
const RIM = 4;

/**
 * `shape` in dark fur with the stage light along its top edge: the light's
 * colour, then the fur over it shifted down, leaving a crescent.
 */
function rimLit(pen: Pen, shape: Path, seed: number, light: number): void {
  ink(pen, shape, {
    fill: AUDIENCE_PALETTE.rim,
    stroke: null,
    alpha: light,
    seed,
  });
  at(pen, { y: RIM }, () => {
    ink(pen, shape, { fill: AUDIENCE_PALETTE.fur, stroke: null, seed });
  });
}

/** An ear in its seated frame, turned `rot` degrees about where it grows. */
function ear(pen: Pen, side: number, rot: number, from: Seat): void {
  at(pen, { y: -30, rot }, () => {
    rimLit(pen, earOn(side), from.seat, from.stageLight);
  });
}

// The smoke an ear leaves: this many puffs, this far apart in seconds.
const PUFFS = 7;
const PUFF_EVERY = 0.07;

/** An ear in flight: its smoke behind it, its exhaust, the ear itself. */
function rocketEar(pen: Pen, flight: EarFlight, seed: number): void {
  const { from, earSide: side, ignites: leaves } = flight;
  const { playhead } = pen;
  const [sx, sy] = from.spot;
  const [rx, ry] = EAR_ROOT;
  const root = { x: side * rx, y: ry };
  for (let k = PUFFS; k >= 1; k -= 1) {
    const past = earRise(flight, Math.max(leaves, playhead - k * PUFF_EVERY));
    if (!past) continue;
    const [px, py] = past.lift;
    at(pen, { x: sx + px, y: sy + py, scale: from.headScale }, () => {
      at(pen, { ...root, scale: 0.7 + k * 0.25 }, () => {
        ink(pen, PUFF, {
          fill: AUDIENCE_PALETTE.smoke,
          stroke: null,
          alpha: 0.5 * (1 - k / (PUFFS + 1)),
          seed: seed + k,
        });
      });
    });
  }
  const now = earRise(flight, playhead);
  if (!now) return;
  const [dx, dy] = now.lift;
  const flicker = 1 + noise(seed, Math.floor(playhead * 24)) * 0.3;
  at(pen, { x: sx + dx, y: sy + dy, scale: from.headScale }, () => {
    at(pen, { ...root, rot: now.tilt }, () => {
      at(pen, { scale: flicker }, () => {
        ink(pen, FLAME, { fill: AUDIENCE_PALETTE.flame, stroke: null, seed });
        ink(pen, FLAME_CORE, {
          fill: AUDIENCE_PALETTE.flameCore,
          stroke: null,
          seed,
        });
      });
      at(pen, { x: -root.x, y: -root.y }, () => {
        ear(pen, side, 0, from);
      });
    });
  });
}

/**
 * The TV studio's audience seen from behind: rows of dark heads and long
 * ears, the stage light catching their edges, an ear twitching now and then.
 * The rows recede up the area, each smaller than the one before. From
 * `liftOff` on, the ears shake, then go up one by one as rockets.
 */
export function studioAudience(pen: Pen, audience: Audience): void {
  const { seed = 0 } = audience;
  const { playhead } = pen;
  const flights = new Map<string, EarFlight>(
    earFlights(audience).map((flight) => [
      `${flight.from.seat}:${flight.earSide}`,
      flight,
    ]),
  );
  const flying: EarFlight[] = [];
  for (const from of seats(audience)) {
    const [x, y] = from.spot;
    const bob = Math.sin(playhead * 1.3 + noise(seed, from.seat) * 6) * 2;
    at(pen, { x, y: y + bob, scale: from.headScale }, () => {
      for (const side of [-1, 1]) {
        const flight = flights.get(`${from.seat}:${side}`);
        if (flight && playhead >= flight.ignites) {
          flying.push(flight);
          continue;
        }
        const rumbling =
          flight !== undefined && playhead >= flight.ignites - RUMBLE;
        const rot = rumbling
          ? Math.sin(playhead * 95 + from.seat) * 5
          : earTurn(seed, from.seat, side, playhead);
        ear(pen, side, rot, from);
      }
      rimLit(pen, HEAD, from.seat, from.stageLight);
    });
  }
  // The rockets go over every head.
  for (const flight of flying) rocketEar(pen, flight, seed + flight.from.seat);
}
