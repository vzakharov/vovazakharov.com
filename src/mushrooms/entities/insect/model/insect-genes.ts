import type { Seeded } from '@/mushrooms/shared/lib/random';

import { type BeeGenes, beeGenes } from './bee-genes';
import { type ButterflyGenes, butterflyGenes } from './butterfly-genes';
import { type FlyGenes, flyGenes } from './fly-genes';
import type { InsectKind, OfKind } from './insect';
import { buzzWing, WING_PAIRS, wingOutline } from './insect-outline';

/** One insect's genes, by its kind. */
export type InsectGenes = ButterflyGenes | FlyGenes | BeeGenes;
/** The genes of an insect of `Kind`. */
export type GenesOf<Kind extends InsectKind> = Extract<
  InsectGenes,
  OfKind<Kind>
>;

const GROWERS: { [Kind in InsectKind]: (seed: number) => GenesOf<Kind> } = {
  butterfly: butterflyGenes,
  fly: flyGenes,
  bee: beeGenes,
};

/** The genes an insect of `kind` grows from `seed`, a pure function of the two. */
export function insectGenes<Kind extends InsectKind>({
  seed,
  kind,
}: Seeded & OfKind<Kind>): GenesOf<Kind> {
  return GROWERS[kind](seed);
}

/**
 * How far an insect reaches from side to side, in units of its size: a
 * butterfly's open wings, or a fly's or a bee's open wings or its body,
 * whichever is wider — read off the outlines it is painted with, so the
 * wingspan the layout sizes an insect by is the one painted.
 */
export function wingspan(genes: InsectGenes): number {
  if (genes.kind !== 'butterfly') {
    const xs = buzzWing(genes, 1, 1).map(({ x }) => x);
    return Math.max(genes.bodyWidth / 2, ...xs) * 2;
  }
  const xs = WING_PAIRS.flatMap((pair) =>
    wingOutline(genes, pair, 1).map(({ x }) => x),
  );
  return Math.max(...xs) * 2;
}
