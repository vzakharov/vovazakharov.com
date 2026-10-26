import type { InsectKind } from '@/mushrooms/entities/insect/index.node-safe';

import { WIDEST_SPAN } from './flower-sight';
import type { InsectSized } from './layout';

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
