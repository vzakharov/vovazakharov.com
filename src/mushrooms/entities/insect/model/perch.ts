/**
 * An insect's perches: where it can be, by name, and where each stands. How a
 * flight from one to the next is timed is `flight-timing.ts`'s; which perch
 * it takes next is the flying's (`flight.ts`, `features/insects-fly`).
 */

import type { WithId } from '@/kernel/shared/typings';

import type { ShelterSide } from '@/mushrooms/shared/world';

import type { Place } from './flight-frame';

/** A seat under a cap: the cap's id, and which side of the stem. */
export type ShelterSeat = WithId & { seat: ShelterSide };

export const SIDES = ['left', 'right'] as const;
export type Side = (typeof SIDES)[number];

export const PERCH_KINDS = ['flower', 'cap', 'air', 'shelter', 'away'] as const;
export type PerchKind = (typeof PERCH_KINDS)[number];

/** What each kind of perch carries beside its kind. */
type PerchFields = {
  flower: WithId;
  cap: WithId;
  air: WithId;
  shelter: ShelterSeat;
  away: { side: Side };
};

/**
 * Where an insect wants to be: a flower or a cap by id, a seat under a cap
 * (`ShelterSeat`), a spot in the open air by id, which it only passes
 * through, or `away`, off screen past that side's edge.
 */
export type Perch = {
  [Kind in PerchKind]: { kind: Kind } & PerchFields[Kind];
}[PerchKind];

/**
 * Where each perch stands (`Place`), by its name (`perchName`), so a distance
 * between two reads the same on every screen; `away` by its side, just past
 * the screen's edge.
 */
export type Places = Readonly<Record<string, Place>>;

/** What of `Sight` times a leg. */
export type Placed = {
  /** Where the perches stand, so a long flight takes longer than a short one (`Habits`). */
  places?: Places;
  /**
   * Where the scene last drew each flier, by its id, in the places' frame:
   * only its steering knows where a flier cut off mid-flight sets off from.
   */
  drawn?: Readonly<Record<string, Place>>;
  /** Each flier's own away spots, by its id: the scene draws one leaving at its own height and span past the edge. */
  aways?: Readonly<Record<string, Places>>;
};

/** Where a leg sets off from. */
export type Origin = { from: Perch };

/** Where a leg flies to. */
export type Destination = { to: Perch };

/** Where a leg sets off from and flies to. */
export type Route = Origin & Destination;

export function isSamePerch(a: Perch, b: Perch): boolean {
  if (a.kind === 'away' || b.kind === 'away') return false;
  if (a.kind !== b.kind || a.id !== b.id) return false;
  return a.kind !== 'shelter' || b.kind !== 'shelter' || a.seat === b.seat;
}

/** A perch's name, the same for the same perch, as `Places` keys it. */
export function perchName(perch: Perch): string {
  if (perch.kind === 'away') return `away ${perch.side}`;
  if (perch.kind === 'shelter') return `shelter ${perch.id} ${perch.seat}`;
  return `${perch.kind} ${perch.id}`;
}
