/**
 * What a meadow is made of, and which of it a reload keeps: the shapes the
 * game (`model/game.ts`) plays and the kept record (`kept-record.ts`) stores.
 */

import type { WithDusk, WithRain } from '@/mushrooms/shared/sky';
import type {
  Planting,
  WithPulled,
} from '@/mushrooms/entities/flower/index.node-safe';
import type {
  Grown,
  WithMushrooms,
  WithSelected,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import type { Spored } from '@/mushrooms/features/grow-mushroom/index.node-safe';
import type { Swarm } from '@/mushrooms/features/insects-fly/index.node-safe';
import type { NightRuns } from '@/mushrooms/features/mice-run/index.node-safe';

export type Meadow = Unkept & KeptMeadow;

/** The pickers a meadow has open. */
export type Pickers = {
  /** Whether the four species are showing, waiting for a pick. */
  picking: boolean;
  /** Whether the windows and the door are showing, waiting for a pick. */
  furnishing: boolean;
  /** The flower picker, open on a tuft or a flower, `undefined` while closed. */
  planting: Planting | undefined;
};

/** What of a meadow belongs to the load that has it: the selection, the pickers and the shower. */
export type Unkept = Pickers & WithSelected & WithRain;

/** The mushrooms standing and the flowers pulled up: what the child's hands left on the ground. */
export type Tended = WithMushrooms & WithPulled;

/** A meadow as a reload keeps it: all of it but `Unkept`. */
export type KeptMeadow = Swarm &
  Tended &
  WithDusk &
  Spored &
  Grown & {
    /** How many insects the meadow has ever released, so every id is new. */
    released: number;
    /** The mice's own outings at dusk (`nightRan`). */
    nightRuns: NightRuns;
  };

/** Every picker shut: the mushrooms', the house's and the flowers'. */
export const PICKERS_SHUT = {
  picking: false,
  furnishing: false,
  planting: undefined,
} as const satisfies Pickers;
