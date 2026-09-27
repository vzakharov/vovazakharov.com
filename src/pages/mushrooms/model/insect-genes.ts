import type { WithId } from '@/shared/typings';

import {
  between,
  geneFrom,
  type GeneRanges,
  mulberry32,
  type Nudged,
  pick,
  type Random,
  type Seeded,
} from './random';

const INSECT_KINDS = ['butterfly'] as const;
export type InsectKind = (typeof INSECT_KINDS)[number];

/** The names `palette.ts` keys its butterfly hues by, one base hue each. */
export const BUTTERFLY_COLOURS = [
  'orange',
  'yellow',
  'blue',
  'violet',
  'white',
] as const;
type ButterflyColour = (typeof BUTTERFLY_COLOURS)[number];

type Kinded = { kind: InsectKind };
export type InsectSeed = Seeded & Kinded;
export type Insect = WithId & InsectSeed;

/**
 * One wing, in units of the insect's size: how far it reaches from the body,
 * how broad it is across, and its tip, from 0 (round) to 1 (pointed).
 */
export type Wing = { length: number; breadth: number; tip: number };

/**
 * One insect's shape and colouring, lengths in units of its size, which the
 * scene sets. Seen from above with the wings open: a fore and a hind pair,
 * each wing carrying the same eye, a mandala of concentric rings.
 */
export type InsectGenes = Kinded &
  Nudged & {
    bodyLength: number;
    /** The body's width at its thickest. */
    bodyWidth: number;
    fore: Wing;
    hind: Wing;
    /** The rings' radii, outermost first, each a fraction of the wing's breadth. */
    eyes: readonly number[];
    /** Where the eye's centre sits along the wing, a fraction of its length. */
    eyeAt: number;
    colour: ButterflyColour;
    /** The eye rings' and the wing edges' colour, never the base's. */
    pattern: ButterflyColour;
    /** The pattern's own shift off its hue, as `hueNudge` is the base's. */
    patternNudge: number;
  };

export const INSECT_RANGES = {
  bodyLength: [0.5, 0.68],
  bodyWidth: [0.07, 0.11],
  foreLength: [0.5, 0.62],
  foreBreadth: [0.3, 0.4],
  foreTip: [0, 1],
  hindLength: [0.36, 0.48],
  hindBreadth: [0.3, 0.42],
  hindTip: [0, 0.6],
  eyeAt: [0.5, 0.66],
  hueNudge: [-0.03, 0.03],
  patternNudge: [-0.04, 0.04],
} as const satisfies GeneRanges;

/** The outermost eye ring's radius, and each inner ring's share of the one outside it. */
export const EYE_RADIUS = [0.26, 0.38] as const;
const EYE_SHRINK = [0.45, 0.65] as const;
export const EYE_RINGS = [1, 3] as const;

function growEyes(random: Random): number[] {
  const count =
    EYE_RINGS[0] + Math.floor(random() * (EYE_RINGS[1] - EYE_RINGS[0] + 1));
  const eyes = [between(random, EYE_RADIUS[0], EYE_RADIUS[1])];
  while (eyes.length < count) {
    const outer = eyes.at(-1) ?? 0;
    eyes.push(outer * between(random, EYE_SHRINK[0], EYE_SHRINK[1]));
  }
  return eyes;
}

export function insectGenes({ seed, kind }: InsectSeed): InsectGenes {
  const random = mulberry32(seed);
  const gene = geneFrom(random, INSECT_RANGES);
  const colour = pick(random, BUTTERFLY_COLOURS);
  const others = BUTTERFLY_COLOURS.filter((each) => each !== colour);
  const [firstOther = colour, ...restOthers] = others;
  return {
    kind,
    bodyLength: gene('bodyLength'),
    bodyWidth: gene('bodyWidth'),
    fore: {
      length: gene('foreLength'),
      breadth: gene('foreBreadth'),
      tip: gene('foreTip'),
    },
    hind: {
      length: gene('hindLength'),
      breadth: gene('hindBreadth'),
      tip: gene('hindTip'),
    },
    eyes: growEyes(random),
    eyeAt: gene('eyeAt'),
    colour,
    pattern: pick(random, [firstOther, ...restOthers]),
    hueNudge: gene('hueNudge'),
    patternNudge: gene('patternNudge'),
  };
}
