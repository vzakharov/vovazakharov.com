/** Space at orbit, sRGB. */
export const SPACE_COLOUR = 0x05_07_0c;
/** A pale day sky, sRGB. */
export const DAY_COLOUR = 0xa9_cb_ee;

/** From here up the sky is space. */
const SPACE_FROM = 20_000_000;
/** From here down the sky is day. */
const DAY_FROM = 100_000;

/**
 * The sky's colour as seen from `height` metres up, sRGB hex: space at orbit,
 * a pale day blue from 100 km down, and between them a blend by the
 * logarithm of height, so the descent turns it evenly.
 */
export function skyColour(height: number): number {
  const share =
    Math.log(SPACE_FROM / Math.max(1, height)) / Math.log(SPACE_FROM / DAY_FROM);
  const t = Math.min(1, Math.max(0, share));
  let colour = 0;
  for (const shift of [16, 8, 0]) {
    const a = (SPACE_COLOUR >> shift) & 0xff;
    const b = (DAY_COLOUR >> shift) & 0xff;
    colour |= Math.round(a + (b - a) * t) << shift;
  }
  return colour;
}
