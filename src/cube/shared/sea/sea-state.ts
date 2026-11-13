import { HOUR_SECONDS, RADIANS_A_TURN, WAVES } from '../outside/swell';
import { FINEST } from './cascade';
import { type Sea, slopeVariance, windSea } from './spectrum';

/**
 * Where the swell travels: it arrives from the south-west, so toward the
 * north-east — radians from +x (east) toward +z (south).
 */
const SWELL_HEADING = -Math.PI / 4;

/** The swell out at sea, a narrow peak from a storm far away. */
const OPEN_SWELL: Sea = {
  peakOmega: (RADIANS_A_TURN * WAVES) / HOUR_SECONDS,
  significant: 0.5,
  sharpness: 8,
  towards: SWELL_HEADING,
  narrowness: 40,
  tailBend: 0,
};

/** The evening breeze's own waves: 3.5 m/s over 15 km of open water. */
const BREEZE = windSea(3.5, 15_000, -0.35);

/** Every sea the wave field is the sum of. */
export const SEAS: readonly Sea[] = [OPEN_SWELL, BREEZE];

/**
 * The variance, along one axis, of the slopes of ripples finer than any
 * cascade carries: roughness the surface has at every pixel.
 */
export const UNSEEN_SPREAD = slopeVariance(BREEZE, FINEST) / 2;
