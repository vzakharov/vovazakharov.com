import type { Point } from '@/mushrooms/shared/lib/geometry';
import {
  type Flier,
  insectGenes,
  type InsectKind,
  perchName,
  wingspan,
} from '@/mushrooms/entities/insect/index.node-safe';
import { VISITS } from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  isSeat,
  MOST_OVERLAP,
  perchSpot,
  seatAt,
} from '@/mushrooms/features/insects-fly/index.node-safe';

import type { MeadowLayout } from './layout';
import { type Opened, overlap, type Playing } from './visit-play';

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

/** Every two of `items`. */
export const pairsOf = <Item>(
  items: readonly Item[],
): Array<readonly [Item, Item]> =>
  items.flatMap((item, index) =>
    items.slice(index + 1).map((other) => [item, other] as const),
  );

/**
 * How, at `now`, two of `fliers` sitting share a perch or cover more than
 * `MOST_OVERLAP` of the narrower's wings, each seated as its kind sits there;
 * `undefined` where none do.
 */
export function seatedClash(
  stand: Opened,
  fliers: readonly Flier[],
  now: number,
  seats: Map<string, Point | undefined>,
): string | undefined {
  const { layout, planted } = stand;
  const sitting = fliers.flatMap((flier) => {
    const { to, arrives } = flier.leg;
    if (now < arrives || !isSeat(to)) return [];
    const name = perchName(to);
    // A perch stands still once it stands, so a seat is found once.
    const key = `${flier.id} ${name} ${String(planted.length)}`;
    const seat = seats.has(key)
      ? seats.get(key)
      : seatAt(stand, to, perchSpot(flier), flier.kind);
    seats.set(key, seat);
    return seat ? [{ flier, seat, name }] : [];
  });
  for (const [a, b] of pairsOf(sitting)) {
    if (a.name === b.name) return `${a.name} shared at ${String(now)}`;
    const apart = Math.hypot(a.seat.x - b.seat.x, a.seat.y - b.seat.y);
    const covered = overlap(
      spanOn(layout, a.flier),
      spanOn(layout, b.flier),
      apart,
    );
    if (covered > MOST_OVERLAP) {
      return `${a.flier.kind} on ${a.name} and ${b.flier.kind} on ${b.name} at ${String(now)}`;
    }
  }
  return undefined;
}
