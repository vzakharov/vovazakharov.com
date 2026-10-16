import { FLOWER_RANGES, type FlowerGenes } from '../../model/flower-genes';
import { mix, nudgeHue } from './colour';
import { PALETTE } from './palette';

/** The warmest a white flower turns, toward the yellow's cream: short of reading as a yellow. */
const WHITE_WARMTH = 0.08;

/**
 * A flower's petals: its colour's base, turned by its own `hueNudge`. A white
 * has no hue to turn, so its nudge warms it toward cream instead, by as much.
 */
export function petalColour({
  colour,
  hueNudge,
}: Pick<FlowerGenes, 'colour' | 'hueNudge'>): number {
  const base = PALETTE.flowers[colour];
  if (colour !== 'white') return nudgeHue(base, hueNudge);
  const [least, most] = FLOWER_RANGES.hueNudge;
  const warmth = (hueNudge - least) / (most - least);
  return mix(base, PALETTE.flowers.yellow, warmth * WHITE_WARMTH);
}
