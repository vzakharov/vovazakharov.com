/**
 * The backdrop's derived colours — each range mixed toward the air by its
 * distance, the ground's stops from the seam to the bottom edge — pure, so a
 * test can hold the depth they make without painting.
 */

import { mix } from './colour';
import { PALETTE } from './palette';
import { SEAM_REACH } from './skyline';
import { SUN_GLOW_REACH } from './sun-layout';

/** A range's colours: `lit` at its highest crest, `foot` where the mist lies at its base. */
export type RangeTones = { lit: number; foot: number };

/** How much further toward the air a range's foot is than its crest. */
const MIST = 0.25;

function range(colour: number, haze: number): RangeTones {
  return {
    lit: mix(colour, PALETTE.air, haze),
    foot: mix(colour, PALETTE.air, haze + MIST),
  };
}

/**
 * The three ranges, farthest first, each nearer the air the farther it
 * stands; the farthest also takes the sky's blue, which is what tells it from
 * the far range at a glance.
 */
export const RANGES = {
  farthest: range(mix(PALETTE.farHill, PALETTE.skyTop, 0.45), 0.35),
  far: range(PALETTE.farHill, 0),
  near: range(PALETTE.nearHill, 0.05),
} as const;

/** A crest's rim on the sun's side of its range. */
export function ridgeTone(lit: number): number {
  return mix(lit, PALETTE.sunGlow, 0.35);
}

/** A colour stop: a share of the way along, and the colour there. */
type Stop = readonly [number, number];

/** The colour `at` of the way along `stops`, blended between the two either side. */
function alongStops(stops: readonly Stop[], at: number): number {
  const clamped = Math.min(1, Math.max(0, at));
  const next = stops.findIndex(([stop]) => stop >= clamped);
  const [to, toColour] = stops[Math.max(next, 1)] ?? [1, 0];
  const [from, fromColour] = stops[Math.max(next, 1) - 1] ?? [0, 0];
  return mix(fromColour, toColour, (clamped - from) / (to - from));
}

/**
 * The sky's stops from its top to the near hills: blue paling to a clean
 * light blue, then to near white before the cream nearest the hills, so blue
 * and cream never mix to a grey on the way.
 */
const SKY_STOPS: readonly Stop[] = [
  [0, PALETTE.skyTop],
  [0.55, mix(PALETTE.skyTop, PALETTE.highlight, 0.4)],
  [0.8, mix(PALETTE.skyHorizon, PALETTE.highlight, 0.5)],
  [1, PALETTE.skyLow],
];

/** The sky's colour `down` of the way from the top of the screen to the near hills. */
export function skyAt(down: number): number {
  return alongStops(SKY_STOPS, down);
}

/** A disc of the sun's light over the sky, round the sun's middle: its colour, its alpha, and its radius in sun radii. */
export type HaloDisc = readonly [colour: number, alpha: number, radius: number];

/** `count` discs of `colour` from `outer` sun radii in to `inner`, each at `alpha` of `alphaAt` of its share of the way in. */
function discs(
  colour: number,
  count: number,
  [outer, inner]: readonly [number, number],
  alphaAt: (inward: number) => number,
): HaloDisc[] {
  return Array.from({ length: count }, (_, index) => {
    const inward = index / (count - 1);
    return [colour, alphaAt(inward), outer + (inner - outer) * inward];
  });
}

/**
 * The sun's light over the sky, in painting order, stacked from the outside
 * in so it thickens toward the sun with no edge of its own: a white halo,
 * reaching farthest, that pales the blue round the sun; the warmth, kept
 * inside the part the halo has already paled, since yellow laid over blue
 * mixes to a grey-teal; and the glow close about the rays.
 */
export const SUN_HALO: readonly HaloDisc[] = [
  ...discs(PALETTE.highlight, 44, [9, 1], () => 0.045),
  ...discs(PALETTE.skyWarm, 26, [3.5, 1], () => 0.048),
  ...discs(PALETTE.sunGlow, 14, [SUN_GLOW_REACH, 1], (inward) => 0.04 * inward),
];

/**
 * The ground's colour stops, as shares of the way from its top to the bottom
 * edge: it holds the near range's foot as far down as the seam wanders, so
 * the seam draws no line; lifts to the lit ground over a band rather than a
 * step, and is lit and yellow only about the flowers' back row; and deepens
 * to `groundDeep` at the bottom, never past it.
 */
export const GROUND_STOPS: readonly Stop[] = [
  [0, RANGES.near.foot],
  [SEAM_REACH, RANGES.near.foot],
  [0.1, mix(PALETTE.groundLit, PALETTE.air, 0.15)],
  [0.18, PALETTE.groundLit],
  [0.44, PALETTE.ground],
  [0.92, mix(PALETTE.ground, PALETTE.groundDeep, 0.9)],
  [1, PALETTE.groundDeep],
];

/** The ground's colour `down` of the way from its top to the bottom edge. */
export function groundAt(down: number): number {
  return alongStops(GROUND_STOPS, down);
}
