/**
 * The puffs `paintClouds` lays a cloud out of, and how far they reach, so
 * what takes a tap on a cloud and where its rain starts keep to what is
 * drawn. Every length is in the cloud's radii.
 */

export const PUFFS = {
  /** How many puffs stand in a row; the middle one is a full radius. */
  count: 5,
  /** How far apart neighbouring puffs' middles stand. */
  step: [0.75, 0.95],
  /** How big each puff beside the middle one is. */
  side: [0.55, 0.8],
  /** How far the lit layer leans toward the sun, and the shade away from it. */
  lean: 0.08,
  /** How far below the rest the shade layer sits. */
  sink: 0.14,
  /** Each layer's puffs against their own size, painted in this order. */
  scale: { shade: 1, lit: 0.96, face: 0.9 },
} as const;

const outermost = (PUFFS.count - 1) / 2;

/**
 * How far a cloud's drawn puffs reach from its middle at the most, however
 * they were shaped and wherever the sun stands: either side, above its
 * middle line and below it, its shaded underside included.
 */
export const PUFF_REACH = {
  across:
    outermost * PUFFS.step[1] + PUFFS.side[1] * PUFFS.scale.shade + PUFFS.lean,
  above: Math.max(
    PUFFS.scale.lit + PUFFS.lean,
    PUFFS.scale.shade - PUFFS.sink + PUFFS.lean,
    PUFFS.scale.face,
  ),
  below: PUFFS.scale.shade + PUFFS.sink + PUFFS.lean,
} as const;
