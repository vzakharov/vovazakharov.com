/**
 * The planet's air as numbers: two layers thinning with height, how much of
 * each lies along a ray, and what the sun keeps of its light through it.
 * `ui/sky-nodes.ts` holds the same column per fragment.
 */

import { R } from '@/island/shared/globe';

import type { Rgb } from './land-colour';

/** A layer of air whose density falls by `e` every `scale` metres. */
export type Layer = {
  readonly scale: number;
  /** The `8·scale / (π·R)` under the column's root: what bends it at the horizon. */
  readonly rounding: number;
};

const layer = (scale: number): Layer => ({
  scale,
  rounding: (8 * scale) / (Math.PI * R),
});

/** The gas, which scatters blue. */
export const GAS = layer(8000);
/** The haze low over the ground, which scatters every colour alike, forward. */
export const HAZE = layer(1200);

/** What a metre of the gas at sea level scatters out of a ray, per channel. */
export const GAS_PER_METRE: Rgb = [5.8e-6, 13.5e-6, 33.1e-6];
/** What a metre of the haze at sea level scatters out of a ray. */
export const HAZE_PER_METRE = 1.2e-5;

/** Space at orbit, linear RGB. */
export const SPACE_COLOUR: Rgb = [0.0015, 0.0021, 0.0037];

/** From here up the eye has no air round it. */
const SPACE_FROM = 1_000_000;
/** From here down the eye keeps `AIR_ALOFT` at the least. */
const AIR_FROM = 100_000;
/**
 * The gas the eye keeps round it up to `AIR_FROM`, as a share of sea level's:
 * the real air is gone by 60 km, and a sky going black there would leave the
 * rest of the descent with none.
 */
const AIR_ALOFT = 0.16;

export type EyeAir = {
  /** The gas's density at the eye, sea level's being 1. */
  readonly air: number;
  /** What of it is more than the real air's: the sky's alone, so it veils no ground. */
  readonly excess: number;
};

/**
 * The least steepness the eye's excess is spread along: it lies round the eye
 * as a level sheet one scale height deep, so a ray along it still leaves it,
 * and from orbit no band of sky stands level with the eye.
 */
export const EXCESS_LEAST_STEEP = 0.3;

/**
 * The gas round an eye `height` metres up: the real air's while that is the
 * denser, then `AIR_ALOFT` to `AIR_FROM`, thinning from there by the logarithm
 * of height to none at `SPACE_FROM`, so the descent turns the sky evenly.
 */
export function airAtEye(height: number): EyeAir {
  const real = Math.exp(-Math.max(0, height) / GAS.scale);
  const share =
    Math.log(SPACE_FROM / Math.max(1, height)) /
    Math.log(SPACE_FROM / AIR_FROM);
  const air = Math.max(real, AIR_ALOFT * Math.min(1, Math.max(0, share)));
  return { air, excess: air - real };
}

/** Chapman's grazing function for a ray `cosine` off the zenith, cosine not negative. */
const chapman = (cosine: number, { rounding }: Layer) =>
  2 / (cosine + Math.sqrt(cosine * cosine + rounding));

/** The lowest height a ray from `height` reaches when it leaves `cosine` off the zenith, downward. */
const lowestAlong = (cosine: number, height: number) =>
  height -
  ((R + height) * cosine * cosine) /
    (1 + Math.sqrt(Math.max(0, 1 - cosine * cosine)));

/**
 * The metres of sea-level air of `of` along a ray from `height`, `cosine` off
 * the zenith, out to space; `excess` is `EyeAir`'s. A ray going down passes
 * its lowest point first; one that would meet the ground counts as grazing it.
 */
export function airColumn(
  cosine: number,
  height: number,
  of: Layer,
  excess = 0,
): number {
  const density = (h: number) => Math.exp(-h / of.scale);
  const steep = Math.abs(cosine);
  const sheet = (excess * of.scale) / Math.max(steep, EXCESS_LEAST_STEEP);
  const up = density(height) * chapman(steep, of) * of.scale;
  if (cosine >= 0) return up + sheet;
  const lowest = Math.max(0, lowestAlong(cosine, height));
  return 2 * density(lowest) * chapman(0, of) * of.scale - up + sheet;
}

/**
 * What a metre of the gas at sea level takes from a lamp's own light: what
 * it scatters, and the ozone's share of green and red, which keeps a low
 * sun's sky from turning green.
 */
export const LIGHT_PER_METRE: Rgb = [8.3e-6, 17.9e-6, 33.6e-6];

/** The metres of sea-level air a lamp's ray is worth per metre it runs under the ground: the planet's shadow, red at its edge. */
export const SHADOW = 30;

/** The share of a light's own colour that reaches `height` from `sine` of elevation. */
export function lightThrough(sine: number, height: number): Rgb {
  const buried = sine < 0 ? Math.max(0, -lowestAlong(sine, height)) : 0;
  const column = airColumn(sine, height, GAS) + SHADOW * buried;
  const [r, g, b] = LIGHT_PER_METRE;
  return [Math.exp(-r * column), Math.exp(-g * column), Math.exp(-b * column)];
}

/** The least of the sun's light the eye still adapts to. */
const DIMMEST = 0.1;
/** How far the eye adapts: 0 not at all, 1 until a setting sun is as bright as noon's. */
const ADAPTING = 0.5;

/**
 * How much the eye opens to a sun whose light arrives as `through`: 1 under
 * a high sun, more as it reddens, so a sunset sky keeps its light.
 */
export const adaptedTo = (through: Rgb): number =>
  Math.max(DIMMEST, ...through) ** -ADAPTING;

/** `through` at full strength: the colour alone of a light that crossed the air. */
export function tintOf(through: Rgb): Rgb {
  const most = Math.max(DIMMEST, ...through);
  const [r, g, b] = through;
  return [Math.min(1, r / most), Math.min(1, g / most), Math.min(1, b / most)];
}
