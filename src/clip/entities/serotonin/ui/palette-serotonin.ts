/** The fall's colours; each kind has three colourings, chosen per fleck. */
export const SEROTONIN_PALETTE = {
  /** A capsule's two halves. */
  capsule: [
    ['#ff7eb0', '#fdf6f0'],
    ['#ffd84a', '#fdf6f0'],
    ['#7ec8ff', '#ff7eb0'],
  ],
  tablet: ['#fdf6f0', '#ffe0ec', '#e4f1ff'],
  flake: ['#fdf6f0', '#ffc2d8', '#fff1a8'],
  outline: '#2b2030',
  /** Far flecks are hazed toward the air behind them. */
  haze: '#c9b6d6',
} as const;
