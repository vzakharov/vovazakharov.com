/** The sea's colour, sRGB. */
export const SEA_COLOUR = 0x0b_34_62;

type Rgb = readonly [number, number, number];

const channels = (hex: number): Rgb => [
  ((hex >> 16) & 0xff) / 255,
  ((hex >> 8) & 0xff) / 255,
  (hex & 0xff) / 255,
];

const linear = (c: number) =>
  c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/** The top of the shore's sand, metres above the sea. */
export const SHORE_TOP = 20;

/**
 * The land's colour by height: the sea's own colour on the floor, shore sand,
 * green lowland, brown upland, pale peaks. Stops are metres above the sea and
 * sRGB.
 */
const SRGB_STOPS: ReadonlyArray<readonly [number, Rgb]> = [
  [-20, channels(SEA_COLOUR)],
  [0, [0.86, 0.8, 0.6]],
  [SHORE_TOP, [0.84, 0.78, 0.57]],
  [60, [0.38, 0.57, 0.27]],
  [450, [0.27, 0.45, 0.2]],
  [800, [0.5, 0.4, 0.27]],
  [1150, [0.44, 0.35, 0.26]],
  [1400, [0.72, 0.7, 0.67]],
  [1650, [0.94, 0.94, 0.95]],
];

/**
 * The land's colour stops in linear RGB, as the renderer reads colours, which
 * the land's shader blends linearly per fragment. Below the first the colour
 * is the first's, above the last the last's. Shallow ground keeps the shore's
 * sand, so a triangle crossing the coastline reads as beach; deeper, it takes
 * the sea's colour, so a skirt or floor that loses a depth tie against the
 * coplanar sea draws as the sea.
 */
export const LAND_STOPS: ReadonlyArray<readonly [number, Rgb]> = SRGB_STOPS.map(
  ([level, [r, g, b]]) => [level, [linear(r), linear(g), linear(b)]] as const,
);
