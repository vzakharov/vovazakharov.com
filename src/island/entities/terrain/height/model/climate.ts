import { length, R, type Vec3 } from '@/island/shared/globe';

import type { CoastDistance } from './height-sphere';
import { noiseSalt, valueNoise3 } from './value-noise';

/** A place's climate: what the relief and the ground's look both read. */
export type Climate = {
  /** The year's mean at the surface, °C. */
  readonly temperature: number;
  /** From 0, dry, to 1, wet. */
  readonly moisture: number;
};

/** The year's mean at sea level on the equator, °C. */
const EQUATOR_CELSIUS = 28;
/** How much colder the poles are than the equator at sea level, °C. */
const POLAR_DROP_CELSIUS = 46;
/** How much colder air is per metre of height, °C. */
const LAPSE_CELSIUS_PER_METRE = 0.0065;

/** The mean moisture of the latitude belts, and how far they swing about it. */
const BELT_MEAN = 0.5;
const BELT_SWING = 0.38;
/**
 * How far the belts wander north and south of their mean latitude, radians
 * (6°), over `WANDER_METRES`: a belt's edge is a slow curve, never a parallel.
 */
const WANDER_RADIANS = 0.105;
const WANDER_METRES = 3_000_000;
/** The noise layer the wander is drawn from, clear of the relief's octaves. */
const WANDER_LAYER = 1000;

/** The most a continent's interior dries a belt, as a share of its dryness. */
const CONTINENTAL_DRYING = 0.6;
/** The distance inland over which that drying reaches ~63% of its full size. */
const CONTINENTAL_REACH_METRES = 1_200_000;

/**
 * The climate over direction `p` (any length but zero) at `height` metres
 * above the sea — a pure function of the coast's distance, the seed (read as
 * a 32-bit integer), the direction and the height. North is `+Y`, the planet
 * frame's axis.
 *
 * Temperature falls from the equator to the poles with the square of the
 * latitude's sine, and with height above the sea by the lapse rate; it is
 * strictly colder higher and never warmer poleward. Moisture follows four
 * belts a hemisphere — wet at the equator, dry near 30°, wet near 60°, dry at
 * the pole — which wander by the seed, and the dry ones dry further with
 * distance from the sea.
 */
export function climateAtSphere(
  coast: CoastDistance,
  seed: number,
  p: Vec3,
  height: number,
): Climate {
  const scale = 1 / length(p);
  const x = p[0] * scale;
  const y = p[1] * scale;
  const z = p[2] * scale;
  const temperature =
    EQUATOR_CELSIUS -
    POLAR_DROP_CELSIUS * y * y -
    LAPSE_CELSIUS_PER_METRE * Math.max(0, height);

  const k = R / WANDER_METRES;
  const wander =
    WANDER_RADIANS *
    valueNoise3(noiseSalt(seed, WANDER_LAYER), x * k, y * k, z * k);
  const latitude = Math.asin(Math.max(-1, Math.min(1, y)));
  const belt = BELT_MEAN + BELT_SWING * Math.cos(6 * (latitude + wander));
  const inland = Math.max(0, coast([x, y, z]));
  const interior = 1 - Math.exp(-inland / CONTINENTAL_REACH_METRES);
  const moisture = belt * (1 - CONTINENTAL_DRYING * (1 - belt) * interior);
  return { temperature, moisture };
}
