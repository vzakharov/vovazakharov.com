import {
  analyze,
  buildCoastField,
  type CoastField,
  type SphereTransform,
} from '@/island/entities/terrain';

import { coast } from './coast';
import { coastTarget } from './sphere-fit';

/** Call 6's clip on #1's target, in metres. */
export const DRAWN_CLIP_METRES = 500_000;

/** The drawn coast's signed-distance field on the island plane. */
export const drawnField = (): CoastField => buildCoastField(coast);

/**
 * #1's series before quantizing: the analysis up to the transform's degree of
 * the drawn coast's signed distance, clipped to `±clip`.
 */
export const drawnSeries = (
  transform: SphereTransform,
  field: CoastField,
  clip = DRAWN_CLIP_METRES,
): Float64Array => analyze(transform, coastTarget(transform.grid, field, clip));
