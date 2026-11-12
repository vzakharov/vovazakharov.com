import { FINEST } from './cascade';
import { HOUR, type Sea, slopeVariance, windSea } from './spectrum';

/** Waves the swell lands on the beach in an hour: one every 8.57 s. */
export const WAVES_PER_HOUR = 420;

/**
 * Where the swell travels: it arrives from the south-west, so toward the
 * north-east — radians from +x (east) toward +z (south).
 */
export const SWELL_HEADING = -Math.PI / 4;

/** The swell out at sea, a narrow peak from a storm far away. */
const SWELL: Sea = {
  peak: (2 * Math.PI * WAVES_PER_HOUR) / HOUR,
  height: 0.5,
  sharpness: 8,
  heading: SWELL_HEADING,
  spread: 40,
  tail: 0,
};

/** The evening breeze's own waves: 3.5 m/s over 15 km of open water. */
const BREEZE = windSea(3.5, 15_000, -0.35);

/** Every sea the wave field is the sum of. */
export const SEAS: readonly Sea[] = [SWELL, BREEZE];

/** The seed every viewer's sea is drawn from. */
export const SEA_SEED = { seed: 0x5e_a5_1d_e5 };

/**
 * The variance, along one axis, of the slopes of ripples finer than any
 * cascade carries: roughness the surface has at every pixel.
 */
export const UNSEEN_SPREAD = slopeVariance(BREEZE, FINEST) / 2;
