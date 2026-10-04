/**
 * Where the dusk sky's stars stand: a dozen in its upper band, from a seed of
 * their own, so every paint of a screen sets them in the same places and the
 * meadow's `random` is never drawn from.
 */

import type { Circle } from '../../model/geometry';
import { between, mulberry32 } from '../../model/random';
import type { MeadowLayout } from './layout';
import { SUN_GLOW_REACH } from './sun-layout';

export const STAR_COUNT = 12;
const STAR_SEED = 0x5_7a_25;
/** The upper band they stand in, as shares of the way down to the near hills. */
export const STAR_BAND = [0.04, 0.42] as const;
/** A star's disc, as shares of the screen's short side. */
const STAR_SIZE = [0.003, 0.0055] as const;
/** How many places are drawn at most: past half of them, the spacing asked of each is halved. */
const STAR_TRIES = 400;

/**
 * The stars, each a disc in the upper band, clear of the sun's glow, where
 * the moon rises, and spaced half the side of an even share of the band
 * apart, so none clump — `STAR_COUNT` of them on every screen the sweeps
 * try, fewer only where the sun's glow fills the band.
 */
export function duskStars({
  width,
  height,
  nearHills,
  sun,
}: Pick<MeadowLayout, 'width' | 'height' | 'nearHills' | 'sun'>): Circle[] {
  const random = mulberry32(STAR_SEED);
  const [top, bottom] = [STAR_BAND[0] * nearHills, STAR_BAND[1] * nearHills];
  const short = Math.min(width, height);
  const spacing = Math.sqrt((width * (bottom - top)) / STAR_COUNT) / 2;
  const clearOfSun = sun.r * SUN_GLOW_REACH;
  const stars: Circle[] = [];
  for (
    let tries = 0;
    tries < STAR_TRIES && stars.length < STAR_COUNT;
    tries++
  ) {
    const star = {
      x: between(random, 0, width),
      y: between(random, top, bottom),
      r: short * between(random, ...STAR_SIZE),
    };
    const apart = tries < STAR_TRIES / 2 ? spacing : spacing / 2;
    if (
      Math.hypot(star.x - sun.x, star.y - sun.y) > clearOfSun &&
      stars.every(({ x, y }) => Math.hypot(star.x - x, star.y - y) >= apart)
    ) {
      stars.push(star);
    }
  }
  return stars;
}
