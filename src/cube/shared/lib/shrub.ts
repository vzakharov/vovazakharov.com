/**
 * A potted plant's outline, in metres up its own axis: what the decor builds
 * it from and what a floor's light takes its shadow from, so the shadow is
 * the plant's.
 */
export const SHRUB = {
  /** The pot: its radius at the floor and at its rim, and its height. */
  pot: { foot: 0.15, rim: 0.2, height: 0.36 },
  /** The stem's thickness, and how far its top leans along the wall. */
  stem: 0.035,
  lean: 0.02,
  /** How far out from the plant's back its axis stands. */
  out: 0.36,
  /** How tall a plant is, from a draw on [0, 1). */
  tall: (draw: number): number => 0.5 + draw * 0.6,
  /**
   * The foliage's radius at each height where it turns, bottom to top, the
   * height `at[0] + at[1] · tall`.
   */
  foliage: [
    { at: [0.3, 0.5], radius: 0.2 },
    { at: [0.3, 0.85], radius: 0.34 },
    { at: [0.3, 1.25], radius: 0.24 },
    { at: [0.3, 1.55], radius: 0.06 },
  ],
  /** How many sides the foliage has. */
  sides: 6,
} as const;

/** How high a turn of the foliage of a plant `tall` is. */
export const shrubHeight = (
  [base, perTall]: readonly [number, number],
  tall: number,
): number => base + perTall * tall;
