/**
 * The widths and heights each species' outline is drawn through: its stem's
 * half-width up from the foot, and its cap's top and lower edge across it.
 * The outlines, the pose, the house and the painter all read them here, so
 * a species answers the same wherever it is asked. In the cap's frame (units
 * of size, the middle of the cap's underside at the origin, y up) unless said
 * otherwise.
 */

import {
  type ChanterelleGenes,
  domeHeight,
  type MushroomGenes,
  type MushroomShape,
} from './mushroom-genes';

/** How many chords each curve of a mushroom's outline is drawn with. */
export const CURVE_STEPS = 28;
/** How many times a cap outline's corners are cut, rounding its rim. */
export const RIM_ROUNDS = 2;

/** How far a chanterelle's front rim curves down at its middle, in its lip: the near edge of its mouth, seen a little from above. */
const FRONT_SAG = 0.6;

type Stem = Pick<MushroomGenes, 'species'> &
  Pick<MushroomShape, 'stemWidth' | 'footBulge'>;

/**
 * The stem's half-width `t` of the way from its foot to its top, where every
 * species is `stemWidth` across. A fly agaric runs from the bulge at its foot
 * to the top, swelling a little at the middle; a porcini's club keeps its
 * bulge low and narrows above it; a russula's stays nearly straight; a
 * chanterelle's widens upward into its funnel.
 */
export function stemHalfWidth(genes: Stem, t: number): number {
  const top = genes.stemWidth / 2;
  const foot = top * genes.footBulge;
  const { species } = genes;
  switch (species) {
    case 'fly-agaric': {
      return foot + (top - foot) * t + top * 0.12 * Math.sin(Math.PI * t);
    }
    case 'porcini': {
      // Level at the foot and at the top, so the club rounds both ways.
      const club = (1 - t) ** 2 * (1 + 2 * t);
      return top + (foot - top) * club;
    }
    case 'russula': {
      return foot + (top - foot) * t;
    }
    case 'chanterelle': {
      return foot + (top - foot) * t ** 1.5;
    }
    default: {
      return species satisfies never;
    }
  }
}

/** How far across its cap `x` is, from 0 at the middle to 1 at either rim. */
function acrossOf(genes: Pick<MushroomShape, 'capWidth'>, x: number): number {
  return Math.min(1, Math.abs((2 * x) / genes.capWidth));
}

/**
 * How far a chanterelle's rim waves up or down at `x`: its lobes, fading to
 * nothing toward the middle so the wave stays on the rim.
 */
export function rimWave(genes: ChanterelleGenes, x: number): number {
  const u = acrossOf(genes, x);
  const along = x / genes.capWidth + 0.5;
  return (
    genes.waveAmp *
    Math.sin(genes.lobes * Math.PI * along + genes.wavePhase) *
    u ** 4
  );
}

/** How far a chanterelle's front rim sags below the rim at `x`. */
export function frontSag(genes: ChanterelleGenes, x: number): number {
  return FRONT_SAG * genes.lip * Math.sqrt(1 - acrossOf(genes, x) ** 4);
}

/** The height of a chanterelle's funnel `r` out from its middle, `r` from the stem's top half-width to the rim's. */
export function funnelHeight(genes: ChanterelleGenes, r: number): number {
  const stem = genes.stemWidth / 2;
  const v = Math.max(0, (Math.abs(r) - stem) / (genes.capWidth / 2 - stem));
  return genes.capHeight * Math.min(1, v) ** genes.flare;
}

/**
 * The cap's top at `x` across it: a dome for a fly agaric and a porcini, one
 * dipping at the middle for a russula, and a chanterelle's lip over its rim,
 * dipping at the middle and waving at the rim. Nothing is above it.
 */
export function capSurface(genes: MushroomGenes, x: number): number {
  switch (genes.species) {
    case 'fly-agaric':
    case 'porcini': {
      return domeHeight(genes, x);
    }
    case 'russula': {
      const inside = 1 - acrossOf(genes, x) ** 2;
      return Math.max(0, domeHeight(genes, x) - genes.hollow * inside ** 2);
    }
    case 'chanterelle': {
      const inside = 1 - acrossOf(genes, x) ** 2;
      return (
        genes.capHeight +
        rimWave(genes, x) +
        genes.lip * inside ** (genes.domePower / 2) -
        genes.hollow * inside ** 2
      );
    }
    default: {
      return genes satisfies never;
    }
  }
}

/**
 * The lower edge of the cap's face, the part a window goes in and a
 * butterfly sits on: a dome's underside, or a chanterelle's front rim, where
 * its lip meets its ridged funnel.
 */
export function capBase(genes: MushroomGenes, x: number): number {
  if (genes.species !== 'chanterelle') return 0;
  return genes.capHeight + rimWave(genes, x) - frontSag(genes, x);
}
