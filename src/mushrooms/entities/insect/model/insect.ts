/**
 * What every insect is, whatever its kind: the kinds there are, and the body
 * and wings each kind's genes build on.
 */

import type { WithId } from '@/kernel/shared/typings';

import type { Nudged, Seeded } from '@/mushrooms/shared/lib/random';

export const INSECT_KINDS = ['butterfly', 'fly', 'bee'] as const;
export type InsectKind = (typeof INSECT_KINDS)[number];

/** An insect of `Kind`, or of any kind. */
export type OfKind<Kind extends InsectKind> = { kind: Kind };
export type Kinded = OfKind<InsectKind>;
export type InsectSeed = Seeded & Kinded;
export type Insect = WithId & InsectSeed;

/**
 * One wing, in units of the insect's size: how far it reaches from the body,
 * how broad it is across, and its tip, from 0 (round) to 1 (pointed).
 */
export type Wing = { length: number; breadth: number; tip: number };

/**
 * What every insect's genes carry, lengths in units of its size, which the
 * scene sets: its kind, its hue's nudge, and its body seen from above, head
 * toward -y.
 */
export type InsectBody = Kinded & Nudged & Bodied;

/** An insect's body seen from above, in units of its size. */
export type Bodied = {
  bodyLength: number;
  /** The body's width at its thickest. */
  bodyWidth: number;
};

/**
 * A two-winged insect's genes beyond its body — the fly's and the bee's: one
 * pair of clear wings, and the legs it rubs, crawls or carries pollen on,
 * each as long as `legLength`.
 */
export type Buzzing = InsectBody & Winged;

/** A two-winged insect's one pair of clear wings, and its legs' length. */
export type Winged = { wing: Wing; legLength: number };

/**
 * A four-winged insect's wings — the butterfly's: a fore and a hind pair,
 * each wing carrying the same eye.
 */
export type FourWinged = {
  fore: Wing;
  hind: Wing;
  /** Where the eye's centre sits along the wing, a fraction of its length. */
  eyeAt: number;
};
