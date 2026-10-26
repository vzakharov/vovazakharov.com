/**
 * The mushrooms the buttons' pictograms are drawn from, and the size each is
 * drawn at: Phaser-free, so a test measures the pictogram the button paints.
 */

import { sample } from '../../model/geometry';
import {
  GENE_RANGES,
  type MushroomGenes,
  mushroomGenes,
  type RussulaTone,
  type Species,
} from '../../model/mushroom-genes';
import { capSurface, CURVE_STEPS } from '../../model/mushroom-profile';

/** How tall a picker button draws its mushroom, in the button's radius. */
export const SPECIES_ICON_HEIGHT = 1.4;
/** The seed every pictogram's mushroom grows from, so each looks the same on every visit. */
const ICON_SEED = 11;
/** A pictogram's domed cap, and a russula's flatter one, dipping at the middle. */
const ICON_DOME = { capHeight: 0.58, domePower: 0.85 };
const ICON_FLAT = { capHeight: 0.4, domePower: 0.4, hollow: 0.05 };
/**
 * A chanterelle's pictogram: the meadow's trumpet on a short stem, its
 * funnel rising straight into a broad lip thick enough that the orange shows
 * round its mouth at a button's size.
 */
const ICON_TRUMPET = {
  capWidth: 0.98,
  stemHeight: 0.5,
  stemWidth: 0.2,
  capHeight: 0.36,
  lip: 0.26,
  flare: 1,
  waveAmp: 0.028,
};
/** The russula's pictogram colour: a rose apart from the fly agaric's red. */
const ICON_RUSSULA = 'rose' satisfies RussulaTone;
/**
 * A pictogram's spots, in the cap's frame: fewer and larger than a meadow
 * mushroom's, so they read as spots at a button's size.
 */
const ICON_SPOTS = [
  { x: -0.24, y: 0.16, r: 0.085 },
  { x: 0.02, y: 0.3, r: 0.09 },
  { x: 0.26, y: 0.13, r: 0.08 },
  { x: -0.05, y: 0.08, r: 0.06 },
];

/**
 * A mushroom of `species`, standing upright: the pictogram's own, not a
 * meadow's. Its cap is wider and taller than any the meadow grows and its stem
 * short, so the cap, which is what tells the four apart, fills the button:
 * a fly agaric's spotted dome, a porcini's broad brown one on a thick stem, a
 * russula's flat rose one, a chanterelle's orange trumpet.
 */
export function iconGenes(species: Species): MushroomGenes {
  const genes = mushroomGenes({ seed: ICON_SEED, species });
  const ranges = GENE_RANGES[species];
  const upright = {
    ...genes,
    lean: 0,
    stemBend: 0,
    capTilt: 0,
    stemHeight: ranges.stemHeight[0],
    stemWidth: ranges.stemWidth[1],
    capWidth: ranges.capWidth[1],
  };
  switch (upright.species) {
    case 'fly-agaric': {
      return { ...upright, ...ICON_DOME, spots: ICON_SPOTS };
    }
    case 'porcini': {
      return { ...upright, ...ICON_DOME };
    }
    case 'russula': {
      return { ...upright, ...ICON_FLAT, tone: ICON_RUSSULA };
    }
    case 'chanterelle': {
      return { ...upright, ...ICON_TRUMPET };
    }
    default: {
      return upright satisfies never;
    }
  }
}

/** The size, in px to its unit, that stands `genes` `height` tall from its foot to its crown. */
export function iconSize(genes: MushroomGenes, height: number): number {
  const crown = Math.max(
    ...sample(-0.5, 0.5, CURVE_STEPS, (across) =>
      capSurface(genes, across * genes.capWidth),
    ),
  );
  return height / (genes.stemHeight + crown);
}
