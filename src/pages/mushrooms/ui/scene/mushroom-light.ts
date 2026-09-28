/**
 * Where the light falls on a mushroom's cap: its shade, its rim light and
 * its shine, each on the side the light gives it. In the cap's frame (units
 * of size, y up) unless said otherwise.
 */

import { type Point, sample } from '../../model/geometry';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { CURVE_STEPS, domeArc } from '../../model/mushroom-outline';
import { litSide } from './ink';
import { PALETTE } from './palette';

/** The dome's arc from `from` past its crown to the rim, on `side`. */
function sideArc(
  genes: MushroomGenes,
  side: -1 | 1,
  from: number,
  to = Math.PI / 2,
): Point[] {
  return domeArc(genes, genes.capWidth / 2, [from, to]).map(({ x, y }) => ({
    x: x * side,
    y,
  }));
}

/** The dome's arc on the side turned from the light: where the shade lies. */
export function capShadeArc(genes: MushroomGenes, toward: Point): Point[] {
  return sideArc(genes, litSide(toward) === 1 ? -1 : 1, 0.3);
}

/** The dome's arc on the light's side, from near its crown to the rim: where the rim light lies. */
export function capRimArc(genes: MushroomGenes, toward: Point): Point[] {
  return sideArc(genes, litSide(toward), 0.12, Math.PI / 2 - 0.08);
}

/** The shine's middle on the cap, over toward the light. */
export function capShine(
  { capWidth, capHeight }: MushroomGenes,
  toward: Point,
): Point {
  return { x: toward.x * 0.2 * capWidth, y: capHeight * 0.72 };
}

/**
 * The half of a circle round `centre` turned from the light, in the canvas's
 * frame (y down, as `toward` is): a spot's shade, an eye's.
 */
export function shadedHalf(centre: Point, r: number, toward: Point): Point[] {
  const away = Math.atan2(-toward.y, -toward.x);
  return sample(
    away - Math.PI / 2,
    away + Math.PI / 2,
    CURVE_STEPS,
    (angle) => ({
      x: centre.x + r * Math.cos(angle),
      y: centre.y + r * Math.sin(angle),
    }),
  );
}

/**
 * One of the stem's layers of light: its colour, its alpha, how deep into the
 * stem it reaches from its edge, in the stem's widths, and which edge.
 */
export type StemLayer = readonly [
  colour: number,
  alpha: number,
  depth: number,
  side: 'sun' | 'shade',
];

/** `count` layers of `colour` on `side`, each at `alpha`, from `deepest` in to `shallowest`. */
function layers(
  colour: number,
  side: StemLayer[3],
  count: number,
  alpha: number,
  [deepest, shallowest]: readonly [number, number],
): StemLayer[] {
  return Array.from({ length: count }, (_, index) => [
    colour,
    alpha,
    deepest + ((shallowest - deepest) * index) / (count - 1),
    side,
  ]);
}

/**
 * The stem's light, as the cap's: a cool shade on the side turned from the
 * sun and a warm light on the side toward it, each stacked in thin layers
 * from the deepest in, so it deepens toward the edge with no band of its
 * own; and a pale line just inside the lit edge. It stays light enough that
 * the stem still reads as pale.
 */
export const STEM_LIGHT: readonly StemLayer[] = [
  ...layers(PALETTE.shadeCool, 'shade', 12, 0.024, [0.6, 0.08]),
  ...layers(PALETTE.stemLit, 'sun', 8, 0.08, [0.34, 0.06]),
  [PALETTE.rimLight, 0.6, 0.04, 'sun'],
];
