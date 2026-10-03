/**
 * Each part of the backdrop's depth, back to front, all under everything in
 * the meadow, so a column a repaint adds stacks where its picture does.
 */
export const DEPTHS = {
  sky: -9,
  glow: -8,
  sun: -7,
  // Behind the clouds, as a rainbow stands in the sky beyond them.
  rainbow: -6.5,
  clouds: -6,
  farHills: -5,
  nearHills: -4,
  ground: -3,
  brow: -2.5,
  wash: -2,
  grain: -1,
} as const;
