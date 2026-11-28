/** Three colourings of one kind, chosen per fleck. */
type Colourings<Colour> = readonly [Colour, Colour, Colour];

/** What a fall is coloured with: three colourings per kind, and the ink. */
export type SerotoninPalette = {
  /** A capsule's two halves. */
  capsule: Colourings<readonly [string, string]>;
  tablet: Colourings<string>;
  flake: Colourings<string>;
  outline: string;
};

/** Pharmacy pastels: the fall in the ward and the snow globe. */
export const SEROTONIN_PALETTE = {
  capsule: [
    ['#ff7eb0', '#fdf6f0'],
    ['#ffd84a', '#fdf6f0'],
    ['#7ec8ff', '#ff7eb0'],
  ],
  tablet: ['#fdf6f0', '#ffe0ec', '#e4f1ff'],
  flake: ['#fdf6f0', '#ffc2d8', '#fff1a8'],
  outline: '#2b2030',
} as const satisfies SerotoninPalette;

/** Kids'-show primaries: the same pills thrown as confetti over the meadow. */
export const CONFETTI_PALETTE = {
  capsule: [
    ['#ff3b5c', '#ffd23f'],
    ['#2ec4b6', '#ff3b5c'],
    ['#3a86ff', '#ffd23f'],
  ],
  tablet: ['#ffd23f', '#ff7ac8', '#7ae582'],
  flake: ['#ff3b5c', '#3a86ff', '#ffd23f'],
  outline: '#1d1530',
} as const satisfies SerotoninPalette;
