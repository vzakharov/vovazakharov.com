/** The sea's colour, sRGB. */
export const SEA_COLOUR = 0x0b_34_62;

/** A colour's channels, each in `[0, 1]`. */
export type Rgb = readonly [number, number, number];

const channels = (hex: number): Rgb => [
  ((hex >> 16) & 0xff) / 255,
  ((hex >> 8) & 0xff) / 255,
  (hex & 0xff) / 255,
];

const linear = (c: number) =>
  c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/** An sRGB colour as the renderer reads colours. */
const toLinear = ([r, g, b]: Rgb): Rgb => [linear(r), linear(g), linear(b)];

/** The top of the shore's sand, metres above the sea. */
export const SHORE_TOP = 20;

/**
 * Where each band of the land gives way to the next, metres above the sea,
 * as the pair of heights the one fades into the other between: lowland green
 * to brown upland, upland to the mountains' bare ground, and the height snow
 * lies from on level ground.
 */
export const BAND_HEIGHTS: {
  readonly upland: readonly [from: number, to: number];
  readonly mountain: readonly [from: number, to: number];
  readonly snowLine: number;
} = {
  upland: [260, 400],
  mountain: [950, 1200],
  snowLine: 2200,
};

/** What the land above the beach is made of, each material's colour in linear RGB. */
export const LAND_PALETTE = {
  /** Lowland meadow in growth, and gone to seed. */
  meadow: toLinear([0.3, 0.5, 0.2]),
  hay: toLinear([0.56, 0.57, 0.3]),
  /** Rushes in a meadow's damp hollow. */
  rush: toLinear([0.22, 0.4, 0.17]),
  /** The trees' own leaf colours, linear as their meshes carry them: a canopy from over it is their mix, shaded. */
  broadleaf: [0.058, 0.14, 0.024],
  conifer: [0.028, 0.082, 0.036],
  /** Beach sand dried pale above the tide, and the wrack a storm left on it. */
  sandDry: toLinear([0.9, 0.85, 0.68]),
  wrack: toLinear([0.22, 0.18, 0.12]),
  /** Marram, the pale grass that holds a dune. */
  marram: toLinear([0.6, 0.63, 0.38]),
  /** The ground under a canopy. */
  litter: toLinear([0.36, 0.3, 0.19]),
  moss: toLinear([0.27, 0.36, 0.16]),
  /** Bare earth where a lowland slope is too steep to hold turf. */
  earth: toLinear([0.47, 0.37, 0.25]),
  /** The upland: tussock, heath between it, stony soil under both. */
  tussock: toLinear([0.55, 0.46, 0.31]),
  heath: toLinear([0.33, 0.28, 0.18]),
  stony: toLinear([0.45, 0.41, 0.35]),
  /** Alpine turf, the last green under the rock. */
  turf: toLinear([0.4, 0.44, 0.24]),
  /** Rock's beds, the darker and the lighter, and the scree under a face. */
  rockDark: toLinear([0.33, 0.31, 0.3]),
  rockLight: toLinear([0.56, 0.53, 0.5]),
  scree: toLinear([0.55, 0.53, 0.5]),
  snow: toLinear([0.86, 0.88, 0.92]),
} as const satisfies Record<string, Rgb>;

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
  // Water takes the red out of the sand under it within a metre, so only the
  // last hand's depth over a beach reads as sand.
  [-1.2, channels(0x84_cc_bf)],
  [-0.3, channels(0xb4_d2_b8)],
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
  SRGB_STOPS.map(([level, colour]) => [level, toLinear(colour)] as const);
