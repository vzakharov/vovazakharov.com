/**
 * The fliers as a meadow is kept: each seated on the perch its leg goes to,
 * with what was left of its stay, so the next load finds none in the air.
 */

import type { Leg } from './flight';
import type { Flier } from './insects';
import { RESTED_AT } from './keeping';

/**
 * `insects` at rest, settled at `now`: one leaving is gone; one under a cap
 * sits there with no stay left, so the first tick with no shower sends it
 * out; any other sits on its perch with the rest of its stay counted from
 * the next load's start, all of it for one still in flight. Only what a
 * seated flier carries is kept: no dart, and no dash or pivot on the leg.
 */
export function restedFliers(
  insects: readonly Flier[],
  now: number,
): readonly Flier[] {
  return insects.flatMap((flier): Flier[] => {
    const { leg, shied, ...rest } = flier;
    const { to, arrives, leaves, hops } = leg;
    if (to.kind === 'away') return [];
    const stay =
      to.kind === 'shelter' ? 0 : Math.max(0, leaves - Math.max(now, arrives));
    const seated: Leg = {
      from: to,
      to,
      departs: RESTED_AT,
      arrives: RESTED_AT,
      leaves: stay,
      ...(hops && { hops }),
    };
    return [{ ...rest, leg: seated }];
  });
}
