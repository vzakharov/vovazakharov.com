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
 * The land's colour stops in linear RGB, as the renderer reads colours,
 * blended linearly between them — here and per fragment in the land's shader.
 * Below the first the colour is the first's, above the last the last's.
 */
export const LAND_STOPS: ReadonlyArray<readonly [number, Rgb]> = SRGB_STOPS.map(
  ([level, [r, g, b]]) => [level, [linear(r), linear(g), linear(b)]] as const,
);

/**
 * The colour at `height` into `out` at `offset`. Shallow ground keeps the
 * shore's sand, so a triangle crossing the coastline reads as beach; deeper,
 * it takes the sea's colour, so a skirt or floor that loses a depth tie
 * against the coplanar sea draws as the sea.
 */
export function landColour(
  height: number,
  out: Float32Array,
  offset: number,
): void {
  let index = LAND_STOPS.findIndex(([level]) => level > height);
  if (index === -1) index = LAND_STOPS.length;
  const lower = LAND_STOPS[Math.max(0, index - 1)];
  const upper = LAND_STOPS[Math.min(LAND_STOPS.length - 1, index)];
  if (lower === undefined || upper === undefined) {
    throw new RangeError('no colour stops');
  }
  const span = upper[0] - lower[0];
  const t =
    span === 0 ? 0 : Math.min(1, Math.max(0, (height - lower[0]) / span));
  for (let i = 0; i < 3; i++) {
    const a = lower[1][i] ?? 0;
    const b = upper[1][i] ?? 0;
    out[offset + i] = a + (b - a) * t;
  }
}

/** Linear RGB per height. */
export function landColours(heights: Float32Array): Float32Array<ArrayBuffer> {
  const colours = new Float32Array(heights.length * 3);
  for (const [v, height] of heights.entries()) {
    landColour(height, colours, v * 3);
  }
  return colours;
}
