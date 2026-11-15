/**
 * The cloud field's numbers. The field is a function of place on the sphere
 * and of the shared clock alone, so every player sees the same sky;
 * `ui/cloud-nodes.ts` evaluates it per fragment.
 */

import { R } from '@/island/shared/globe';

/** The clouds' flat bases and their highest tops, metres over the sea. */
export const CLOUD_BASE = 1500;
export const CLOUD_TOP = 3500;

/** The share of the planet under cloud. */
export const CLOUD_AMOUNT = 0.45;

/** Waves of the field round the unit sphere: weather, its fronts, then the cells and their detail. */
export const WEATHER_WAVES = [2.5, 6.1] as const;
export const FRONT_WAVES = [19, 47] as const;
const CELL_METRES = [9000, 3800, 1600] as const;
export const CELL_WAVES = CELL_METRES.map((metres) => R / metres);

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
};

/** Where the field stands `seconds` into the shared clock. */
export function cloudClockAt(seconds: number): CloudClock {
  const turned = ((seconds % TURN) + TURN) % TURN;
  return { drift: (turned / TURN) * 2 * Math.PI, growth: turned / LIFETIME };
}
