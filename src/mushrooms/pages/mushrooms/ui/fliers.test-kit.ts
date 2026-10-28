import {
  type Flier,
  insectGenes,
  type InsectKind,
  wingspan,
} from '@/mushrooms/entities/insect/index.node-safe';
import { VISITS } from '@/mushrooms/entities/mushroom/index.node-safe';

import type { MeadowLayout } from './layout';
import type { Playing } from './visit-play';

/** How long each visit is played and how often ticked, and how far apart its fliers fly in, in ms. */
const LASTING = 5 * 60_000;
export const TICK = 250;
const GAP = 300;
export const SEEDS = VISITS.slice(0, 3);
/** `kinds` played `GAP` apart, over `LASTING`, ticked every `TICK`. */
export const playingOf = (kinds: readonly InsectKind[]): Playing => ({
  kinds,
  gap: GAP,
  lasting: LASTING,
  tick: TICK,
});

/** Each flier's wingspan in units of its own size, by kind and seed, measured once. */
const wingspans = new Map<string, number>();

/** How wide a flier's wings span on `layout`, in CSS px. */
export function spanOn(layout: MeadowLayout, flier: Flier): number {
  const key = `${flier.kind} ${String(flier.seed)}`;
  const span = wingspans.get(key) ?? wingspan(insectGenes(flier));
  wingspans.set(key, span);
  return span * layout.insectSizes[flier.kind];
}

/** The share of `part` in `whole`, 0 for none. */
export const share = (part: number, whole: number) =>
  whole > 0 ? part / whole : 0;
