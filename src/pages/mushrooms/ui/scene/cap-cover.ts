/**
 * How much of a mushroom's cap a nearer one's hides: read box against box,
 * the cap and gills as drawn, so a pick and the sweeps over it measure the
 * same thing.
 */

import { type Box, boxAround } from '../../model/geometry';
import type { Standing } from './door-sight';

/** How much of a cap's box a nearer mushroom's cap may hide. */
export const MOST_HIDDEN = 0.25;

/** How much of `box`'s area `over` covers. */
export function coverOf(box: Box, over: Box): number {
  const across =
    Math.min(box.right, over.right) - Math.max(box.left, over.left);
  const down = Math.min(box.bottom, over.bottom) - Math.max(box.top, over.top);
  const area = (box.right - box.left) * (box.bottom - box.top);
  return (Math.max(0, across) * Math.max(0, down)) / area;
}

/** The box round `standing`'s cap and gills as drawn. */
export function capBox({ drawn: [dome = [], gills = []] }: Standing): Box {
  return boxAround([...dome, ...gills]);
}
