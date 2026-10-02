/**
 * Where every flower stands, seeded and planted alike: a seeded flower on its
 * foot of the visit's bed, which `layout.flowers` shows, a bee's in its ring
 * slot round its parent, on the ground, and the child's on the tuft it was
 * planted on — each where it has ground (`groundFor`). A slot is fixed on
 * the ground in the parent's size, so a turn or a resize moves no flower,
 * and a well-visited flower grows a round bed.
 */

import { pick } from '@/shared/lib/collections';

import type { Flower } from '../../model/flower-genes';
import type { Meadow } from '../../model/game';
import { type Ground, type Rooted, zAt } from '../../model/ground';
import { isBeeSown, type RootedFlower, type Sown } from '../../model/pollen';
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
 * Each ring slot round a parent, a bee's planting taking any free one
 * (`sown`): across and into the distance on the ground from the parent's
 * foot, in the parent's size. A near ring, then a ring twice as far out,
 * which reaches past a mushroom standing beside the parent, so a full forest
 * still leaves the bees ground to plant on; in each ring beside it either
 * way, before it and behind it, so the bed grows round and each head stands
 * clear of its neighbours' however foreshortened the screen shows the
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
/** A flower as it stands: on the ground, and on one screen. */
export type StandingFlower = RootedFlower & Placed;

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
 * Where on the ground `sown` would stand, `feet` holding the foot of every
 * flower before it, pulled up or not: on its own foot, planted on a tuft, or
 * in its ring slot round its parent; a bee's flower whose parent stands
 * nowhere stands nowhere either.
 */
function footOf(
  sown: Sown,
  feet: ReadonlyMap<string, FlowerFoot>,
): FlowerFoot | undefined {
  if (!isBeeSown(sown)) return sown.foot;
  const parent = feet.get(sown.parent);
  return parent && ringFoot(parent, sown.ring);
}

/**
 * Every flower that stands on `layout` among `mushrooms`: the seeded ones of
 * the visit's bed, then each planted one, a bee's round its parent and the
 * child's on its tuft, in the order they opened, so a parent always stands
 * before its children (`footOf`). A planted flower stands only where it has
 * ground (`groundFor`) off the feet of the mushrooms standing now, so a
 * mushroom grown on it hides it while that mushroom stands. A flower of
 * `pulled` stands nowhere and takes no ground, but a bee's flower ringed
 * round it keeps its slot round where it stood.
 */
export function standingFlowers(
  layout: MeadowLayout,
  seeded: readonly Flower[],
  planted: readonly Sown[],
  mushrooms: Meadow['mushrooms'],
  pulled: Meadow['pulled'],
): StandingFlower[] {
  return plotted(layout, seeded, planted, mushrooms, pulled).standing;
}

/**
 * `standingFlowers`, and the foot on the ground of every flower that stands
 * or would but for `pulled`, by id.
 */
function plotted(
  layout: MeadowLayout,
  seeded: readonly Flower[],
  planted: readonly Sown[],
  mushrooms: Meadow['mushrooms'],
  pulled: Meadow['pulled'],
): { standing: StandingFlower[]; feet: ReadonlyMap<string, FlowerFoot> } {
  const { camera, flowers } = layout;
  const claimed = mushroomFeet(layout, mushrooms);
  const up = new Set(pulled);
  const feet = new Map<string, FlowerFoot>();
  const standing: StandingFlower[] = [];
  const stand = (flower: Flower, foot: FlowerFoot, place: Footing) => {
    feet.set(flower.id, foot);
    if (!up.has(flower.id)) {
      standing.push({ ...pick(flower, 'id', 'seed'), foot, place });
    }
  };
  for (const [index, flower] of seeded.entries()) {
    const place = flowers[index];
    if (place) stand(flower, groundOf(camera, place), place);
  }
  for (const sown of planted) {
    const foot = footOf(sown, feet);
    if (foot && groundFor(foot, standing, claimed)) {
      stand(sown, foot, standingOn(camera, foot));
    }
  }
  return { standing, feet };
}

/** Every flower standing in `stand` (`standingFlowers`). */
export function flowersOf({
  layout,
  flowers,
  planted,
  mushrooms,
  pulled,
}: Stand): StandingFlower[] {
  return standingFlowers(layout, flowers, planted, mushrooms, pulled);
}

/**
 * Where on the ground each flower of `stand`'s `pulled` stood, in the order
 * they went: the spot it leaves the child to plant on again. A flower that
 * never stood on this layout, pulled or not, has none.
 */
export function pulledFeet({
  layout,
  flowers,
  planted,
  mushrooms,
  pulled,
}: Stand): FlowerFoot[] {
  const { feet } = plotted(layout, flowers, planted, mushrooms, pulled);
  return pulled.flatMap((id) => {
    const foot = feet.get(id);
    return foot ? [foot] : [];
  });
}

/**
 * Every flower standing in `stand`, seeded and planted, as its foot on the
 * ground, for a mushroom's foot to keep off (`roomFor`).
 */
export function flowerFeet(stand: Stand): FlowerFoot[] {
  return flowersOf(stand).map(({ foot }) => foot);
}
