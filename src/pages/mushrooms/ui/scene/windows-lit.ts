import { type Dusk, duskness } from '../../model/dusk';
import { smooth } from '../../model/motion';

/** The longest a house's windows light after the meadow's dusk, in ms, so the village lights up house by house. */
export const LIT_DELAY_MOST = 1500;
/** How far toward dusk a house's light stands, its delay behind, as its windows start to light; and how much further on they are fully lit. */
const LIT_FROM = 0.3;
const LIT_SPAN = 0.45;

/**
 * How lit a house's windows show at `now`, in ms: from 0 by day to 1 well
 * into dusk, a delay of up to `LIT_DELAY_MOST` seeded by the house's `phase`
 * behind the meadow's light, both as it falls and as it comes back.
 */
export function windowsLit(dusk: Dusk, now: number, phase: number): number {
  const delay = ((phase / (Math.PI * 2)) % 1) * LIT_DELAY_MOST;
  return smooth((duskness(dusk, now - delay) - LIT_FROM) / LIT_SPAN);
}
