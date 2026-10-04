/**
 * Where a tap's spore settles: the scene's half of a sowing. The model names
 * the seed a tapped mushroom sows next (`sowable`); this finds its foot round
 * the parent (`roomFor`'s `near`) for the `select` to carry.
 */

import { sowable, type SporeTap } from '../../model/sprouting';
import { roomFor } from './mushroom-room';
import type { Scened } from './planter';

/**
 * The spore a tap on the mushroom `id` at `now`, in ms, settles, as the
 * `select` carries it: a foot round the parent found by the spore's own seed
 * among the meadow `stand` holds, as shown in `view`; none where the
 * mushroom sows none or the seed finds no room.
 */
export function sporeOnTap(
  { meadow, stand, view }: Pick<Scened, 'meadow' | 'stand' | 'view'>,
  id: string,
  now: number,
): SporeTap {
  const shown = meadow();
  const seeded = shown && sowable(shown, id, now);
  const standing = seeded && stand();
  const parent = shown?.mushrooms.find((mushroom) => mushroom.id === id);
  const found =
    standing && parent && roomFor(standing, seeded.seed, view(), parent.foot);
  return found ? { spore: { ...found, now } } : {};
}
