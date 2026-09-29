import type { WithId } from '@/shared/typings';

import type { Circle } from './geometry';
import {
  between,
  countFrom,
  geneFrom,
  type GeneRanges,
  mulberry32,
  nextSeed,
  pick,
  type Random,
  type Seeded,
  type Stalked,
} from './random';

/** The meadow's four species, in the order the picker shows them. */
export const MUSHROOM_SPECIES = [
  'fly-agaric',
  'porcini',
  'chanterelle',
  'russula',
] as const;
export type Species = (typeof MUSHROOM_SPECIES)[number];

/** The colours a russula's cap comes in, one picked by its seed. */
export const RUSSULA_TONES = [
  'red',
  'rose',
  'violet',
  'ochre',
  'green',
] as const;
export type RussulaTone = (typeof RUSSULA_TONES)[number];

type OfSpecies<Kind extends Species = Species> = { species: Kind };
export type MushroomSeed = Seeded & OfSpecies;
export type Mushroom = WithId & MushroomSeed;

/**
 * The shape every species grows, each from its own `GENE_RANGES`. Lengths are
 * in units of the mushroom's size, which the scene sets per placement, so the
 * same genes paint a near mushroom and a far one. Angles are in radians. The
 * cap follows the stem's bend.
 */
export type MushroomShape = Stalked & {
  stemHeight: number;
  /** The stem's width under the cap. */
  stemWidth: number;
  /** The foot's width over the top's: past 1 a bulging foot, under 1 a stem flaring upward. */
  footBulge: number;
  /** The whole mushroom's tilt from upright, the foot staying put. */
  lean: number;
  capWidth: number;
  /** A dome's height; a chanterelle's funnel's rise from the stem to its rim. */
  capHeight: number;
  /** The cap's profile: below 1 a broad, shouldered cap, above 1 a pointed one. */
  domePower: number;
  /** A small turn of the cap against the stem. */
  capTilt: number;
};
type ShapeGene = keyof MushroomShape;

/** White spots, each centred `y` above the cap's underside: a fly agaric's, none on any other. */
type Spotted = { spots: readonly Circle[] };
/** How far the middle of the cap's top sinks below where a plain dome would stand. */
type Hollowed = { hollow: number };
/**
 * A chanterelle's own: a trumpet whose funnel rises `capHeight` from the stem
 * to a thick `lip` of cap, the funnel's curve `flare` (under 1, the stem's
 * sides running up into it with no joint), its rim waving in `lobes` of
 * `waveAmp` from `wavePhase`, and `ridges` running from the rim onto the stem.
 */
type Trumpet = Hollowed & {
  lip: number;
  flare: number;
  lobes: number;
  waveAmp: number;
  wavePhase: number;
  ridges: number;
};
type Grown<Kind extends Species, Own = unknown> = OfSpecies<Kind> &
  MushroomShape &
  Spotted &
  Own;

export type FlyAgaricGenes = Grown<'fly-agaric'>;
export type PorciniGenes = Grown<'porcini'>;
export type ChanterelleGenes = Grown<'chanterelle', Trumpet>;
export type RussulaGenes = Grown<'russula', Hollowed & { tone: RussulaTone }>;
/** One mushroom's genes, whichever its species. */
export type MushroomGenes =
  | FlyAgaricGenes
  | PorciniGenes
  | ChanterelleGenes
  | RussulaGenes;
/**
 * The shape each species' head takes: a dome over gills or pores, or a
 * trumpet whose funnel runs on from the stem. What is drawn, lit and housed
 * by shape asks this; what is a species' own colour or genes asks the species.
 */
export const HEAD_KIND = {
  'fly-agaric': 'dome',
  porcini: 'dome',
  chanterelle: 'trumpet',
  russula: 'dome',
} as const satisfies Record<Species, 'dome' | 'trumpet'>;
export type HeadKind = (typeof HEAD_KIND)[Species];
/** The genes of every species whose head is `Kind`. */
type HeadGenes<Kind extends HeadKind> = Extract<
  MushroomGenes,
  OfSpecies<
    { [S in Species]: (typeof HEAD_KIND)[S] extends Kind ? S : never }[Species]
  >
>;
/** The genes of a species with a domed cap. */
export type DomeGenes = HeadGenes<'dome'>;

/** Whether `genes` grow a trumpet rather than a dome. */
export function hasTrumpet(
  genes: MushroomGenes,
): genes is HeadGenes<'trumpet'> {
  return HEAD_KIND[genes.species] === 'trumpet';
}

/**
 * Each species' shape genes, drawn in the one order `growGenes` lists them,
 * so a seed's stream stays aligned whatever the species. Every cap is at least
 * the fly agaric's narrowest across and reaches no farther than its widest
 * reaches (`maxReach`), so the layout's floors and margins hold for all four.
 */
export const GENE_RANGES = {
  'fly-agaric': {
    stemHeight: [0.6, 0.9],
    stemWidth: [0.13, 0.19],
    footBulge: [1.1, 1.45],
    stemBend: [-0.26, 0.26],
    lean: [-0.12, 0.12],
    capWidth: [0.72, 1],
    capHeight: [0.3, 0.42],
    domePower: [0.55, 1.15],
    capTilt: [-0.08, 0.08],
    hueNudge: [-0.03, 0.03],
  },
  // Stout: a short barrel of a stem, its foot bulging to near half the cap
  // across, under a wide, thick bun. The stem shows about 0.58 of the cap's
  // width tall, against a fly agaric's 0.8, and stands as short as the door
  // stations up it allow (`doorStations`). It always leans a little (a
  // placement picks the side), so two of these barrels in the clump part
  // before the back one's door.
  porcini: {
    stemHeight: [0.54, 0.64],
    stemWidth: [0.28, 0.32],
    footBulge: [1.3, 1.55],
    stemBend: [-0.2, 0.2],
    lean: [0.065, 0.1],
    capWidth: [0.86, 1],
    capHeight: [0.32, 0.39],
    domePower: [0.55, 0.85],
    capTilt: [-0.06, 0.06],
    hueNudge: [-0.03, 0.03],
  },
  // Nearly upright on a short stem, the cap turning only as the stem does, so
  // the tall funnel meets it with no joint; the lip's top rounds as an
  // ellipse's far half.
  chanterelle: {
    stemHeight: [0.56, 0.7],
    stemWidth: [0.15, 0.2],
    footBulge: [0.62, 0.78],
    stemBend: [-0.06, 0.06],
    lean: [-0.04, 0.04],
    capWidth: [0.78, 0.9],
    capHeight: [0.25, 0.29],
    domePower: [0.85, 1.05],
    capTilt: [0, 0],
    hueNudge: [-0.006, 0.006],
  },
  // A straight stem under a flattish cap.
  russula: {
    stemHeight: [0.68, 0.88],
    stemWidth: [0.15, 0.2],
    footBulge: [0.98, 1.08],
    stemBend: [-0.14, 0.14],
    lean: [-0.1, 0.1],
    capWidth: [0.76, 0.98],
    capHeight: [0.2, 0.27],
    domePower: [0.3, 0.55],
    capTilt: [-0.06, 0.06],
    hueNudge: [-0.02, 0.02],
  },
} as const satisfies Record<Species, GeneRanges<ShapeGene>>;

/** The genes only a chanterelle grows, drawn after its shape. */
export const TRUMPET_RANGES = {
  lip: [0.12, 0.15],
  hollow: [0.025, 0.04],
  flare: [0.85, 1.1],
  waveAmp: [0.018, 0.03],
  wavePhase: [-0.8, 0.8],
} as const satisfies GeneRanges<Exclude<keyof Trumpet, 'lobes' | 'ridges'>>;
const LOBES = [3, 5] as const;
const RIDGES = [7, 11] as const;
/** How far a russula's cap dips at its middle, drawn after its shape. */
export const RUSSULA_HOLLOW = [0.05, 0.07] as const;

/** The least and the most `name` takes over every species. */
export function geneBounds(name: ShapeGene): [number, number] {
  const ranges = MUSHROOM_SPECIES.map((species) => GENE_RANGES[species][name]);
  return [
    Math.min(...ranges.map(([min]) => min)),
    Math.max(...ranges.map(([, max]) => max)),
  ];
}

const SPOT_COUNT = [4, 8] as const;
const SPOT_RADIUS = [0.035, 0.065] as const;
/** How far a spot keeps from the rim and from the dome's edge. */
export const SPOT_MARGIN = 0.03;
const SPOT_ATTEMPTS = 120;

/** The dome's height above its underside at `x` across it. */
export function domeHeight(
  genes: Pick<MushroomShape, 'capWidth' | 'capHeight' | 'domePower'>,
  x: number,
): number {
  const across = (2 * x) / genes.capWidth;
  if (Math.abs(across) >= 1) return 0;
  return genes.capHeight * (1 - across * across) ** (genes.domePower / 2);
}

function growSpots(
  random: Random,
  cap: Pick<MushroomShape, 'capWidth' | 'capHeight' | 'domePower'>,
): Circle[] {
  const wanted = Math.round(between(random, SPOT_COUNT[0], SPOT_COUNT[1]));
  const spots: Circle[] = [];
  for (
    let attempt = 0;
    attempt < SPOT_ATTEMPTS && spots.length < wanted;
    attempt++
  ) {
    const r = between(random, SPOT_RADIUS[0], SPOT_RADIUS[1]);
    const x = between(random, -cap.capWidth / 2, cap.capWidth / 2);
    // Drawn within the band the dome leaves at `x`, so most tries land.
    const y = between(random, SPOT_MARGIN + r, domeHeight(cap, x));
    const fits =
      y + r + SPOT_MARGIN <= domeHeight(cap, x - r) &&
      y + r + SPOT_MARGIN <= domeHeight(cap, x + r) &&
      y + SPOT_MARGIN <= domeHeight(cap, x) - r;
    const clear = spots.every(
      (other) =>
        Math.hypot(other.x - x, other.y - y) >= other.r + r + SPOT_MARGIN,
    );
    if (fits && clear) spots.push({ x, y, r });
  }
  return spots;
}

/**
 * Every mushroom's genes grown so far, by species and seed: a pure function of
 * the two, costly to grow and read every time a mushroom is drawn or sat on,
 * and never changed once grown.
 */
const grown = new Map<string, MushroomGenes>();

export function mushroomGenes(seeded: MushroomSeed): MushroomGenes {
  const key = `${seeded.species} ${String(seeded.seed)}`;
  const known = grown.get(key) ?? growGenes(seeded);
  grown.set(key, known);
  return known;
}

function growGenes({ seed, species }: MushroomSeed): MushroomGenes {
  const random = mulberry32(seed);
  const gene = geneFrom(random, GENE_RANGES[species]);
  const shape: MushroomShape = {
    stemHeight: gene('stemHeight'),
    stemWidth: gene('stemWidth'),
    footBulge: gene('footBulge'),
    stemBend: gene('stemBend'),
    lean: gene('lean'),
    capWidth: gene('capWidth'),
    capHeight: gene('capHeight'),
    domePower: gene('domePower'),
    capTilt: gene('capTilt'),
    hueNudge: gene('hueNudge'),
  };
  // A species' own genes are drawn after the shape, so they leave it alone.
  switch (species) {
    case 'fly-agaric': {
      return { species, ...shape, spots: growSpots(random, shape) };
    }
    case 'porcini': {
      return { species, ...shape, spots: [] };
    }
    case 'chanterelle': {
      const own = geneFrom(random, TRUMPET_RANGES);
      return {
        species,
        ...shape,
        spots: [],
        lip: own('lip'),
        hollow: own('hollow'),
        flare: own('flare'),
        waveAmp: own('waveAmp'),
        wavePhase: own('wavePhase'),
        lobes: countFrom(random, LOBES),
        ridges: countFrom(random, RIDGES),
      };
    }
    case 'russula': {
      return {
        species,
        ...shape,
        spots: [],
        hollow: between(random, ...RUSSULA_HOLLOW),
        tone: pick(random, RUSSULA_TONES),
      };
    }
    default: {
      return species satisfies never;
    }
  }
}

/** The species the meadow opens with, both of the clump's two. */
export const OPENING_SPECIES = 'fly-agaric' satisfies Species;

/**
 * The drawing's two fly agarics, which the meadow opens with and the layout
 * stands as one clump.
 */
export function firstMushrooms(random: Random): Mushroom[] {
  return [1, 2].map((n) => ({
    id: `mushroom-${n}`,
    seed: nextSeed(random),
    species: OPENING_SPECIES,
  }));
}
