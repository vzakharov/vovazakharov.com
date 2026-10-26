/**
 * The seeded flowers' far band: ground past the walking brow that only the
 * eye risen in flight sees (`FLIGHT_RISE`). It starts where the tallest
 * seeded flower has sunk away behind the walking brow (`sunkAway`), so
 * steps sees none of it, and reaches up to `FLIGHT_TOP` under flight's brow.
 */

import { FLIGHT_RISE } from '../../model/eye-height';
import { downOf, groundOfPlane, planeOf, zAt } from '../../model/ground';
import { type Band, bandSlots } from './flower-layout';

/** How far down the ground's depth the point `distance` straight ahead of the opening eye stands. */
function downAhead(distance: number): number {
  return downOf(groundOfPlane({ x: 0, y: distance }).z);
}

/**
 * How far past the ground's top row, as a share of its depth, a seeded
 * flower's foot stands once the walking brow covers all but `SHOWN_LEAST` of
 * it at its tallest, on every screen.
 */
const SUNK_AWAY = 0.1;

/**
 * How far down flight's ground, as a share of its depth, the far band's
 * farthest foot stands: near the brow, so the band shows depth, its heads
 * still standing clear over the seam's grass.
 */
const FLIGHT_TOP = 0.065;

/** How far down the ground's depth, from the opening eye, the far band lies: from `FLIGHT_TOP` in flight to `SUNK_AWAY`. */
const FAR_DOWN = [
  downAhead(FLIGHT_RISE * planeOf({ x: 0, z: zAt(FLIGHT_TOP) }).y),
  -SUNK_AWAY,
] as const;

/**
 * The far band's slots in each half of the world: across its half, and how
 * far down the band from its far edge, uneven both ways so they read as
 * grown rather than planted in a row.
 */
const FAR_SHARES = [
  [0.1, 0.35],
  [0.36, 0.85],
  [0.6, 0.15],
  [0.86, 0.6],
] as const;

const [FAR_TOP, FAR_FOOT] = FAR_DOWN;

/** The seeded flowers' band in flight's deeper ground, laid out after `NEAR_BAND`. */
export const FAR_BAND: Band = {
  spots: FAR_SHARES.map(([across, down]) => [
    across,
    FAR_TOP + down * (FAR_FOOT - FAR_TOP),
  ]),
  jitter: [0.06, 0.15 * (FAR_FOOT - FAR_TOP)],
  down: FAR_DOWN,
};

/** How many seeded flowers the far band holds. */
export const FAR_FLOWERS = bandSlots(FAR_BAND);
