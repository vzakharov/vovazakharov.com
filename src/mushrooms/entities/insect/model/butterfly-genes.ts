import {
  between,
  countFrom,
  geneFrom,
  type GeneRanges,
  mulberry32,
  pick,
  type Random,
} from '@/mushrooms/shared/lib/random';

import type { FourWinged, InsectBody, OfKind } from './insect';
import { eyeRoom, WING_PAIRS } from './insect-outline';

/**
 * The names `palette.ts` keys its butterfly hues by, one base hue each, in
 * order round the colour wheel with white closing the ring. Enough of them
 * that four butterflies on screen seldom share one; none in the grass's
 * greens, which a butterfly would vanish into.
 */
export const BUTTERFLY_COLOURS = [
  'coral',
  'peach',
  'orange',
  'yellow',
  'lemon',
  'mint',
  'turquoise',
  'sky',
  'cobalt',
  'periwinkle',
  'violet',
  'magenta',
  'rose',
  'white',
] as const;
/**
 * The butterfly button's seed, so the pictogram looks the same on every
 * visit: orange with cobalt edges and eyes, three rings to each eye.
 */
export const PICTOGRAM_SEED = 100;
/**
 * How far round `BUTTERFLY_COLOURS` a pattern sits from its base, as a share
 * of the ring: never a near neighbour, so the eyes and the edge stand out.
 */
export const PATTERN_TURN = [0.25, 0.75] as const;
type ButterflyColour = (typeof BUTTERFLY_COLOURS)[number];

/**
 * A butterfly's shape and colouring, seen from above with the wings open: each
 * wing's eye a mandala of concentric rings.
 */
export type ButterflyGenes = InsectBody &
  OfKind<'butterfly'> &
  FourWinged & {
    /** The rings' radii, outermost first, each a fraction of the wing's breadth. */
    eyes: readonly number[];
    colour: ButterflyColour;
    /** The eye rings' and the wing edges' colour, never the base's. */
    pattern: ButterflyColour;
    /** The pattern's own shift off its hue, as `hueNudge` is the base's. */
    patternNudge: number;
  };

export const BUTTERFLY_RANGES = {
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

/**
 * The outermost eye ring's radius before it is fitted to its wings, and each
 * inner ring's share of the one outside it. Every eye has at least two
 * rings, so each reads as concentric.
 */
export const EYE_RADIUS = [0.26, 0.38] as const;
const EYE_SHRINK = [0.45, 0.65] as const;
export const EYE_RINGS = [2, 3] as const;
/** How much of the room to its wing's nearest edge an eye's outer ring may take. */
const EYE_FIT = 0.92;

function growEyes(random: Random): number[] {
  const count = countFrom(random, EYE_RINGS);
  const eyes = [between(random, EYE_RADIUS[0], EYE_RADIUS[1])];
  while (eyes.length < count) {
    const outer = eyes.at(-1) ?? 0;
    eyes.push(outer * between(random, EYE_SHRINK[0], EYE_SHRINK[1]));
  }
  return eyes;
}

/**
 * `genes` with its eye rings shrunk as a whole, each keeping its share of the
 * next, until the outer ring sits inside both wings.
 */
function fitted(genes: ButterflyGenes): ButterflyGenes {
  const room =
    EYE_FIT * Math.min(...WING_PAIRS.map((pair) => eyeRoom(genes, pair)));
  const [outer = 0] = genes.eyes;
  if (outer <= room) return genes;
  return {
    ...genes,
    eyes: genes.eyes.map((radius) => (radius * room) / outer),
  };
}

/** A pattern colour for `colour`, `PATTERN_TURN` of the way round the ring from it. */
function patternFor(random: Random, colour: ButterflyColour): ButterflyColour {
  const count = BUTTERFLY_COLOURS.length;
  const least = Math.ceil(PATTERN_TURN[0] * count);
  const most = Math.floor(PATTERN_TURN[1] * count);
  const turn = least + Math.floor(random() * (most - least + 1));
  const index = (BUTTERFLY_COLOURS.indexOf(colour) + turn) % count;
  return BUTTERFLY_COLOURS[index] ?? colour;
}

export function butterflyGenes(seed: number): ButterflyGenes {
  const random = mulberry32(seed);
  const gene = geneFrom(random, BUTTERFLY_RANGES);
  const colour = pick(random, BUTTERFLY_COLOURS);
  return fitted({
    kind: 'butterfly',
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
    pattern: patternFor(random, colour),
    hueNudge: gene('hueNudge'),
    patternNudge: gene('patternNudge'),
  });
}
