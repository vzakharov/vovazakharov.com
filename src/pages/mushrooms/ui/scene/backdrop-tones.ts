/**
 * The backdrop's derived colours — each range mixed toward the air by its
 * distance, the ground's stops from the seam to the bottom edge — pure, so a
 * test can hold the depth they make without painting.
 */

import { channels, mix, packed } from './colour';
import type { MeadowLayout } from './layout';
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

/**
 * A layer of the sun's light over the sky: its colour, its `opacity` out to
 * `from` the sun's middle, and how far it reaches, `to`, thinning between the two —
 * in sun radii, or as shares of the screen's short side.
 */
type HaloLayer = {
  colour: number;
  opacity: number;
  from: number;
  to: number;
  per: 'sun' | 'screen';
};

/**
 * The sun's light over the sky, in the order it is laid on: a white halo,
 * reaching farthest and as far for its size on every screen, that pales the
 * blue round the sun; the warmth, kept inside the part the halo has already
 * paled, since yellow laid over blue mixes to a grey-teal; and the glow close
 * about the rays. Each thins from its full opacity at the sun's middle to
 * nothing at its `to` (`falloff`), so none has a plateau or an edge.
 */
const SUN_HALO: readonly HaloLayer[] = [
  { colour: PALETTE.highlight, opacity: 0.3, from: 0, to: 0.4, per: 'screen' },
  { colour: PALETTE.highlight, opacity: 0.92, from: 1.8, to: 3.5, per: 'sun' },
  { colour: PALETTE.skyWarm, opacity: 0.6, from: 1.8, to: 2.8, per: 'sun' },
  {
    colour: PALETTE.sunGlow,
    opacity: 0.6,
    from: 1,
    to: SUN_GLOW_REACH,
    per: 'sun',
  },
];

/** A layer's opacity `t` of the way from its `from` to its `to`, as a share of its full opacity: a smoothstep down, level only at either end. */
function falloff(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - clamped * clamped * (3 - 2 * clamped);
}

/** How far from the sun's middle, in CSS px, its light over the sky reaches: past it `litSkyAt` is the bare sky. */
export function haloReach({
  sun,
  width,
  height,
}: Pick<MeadowLayout, 'sun' | 'width' | 'height'>): number {
  const short = Math.min(width, height);
  return Math.max(
    ...SUN_HALO.map(({ to, per }) => to * (per === 'sun' ? sun.r : short)),
  );
}

/**
 * The sky at `x`, `y` with the sun's light laid over it, each layer in turn
 * at its opacity there, composited in full precision and rounded once, so
 * rounding never loses a layer however faint.
 */
export function litSkyAt(
  {
    sun,
    width,
    height,
    nearHills,
  }: Pick<MeadowLayout, 'sun' | 'width' | 'height' | 'nearHills'>,
  x: number,
  y: number,
): number {
  const short = Math.min(width, height);
  const away = Math.hypot(x - sun.x, y - sun.y);
  let lit = channels(skyAt(y / nearHills));
  for (const { colour, opacity, from, to, per } of SUN_HALO) {
    const over = channels(colour);
    const unit = per === 'sun' ? sun.r : short;
    const alpha =
      opacity * falloff((away - from * unit) / ((to - from) * unit));
    lit = {
      r: lit.r + (over.r - lit.r) * alpha,
      g: lit.g + (over.g - lit.g) * alpha,
      b: lit.b + (over.b - lit.b) * alpha,
    };
  }
  return packed(lit);
}

/**
 * How many cells of the painted sky span the screen's short side, and a sun
 * radius at the least, where its light curves the most.
 */
const SKY_CELLS = 48;
const SUN_CELLS = 5;

/**
 * The cells the sky is painted in down to the near hills: each shaded
 * between its corners' `litSkyAt`, so the sky and the sun's light on it are
 * one smooth fill, however many layers are laid on.
 */
export function skyGrid({
  width,
  height,
  nearHills,
  sun,
}: Pick<MeadowLayout, 'width' | 'height' | 'nearHills' | 'sun'>): {
  columns: number;
  rows: number;
  across: number;
  down: number;
} {
  const cell = Math.min(Math.min(width, height) / SKY_CELLS, sun.r / SUN_CELLS);
  const columns = Math.ceil(width / cell);
  const rows = Math.ceil(nearHills / cell);
  return { columns, rows, across: width / columns, down: nearHills / rows };
}

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
