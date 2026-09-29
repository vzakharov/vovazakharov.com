/**
 * Where every flower stands, seeded and planted alike: a seeded flower on its
 * foot of the visit's bed, which `layout.flowers` shows, and a planted one in
 * its ring slot round its parent, on the ground, where the slot has ground
 * for it (`groundFor`). A slot is fixed on the ground in the parent's size,
 * so a turn or a resize moves no flower, and a well-visited flower grows a
 * round bed.
 */

import { pick } from '@/shared/lib/collections';

import type { Flower } from '../../model/flower-genes';
import type { Meadow } from '../../model/game';
import { type Ground, zAt } from '../../model/ground';
import type { Sown } from '../../model/pollen';
import { standingPlaces } from './clump-layout';
import {
  clearOfFeet,
  FLOWER_DOWN,
  type FlowerFoot,
  groundOf,
  headsApart,
  standingOn,
} from './flower-layout';
import type { Stand } from './flower-sight';
import type { Footing, MeadowLayout } from './layout';

/**
 * Each ring slot round a parent, in the order a bee's plantings take them:
 * across and into the distance on the ground from the parent's foot, in the
 * parent's size. The near ring first, then a ring twice as far out, which
 * reaches past a mushroom standing beside the parent, so a full forest
 * still leaves the bees ground to plant on; in each ring beside it either
 * way, then before it, then behind it, so the bed grows round and each head
 * stands clear of its neighbours' however foreshortened the screen shows the
 * ground.
 */
export const RING_SLOTS: readonly Ground[] = [
  { x: 1.1, z: 0 },
  { x: -1.1, z: 0 },
  { x: 0.5, z: -1.2 },
  { x: -0.5, z: -1.2 },
  { x: 0.5, z: 1.2 },
  { x: -0.5, z: 1.2 },
  { x: 2.3, z: 0 },
  { x: -2.3, z: 0 },
  { x: 2, z: -1.15 },
  { x: -2, z: -1.15 },
  { x: 2, z: 1.15 },
  { x: -2, z: 1.15 },
  { x: 1.15, z: -2 },
  { x: -1.15, z: -2 },
  { x: 1.15, z: 2 },
  { x: -1.15, z: 2 },
  { x: 0, z: -2.3 },
  { x: 0, z: 2.3 },
];

/** Where a flower stands on one screen. */
export type Placed = { place: Footing };
/** Where a flower stands on the ground. */
type Rooted = { foot: FlowerFoot };
/** A flower as it stands: on the ground, and on one screen. */
export type StandingFlower = Flower & Placed & Rooted;

/**
 * Where on the ground the flowers' band lies into the distance, nearest
 * first: as far down the ground's depth as `FLOWER_DOWN` on every screen,
 * a point's share of the depth being the same on all of them.
 */
const FLOWER_DEPTH = FLOWER_DOWN.map((down) => zAt(down)).toSorted(
  (a, b) => a - b,
);

/**
 * How far past the flowers' band, in the clump's size, a foot still stands on
 * it: a seeded flower held to the band's edge and its side slots stand on it
 * as each screen reads them back, a float's rounding either way.
 */
const ON_THE_BAND = 1e-9;

/**
 * Where a flower in ring slot `ring` round `parent` stands on the ground:
 * its foot the slot's step off the parent's; `undefined` for a slot past the
 * ring.
 */
export function ringFoot(
  parent: FlowerFoot,
  ring: number,
): FlowerFoot | undefined {
  const slot = RING_SLOTS[ring];
  if (!slot) return undefined;
  const { x, z, size } = parent;
  return { x: x + slot.x * size, z: z + slot.z * size, size };
}

/**
 * Whether a flower at `foot` has ground to stand on: in the flowers' band of
 * the meadow's depth, clear of every mushroom's foot of `feet`, and its head
 * at its widest apart from the head of every flower of `standing`, all on
 * the ground, so the answer is the same on every screen.
 */
export function groundFor(
  foot: FlowerFoot,
  standing: readonly Rooted[],
  feet: readonly FlowerFoot[],
): boolean {
  const [near = 0, far = 0] = FLOWER_DEPTH;
  return (
    foot.z >= near - ON_THE_BAND &&
    foot.z <= far + ON_THE_BAND &&
    clearOfFeet(foot, feet) &&
    headsApart(
      foot,
      standing.map((flower) => flower.foot),
    )
  );
}

/**
 * The foot of each of `mushrooms` that `layout` shows, on the ground, for a
 * flower to keep off (`groundFor`). A mushroom yet to grow keeps off every
 * flower (`pickFoot`), so a flower keeps off only these.
 */
export function mushroomFeet(
  layout: MeadowLayout,
  mushrooms: Meadow['mushrooms'],
): FlowerFoot[] {
  return standingPlaces(layout.mushrooms, mushrooms).map((place) =>
    groundOf(layout.camera, place),
  );
}

/**
 * Every flower that stands on `layout` among `mushrooms`: the seeded ones of
 * the visit's bed, then each planted one round its parent, in the order they
 * opened, so a parent always stands before its children. A planted flower
 * stands only where its slot has ground (`groundFor`) off the feet of the
 * mushrooms standing now, so a mushroom grown on it hides it while that
 * mushroom stands; one whose parent stands nowhere stands nowhere either.
 */
export function standingFlowers(
  layout: MeadowLayout,
  seeded: readonly Flower[],
  planted: readonly Sown[],
  mushrooms: Meadow['mushrooms'],
): StandingFlower[] {
  const { camera, flowers } = layout;
  const feet = mushroomFeet(layout, mushrooms);
  const standing: StandingFlower[] = seeded.flatMap((flower, index) => {
    const place = flowers[index];
    return place ? [{ ...flower, place, foot: groundOf(camera, place) }] : [];
  });
  for (const sown of planted) {
    const parent = standing.find(({ id }) => id === sown.parent);
    const foot = parent && ringFoot(parent.foot, sown.ring);
    if (foot && groundFor(foot, standing, feet)) {
      standing.push({
        ...pick(sown, 'id', 'seed'),
        foot,
        place: standingOn(camera, foot),
      });
    }
  }
  return standing;
}

/**
 * Every flower standing in `stand`, seeded and planted, as its foot on the
 * ground, for a mushroom's foot to keep off (`clearOfFlowers`).
 */
export function flowerFeet({
  layout,
  flowers,
  planted,
  mushrooms,
}: Stand): FlowerFoot[] {
  return standingFlowers(layout, flowers, planted, mushrooms).map(
    ({ foot }) => foot,
  );
}

/**
 * Whether a mushroom's foot at `foot`, `size` its unit in the clump's, keeps
 * off every flower of `flowers` as each flower keeps off a foot
 * (`clearOfFeet`), on every screen.
 */
export function clearOfFlowers(
  foot: FlowerFoot,
  flowers: readonly FlowerFoot[],
): boolean {
  return flowers.every((flower) => clearOfFeet(flower, [foot]));
}
