import type { Vec2 } from '@/cube/shared/lib/vec';

import type { Scene } from './mix';
import { coastOf, type Sea } from './shore';

/** The round island's radius at the still sea, in metres. */
export const RADIUS = 30;

/** Seconds between two waves of the test sea. */
export const PERIOD = 10;

/**
 * A round island with a sea that rises and falls on every shore at once,
 * `swell` metres either way: the least a surf can be read from.
 */
const swelling =
  (swell: number) =>
  (seconds: number): number =>
    swell * Math.sin((2 * Math.PI * seconds) / PERIOD);

export const seaOf = (swell = 0.2): Sea => ({
  islandHeight: ([x, z]) => 1.5 * (1 - (x * x + z * z) / RADIUS ** 2),
  waterAt: () => swelling(swell),
});

/** The round island with the cube `cube` from its middle. */
export const sceneOf = (cube: Vec2 = [0, 0], swell?: number): Scene => ({
  coast: coastOf(seaOf(swell), [0, 0]),
  cube,
});

/** A quarter of the way into a wave: the water climbing its fastest. */
export const RISING = 0;
/** Half a wave on: the water falling its fastest. */
export const FALLING = PERIOD / 2;
