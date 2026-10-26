import { mix, nudgeHue } from '@/mushrooms/shared/lib/colour';
import type { Nudged } from '@/mushrooms/shared/lib/random';
import { PALETTE } from '@/mushrooms/shared/ui/index.node-safe';

import { type Coloured, FLOWER_RANGES } from '../model/flower-genes';

/** The warmest a white flower turns, toward the yellow's cream: short of reading as a yellow. */
const WHITE_WARMTH = 0.08;

/**
 * A flower's petals: its colour's base, turned by its own `hueNudge`. A white
 * has no hue to turn, so its nudge warms it toward cream instead, by as much.
 */
export function petalColour({ colour, hueNudge }: Coloured & Nudged): number {
  const base = PALETTE.flowers[colour];
  if (colour !== 'white') return nudgeHue(base, hueNudge);
  const [least, most] = FLOWER_RANGES.hueNudge;
  const warmth = (hueNudge - least) / (most - least);
  return mix(base, PALETTE.flowers.yellow, warmth * WHITE_WARMTH);
}
