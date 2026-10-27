import { keptIn } from '@/kernel/shared/cache';

import type { Sitter } from '@/mushrooms/shared/world';

import type { InsectKind } from '../model/insect-genes';
import { flowerLift } from './flower-lift';
import type { InsectScaled, InsectSized } from './insect-size';

/** The widest a butterfly's open wings span, in units of its size, whatever its genes. */
export const WIDEST_SPAN = 1.22;

/**
 * The widest each kind's open wings span, in units of its own size, whatever
 * its genes: the butterfly's `WIDEST_SPAN`, and a fly's and a bee's.
 */
const WIDEST_SPANS = {
  butterfly: WIDEST_SPAN,
  fly: 1.36,
  bee: 1.2,
} as const satisfies Record<InsectKind, number>;

/** The widest an insect of `kind` spans on `layout`, in CSS px. */
export function widestOn(layout: InsectSized, kind: InsectKind): number {
  return WIDEST_SPANS[kind] * layout.insectSizes[kind];
}

/** The widest a butterfly's wings span on `layout`, in CSS px. */
export function widestSpanOn({ insectSize }: InsectScaled): number {
  return WIDEST_SPAN * insectSize;
}

/** Each insect size's butterfly as a sitter (`butterflyOn`), one object a size so a sight's stores by it hold. */
const butterflies = new Map<number, Sitter>();

/**
 * A butterfly of `layout`'s insect size as it sits on a flower's head, its
 * wings at their widest: what a flower's planting is judged in sight by.
 */
export function butterflyOn(layout: InsectScaled): Sitter {
  return keptIn(butterflies, layout.insectSize, (insectSize) => ({
    span: widestSpanOn(layout),
    lift: (reach) => flowerLift(reach, insectSize),
  }));
}
