/**
 * The pollen a bee carries from flower to flower, and shows on its legs.
 */

import type { Flight, Leg } from './flight-timing';

/** How many specks of pollen a bee's baskets hold at most. */
export const POLLEN_MOST = 3;

/**
 * What a bee carries: `from`, the last flower it drank at, `undefined` until
 * its first; `specks`, the pollen on its legs, 0 to `POLLEN_MOST`, as it
 * stands in flight; `pollinates`, whether the flower its current leg goes to
 * is one it pollinates, a flower other than `from`.
 */
export type Pollen = Specked & {
  from: string | undefined;
  pollinates: boolean;
};
export type Specked = { specks: number };
export type Carrying = { pollen: Pollen };

/** A bee's pollen as it flies in, before any flower. */
export const NO_POLLEN: Pollen = {
  from: undefined,
  specks: 0,
  pollinates: false,
};

/** The flower `leg` has the insect at by `now`, when it went to one and landed. */
export function landedAt(
  { to, arrives }: Leg,
  now: number,
): string | undefined {
  return to.kind === 'flower' && now >= arrives ? to.id : undefined;
}

/**
 * `pollen` as the bee leaves `leg` at `now` for `next`. Having landed at a
 * flower, it carries that flower's pollen on, a speck more than it had, up
 * to `POLLEN_MOST` — one speck alone when it had shed the rest there,
 * pollinating it; a leg cut short before landing leaves the load as it was.
 * `next` pollinates when it goes to a flower other than the one carried from.
 */
export function pollenAfter(
  pollen: Pollen,
  leg: Leg,
  now: number,
  next: Leg,
): Pollen {
  const flower = landedAt(leg, now);
  const visited =
    flower === undefined
      ? pollen
      : {
          from: flower,
          specks: pollen.pollinates
            ? 1
            : Math.min(POLLEN_MOST, pollen.specks + 1),
        };
  const pollinates =
    next.to.kind === 'flower' &&
    visited.from !== undefined &&
    visited.from !== next.to.id;
  return { ...visited, pollinates };
}

/**
 * How many specks the bee on `leg` shows at `now`: what it carries, and none
 * once it has landed at a flower it pollinates, having shed them there.
 */
export function specksAt(
  { pollen, leg }: Carrying & Flight,
  now: number,
): number {
  return pollen.pollinates && landedAt(leg, now) !== undefined
    ? 0
    : pollen.specks;
}
