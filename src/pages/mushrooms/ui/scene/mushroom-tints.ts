/**
 * The colours each species is painted in, from its genes: the one place a
 * species' palette entries become a mushroom's fills, so the painter, the
 * house and the HUD all read one answer.
 */

import { pick } from '@/shared/lib/collections';

import {
  GENE_RANGES,
  type MushroomGenes,
  type PorciniGenes,
  type RussulaGenes,
} from '../../model/mushroom-genes';
import { contrast, mix, nudgeHue } from './colour';
import { inkFor } from './ink';
import { PALETTE } from './palette';

/**
 * A mushroom's fills: its stem and the warm light down its sun side, what
 * shows under its cap (gills, pores or a chanterelle's funnel), its cap and
 * the warm light along the cap's sun-facing edge.
 */
export type MushroomTints = Record<
  'stem' | 'stemLit' | 'under' | 'cap' | 'capLit',
  number
>;

/** How much of the way from a porcini's cap to its margin colour its paler band goes. */
const MARGIN_SHARE = 0.7;
/** How far a russula's dip pales toward white. */
const CENTRE_PALE = 0.28;

/** Where a porcini's cap stands from tan (0) to chestnut (1): its hue nudge, read across its range. */
function porciniBrown({ hueNudge }: PorciniGenes): number {
  const [min, max] = GENE_RANGES.porcini.hueNudge;
  return (hueNudge - min) / (max - min);
}

/** How much of the meadow's haze a chanterelle takes: less than the rest, its orange being what tells it apart far off. */
const CHANTERELLE_HAZE = 0.55;

/** The haze `genes`' colours go toward, of the `haze` where it stands. */
export function heldHaze(genes: MushroomGenes, haze: number): number {
  return genes.species === 'chanterelle' ? haze * CHANTERELLE_HAZE : haze;
}

export function mushroomTints(genes: MushroomGenes): MushroomTints {
  const shared = pick(PALETTE, 'stem', 'stemLit', 'capLit');
  switch (genes.species) {
    case 'fly-agaric': {
      return {
        ...shared,
        under: PALETTE.gills,
        cap: nudgeHue(PALETTE.capRed, genes.hueNudge),
      };
    }
    case 'porcini': {
      const { stem, pores, tan, chestnut, lit } = PALETTE.porcini;
      return {
        ...shared,
        stem,
        under: pores,
        cap: mix(tan, chestnut, porciniBrown(genes)),
        capLit: lit,
      };
    }
    case 'chanterelle': {
      const { chanterelle } = PALETTE;
      const flesh = nudgeHue(chanterelle.flesh, genes.hueNudge);
      return {
        stem: flesh,
        stemLit: chanterelle.lit,
        under: flesh,
        cap: flesh,
        capLit: chanterelle.lit,
      };
    }
    case 'russula': {
      return {
        ...shared,
        under: PALETTE.russulaGills,
        cap: russulaCap(genes),
      };
    }
    default: {
      return genes satisfies never;
    }
  }
}

function russulaCap(genes: RussulaGenes): number {
  return nudgeHue(PALETTE.russula[genes.tone], genes.hueNudge);
}

/** A porcini's paler band along its cap's margin. */
export function porciniMargin(genes: PorciniGenes): number {
  return mix(
    mushroomTints(genes).cap,
    PALETTE.porcini.margin,
    MARGIN_SHARE,
  );
}

/** The paler middle of a russula's cap, in its dip. */
export function russulaCentre(genes: RussulaGenes): number {
  return mix(russulaCap(genes), PALETTE.highlight, CENTRE_PALE);
}

/** The contrast a child reads an edge by. */
const READS = 3;

/**
 * The pale line a house piece of `fill` takes round its outer edge on
 * `behind`, a cap or a stem: none where its own ink stands 3:1 off it, so a
 * window frame on a dark cap gets a light line round it and one on a red or
 * orange cap its dark ink alone.
 */
export function haloFor(fill: number, behind: number): number | undefined {
  return contrast(inkFor(fill), behind) >= READS ? undefined : PALETTE.rimLight;
}
