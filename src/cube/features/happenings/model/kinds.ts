import { lerp } from '@/cube/shared/lib/ease';
import { DEEPEST_FLOOR, type Setting } from '@/cube/entities/world';

import { openSides, shutCorners, shutSides } from '../lib/side';

/**
 * The two paces a room keeps. Time is cut into beats `every` seconds long,
 * each room's own beats starting at its own moment, and a beat holds an act
 * with `chance`. A brief act comes and goes inside its beat; a lingering one
 * stays for minutes.
 *
 * With about six rooms in sight, brief acts begin within sight every
 * `every / chance / 6` seconds — under two minutes — and one room in thirty
 * holds a lingering act at any moment.
 */
export const PACES = {
  brief: { every: 40, chance: 1 / 16 },
  lingering: { every: 600, chance: 1 / 12 },
} as const;
export type Pace = keyof typeof PACES;

/** What an act needs of the room to be played in it. */
const NEEDS = {
  wall: (setting: Setting) => shutSides(setting).length > 0,
  opening: (setting: Setting) => openSides(setting).length > 0,
  corner: (setting: Setting) => shutCorners(setting).length > 0,
} as const;

type KindTraits = {
  pace: Pace;
  /** Whether it is a scare rather than a thing a building does. */
  scare: boolean;
  /** Its weight among its pace's kinds on floor `since`, and on the deepest. */
  weight: readonly [top: number, deep: number];
  /** The first floor it happens on; 1 where not given. */
  since?: number;
  /** The least and the most seconds it lasts. */
  lastsFor: readonly [number, number];
  needs?: keyof typeof NEEDS;
};

export const HAPPENING_KINDS = {
  ball: { pace: 'brief', scare: false, weight: [5, 2], lastsFor: [7, 7] },
  paper: { pace: 'brief', scare: false, weight: [5, 3], lastsFor: [12, 12] },
  cat: { pace: 'brief', scare: false, weight: [4, 1], lastsFor: [14, 14] },
  phone: { pace: 'brief', scare: false, weight: [3, 3], lastsFor: [20, 20] },
  knock: {
    pace: 'brief',
    scare: false,
    weight: [2, 4],
    lastsFor: [5, 5],
    needs: 'wall',
  },
  footsteps: {
    pace: 'brief',
    scare: false,
    weight: [3, 3],
    lastsFor: [6, 6],
    needs: 'opening',
  },
  door: {
    pace: 'brief',
    scare: false,
    weight: [3, 3],
    lastsFor: [18, 18],
    needs: 'wall',
  },
  figure: { pace: 'brief', scare: true, weight: [1.2, 3], lastsFor: [6, 12] },
  shadow: { pace: 'brief', scare: true, weight: [1, 2.5], lastsFor: [12, 16] },
  hand: {
    pace: 'brief',
    scare: true,
    weight: [0.8, 2.5],
    lastsFor: [7, 9],
    needs: 'opening',
  },
  unfolding: {
    pace: 'brief',
    scare: true,
    weight: [0.5, 2],
    lastsFor: [16, 16],
  },
  corner: {
    pace: 'brief',
    scare: true,
    weight: [0, 4],
    since: 30,
    lastsFor: [20, 20],
    needs: 'corner',
  },
  balloon: {
    pace: 'lingering',
    scare: false,
    weight: [5, 2],
    lastsFor: [150, 240],
  },
  chairs: {
    pace: 'lingering',
    scare: false,
    weight: [2, 4],
    lastsFor: [150, 240],
  },
  mannequin: {
    pace: 'lingering',
    scare: true,
    weight: [1.5, 4],
    lastsFor: [180, 300],
  },
} as const satisfies Record<string, KindTraits>;

export type HappeningKind = keyof typeof HAPPENING_KINDS;

const traitsOf = (kind: HappeningKind): KindTraits => HAPPENING_KINDS[kind];

export const KIND_NAMES = Object.keys(HAPPENING_KINDS).filter(
  (name): name is HappeningKind => name in HAPPENING_KINDS,
);

export const kindsOf = (pace: Pace): HappeningKind[] =>
  KIND_NAMES.filter((kind) => HAPPENING_KINDS[kind].pace === pace);

/** How heavily `kind` weighs among its pace's kinds on floor `n`. */
export function weightOf(kind: HappeningKind, n: number): number {
  const { weight, since = 1 } = traitsOf(kind);
  if (n < since) return 0;
  const [top, deep] = weight;
  return lerp(top, deep, Math.min(1, (n - since) / (DEEPEST_FLOOR - since)));
}

/** Whether `setting`'s room has what `kind` needs. */
export function fitsIn(kind: HappeningKind, setting: Setting): boolean {
  const { needs } = traitsOf(kind);
  return needs === undefined || NEEDS[needs](setting);
}

/**
 * The kind of `pace` that `chance` of `[0, 1)` falls on in `setting`'s room on
 * floor `n`, by weight among those the room fits; null where it fits none.
 */
export function kindAt(
  pace: Pace,
  setting: Setting,
  n: number,
  chance: number,
): HappeningKind | null {
  const weighed = kindsOf(pace)
    .filter((kind) => fitsIn(kind, setting))
    .map((kind) => ({ kind, weight: weightOf(kind, n) }));
  const total = weighed.reduce((sum, { weight }) => sum + weight, 0);
  let left = chance * total;
  for (const { kind, weight } of weighed) {
    left -= weight;
    if (left < 0) return kind;
  }
  return null;
}

/** How long `kind` lasts, `chance` of `[0, 1)` of the way up its range. */
export function lastsOf(kind: HappeningKind, chance: number): number {
  const [least, most] = traitsOf(kind).lastsFor;
  return lerp(least, most, chance);
}

/**
 * The share of floor `n`'s brief acts that are scares, in a room that fits
 * every kind: about an eighth on floor 1, two fifths on the deepest.
 */
export function scareShare(n: number): number {
  const brief = kindsOf('brief');
  const total = (kinds: readonly HappeningKind[]) =>
    kinds.reduce((sum, kind) => sum + weightOf(kind, n), 0);
  return (
    total(brief.filter((kind) => HAPPENING_KINDS[kind].scare)) / total(brief)
  );
}
