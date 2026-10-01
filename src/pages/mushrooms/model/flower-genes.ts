import type { WithId } from '@/shared/typings';

import type { Circle } from './geometry';
import {
  between,
  geneFrom,
  type GeneRanges,
  mulberry32,
  pick,
  type Seeded,
  type Stalked,
} from './random';

/** A petal's outline: a pointed lens, or a rounded paddle. */
export const PETAL_KINDS = ['pointed', 'round'] as const;
export const FLOWER_COLOURS = [
  'pink',
  'yellow',
  'white',
  'violet',
  'blue',
] as const;
export type FlowerColour = (typeof FLOWER_COLOURS)[number];
export type Coloured = { colour: FlowerColour };

export type Flower = WithId & Seeded;

/**
 * One flower's shape, in units of its size — its height to the head's centre.
 * Its head is a mandala in miniature: `fold` petals in a ring, and a second
 * ring set half a step round inside the first where `rings` is 2.
 */
export type FlowerGenes = Stalked &
  Coloured & {
    petal: (typeof PETAL_KINDS)[number];
    fold: number;
    rings: 1 | 2;
    petalLength: number;
    /** The petal's half-width, as a fraction of its length. */
    petalWidth: number;
    centre: number;
    /** The whole ring's turn, so no two heads line up. */
    twist: number;
    /** Where along the stem the leaf grows, and to which side. */
    leafAt: number;
    leafSide: -1 | 1;
  };

export const FLOWER_RANGES = {
  fold: [5, 9],
  petalLength: [0.3, 0.4],
  petalWidth: [0.32, 0.5],
  centre: [0.09, 0.13],
  stemBend: [-0.14, 0.14],
  leafAt: [0.25, 0.5],
  hueNudge: [-0.025, 0.025],
} as const satisfies GeneRanges;

export function flowerGenes({ seed }: Seeded): FlowerGenes {
  const random = mulberry32(seed);
  const gene = geneFrom(random, FLOWER_RANGES);
  const fold = Math.round(gene('fold'));
  return {
    petal: pick(random, PETAL_KINDS),
    colour: pick(random, FLOWER_COLOURS),
    fold,
    rings: random() < 0.5 ? 1 : 2,
    petalLength: gene('petalLength'),
    petalWidth: gene('petalWidth'),
    centre: gene('centre'),
    twist: between(random, 0, (Math.PI * 2) / fold),
    stemBend: gene('stemBend'),
    leafAt: gene('leafAt'),
    leafSide: random() < 0.5 ? -1 : 1,
    hueNudge: gene('hueNudge'),
  };
}

/**
 * Where the head of a flower `size` tall stands relative to its foot, y
 * down, and how far its petals reach.
 */
export function flowerHead(genes: FlowerGenes, size: number): Circle {
  return { x: genes.stemBend * size, y: -size, r: genes.petalLength * size };
}
