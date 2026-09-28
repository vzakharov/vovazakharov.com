/**
 * Where the light falls on a mushroom's cap: its shade, its rim light and
 * its shine, each on the side the light gives it. In the cap's frame (units
 * of size, y up) unless said otherwise.
 */

import { type Point, sample } from '../../model/geometry';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { CURVE_STEPS, domeArc } from '../../model/mushroom-outline';
import { litSide } from './ink';

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
