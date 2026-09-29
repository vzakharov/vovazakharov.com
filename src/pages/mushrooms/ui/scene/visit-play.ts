/**
 * A visit played as the scene plays it, for the sweeps over `VIEWPORTS`: the
 * meadow opened from the visit's own streams, fliers released through the
 * real reducer, and the perches read off the real `perchSight`, read again
 * whenever a bee plants. Only tests and `scripts/sweep-mushrooms.ts` read it.
 */

import { pick } from '@/shared/lib/collections';

import type { Sight, Timed } from '../../model/flight';
import { firstFlowers } from '../../model/flower-genes';
import {
  firstMeadow,
  type Meadow,
  MUSHROOM_SLOTS,
  reduce,
} from '../../model/game';
import type { InsectKind } from '../../model/insect-genes';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { openingIndex } from '../../model/placement';
import { mulberry32, nextSeed } from '../../model/random';
import { type Among, amongAt, capBox } from './cap-cover';
import { placeIn } from './clump-layout';
import { usedIn } from './flower-plots';
import type { Stand } from './flower-sight';
import { type MeadowLayout, meadowLayout } from './layout';
import { roomFor } from './mushroom-room';
import { perchSight } from './perch-sight';

/** The meadow as it stands. */
type Meadowed = { meadow: Meadow };

/** A stand, and the meadow it stands. */
export type Opened = Stand & Meadowed;

/**
 * A meadow as the scene opens it for the visit `seed`, drawing from the
 * scene's own streams, with the opening clump or a forest grown to
 * `MUSHROOM_SLOTS`, as far as the meadow has room, standing.
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
  const layout = meadowLayout(width, height, seed ^ 0xf1_0e_25, {
    screen: { width, height },
    openers: meadow.mushrooms,
  });
  const growing = mulberry32(seed ^ 0x9e_0a);
  const grown = forest ? MUSHROOM_SLOTS - meadow.mushrooms.length : 0;
  for (const index of Array.from({ length: grown }).keys()) {
    const species =
      MUSHROOM_SPECIES[index % MUSHROOM_SPECIES.length] ?? 'fly-agaric';
    const own = nextSeed(growing);
    const { mushrooms, planted } = meadow;
    const foot = roomFor({ layout, flowers, mushrooms, planted }, own);
    if (!foot) break;
    meadow = reduce(meadow, { kind: 'grow', species, seed: own, foot });
  }
  const { mushrooms, planted } = meadow;
  return { meadow, layout, flowers, mushrooms, planted };
}

/**
 * The visit `seed` of `stand` laid out on a screen `width` by `height`, as
 * the scene lays it out after a turn or a resize: its flowers where the
 * screen it opened on placed them, among the clump it opened with, and every
 * foot it has used in view.
 */
export function relaidOn(
  stand: Stand,
  seed: number,
  width: number,
  height: number,
): MeadowLayout {
  const { layout, mushrooms } = stand;
  return meadowLayout(
    width,
    height,
    seed ^ 0xf1_0e_25,
    {
      screen: pick(layout, 'width', 'height'),
      openers: mushrooms.filter(({ foot }) => openingIndex(foot) !== undefined),
    },
    usedIn(stand),
  );
}

/** Each of `stand`'s mushrooms as the scene stands it on its layout. */
export function standingIn({ layout, mushrooms }: Stand): Among[] {
  return mushrooms.map((mushroom) => {
    const place = placeIn(layout.mushrooms, mushroom);
    if (!place) throw new Error(`${mushroom.id} off the screen`);
    return amongAt(place, mushroom);
  });
}

/** How wide `stand`'s caps span together, as a share of its screen's width. */
export function capsSpan(stand: Stand): number {
  const caps = standingIn(stand).map(({ standing }) => capBox(standing));
  const left = Math.min(...caps.map((cap) => cap.left));
  const right = Math.max(...caps.map((cap) => cap.right));
  return (right - left) / stand.layout.width;
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
