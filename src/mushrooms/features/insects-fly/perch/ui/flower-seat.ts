import type { HeadReach } from '@/mushrooms/shared/world';
import {
  BUD,
  type FlowerGenes,
  flowerHead,
  type Folding,
} from '@/mushrooms/entities/flower/index.node-safe';

/**
 * Where insects perch on the head of a flower `folded` as far shut as that
 * holds, as `paintFlowerHead` draws it: its rim, below the middle, closing up
 * to the bud's foot, and its centre, above it, rising to the bud's tip.
 */
export function foldedHead(
  genes: FlowerGenes,
  size: number,
  { closing }: Folding,
): HeadReach {
  const { r } = flowerHead(genes, size);
  const along = (one: number, other: number) => one + (other - one) * closing;
  return {
    r: along(r, r * BUD.foot),
    disc: along(genes.centre * size, r * BUD.tip),
  };
}
