import { mulberry32, type Random } from '@/mushrooms/shared/lib/random';
import { OPENING_EYE, viewAt } from '@/mushrooms/shared/space';
import {
  plantedId,
  type Sown,
  type Stand,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  type Lawn,
  LiveLawn,
} from '@/mushrooms/entities/landscape/index.node-safe';
import {
  FLOOR_HELD,
  type Planted,
  VIEWPORTS,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  type Sprout,
  tendedIn,
  tendTufts,
} from '@/mushrooms/features/plant-flower/index.node-safe';

import type { MeadowLayout } from './layout';

export type MeadowStand = Stand<MeadowLayout, Planted>;

export const SCREENS = [...VIEWPORTS, FLOOR_HELD] as const;
/** How many visits each screen is tried over, on a fresh meadow. */
export const VISITS = 40;

export const seedOf = (visit: number) => visit * 7919 + 3;
export const tuftingOf = (seed: number): Random =>
  mulberry32(seed ^ 0x70_f7_5e);
/** The lawn a visit of `seed` grows on `layout`, as `Grass` seeds it. */
export const lawnOf = (layout: MeadowLayout, seed: number): Lawn => ({
  seed: Math.floor(tuftingOf(seed)() * 2 ** 32),
  layout,
});
/** The live tufts of a visit of `seed` on `layout` the opening eye tends (`tendedIn`). */
export function tendedOn(layout: MeadowLayout, seed: number): Sprout[] {
  return new LiveLawn(lawnOf(layout, seed))
    .round(OPENING_EYE)
    .filter(tendedIn(viewAt(layout.camera, OPENING_EYE)));
}
/** The tufts of `stand` the opening eye tends as a visit of `seed` grows them, and those that stand. */
export function grassOf(
  stand: MeadowStand,
  seed: number,
): [Sprout[], Sprout[]] {
  const grown = tendedOn(stand.layout, seed);
  return [grown, tendTufts(stand, grown, OPENING_EYE)];
}

/** `stand` with a flower planted on `sprout`, as the scene plants it. */
export function plantedOn<Standing extends MeadowStand>(
  stand: Standing,
  { foot }: Sprout,
  seed: number,
): Standing {
  const planted: Sown[] = [
    ...stand.planted,
    { id: plantedId(stand.planted), seed, foot },
  ];
  return { ...stand, planted };
}
