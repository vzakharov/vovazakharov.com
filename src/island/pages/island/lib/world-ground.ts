import {
  type CoastDistance,
  detailedCoast,
  heightAtSphere,
  sampleSphereField,
  type SphereField,
} from '@/island/entities/terrain';
import type { GroundAt } from '@/island/features/eye';

/** Ground before a world's field arrives; nothing reads it before then. */
export const SEA_LEVEL: GroundAt = () => 0;

/**
 * The signed distance to the coast a world's field holds, bent by its terrain
 * seed: the one coast the tiles, their selection and the eye all read.
 */
export const coastOf = (field: SphereField, seed: number): CoastDistance =>
  detailedCoast((p) => sampleSphereField(field, p), seed);

/** The ground the eye stands on: the world's relief with no detail cut. */
export const groundOf =
  (coast: CoastDistance, seed: number): GroundAt =>
  (p) =>
    heightAtSphere(coast, seed, p);
