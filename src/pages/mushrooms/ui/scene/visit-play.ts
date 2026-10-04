/**
 * A visit played as the scene plays it, for the sweeps over `VIEWPORTS`: the
 * meadow opened from the visit's own streams, fliers released through the
 * real reducer, and the perches read off the real `perchSight`, read again
 * whenever a bee plants. Only tests and `scripts/sweep-mushrooms.ts` read it.
 */

import { MUSHROOM_SLOTS } from '../../model/crowding';
import type { Sight, Timed } from '../../model/flight';
import { visitFlowers } from '../../model/flower-sounds';
import { firstMeadow, type Meadow, reduce } from '../../model/game';
import type { InsectKind } from '../../model/insect-genes';
import { MUSHROOM_SPECIES } from '../../model/mushroom-genes';
import { openingIndex } from '../../model/placement';
import { mulberry32, nextSeed } from '../../model/random';
import { SPORE_SEATS, SPROUT_MS, sproutedInRain } from '../../model/sprouting';
import { RAIN_MS } from '../../model/weather';
import { type Among, amongAt, capBox } from './cap-cover';
import { placeIn } from './clump-layout';
import { FAR_FLOWERS } from './far-band';
import { type Stand, standOf } from './flower-sight';
import { type MeadowLayout, meadowLayout } from './layout';
import { roomFor } from './mushroom-room';
import { perchSight } from './perch-sight';
import { sporeOnTap } from './spore-seats';
import type { View } from './view';

export { tapTarget } from './mushroom-tap';

/** The meadow as it stands. */
export type Meadowed = { meadow: Meadow };

/**
 * A stand, the meadow it stands, and the meadow as the last shower found it,
 * every spore of its round lying (the meadow itself with no shower).
 */
export type Opened = Stand & Meadowed & { sowed: Meadow };

/** How long a shower in `opened` waits after the last: its rain, then every sprout grown old. */
const SHOWER_EVERY = RAIN_MS + SPROUT_MS;

/**
 * A meadow as the scene opens it for the visit `seed`, drawing from the
 * scene's own streams, with the opening clump or a forest grown to
 * `MUSHROOM_SLOTS`, as far as the meadow has room, standing: each `+`
 * pressed in the view `viewIn` gives, or anywhere in the world absent one.
 * Then `showers` rounds one after another: every mushroom tapped for spores
 * until it sows no more, their feet found in the same view, then a cloud
 * tapped and the shower left to stop, every spore sprouted.
 */
export function opened(
  seed: number,
  width: number,
  height: number,
  forest: boolean,
  viewIn?: (layout: MeadowLayout) => View,
  showers = 0,
): Opened {
  const random = mulberry32(seed);
  let meadow = firstMeadow(random);
  const flowers = visitFlowers(random, seed, FAR_FLOWERS);
  const layout = meadowLayout(
    width,
    height,
    seed ^ 0xf1_0e_25,
    meadow.mushrooms,
  );
  const view = viewIn?.(layout);
  const growing = mulberry32(seed ^ 0x9e_0a);
  const grown = forest ? MUSHROOM_SLOTS - meadow.mushrooms.length : 0;
  for (const index of Array.from({ length: grown }).keys()) {
    const species =
      MUSHROOM_SPECIES[index % MUSHROOM_SPECIES.length] ?? 'fly-agaric';
    const own = nextSeed(growing);
    const foot = roomFor(standOf(layout, flowers, meadow), own, view);
    if (!foot) break;
    meadow = reduce(meadow, {
      kind: 'grow',
      species,
      seed: own,
      ...foot,
    });
  }
  let sowed = meadow;
  for (const index of Array.from({ length: showers }).keys()) {
    const now = index * SHOWER_EVERY;
    for (const { id } of meadow.mushrooms) {
      meadow = sownUp(meadow, id, now, (sowing) => ({
        meadow: () => sowing,
        stand: () => standOf(layout, flowers, sowing),
        view: () => view,
      }));
    }
    sowed = meadow;
    meadow = reduce(meadow, { kind: 'rain', now });
    meadow = sproutedInRain(meadow, now + RAIN_MS);
  }
  return { meadow, sowed, ...standOf(layout, flowers, meadow) };
}

/**
 * `meadow` with the mushroom `id` tapped at `now` up to `SPORE_SEATS` times,
 * each tap's spore found as the scene finds it, stopping at the first tap
 * that settles none.
 */
function sownUp(
  meadow: Meadow,
  id: string,
  now: number,
  scened: (meadow: Meadow) => Parameters<typeof sporeOnTap>[0],
): Meadow {
  let sowing = meadow;
  for (let seat = 0; seat < SPORE_SEATS; seat++) {
    const tapped = reduce(sowing, {
      kind: 'select',
      id,
      ...sporeOnTap(scened(sowing), id, now),
    });
    if (tapped.spores.length === sowing.spores.length) break;
    sowing = tapped;
  }
  return sowing;
}

/**
 * The visit `seed` of `stand` laid out on a screen `width` by `height`, as
 * the scene lays it out after a turn or a resize: the same world, placed
 * against the opening clump still standing, at this screen's zoom, the
 * screen a new crop of it.
 */
export function relaidOn(
  { mushrooms }: Stand,
  seed: number,
  width: number,
  height: number,
): MeadowLayout {
  return meadowLayout(
    width,
    height,
    seed ^ 0xf1_0e_25,
    mushrooms.filter(({ foot }) => openingIndex(foot) !== undefined),
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

/** How a visit is played: which kinds fly in, how far apart, for how long and how often ticked, and when a cloud is tapped, in ms. */
export type Playing = {
  kinds: readonly InsectKind[];
  gap: number;
  lasting: number;
  tick: number;
  rains?: readonly number[];
};

/** One tick of a played visit: the meadow after it, when, and what the scene saw. */
export type Played = Meadowed & Timed & { sight: Sight };

/**
 * `stand` played for the visit `seed`: `kinds` released `gap` apart, then
 * ticked every `tick` ms up to `lasting`, a cloud tapped on the first tick
 * at or after each of `rains`, `each` seeing every tick.
 */
export function play(
  stand: Opened,
  seed: number,
  { kinds, gap, lasting, tick, rains = [] }: Playing,
  each: (played: Played) => void,
): void {
  const releasing = mulberry32(seed ^ 0xb7_7e_f1);
  let { meadow } = stand;
  let sight = perchSight(stand);
  let seen = meadow.planted;
  let released = 0;
  let rained = 0;
  for (let now = 0; now <= lasting; now += tick) {
    for (; rained < rains.length && (rains[rained] ?? 0) <= now; rained++) {
      meadow = reduce(meadow, { kind: 'rain', now });
    }
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
