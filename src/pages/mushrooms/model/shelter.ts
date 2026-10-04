/**
 * Shelter from the rain: while it falls, a flier is offered only the seats
 * under the caps and the air, and takes the seat nearest where it is drawn;
 * the shower's start sends every flier at once, and its end lets them out one
 * by one. Nothing here draws from a leg's stream, so a dry meadow flies as if
 * shelter did not exist.
 */

import type { WithId } from '@/shared/typings';

import type { Choosing, Flight, Leg, Perch, Perches } from './flight';
import { apartIn } from './flight-timing';
import { isSamePerch, perchName } from './perch-room';
import { between, saltedStream, type Seeded } from './random';
import { type Rain, raining } from './weather';

/** A cap's two seats underneath, left and right of its stem. */
export const SHELTER_SEATS = [0, 1] as const;

/** A seat under a cap: the cap's id, and which side of the stem. */
export type ShelterSeat = WithId & { seat: (typeof SHELTER_SEATS)[number] };

type Shelter = Extract<Perch, { kind: 'shelter' }>;

/** The meadow's shower, as the swarm reads it off the meadow. */
export type Showered = { rain?: Rain | undefined };

/** How long after a shower stops a flier stays under its cap, in ms: a span its seed picks from. */
export const LINGER_MS = [300, 2500] as const;

/** Keeps the linger's draw apart from every other stream grown off the seed. */
const LINGER_SALT = 0x2c_8e_41_f7;

/** How long after a shower stops the flier grown off `seed` comes out, in ms (`LINGER_MS`). */
export function lingerOf({ seed }: Seeded): number {
  return between(saltedStream(seed, LINGER_SALT, 0), ...LINGER_MS);
}

/**
 * `perches` as `rain` leaves them at `now`: while it falls, with no flower
 * and no cap top, so only the shelters and the air are offered (`raining`);
 * dry, as they are, the same object, where a shelter is offered only to the
 * flier already under it. A scene that sights no shelters (`shelters` absent)
 * has its fliers keep their dry habits in the rain.
 */
export function shelteredPerches(
  perches: Perches,
  rain: Rain | undefined,
  now: number,
): Perches {
  const { shelters, beeFlowers } = perches;
  if (shelters === undefined || !raining(rain, now)) return perches;
  return {
    ...perches,
    flowers: [],
    ...(beeFlowers && { beeFlowers: [] }),
    caps: [],
    spotted: [],
    raining: true,
  };
}

const shelterOf = (seat: ShelterSeat): Shelter => ({
  kind: 'shelter',
  ...seat,
});

/** Whether `perches` sights `shelter`, the seat under a cap. */
export function offersShelter(
  { shelters }: Pick<Perches, 'shelters'>,
  { id, seat }: Shelter,
): boolean {
  return (
    shelters?.some((each) => each.id === id && each.seat === seat) ?? false
  );
}

/**
 * The open shelter nearest `from` by `perches.places` (`apartIn`), the first
 * sighted where they place none; open means sighted, not `from`, and not in
 * `blocked`. `undefined` with none open. It draws nothing, so the choice is
 * the same however often it is made.
 */
export function nearestShelter({
  from,
  perches,
  blocked,
}: Pick<Choosing, 'from' | 'perches' | 'blocked'>): Shelter | undefined {
  let nearest: { shelter: Shelter; apart: number } | undefined;
  for (const seat of perches.shelters ?? []) {
    const shelter = shelterOf(seat);
    if (isSamePerch(shelter, from) || blocked.has(perchName(shelter))) continue;
    const apart = apartIn(perches.places, from, shelter) ?? Infinity;
    if (nearest === undefined || apart < nearest.apart) {
      nearest = { shelter, apart };
    }
  }
  return nearest?.shelter;
}

/**
 * Whether `leg` is due at once for `rain` starting: while it falls over
 * sheltered `perches`, every leg that set off before it, mid-flight too,
 * other than one to a shelter. A leg taken in the rain sets off after its
 * start, so the rule fires once per flier a shower; a shower lengthened
 * keeps its start, so it sends no second dash.
 */
export function dashesForCover(
  { departs, to }: Pick<Leg, 'departs' | 'to'>,
  rain: Rain | undefined,
  { raining: falling }: Pick<Perches, 'raining'>,
): boolean {
  return (
    falling === true &&
    rain !== undefined &&
    departs < rain.startedAt &&
    to.kind !== 'shelter'
  );
}

/**
 * `fliers` with each one under a shelter staying there while `rain` falls at
 * `now` and its own linger after (`lingerOf`): a stay ending sooner is
 * stretched to `stopsAt` and the linger, so a shower lengthened keeps them
 * in. The same array when no stay changes.
 */
export function stayingDry<Each extends Seeded & Flight>(
  fliers: readonly Each[],
  rain: Rain | undefined,
  now: number,
): readonly Each[] {
  if (rain === undefined || !raining(rain, now)) return fliers;
  const stayed = fliers.map((flier) => {
    const { leg } = flier;
    if (leg.to.kind !== 'shelter') return flier;
    const leaves = Math.max(leg.arrives, rain.stopsAt + lingerOf(flier));
    return leg.leaves >= leaves ? flier : { ...flier, leg: { ...leg, leaves } };
  });
  const changed = stayed.some((flier, index) => flier !== fliers[index]);
  return changed ? stayed : fliers;
}
