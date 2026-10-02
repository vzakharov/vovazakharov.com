/**
 * How an insect goes down behind the brow, as a flower or a mushroom does.
 * While the ground under it stands this side of the brow it is drawn over
 * everything in the meadow; past it, it sorts among what sinks (`depthOf`),
 * under the brow's own ground, which covers it from below as it goes down
 * (`sunk`), paling as a bed does (`browPale`), and is hidden only once less
 * than `SHOWN_LEAST` of it shows over the brow (`sunkAway`).
 */

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { Layered } from '../../model/ground';
import { type BedPlace, depthOf, UNPLACED } from './bed-place';
import type { Translucent } from './ink';
import { browPale } from './repaint-queue';
import { behindHills, sunkAway, type View } from './view';

/**
 * How many screen rows nearer than the ground it is over an insect sorts
 * past the brow: over every part of the host it sits on (the house's are
 * the nearest, a tenth of a row), and over that host as it flies down onto
 * a seat a little off its foot's row.
 */
const OVER_HOST = 2;

/** The ground an insect is over: the row its foot stands on before it sinks, which it sorts by, and its distance from the eye. */
export type Under = Pick<BedPlace, 'depth' | 'distance'>;

/** How an insect is drawn for the brow: at what depth, how opaque, and whether at all. */
export type Sinking = Layered & Translucent & { shown: boolean };

/**
 * How `view` draws an insect whose middle is drawn at `middle`, sunk or not,
 * `height` CSS px tall there, over the ground `under`: at `above` this side
 * of the brow; past it, among what sinks, paler, and hidden once it has
 * sunk away.
 */
export function sinkingOf(
  view: View,
  middle: Point,
  height: number,
  under: Under,
  above: number,
): Sinking {
  if (!behindHills(under)) return { depth: above, alpha: 1, shown: true };
  const foot = {
    ...middle,
    y: middle.y + height / 2,
    ...pick(under, 'distance'),
  };
  return {
    depth: depthOf(
      { ...UNPLACED, ...pick(under, 'depth'), behind: true },
      OVER_HOST,
    ),
    alpha: 1 - browPale(under.distance),
    shown: !sunkAway(view, foot, height),
  };
}
