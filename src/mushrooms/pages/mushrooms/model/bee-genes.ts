/**
 * A bee's genes: a round fuzzy body in black and yellow bands, a small head,
 * two small clear wings, and pollen baskets on its hind legs that fill as it
 * carries.
 */

import { buzzingBody } from './buzz-genes';
import type { Buzzing, OfKind } from './insect-genes';
import {
  countFrom,
  geneFrom,
  type GeneRanges,
  mulberry32,
  pick,
} from './random';

/** The names `palette.ts` keys a bee's yellow bands by, from pale to deep. */
export const BEE_YELLOWS = ['lemon', 'gold', 'amber', 'honey'] as const;
type BeeYellow = (typeof BEE_YELLOWS)[number];

export type BeeGenes = Buzzing &
  OfKind<'bee'> & {
    /** The yellow its bands alternate with black. */
    stripe: BeeYellow;
    /** How many yellow bands cross its body. */
    bands: number;
    headRadius: number;
    /** How far its fuzz stands off its outline, a share of its width. */
    fuzz: number;
    /** A full pollen basket's radius, on each hind leg. */
    basket: number;
  };

export const BEE_RANGES = {
  bodyLength: [0.6, 0.7],
  bodyWidth: [0.5, 0.58],
  wingLength: [0.36, 0.44],
  wingBreadth: [0.18, 0.22],
  wingTip: [0, 0.3],
  legLength: [0.2, 0.26],
  headRadius: [0.1, 0.12],
  fuzz: [0.04, 0.08],
  basket: [0.06, 0.08],
  hueNudge: [-0.03, 0.03],
} as const satisfies GeneRanges;
export const BEE_BANDS = [3, 4] as const;

export function beeGenes(seed: number): BeeGenes {
  const random = mulberry32(seed);
  const gene = geneFrom(random, BEE_RANGES);
  return {
    kind: 'bee',
    ...buzzingBody(gene),
    headRadius: gene('headRadius'),
    fuzz: gene('fuzz'),
    basket: gene('basket'),
    hueNudge: gene('hueNudge'),
    stripe: pick(random, BEE_YELLOWS),
    bands: countFrom(random, BEE_BANDS),
  };
}
