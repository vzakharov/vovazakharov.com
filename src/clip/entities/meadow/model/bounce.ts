/** A bouncing block at one moment of its bounce, in its own units. */
export type Bounce = {
  /** How high it is off the ground. */
  airGap: number;
  /** Its height against its own: squashed below 1 on landing. */
  squash: number;
  /** How far it has tipped, in degrees. */
  tipDegrees: number;
};

// The share of a bounce spent squashed on the ground.
const LANDED = 0.15;
// How high a block bounces against its own size.
const BOUNCE_HEIGHT = 1.1;

/**
 * A block `phase` of the way through a bounce, `phase` in `[0, 1)`: landing
 * at 0 squashed, springing back, then a high arc that tips it one way going
 * up and back coming down, `lean` choosing which way and how far.
 */
export function bounceAt(phase: number, size: number, lean = 1): Bounce {
  const p = phase - Math.floor(phase);
  if (p < LANDED) {
    const g = p / LANDED;
    return { airGap: 0, squash: 1 - 0.25 * (1 - g) ** 2, tipDegrees: 0 };
  }
  const u = (p - LANDED) / (1 - LANDED);
  return {
    airGap: size * BOUNCE_HEIGHT * 4 * u * (1 - u),
    squash: 1 + 0.08 * Math.max(0, 1 - u / 0.25),
    tipDegrees: Math.sin(u * Math.PI * 2) * 9 * lean,
  };
}
