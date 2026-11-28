import { lerp, type Point } from '@/clip/shared/ink';

import type { Build } from '../../body';

export const ROLES = ['guitar', 'vocal', 'bass', 'drums'] as const;

/** The four of the band: the same man, built four ways. */
export type Role = (typeof ROLES)[number];

export const BUILDS: Record<Role, Build> = {
  guitar: { size: 0.93, wide: 1, torso: 1.15, arms: 1, legs: 1, head: 1 },
  vocal: { size: 1, wide: 1, torso: 1, arms: 1, legs: 1, head: 1 },
  bass: { size: 0.98, wide: 1.5, torso: 0.92, arms: 1, legs: 1, head: 0.8 },
  drums: { size: 0.72, wide: 1, torso: 0.75, arms: 1.3, legs: 0.6, head: 1.35 },
};

export type Strings = 'guitar' | 'bass';

/**
 * A guitar in its own units: the body's middle at the origin, the neck out
 * along the x axis, the strings running from `bridge` to `nut`.
 */
export const GUITAR: Record<Strings, { bridge: number; nut: number }> = {
  guitar: { bridge: -40, nut: 240 },
  bass: { bridge: -40, nut: 292 },
};

/** Where the strings are struck, over the pickups. */
export const PICK_AT: Point = [8, 0];

/** The point on the neck `along` of the way from its heel to the nut. */
export const fretAt = (strings: Strings, along: number): Point => [
  lerp(72, GUITAR[strings].nut - 24, along),
  0,
];

/**
 * The drum kit in the puppet's units, the floor under its middle at the
 * origin: where each thing is struck, and where the drummer sits. The pots
 * and the bedpan are off a hospital ward.
 */
export const KIT = {
  /** Where the drummer's hips are. */
  stool: [0, -150],
  /** The big pot on its side: its middle, and its radius. */
  kick: [0, -84],
  kickRadius: 84,
  /** The middle of each pot's skin, and of each dish. */
  snare: [140, -205],
  tom: [-140, -190],
  hat: [-205, -285],
  crash: [200, -345],
} as const satisfies Record<string, Point | number>;

/** A drumstick's length. */
export const STICK = 110;
