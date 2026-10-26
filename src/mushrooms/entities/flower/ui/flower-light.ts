import type { Point, Scaled } from '@/mushrooms/shared/lib/geometry';
import { type Light, lightAt } from '@/mushrooms/shared/lib/light';
import { OPENING_EYE } from '@/mushrooms/shared/world';

import { type FlowerGenes, flowerHead } from '../model/flower-genes';

/**
 * The light a flower standing at `foot`, `size` tall, is painted in, the eye
 * facing `heading`: from its head toward the sun.
 */
export function flowerLight<Lit extends Light>(
  light: Lit,
  genes: FlowerGenes,
  foot: Point & Scaled,
  sun: Point,
  heading = OPENING_EYE.heading,
): Lit {
  const head = flowerHead(genes, foot.size);
  return lightAt(
    light,
    { x: foot.x + head.x, y: foot.y + head.y },
    sun,
    heading,
  );
}
