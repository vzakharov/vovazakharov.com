/**
 * A meadow settled at rest to be kept, and opened again from what was kept.
 * Every moment in a meadow is on the scene's clock, which starts afresh each
 * load, so a kept moment is one every load has already passed by its first
 * frame.
 */

import { pick } from '@/shared/lib/collections';

import { FULL_DAY, FULL_DUSK } from './dusk';
import { restedFliers } from './flier-rest';
import type { Meadow } from './game';
import type { KeptMeadow } from './kept-record';
import { NO_NIGHT_RUNS } from './night-runs';
import { SPROUT_MS, sproutedInRain } from './sprouting';

/**
 * The moment every kept stamp is set to: longer before the load's start
 * than any span a rule measures from a stamp, so each reads it as long over.
 */
export const RESTED_AT = -SPROUT_MS;

/** What a meadow opens with of what is not kept: nothing selected, every picker shut, no shower yet. */
const UNKEPT = {
  selected: undefined,
  picking: false,
  furnishing: false,
  planting: undefined,
  rain: undefined,
} as const satisfies Omit<Meadow, keyof KeptMeadow>;

/**
 * `meadow` at rest as of `now`, to be kept: every spore a shower under way
 * would raise come up, every sprout grown, the light turned all the way it
 * was going, no mouse's outing due or playing, the fliers seated
 * (`restedFliers`), every lying spore settled long ago.
 */
export function settled(meadow: Meadow, now: number): KeptMeadow {
  const risen = sproutedInRain(meadow, Infinity);
  const { mushrooms, spores, dusk, nightRuns, insects } = risen;
  const { selected, picking, furnishing, planting, rain, ...kept } = risen;
  return {
    ...kept,
    mushrooms: mushrooms.map(({ sprout, ...grown }) => grown),
    spores: spores.map((spore) => ({ ...spore, at: RESTED_AT })),
    dusk: dusk.toward === 'dusk' ? FULL_DUSK : FULL_DAY,
    nightRuns: { ...NO_NIGHT_RUNS, ...pick(nightRuns, 'made') },
    insects: restedFliers(insects, now),
  };
}

/** The meadow `kept` opens as, with `UNKEPT` for what was not kept. */
export function reopened(kept: KeptMeadow): Meadow {
  return { ...kept, ...UNKEPT };
}
