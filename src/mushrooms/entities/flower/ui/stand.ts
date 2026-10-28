/**
 * The meadow as the scene stands it, which both where the flowers stand
 * (`flower-plots.ts`) and whether they are seen (`flower-sight.ts`) read.
 */

import { pick } from '@/kernel/shared/lib/collections';
import type { WithHeight } from '@/kernel/shared/typings';

import type {
  ClumpGround,
  Occupied,
  Occupying,
  Stood,
  WithCamera,
  WithLayout,
} from '@/mushrooms/shared/world';

import type { Flower, WithPulled } from '../model/flower-genes';
import type { WithPlanted } from '../model/planted-flowers';
import type { Bedded } from './flower-layout';

export type FlowerPlotsLayout = WithCamera & ClumpGround & Bedded;

export type FlowerSightLayout = WithHeight & FlowerPlotsLayout;

/** The layout and the visit's seeded flowers on it. */
export type SeededLayout<L = FlowerSightLayout> = WithLayout<L> & {
  flowers: readonly Flower[];
};

/**
 * The meadow as the scene stands it: the layout, the visit's seeded flowers,
 * the planted ones and the ones the child pulled up, and the things standing
 * among them, with how they occupy the ground (`Occupying`); generic in the
 * layout, which the scene reads more of than the sight does, and in the
 * things, which the flowers know only as occupants.
 */
export type Stand<
  L = FlowerSightLayout,
  Thing extends Stood = Stood,
> = SeededLayout<L> &
  WithPlanted &
  WithPulled &
  Occupied<Thing> & { occupying: Occupying<Thing> };

/** `meadow` as it stands on `layout` among the visit's seeded `flowers`, its things occupying the ground as `occupying` says. */
export function standOf<L extends FlowerSightLayout, Thing extends Stood>(
  layout: L,
  flowers: readonly Flower[],
  meadow: WithPlanted & WithPulled & Occupied<Thing>,
  occupying: Occupying<Thing>,
): Stand<L, Thing> {
  return {
    layout,
    flowers,
    ...pick(meadow, 'mushrooms', 'planted', 'pulled'),
    occupying,
  };
}
