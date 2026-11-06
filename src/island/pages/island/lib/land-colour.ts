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
 * The ground's colour by height, read by the land and, over the floor beneath
 * it, by the sea: the deep sea's own colour, lightening up the shelf to a
 * turquoise shallow and to sand at the waterline, so the sea's colour meets the
 * land's there and the coastline draws with no seam; then green lowland, brown
 * upland, pale peaks. Stops are metres above the sea and sRGB.
 */
const SRGB_STOPS: ReadonlyArray<readonly [number, Rgb]> = [
  [-1500, channels(SEA_COLOUR)],
  [-250, channels(0x14_5a_86)],
  [-40, channels(0x23_86_a0)],
  [-6, channels(0x5c_b8_b4)],
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
 * The ground's colour stops in linear RGB, as the renderer reads colours,
 * which the shaders blend linearly per fragment. Below the first the colour is
 * the first's, above the last the last's. Ground under the sea takes the
 * colour the sea shows over it, so a skirt or floor that wins a depth tie
 * against the coplanar sea draws as the sea.
 */
export const GROUND_STOPS: ReadonlyArray<readonly [number, Rgb]> =
  SRGB_STOPS.map(
    ([level, [r, g, b]]) => [level, [linear(r), linear(g), linear(b)]] as const,
  );
