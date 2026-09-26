import type { WithId } from '@/shared/typings';

import { between, mulberry32, nextSeed, type Random } from './random';

/** The four caps of Syama's drawing, in the order he drew them. */
export const CAP_KINDS = [
  'spotted',
  'plain',
  'dark-top',
  'dark-bottom',
] as const;
export type CapKind = (typeof CAP_KINDS)[number];

/** What a creature is grown from: its genes are a pure function of it. */
export type Seeded = { seed: number };
type Capped = { cap: CapKind };
type MushroomSeed = Seeded & Capped;
export type Mushroom = WithId & MushroomSeed;

/** A white spot on the cap, centred `y` above the cap's underside. */
type Spot = { x: number; y: number; r: number };

/**
 * One mushroom's shape. Lengths are in units of the mushroom's size, which the
 * scene sets per placement, so the same genes paint a near mushroom and a far
 * one. Angles are in radians.
 */
export type MushroomGenes = Capped & {
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
  /** A shift of the cap's hue, as a fraction of the colour wheel. */
  hueNudge: number;
  spots: readonly Spot[];
};

export const GENE_RANGES = {
  stemHeight: [0.42, 0.62],
  stemWidth: [0.13, 0.19],
  footBulge: [1.1, 1.45],
  lean: [-0.12, 0.12],
  capWidth: [0.72, 1],
  capHeight: [0.3, 0.42],
  domePower: [0.55, 1.15],
  capTilt: [-0.08, 0.08],
  hueNudge: [-0.03, 0.03],
} as const satisfies Record<string, readonly [number, number]>;

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
): Spot[] {
  const wanted = Math.round(between(random, SPOT_COUNT[0], SPOT_COUNT[1]));
  const spots: Spot[] = [];
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

export function mushroomGenes({ seed, cap }: MushroomSeed): MushroomGenes {
  const random = mulberry32(seed);
  const gene = (name: keyof typeof GENE_RANGES) =>
    between(random, GENE_RANGES[name][0], GENE_RANGES[name][1]);
  const shape = {
    stemHeight: gene('stemHeight'),
    stemWidth: gene('stemWidth'),
    footBulge: gene('footBulge'),
    lean: gene('lean'),
    capWidth: gene('capWidth'),
    capHeight: gene('capHeight'),
    domePower: gene('domePower'),
    capTilt: gene('capTilt'),
    hueNudge: gene('hueNudge'),
  };
  // Drawn after the shape, so turning spots on or off leaves the shape alone.
  const spots = cap === 'spotted' ? growSpots(random, shape) : [];
  return { cap, ...shape, spots };
}

/** The two fly agarics the meadow opens with, as in the drawing. */
export function firstMushrooms(random: Random): Mushroom[] {
  return [1, 2].map((n) => ({
    id: `mushroom-${n}`,
    seed: nextSeed(random),
    cap: 'spotted',
  }));
}
