import {
  at,
  ellipse,
  ink,
  limb,
  noise,
  type Pen,
  type Point,
} from '@/clip/shared/ink';
import {
  type Audience,
  EAR_ROOT,
  type EarFlight,
  earFlights,
} from '@/clip/entities/bunny';

import { IGNITION_PALETTE } from './palette-ignition';

// Seconds before an ear leaves that its root starts to smoke.
const WARM = 2.2;
// A new puff of smoke every this many seconds, each living this long.
const PUFF_EVERY = 0.11;
const PUFF_LIFE = 1.3;
// How many times a second the sparks are thrown anew, and the most at once.
const SPARK_RATE = 24;
const SPARKS = 10;
const PUFF = ellipse([0, 0], 1);

/** Where `flight`'s ear grows out of its head, in the audience's coordinates. */
function rootOf({ from, earSide }: EarFlight): Point {
  const [x, y] = from.spot;
  return [
    x + earSide * EAR_ROOT[0] * from.headScale,
    y + EAR_ROOT[1] * from.headScale,
  ];
}

/** The smoke curling up off one ear's root, thicker the nearer it is to leaving. */
function smoke(pen: Pen, flight: EarFlight, key: number): void {
  const { playhead } = pen;
  const [x, y] = rootOf(flight);
  const scale = flight.from.headScale;
  const warmFrom = flight.ignites - WARM;
  const first = Math.ceil(
    Math.max(warmFrom, playhead - PUFF_LIFE) / PUFF_EVERY,
  );
  const last = Math.floor(Math.min(playhead, flight.ignites) / PUFF_EVERY);
  for (let n = first; n <= last; n += 1) {
    const age = playhead - n * PUFF_EVERY;
    const warmth = (n * PUFF_EVERY - warmFrom) / WARM;
    const fade = 1 - age / PUFF_LIFE;
    const drift = noise(key, n) * 30 + Math.sin(age * 4 + n) * 12;
    at(
      pen,
      {
        x: x + drift * scale * age,
        y: y - age * 70 * scale,
        scale: (5 + age * 30) * scale * (0.5 + warmth),
      },
      () => {
        ink(pen, PUFF, {
          fill:
            n % 3 === 0 ? IGNITION_PALETTE.smokeDark : IGNITION_PALETTE.smoke,
          stroke: null,
          alpha: 0.6 * fade * Math.min(1, warmth * 2),
          wobble: 0,
        });
      },
    );
  }
}

/** Sparks spat from one ear's root in its last second on the head, more of them as it nears. */
function sparks(pen: Pen, flight: EarFlight, key: number): void {
  const { playhead } = pen;
  const heat = 1 - (flight.ignites - playhead);
  if (heat <= 0 || playhead >= flight.ignites) return;
  const [x, y] = rootOf(flight);
  const scale = flight.from.headScale;
  const frame = Math.floor(playhead * SPARK_RATE);
  const count = Math.ceil(heat * heat * SPARKS);
  for (let n = 0; n < count; n += 1) {
    const angle = Math.PI * (0.5 + noise(key + frame, n) * 0.9);
    const reach = (20 + Math.abs(noise(key + frame, n + 50)) * 60) * scale;
    const [dx, dy] = [Math.cos(angle), Math.sin(angle)];
    const near = 6 * scale;
    limb(
      pen,
      [
        [x + dx * near, y + dy * near],
        [x + dx * reach, y + dy * reach],
      ],
      n % 2 === 0 ? IGNITION_PALETTE.spark : IGNITION_PALETTE.sparkHot,
      4 * scale,
      key + n,
    );
  }
}

/**
 * The ears getting ready to go: smoke curling off each ear's root for a
 * couple of seconds before it leaves, sparks spitting from it in its last
 * second. Drawn over `studioAudience` with the same `audience`, its
 * `liftOff` set; the last puffs clear soon after the ear is off.
 */
export function earIgnition(pen: Pen, audience: Audience): void {
  const { seed = 0 } = audience;
  for (const flight of earFlights(audience)) {
    if (pen.playhead < flight.ignites - WARM) continue;
    if (pen.playhead >= flight.ignites + PUFF_LIFE) continue;
    const key = seed * 7919 + flight.from.seat * 2 + (flight.earSide + 1) / 2;
    smoke(pen, flight, key);
    sparks(pen, flight, key);
  }
}
