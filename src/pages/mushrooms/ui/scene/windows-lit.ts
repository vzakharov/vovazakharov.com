import { duskness } from '../../model/dusk';
import { smooth } from '../../model/motion';
import type { Lights } from './dusk-view';

/** The longest a house's windows light after the meadow's dusk, in ms, so the village lights up house by house. */
export const LIT_DELAY_MOST = 1500;
/** How far toward dusk a house's light stands, its delay behind, as its windows start to light; and how much further on they are fully lit. */
const LIT_FROM = 0.15;
const LIT_SPAN = 0.5;

/**
 * How lit a house's windows show at `now`, in ms: from 0 by day to 1 well
 * into dusk, a delay of up to `LIT_DELAY_MOST` seeded by the house's `phase`
 * behind the meadow's light, both as it falls and as it comes back. A house
 * still lagging when the light is turned reads the turn `before` until its
 * delay is past, so it carries on from where its own light stood.
 */
export function windowsLit(
  { dusk, before }: Pick<Lights, 'dusk' | 'before'>,
  now: number,
  phase: number,
): number {
  const delay = ((phase / (Math.PI * 2)) % 1) * LIT_DELAY_MOST;
  const at = now - delay;
  const level = duskness(at < dusk.startedAt ? before : dusk, at);
  return smooth((level - LIT_FROM) / LIT_SPAN);
}
