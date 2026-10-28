import { mulberry32 } from '@/mushrooms/shared/lib/random';
import { OPENING_EYE } from '@/mushrooms/shared/world';
import { grownOn } from '@/mushrooms/entities/mushroom/index.node-safe';

import type { Meadow } from '../shape/meadow';
import { type Action, firstMeadow, reduce } from './game';

export const opening = () => firstMeadow(mulberry32(1));
/** Where the scene picked the foot of the mushroom grown from `seed`, as these tests have it. */
export const footedOf = (seed: number) =>
  grownOn(OPENING_EYE, { x: seed / 10, z: 1 });
export const grow = (seed: number): Action => ({
  kind: 'grow',
  species: 'porcini',
  seed,
  ...footedOf(seed),
});
export function run(meadow: Meadow, actions: readonly Action[]): Meadow {
  let state = meadow;
  for (const action of actions) state = reduce(state, action);
  return state;
}

/** The flowers in sight, as the scene would pass them, none crowding another. */
export const FLOWERS = ['flower-1', 'flower-2', 'flower-3', 'flower-4'];
export const SIGHT = {
  flowers: FLOWERS,
  air: [],
  crowded: [],
  room: [],
};
