import { latLonToUnit } from '@/island/shared/globe';
import { analyze, type SphereTransform } from '@/island/entities/terrain';

import { worldToPlane } from './azimuthal';
import { coast, drawnLakes } from './coast';
import { buildCoastField, type CoastField } from './coast-field';
import { coastTarget, type FitTarget, lakeLine, lakeWater } from './sphere-fit';

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

const degrees = (radians: number) => (radians * 180) / Math.PI;

/**
 * #1's fit, measured on `fine`'s grid: patches placed in plane km from the
 * island centre too, and the five drawn lakes.
 */
export function drawnFit(fine: SphereTransform): FitTarget {
  const field = drawnField();
  return {
    truth: coastTarget(fine.grid, field, Infinity),
    series: (transform, clip) => drawnSeries(transform, field, clip),
    place: (patch) => {
      const { x, y } = worldToPlane(latLonToUnit(patch));
      return (
        `${degrees(patch.lat).toFixed(1)}°, ${degrees(patch.lon).toFixed(1)}° ` +
        `(${(x / 1000).toFixed(0)}, ${(y / 1000).toFixed(0)}) km`
      );
    },
    report: (kept) => [
      'the drawn lakes:',
      ...drawnLakes.map((lake) => {
        const { nodes, water } = lakeWater(fine.grid, kept, lake);
        const at = `at (${lake.x.toFixed(0)}, ${lake.y.toFixed(0)}) km`;
        return lakeLine(at, nodes, water);
      }),
    ],
  };
}
