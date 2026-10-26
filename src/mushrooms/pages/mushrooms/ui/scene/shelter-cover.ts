/**
 * Whether a mushroom nearer the front is drawn over an insect sheltering
 * under a cap. The insects are painted over every mushroom, so one
 * sheltering where a nearer cap or stem is drawn would read as sitting on
 * that one, not hiding under its own: such a seat is not offered.
 */

import {
  boxAround,
  boxesMeet,
  containsPoint,
  type Point,
} from '../../model/geometry';
import type { Cover } from './flower-sight';

/** How many points round each ring of a disc it is judged at. */
const RING = 8;

/** The points a disc `radius` round `middle` is judged at: its middle, and a ring at half and at full `radius`. */
export function discPoints(middle: Point, radius: number): Point[] {
  const ring = (reach: number) =>
    Array.from({ length: RING }, (_, step) => {
      const angle = (step * 2 * Math.PI) / RING;
      return {
        x: middle.x + reach * Math.cos(angle),
        y: middle.y + reach * Math.sin(angle),
      };
    });
  return [middle, ...ring(radius / 2), ...ring(radius)];
}

/**
 * Whether any of `covers` standing nearer the front than `depth` (`Cover`'s
 * own, its foot's row) draws over the disc `radius` round `middle`
 * (`discPoints`): a mushroom at the same depth is not nearer.
 */
export function discCovered(
  middle: Point,
  radius: number,
  depth: number,
  covers: readonly Cover[],
): boolean {
  const points = discPoints(middle, radius);
  const disc = boxAround(points);
  return covers.some(
    (cover) =>
      cover.depth > depth &&
      cover.drawn.some(
        ({ outline, box }) =>
          boxesMeet(disc, box) &&
          points.some((point) => containsPoint(outline, point)),
      ),
  );
}
