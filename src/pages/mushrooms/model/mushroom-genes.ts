import type { WithId } from '@/shared/typings';

import type { Bent, Circle } from './geometry';
import {
  between,
  geneFrom,
  type GeneRanges,
  mulberry32,
  nextSeed,
  type Nudged,
  type Random,
  type Seeded,
} from './random';

/** The meadow's four species, in the order the picker shows them. */
export const MUSHROOM_SPECIES = [
  'fly-agaric',
  'porcini',
  'chanterelle',
  'russula',
] as const;
export type Species = (typeof MUSHROOM_SPECIES)[number];

type OfSpecies = { species: Species };
export type MushroomSeed = Seeded & OfSpecies;
export type Mushroom = WithId & MushroomSeed;

/**
 * One mushroom's shape. Lengths are in units of the mushroom's size, which the
 * scene sets per placement, so the same genes paint a near mushroom and a far
 * one. Angles are in radians. The cap follows the stem's bend.
 */
export type MushroomGenes = OfSpecies &
  Bent &
  Nudged & {
    stemHeight: number;
    /** The stem's width under the cap. */
    stemWidth: number;
    /** How much wider the foot is than the top. */
    footBulge: number;
    /** The whole mushroom's tilt from upright, the foot staying put. */
    lean: number;
    capWidth: number;
    capHeight: number;
    /** The dome's profile: below 1 a broad, shouldered cap, above 1 a pointed one. */
    domePower: number;
    /** A small turn of the cap against the stem. */
    capTilt: number;
    /** White spots, each centred `y` above the cap's underside. */
    spots: readonly Circle[];
  };

export const GENE_RANGES = {
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
} as const satisfies GeneRanges;

const SPOT_COUNT = [4, 8] as const;
const SPOT_RADIUS = [0.035, 0.065] as const;
/** How far a spot keeps from the rim and from the dome's edge. */
export const SPOT_MARGIN = 0.03;
const SPOT_ATTEMPTS = 120;

/** The dome's height above its underside at `x` across it. */
export function domeHeight(
  genes: Pick<MushroomGenes, 'capWidth' | 'capHeight' | 'domePower'>,
  x: number,
): number {
  const across = (2 * x) / genes.capWidth;
  if (Math.abs(across) >= 1) return 0;
  return genes.capHeight * (1 - across * across) ** (genes.domePower / 2);
}

function growSpots(
  random: Random,
  cap: Pick<MushroomGenes, 'capWidth' | 'capHeight' | 'domePower'>,
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
  const gene = geneFrom(random, GENE_RANGES);
  const shape = {
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
  // Drawn after the shape, so turning spots on or off leaves the shape alone.
  const spots = species === 'fly-agaric' ? growSpots(random, shape) : [];
  return { species, ...shape, spots };
}

/**
 * The drawing's two fly agarics, which the meadow opens with and the layout
 * stands as one clump.
 */
export function firstMushrooms(random: Random): Mushroom[] {
  return [1, 2].map((n) => ({
    id: `mushroom-${n}`,
    seed: nextSeed(random),
    species: 'fly-agaric',
  }));
}
