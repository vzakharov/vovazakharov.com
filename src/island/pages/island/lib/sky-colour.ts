/** Space at orbit, sRGB. */
export const SPACE_COLOUR = 0x05_07_0c;
/** A pale day sky, sRGB. */
export const DAY_COLOUR = 0xa9_cb_ee;
/** A moonlit night sky, sRGB: dark, but a blue rather than space. */
export const NIGHT_COLOUR = 0x1a_24_40;

/** From here up the sky is space. */
const SPACE_FROM = 20_000_000;
/** From here down the sky is the air's. */
const DAY_FROM = 100_000;

/** sRGB hex `a` moved `t` of the way to `b`, channel by channel. */
function mixHex(a: number, b: number, t: number): number {
  let colour = 0;
  for (const shift of [16, 8, 0]) {
    const from = (a >> shift) & 0xff;
    const to = (b >> shift) & 0xff;
    colour |= Math.round(from + (to - from) * t) << shift;
  }
  return colour;
}

/**
 * The sky's colour as seen from `height` metres up with `day` of daylight
 * under the eye (1 by day, 0 by night), sRGB hex: space at orbit, from 100 km
 * down the air's colour — a pale day blue, a night blue by night — and between
 * them a blend by the logarithm of height, so the descent turns it evenly.
 */
export function skyColour(height: number, day: number): number {
  const share =
    Math.log(SPACE_FROM / Math.max(1, height)) /
    Math.log(SPACE_FROM / DAY_FROM);
  const t = Math.min(1, Math.max(0, share));
  return mixHex(SPACE_COLOUR, mixHex(NIGHT_COLOUR, DAY_COLOUR, day), t);
}
