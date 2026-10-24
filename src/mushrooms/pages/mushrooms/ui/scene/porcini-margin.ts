import { type Point, sample } from '../../model/geometry';
import type { PorciniGenes } from '../../model/mushroom-genes';
import { domeArc } from '../../model/mushroom-outline';
import { crescent } from './crescent';

/** A porcini's pale margin: how far round the rim it climbs, in radians from it, and how deep it reaches in, in the cap's height. */
const MARGIN_CLIMB = 0.55;
const MARGIN_DEPTH = 0.2;

/**
 * A porcini's paler band along its cap's margin, on the canvas through
 * `toMushroom` at `size` px to the unit: up each side from near the rim,
 * round it and along the underside, reaching into the cap from there.
 */
export function marginBand(
  genes: PorciniGenes,
  toMushroom: (point: Point) => Point,
  size: number,
  steps: number,
): Point[] {
  const half = genes.capWidth / 2;
  const climb = (from: number, to: number) =>
    domeArc(genes, half, [from, to], 0, steps);
  const arc = [
    ...climb(-Math.PI / 2 + MARGIN_CLIMB, -Math.PI / 2),
    ...sample(-half, half, steps, (x) => ({ x, y: 0 })).slice(1, -1),
    ...climb(Math.PI / 2, Math.PI / 2 - MARGIN_CLIMB),
  ].map((point) => toMushroom(point));
  return crescent(
    arc,
    toMushroom({ x: 0, y: genes.capHeight * 0.6 }),
    genes.capHeight * size * MARGIN_DEPTH,
  );
}
