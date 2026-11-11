/** A colour as red, green and blue, each 0 to 1. */
export type Rgb = readonly [number, number, number];

/** The golden angle, in degrees: floors a turn apart never share a hue. */
const GOLDEN_ANGLE = 137.508;

/** Floor `n`'s hue, in degrees. */
export const hueOf = (n: number): number => (n * GOLDEN_ANGLE) % 360;

/** HSL to RGB as CSS does it, `hue` in degrees and the rest in `[0, 1]`. */
export function hsl(hue: number, saturation: number, lightness: number): Rgb {
  const reach = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12;
    return lightness - reach * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

/** `0xRRGGBB` as a colour. */
export const hex = (rgb: number): Rgb => [
  ((rgb >> 16) & 0xff) / 255,
  ((rgb >> 8) & 0xff) / 255,
  (rgb & 0xff) / 255,
];

/** A colour as `0xRRGGBB`, each channel rounded to its nearest step. */
export const toHex = ([r, g, b]: Rgb): number =>
  (Math.round(r * 255) << 16) |
  (Math.round(g * 255) << 8) |
  Math.round(b * 255);

const linearChannel = (value: number): number =>
  value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

/**
 * A colour as a screen shows it (sRGB) as the light it stands for, which is
 * what a shader lights and mixes.
 */
export const linear = ([r, g, b]: Rgb): Rgb => [
  linearChannel(r),
  linearChannel(g),
  linearChannel(b),
];

/** `rgb` as a CSS colour, for a canvas drawn into a texture. */
export const cssRgb = (rgb: Rgb): string =>
  `#${toHex(rgb).toString(16).padStart(6, '0')}`;
