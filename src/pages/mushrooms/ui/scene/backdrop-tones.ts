/**
 * The backdrop's derived colours — each range mixed toward the air by its
 * distance, the ground's stops from the seam to the bottom edge — pure, so a
 * test can hold the depth they make without painting. Each is derived from a
 * set of source colours (`tonesOf`): the day's in `PALETTE`, the dusk's in
 * `DUSK`, or a blend of the two part way to dusk (`tonesAt`).
 */

import type { Ramped } from '../../model/motion';
import { channels, mix, packed } from './colour';
import type { MeadowLayout } from './layout';
import { DUSK, PALETTE } from './palette';
import { SEAM_REACH, seamTop } from './skyline';
import { SUN_GLOW_REACH } from './sun-layout';

/** A range's colours: `lit` at its highest crest, `foot` where the mist lies at its base. */
type RangeTones = { lit: number; foot: number };

/** How much further toward the air a range's foot is than its crest. */
const MIST = 0.25;

/** A colour stop: a share of the way along, and the colour there. */
type Stop = readonly [number, number];

/** A backdrop source colour's name, as `PALETTE` and its dusk twin `DUSK` both spell it. */
type ColourName = keyof typeof DUSK;

/** The source colours a backdrop is toned from, looked up by name: the day's, the dusk's, or a blend. */
type BackdropColours = (name: ColourName) => number;

/**
 * Everything toned from one set of source colours: the sky's stops, the
 * three ranges, the light a ridge catches on the sun's side, the ground's
 * stops and the brow's.
 */
export type Tones = {
  sky: readonly Stop[];
  ranges: Record<'farthest' | 'far' | 'near', RangeTones>;
  ridge: number;
  ground: readonly Stop[];
  brow: { crest: number; blade: number; bladeLit: number };
};

/**
 * The backdrop toned from the source colours `colour` names.
 *
 * The sky's stops run from its top to the near hills: blue paling to a clean
 * light blue, then to near white before the cream nearest the hills, so blue
 * and cream never mix to a grey on the way.
 *
 * Each range stands nearer the air the farther it stands; the farthest also
 * takes the sky's blue, which is what tells it from the far range at a
 * glance.
 *
 * The ground's stops, as shares of the way from its top to the bottom edge,
 * hold the near range's foot as far down as the seam wanders, so the seam
 * draws no line; lift to the lit ground over a band rather than a step, lit
 * and yellow only about the flowers' back row; and deepen to `groundDeep` at
 * the bottom, never past it.
 *
 * The brow, along the ground's cover row, has its crest a little lighter than
 * the ground there, catching the light, and the blades standing along it
 * dark against what sinks behind them and lit at their tips.
 */
function tonesOf(colour: BackdropColours): Tones {
  const skyTop = colour('skyTop');
  const highlight = colour('highlight');
  const air = colour('air');
  const range = (base: number, haze: number): RangeTones => ({
    lit: mix(base, air, haze),
    foot: mix(base, air, haze + MIST),
  });
  const ranges = {
    farthest: range(mix(colour('farHill'), skyTop, 0.45), 0.35),
    far: range(colour('farHill'), 0),
    near: range(colour('nearHill'), 0.05),
  };
  const ground: readonly Stop[] = [
    [0, ranges.near.foot],
    [SEAM_REACH, ranges.near.foot],
    [0.1, mix(colour('groundLit'), air, 0.15)],
    [0.18, colour('groundLit')],
    [0.44, colour('ground')],
    [0.92, mix(colour('ground'), colour('groundDeep'), 0.9)],
    [1, colour('groundDeep')],
  ];
  const seam = alongStops(ground, SEAM_REACH);
  return {
    sky: [
      [0, skyTop],
      [0.55, mix(skyTop, highlight, 0.4)],
      [0.8, mix(colour('skyHorizon'), highlight, 0.5)],
      [1, colour('skyLow')],
    ],
    ranges,
    ridge: colour('sunGlow'),
    ground,
    brow: {
      crest: mix(seam, colour('browLit'), 0.5),
      blade: mix(colour('tuftDark'), seam, 0.45),
      bladeLit: mix(colour('tuft'), colour('browLit'), 0.25),
    },
  };
}

/** The backdrop toned by day, and at full dusk. */
const DAY = tonesOf((name) => PALETTE[name]);
export const DUSK_TONES = tonesOf((name) => DUSK[name]);

/**
 * The backdrop toned `dusk` of the way to full dusk: its source colours
 * blended, which is what the dusk's baked pictures over the day's show, so
 * what is drawn live meets them seamlessly.
 */
export function tonesAt(dusk: number): Tones {
  if (dusk <= 0) return DAY;
  if (dusk >= 1) return DUSK_TONES;
  return tonesOf((name) => mix(PALETTE[name], DUSK[name], dusk));
}

/** The day's ranges, ground stops and brow (`tonesOf`). */
export const { ranges: RANGES, ground: GROUND_STOPS, brow: BROW } = DAY;

/** A crest's rim on the sun's side of its range, in `tones`. */
export function ridgeTone(lit: number, tones: Tones = DAY): number {
  return mix(lit, tones.ridge, 0.35);
}

/** The colour `at` of the way along `stops`, blended between the two either side. */
function alongStops(stops: readonly Stop[], at: number): number {
  const clamped = Math.min(1, Math.max(0, at));
  const next = stops.findIndex(([stop]) => stop >= clamped);
  const [to, toColour] = stops[Math.max(next, 1)] ?? [1, 0];
  const [from, fromColour] = stops[Math.max(next, 1) - 1] ?? [0, 0];
  return mix(fromColour, toColour, (clamped - from) / (to - from));
}

/** The sky's colour `down` of the way from the top of the screen to the near hills, in `tones`. */
export function skyAt(down: number, tones: Tones = DAY): number {
  return alongStops(tones.sky, down);
}

/**
 * A layer of the sun's light over the sky: its colour, its `opacity` out to
 * `from` the sun's middle, and how far it reaches, `to`, thinning between the two —
 * in sun radii, or as shares of the screen's short side.
 */
type HaloLayer = Ramped & {
  colour: number;
  opacity: number;
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

/** The ground's colour `down` of the way from its top to the bottom edge, in `tones`. */
export function groundAt(down: number, tones: Tones = DAY): number {
  return alongStops(tones.ground, down);
}

/** How many rows the ground's picture is toned in, from where the seam rises highest to the bottom edge. */
export const GROUND_BANDS = 32;

/**
 * The tone the ground's picture gives row `y` on `screen` in `tones`: its
 * band's, each band toned at its top as though the bands ran up to where the
 * seam rises highest.
 */
export function groundRowAt(
  screen: Pick<MeadowLayout, 'height' | 'groundTop'>,
  y: number,
  tones: Tones = DAY,
): number {
  const { height, groundTop } = screen;
  const top = seamTop(screen);
  const step = (height - top) / GROUND_BANDS;
  const band = Math.min(
    GROUND_BANDS - 1,
    Math.max(0, Math.floor((y - top) / step)),
  );
  return groundAt(
    (top + band * step - groundTop) / (height - groundTop),
    tones,
  );
}
