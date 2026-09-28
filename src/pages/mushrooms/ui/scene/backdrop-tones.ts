/**
 * The backdrop's derived colours — each range mixed toward the air by its
 * distance, the ground's stops from the seam to the bottom edge — pure, so a
 * test can hold the depth they make without painting.
 */

import { PALETTE } from './palette';

/** `from` blended toward `to` by `t`, channel by channel, rounded. */
export function blend(from: number, to: number, t: number): number {
  const channel = (shift: number) => {
    const a = (from >> shift) & 0xff;
    const b = (to >> shift) & 0xff;
    return Math.round(a + (b - a) * t) << shift;
  };
  return channel(16) | channel(8) | channel(0);
}

/** A range's colours: `lit` at its highest crest, `foot` where the mist lies at its base. */
export type RangeTones = { lit: number; foot: number };

/** How much further toward the air a range's foot is than its crest. */
const MIST = 0.25;

function range(colour: number, haze: number): RangeTones {
  return {
    lit: blend(colour, PALETTE.air, haze),
    foot: blend(colour, PALETTE.air, haze + MIST),
  };
}

/**
 * The three ranges, farthest first, each nearer the air the farther it
 * stands; the farthest also takes the sky's blue, which is what tells it from
 * the far range at a glance.
 */
export const RANGES = {
  farthest: range(blend(PALETTE.farHill, PALETTE.skyTop, 0.45), 0.35),
  far: range(PALETTE.farHill, 0),
  near: range(PALETTE.nearHill, 0.05),
} as const;

/** A crest's rim on the sun's side of its range. */
export function ridgeTone(lit: number): number {
  return blend(lit, PALETTE.sunGlow, 0.35);
}

/** A colour stop: a share of the way along, and the colour there. */
type Stop = readonly [number, number];

/** The colour `at` of the way along `stops`, blended between the two either side. */
function alongStops(stops: readonly Stop[], at: number): number {
  const clamped = Math.min(1, Math.max(0, at));
  const next = stops.findIndex(([stop]) => stop >= clamped);
  const [to, toColour] = stops[Math.max(next, 1)] ?? [1, 0];
  const [from, fromColour] = stops[Math.max(next, 1) - 1] ?? [0, 0];
  return blend(fromColour, toColour, (clamped - from) / (to - from));
}

/**
 * The sky's stops from its top to the near hills: blue paling to a clean
 * light blue, and the cream kept to the part nearest the hills, so the
 * middle never greys where blue and cream would meet.
 */
const SKY_STOPS: readonly Stop[] = [
  [0, PALETTE.skyTop],
  [0.55, blend(PALETTE.skyTop, PALETTE.highlight, 0.4)],
  [0.8, blend(PALETTE.skyLow, PALETTE.highlight, 0.3)],
  [1, PALETTE.skyLow],
];

/** The sky's colour `down` of the way from the top of the screen to the near hills. */
export function skyAt(down: number): number {
  return alongStops(SKY_STOPS, down);
}

/**
 * The ground's colour stops, as shares of the way from its top to the bottom
 * edge: it opens on the near range's foot, so the seam draws no line; is lit
 * and yellow only behind the flowers' back row; and deepens to `groundDeep`
 * at the bottom, never past it.
 */
export const GROUND_STOPS: readonly Stop[] = [
  [0, RANGES.near.foot],
  [0.05, blend(PALETTE.groundLit, PALETTE.air, 0.12)],
  [0.14, PALETTE.groundLit],
  [0.42, PALETTE.ground],
  [0.92, blend(PALETTE.ground, PALETTE.groundDeep, 0.9)],
  [1, PALETTE.groundDeep],
];

/** The ground's colour `down` of the way from its top to the bottom edge. */
export function groundAt(down: number): number {
  return alongStops(GROUND_STOPS, down);
}
