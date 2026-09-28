/**
 * A visit played as the scene plays it, for the sweeps over `VIEWPORTS`: the
 * meadow opened from the visit's own streams, fliers released through the
 * real reducer, and the perches read off the real `perchSight`, read again
 * whenever a bee plants. Only tests read it.
 */

import type { Sight, Timed } from '../../model/flight';
import { firstFlowers } from '../../model/flower-genes';
import { firstMeadow, type Meadow, reduce } from '../../model/game';
import type { InsectKind } from '../../model/insect-genes';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { mulberry32, nextSeed } from '../../model/random';
import type { Stand } from './flower-sight';
import { meadowLayout } from './layout';
import { perchSight } from './perch-sight';

/** The meadow as it stands. */
type Meadowed = { meadow: Meadow };

/** A stand, and the meadow it stands. */
export type Opened = Stand & Meadowed;

/**
 * A meadow as the scene opens it for the visit `seed`, drawing from the
 * scene's own streams, with the opening clump or a full forest standing.
 */
export function opened(
  seed: number,
  width: number,
  height: number,
  forest: boolean,
): Opened {
  const random = mulberry32(seed);
  let meadow = firstMeadow(random);
  const flowers = firstFlowers(random, 7);
  const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25);
  const growing = mulberry32(seed ^ 0x9e_0a);
  const grown = forest ? layout.mushrooms.length - meadow.mushrooms.length : 0;
  for (const index of Array.from({ length: grown }).keys()) {
    const species =
      MUSHROOM_SPECIES[index % MUSHROOM_SPECIES.length] ?? 'fly-agaric';
    meadow = reduce(meadow, { kind: 'grow', species, seed: nextSeed(growing) });
  }
  const { mushrooms, planted } = meadow;
  return { meadow, layout, flowers, mushrooms, planted };
}

/** How much of the narrower of two spans, centred `apart` px from each other, the other covers. */
export function overlap(a: number, b: number, apart: number): number {
  return Math.max(0, (a + b) / 2 - apart) / Math.min(a, b);
}

/** Every kind at its limit, released in turn: four butterflies, three flies and three bees. */
export const ALL_TEN: readonly InsectKind[] = [
  'butterfly',
  'fly',
  'bee',
  'butterfly',
  'fly',
  'bee',
  'butterfly',
  'fly',
  'bee',
  'butterfly',
];

/** How a visit is played: which kinds fly in, how far apart, for how long and how often ticked, in ms. */
export type Playing = {
  kinds: readonly InsectKind[];
  gap: number;
  lasting: number;
  tick: number;
};

/** One tick of a played visit: the meadow after it, when, and what the scene saw. */
export type Played = Meadowed & Timed & { sight: Sight };

/**
 * `stand` played for the visit `seed`: `kinds` released `gap` apart, then
 * ticked every `tick` ms up to `lasting`, `each` seeing every tick.
 */
export function play(
  stand: Opened,
  seed: number,
  { kinds, gap, lasting, tick }: Playing,
  each: (played: Played) => void,
): void {
  const releasing = mulberry32(seed ^ 0xb7_7e_f1);
  let { meadow } = stand;
  let sight = perchSight(stand);
  let seen = meadow.planted;
  let released = 0;
  for (let now = 0; now <= lasting; now += tick) {
    for (; released < kinds.length && released * gap <= now; released++) {
      const insect = kinds[released] ?? 'butterfly';
      const seeded = nextSeed(releasing);
      meadow = reduce(meadow, {
        kind: 'release',
        insect,
        seed: seeded,
        now,
        ...sight,
      });
    }
    meadow = reduce(meadow, { kind: 'tick', now, ...sight });
    if (meadow.planted !== seen) {
      seen = meadow.planted;
      sight = perchSight({ ...stand, planted: seen });
    }
    each({ meadow, now, sight });
  }
}
