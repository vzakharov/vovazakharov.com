import type { Seeded, Sized } from '@/kernel/shared/typings';

import { heading, noise, type Point } from '@/clip/shared/ink';

/** What a pattern of figures covers: an area of the stage, from the current origin. */
export type Covering = Partial<Seeded> & {
  area: Sized & { x?: number; y?: number };
};

/** Fills its `area` with the front row at the bottom. */
export type Audience = Covering & {
  /** How many rows, front to back; 3 by default. */
  rows?: number;
  /** The front row's head width in stage units; 150 by default. */
  headWidth?: number;
  /**
   * The playhead at which the ears start leaving their heads as rockets,
   * each in its own turn; they stay on for good when it is unset.
   */
  liftOff?: number;
};

/** One head in the audience, where it sits before it bobs. */
export type Seat = {
  spot: Point;
  /** Its size against a head's own units, 100 wide. */
  headScale: number;
  /** Its number, unique across the rows: seeds its noise. */
  seat: number;
  /** Its row, 0 the front. */
  rank: number;
  /** How much of the stage light reaches it, 0 to 1. */
  stageLight: number;
};

// How much smaller and higher each row back sits than the one before it.
const RECEDE = 0.72;
// Head to head in a row, in a head's own units.
const SPACING = 112;

/** The audience's heads, back row first so the front rows cover them. */
export function seats(audience: Audience): readonly Seat[] {
  const { area, rows = 3, headWidth = 150, seed = 0 } = audience;
  const { x = 0, y = 0, width, height } = area;
  const all: Seat[] = [];
  for (let rank = rows - 1; rank >= 0; rank -= 1) {
    const scale = (headWidth / 100) * RECEDE ** rank;
    const spacing = SPACING * scale;
    const baseline = y + height - rank * (height / (rows + 1));
    const shift =
      (rank % 2) * spacing * 0.5 + noise(seed, rank) * spacing * 0.2;
    for (let n = 0; n * spacing - spacing <= width; n += 1) {
      const seat = rank * 1000 + n;
      all.push({
        spot: [
          x +
            n * spacing -
            spacing / 2 +
            shift +
            noise(seed, seat + 500) * spacing * 0.12,
          baseline,
        ],
        headScale: scale * (1 + noise(seed, seat + 700) * 0.06),
        seat,
        rank,
        // The stage light reaches the back rows weaker.
        stageLight: 1 - rank * 0.25,
      });
    }
  }
  return all;
}

/** Where an ear's base sits on its head, in a head's own units. */
export const EAR_ROOT: Point = [24, -60];

/** One ear's flight, from its head to where it bursts. */
export type EarFlight = {
  from: Seat;
  /** -1 the left ear, 1 the right. */
  earSide: number;
  /** The playhead at which it leaves its head, and at which it bursts. */
  ignites: number;
  bursts: number;
  /** Where it bursts, in the audience's coordinates. */
  apex: Point;
};

/** How long an ear shakes on its head before it goes, in seconds. */
export const RUMBLE = 0.45;
// Over how many seconds the ears go, one after another.
const SPREAD = 2.6;
// The least an ear climbs above its head before it bursts, in stage units.
const CLEARANCE = 240;

/**
 * Every ear's flight once `liftOff` is set: each leaves in its own turn
 * within a few seconds of it, climbs faster and faster, and bursts high over
 * the stage. Fixed by the audience's seed.
 */
export function earFlights(audience: Audience): readonly EarFlight[] {
  const { liftOff, seed = 0 } = audience;
  if (liftOff === undefined) return [];
  return seats(audience).flatMap((from) =>
    [-1, 1].map((side): EarFlight => {
      const key = from.seat * 2 + (side + 1) / 2;
      const roll = (n: number): number => (noise(seed + 77, key + n) + 1) / 2;
      const leaves = liftOff + RUMBLE + roll(0) * SPREAD;
      const [x, y] = from.spot;
      // High over the stage, and always well above the head it left.
      const top = Math.min(60 + roll(3) * 240, y - CLEARANCE);
      return {
        from,
        earSide: side,
        ignites: leaves,
        bursts: leaves + 0.9 + roll(1) * 0.5,
        apex: [x + (roll(2) - 0.5) * 360, top],
      };
    }),
  );
}

/**
 * Where the ear of `flight` is at `playhead`, against where it sits, and how
 * it is tilted, in degrees; undefined while it is on its head or once it has
 * burst. It accelerates the whole way up, wagging less as it gains speed.
 */
export function earRise(
  flight: EarFlight,
  playhead: number,
): { lift: Point; tilt: number } | undefined {
  const { from, earSide: side, ignites: leaves, bursts, apex } = flight;
  if (playhead < leaves || playhead >= bursts) return undefined;
  const s = (playhead - leaves) / (bursts - leaves);
  const [rx, ry] = EAR_ROOT;
  const [sx, sy] = from.spot;
  const startX = sx + side * rx * from.headScale;
  const startY = sy + ry * from.headScale;
  const along = s * s;
  const wag = Math.sin(s * Math.PI * 5) * 10 * (1 - s);
  const dx = (apex[0] - startX) * along + wag;
  const dy = (apex[1] - startY) * along;
  // `heading` leans off straight down, so the line back from the apex gives the lean off straight up.
  const lean = heading(apex, [startX, startY]);
  return { lift: [dx, dy], tilt: lean * Math.min(1, s * 4) };
}
