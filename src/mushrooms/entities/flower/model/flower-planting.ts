/**
 * The flower picker: where it is open and what the child has picked in it so
 * far, and the two picks it takes — a colour, then a shape.
 */

import type { WithId } from '@/kernel/shared/typings';

import type { Seeds } from '@/mushrooms/shared/lib/random';
import type { Rooted } from '@/mushrooms/shared/world';

import type { Coloured } from './flower-genes';
import { FLOWER_SHAPES, type FlowerShape } from './flower-sounds';

/**
 * A colour the child picked to plant, and the seed each of `FLOWER_SHAPES`
 * grows from in it, in that order, drawn before the pick so the picker shows
 * the very flower that will grow.
 */
type Chosen = Coloured & Seeds;

/**
 * Where the flower picker is open, as a foot on the plane, while it waits:
 * for a colour while `chosen` is `undefined`, then for a shape. On a tuft the
 * child tapped, `flower` is `undefined`; on a flower the child held, it is
 * that flower's id, which a pick replaces and the cross pulls up.
 */
export type Planting = Rooted & {
  chosen: Chosen | undefined;
  flower: string | undefined;
};

/** A long press on the flower `id`, standing at `foot`: opens the picker on it. */
export type HoldFlower = { kind: 'flower' } & WithId & Rooted;

/** The picker's first pick: a colour, and the seeds its shapes grow from. */
export type PickColour = { kind: 'colour' } & Chosen;

/** The picker's second pick: a shape, which plants the flower. */
export type PlantShape = { kind: 'plant'; shape: FlowerShape };

/** The seed `shape` grows from in the colour `planting` has picked; `undefined` before a pick. */
export function shapeSeed(
  planting: Planting | undefined,
  shape: FlowerShape,
): number | undefined {
  return planting?.chosen?.seeds[FLOWER_SHAPES.indexOf(shape)];
}
