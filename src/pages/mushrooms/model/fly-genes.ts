/**
 * A fly's genes: a stout dark body with a metallic sheen, two big red eyes,
 * and two clear veined wings, laid back over the body at rest.
 */

import type { Buzzing, OfKind } from './insect-genes';
import {
  countFrom,
  geneFrom,
  type GeneRanges,
  mulberry32,
  pick,
} from './random';

/**
 * The names `palette.ts` keys a fly's sheen by, from bottle green round to a
 * bluebottle's blue: the metal a dark body catches the light in.
 */
export const FLY_SHEENS = [
  'bottle',
  'emerald',
  'teal',
  'peacock',
  'bluebottle',
] as const;
type FlySheen = (typeof FLY_SHEENS)[number];

export type FlyGenes = Buzzing &
  OfKind<'fly'> & {
    sheen: FlySheen;
    /** Each of its two eyes' radius, the eyes filling the head either side. */
    eyeRadius: number;
    /** How many veins run out along each wing from its root. */
    veins: number;
  };

export const FLY_RANGES = {
  bodyLength: [0.62, 0.74],
  bodyWidth: [0.26, 0.32],
  wingLength: [0.5, 0.6],
  wingBreadth: [0.2, 0.26],
  wingTip: [0.2, 0.6],
  legLength: [0.22, 0.3],
  eyeRadius: [0.1, 0.13],
  hueNudge: [-0.03, 0.03],
} as const satisfies GeneRanges;
export const FLY_VEINS = [3, 4] as const;

export function flyGenes(seed: number): FlyGenes {
  const random = mulberry32(seed);
  const gene = geneFrom(random, FLY_RANGES);
  return {
    kind: 'fly',
    bodyLength: gene('bodyLength'),
    bodyWidth: gene('bodyWidth'),
    wing: {
      length: gene('wingLength'),
      breadth: gene('wingBreadth'),
      tip: gene('wingTip'),
    },
    legLength: gene('legLength'),
    eyeRadius: gene('eyeRadius'),
    hueNudge: gene('hueNudge'),
    sheen: pick(random, FLY_SHEENS),
    veins: countFrom(random, FLY_VEINS),
  };
}
