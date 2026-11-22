/**
 * The cloud field's numbers. The field is a function of place on the sphere
 * and of the shared clock alone, so every player sees the same sky;
 * `ui/cloud-nodes.ts` evaluates it per fragment.
 */

import { R } from '@/island/shared/globe';

/** The lowest base and the highest top any low or deep cloud has, metres over the sea. */
export const LOWEST_BASE = 500;
export const HIGHEST_TOP = 11_500;
/** The height a ray's weather is read at: the middle of the fair-weather cumulus. */
export const WEATHER_AT = 2000;
/** The shell the ice cloud lies on: cirrus, a front's shield, a storm's anvil. */
export const ICE_AT = 10_500;

/**
 * Waves round the unit sphere of the four noises the weather map is drawn
 * from: the belts' meanders, the patches a regime holds, the clusters within
 * them, and their ragged edges.
 */
export const MAP_WAVES = [2.5, 5.3, 11, 41] as const;

/** The wavelength of a front's lumps, and the width of the cells a deck closes into and a cold outbreak opens into, metres. */
const MESO_METRES = [52_000, 48_000] as const;
export const MESO_WAVES = [R / MESO_METRES[0], R / MESO_METRES[1]] as const;
/** The cumulus scales, coarsest first, metres: a cloud, its towers, and the billows an eye under it tells. */
export const CELL_METRES = [9000, 3800, 1600, 640, 250] as const;
export const CELL_WAVES = CELL_METRES.map((metres) => R / metres);
/** Cloud streets: their spacing across the wind and their length along it, metres. */
const STREET_METRES = [7000, 90_000] as const;
export const STREET_WAVES = STREET_METRES.map((metres) => R / metres);
/** Cirrus: a streak's width and its length along the wind, coarse then fine, metres. */
const STREAK_METRES = [
  [45_000, 420_000],
  [9000, 110_000],
] as const;
export const STREAK_WAVES = STREAK_METRES.map(
  ([across, along]) => [R / across, R / along] as const,
);

/** Cyclones round each hemisphere's storm track. */
export const STORMS_ROUND = 7;
/** A cyclone's lives in one turn of the field: it is born, winds up and fades that many times. */
export const STORM_LIVES = 8;

/** The steady wind the field drifts on, eastward, metres a second at the equator. */
const DRIFT = 10;
/** Seconds in which a cell grows into another. */
const LIFETIME = 1500;
/** The field's own day, after which its drift and growth come round: both wrap unseen there. */
const TURN = (2 * Math.PI * R) / DRIFT;

export type CloudClock = {
  /** How far east the field has turned, radians. */
  readonly drift: number;
  /** How far the cells have grown, in waves of their own noise. */
  readonly growth: number;
  /** How many lives the cyclones have lived this turn, 0 up to `STORM_LIVES`. */
  readonly storms: number;
};

/** Where the field stands `seconds` into the shared clock. */
export function cloudClockAt(seconds: number): CloudClock {
  const turned = (((seconds % TURN) + TURN) % TURN) / TURN;
  return {
    drift: turned * 2 * Math.PI,
    growth: (turned * TURN) / LIFETIME,
    storms: turned * STORM_LIVES,
  };
}
