/**
 * Which perches an insect may take, given the others' (`Held`): none another
 * sits on or is heading to, none crowded by one of those for the two kinds
 * (`Crowding`), and, for every kind but the bee, none the bees are owed
 * (`keptForBees`).
 */

import type { Pairing, Perch, Perches, Sight } from './flight';
import type { InsectKind, Kinded } from './insect-genes';

/** A perch an insect sits on. */
type Seat = Extract<Perch, { kind: 'flower' | 'cap' }>;

export function isSamePerch(a: Perch, b: Perch): boolean {
  return a.kind === 'away' || b.kind === 'away'
    ? false
    : a.kind === b.kind && a.id === b.id;
}

/** A perch another insect sits on or is heading to, and that insect's kind. */
export type Held = Kinded & { perch: Perch };

/** A perch's name, the same for the same perch, as `Places` keys it. */
export function perchName(perch: Perch): string {
  return perch.kind === 'away'
    ? `away ${perch.side}`
    : `${perch.kind} ${perch.id}`;
}

const hasPairing = (pairings: readonly Pairing[], [a, b]: Pairing) =>
  pairings.some(([first, second]) => first === a && second === b);

/** Whether `held` is a bee roaming the air for want of a flower. */
const isWaitingBee = ({ kind, perch }: Held) =>
  kind === 'bee' && perch.kind === 'air';

/**
 * Every perch an insect of `kind` may not take: each of `taken`, and each
 * that stands too close to one of them for `kind` beside the kind there.
 */
export function blockedFor(
  kind: InsectKind,
  taken: readonly Held[],
  crowded: Sight['crowded'],
): Set<string> {
  const blocked = new Set(taken.map(({ perch }) => perchName(perch)));
  for (const [a, b, pairings] of crowded) {
    for (const held of taken) {
      if (isSamePerch(a, held.perch) && hasPairing(pairings, [held.kind, kind]))
        blocked.add(perchName(b));
      if (isSamePerch(b, held.perch) && hasPairing(pairings, [kind, held.kind]))
        blocked.add(perchName(a));
    }
  }
  return blocked;
}

/** What of `Perches` the rules for flowers read: the flowers in sight, a bee's own, and the crowded pairs. */
type FlowersSeen = Pick<Perches, 'flowers' | 'beeFlowers' | 'crowded'>;

/**
 * The flowers `perches` offers an insect of `kind`: a bee's own, where the
 * scene gives them (`Sight`), and the ones in sight to every kind otherwise.
 */
export function flowersFor(
  kind: InsectKind,
  { flowers, beeFlowers }: Pick<Perches, 'flowers' | 'beeFlowers'>,
): readonly string[] {
  return kind === 'bee' ? (beeFlowers ?? flowers) : flowers;
}

/**
 * The perches an insect of `kind` other than a bee leaves to the bees: while
 * a bee waits in the air, or the flowers open to a bee are no more than the
 * bees, every such flower and every perch crowding one.
 */
export function keptForBees(
  kind: InsectKind,
  taken: readonly Held[],
  perches: FlowersSeen,
): Set<string> {
  const bees = taken.filter((each) => each.kind === 'bee').length;
  if (kind === 'bee' || bees === 0) return new Set();
  const { crowded } = perches;
  const forBee = blockedFor('bee', taken, crowded);
  const kept = flowersFor('bee', perches)
    .map((id): Held => ({ kind: 'bee', perch: { kind: 'flower', id } }))
    .filter(({ perch }) => !forBee.has(perchName(perch)));
  return kept.length <= bees || taken.some((each) => isWaitingBee(each))
    ? blockedFor(kind, kept, crowded)
    : new Set();
}

/**
 * Whether an insect of `kind` sitting on `perch` makes way for a bee waiting
 * in the air among `taken`: its perch is one it would leave to the bees
 * (`keptForBees`), so it takes its next leg at once.
 */
export function givesWay(
  { kind, perch }: Held,
  taken: readonly Held[],
  perches: FlowersSeen,
): boolean {
  return (
    kind !== 'bee' &&
    isSeat(perch) &&
    taken.some((each) => isWaitingBee(each)) &&
    keptForBees(kind, taken, perches).has(perchName(perch))
  );
}

/**
 * Whether a bee hovering in the air, among `taken`, has a flower open to it,
 * so it flies there at once rather than finish its hover.
 */
export function flowerFreed(
  held: Held,
  taken: readonly Held[],
  perches: FlowersSeen,
): boolean {
  if (!isWaitingBee(held)) return false;
  const blocked = blockedFor('bee', taken, perches.crowded);
  return flowersFor('bee', perches).some(
    (id) => !blocked.has(perchName({ kind: 'flower', id })),
  );
}

/** Whether `perch` is one an insect sits on, rather than the air or away. */
export function isSeat(perch: Perch): perch is Seat {
  return perch.kind === 'flower' || perch.kind === 'cap';
}
