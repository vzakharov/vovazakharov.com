/**
 * Where a shower's sprouts stand: the scene's half of a shed. The model names
 * who sheds and from which seeds (`shedding`); this finds each a foot round
 * its parent (`roomFor`'s `near`) for the tick to carry.
 */

import type { Planted } from '../../model/game';
import { EMPTY_HOUSE } from '../../model/house';
import { type Shedder, type Shedding, shedding } from '../../model/sprouting';
import type { BedPlace } from './bed-place';
import type { Stand } from './flower-sight';
import { roomFor } from './mushroom-room';
import type { Scened } from './planter';
import type { View } from './view';

/** A tick's shed, once a shed is due. */
type Shed = NonNullable<Shedding['shed']>;

/**
 * The sprouts the first of `shedders` that finds room for any sheds in
 * `stand`, as shown in `view`: each seed's foot found round the parent's
 * among the meadow and the sprouts found before it, a seed with no room left
 * out. Where none finds room, the first sheds none, so the shower still
 * counts as shed.
 */
export function shedIn(
  stand: Stand,
  shedders: readonly Shedder[],
  view?: View,
): Shed | undefined {
  for (const { id, seeds } of shedders) {
    const parent = stand.mushrooms.find((mushroom) => mushroom.id === id);
    if (!parent) throw new Error(`${id} sheds, standing nowhere`);
    let { mushrooms } = stand;
    const sprouts: Array<Shed['sprouts'][number]> = [];
    for (const seed of seeds) {
      const found = roomFor({ ...stand, mushrooms }, seed, view, parent.foot);
      if (!found) continue;
      sprouts.push({ seed, ...found });
      const sprout: Planted = {
        ...parent,
        id: `${id} sprout ${String(sprouts.length)}`,
        seed,
        house: EMPTY_HOUSE,
        ...found,
      };
      mushrooms = [...mushrooms, sprout];
    }
    if (sprouts.length > 0) return { parent: id, sprouts };
  }
  const first = shedders[0];
  return first && { parent: first.id, sprouts: [] };
}

/** Whether a mushroom standing at `stands` has its foot on `view`'s screen: any drawn, absent a view. */
export function footShown(
  stands: BedPlace | undefined,
  view: View | undefined,
): boolean {
  return (
    stands?.drawn === true &&
    stands.x >= 0 &&
    stands.x <= (view?.width ?? Infinity)
  );
}

/**
 * The shed the scene's tick carries at `now`, in ms: found while one is due
 * and an old mushroom stands on the screen the `bed` shows, else none.
 */
export function shedNow(
  { meadow, stand, view }: Pick<Scened, 'meadow' | 'stand' | 'view'>,
  bed: { inSight: (id: string) => boolean } | undefined,
  now: number,
): Shed | undefined {
  const shown = meadow();
  const shedders =
    shown && bed && shedding(shown, now, (id) => bed.inSight(id));
  const standing = shedders && stand();
  return standing && shedIn(standing, shedders, view());
}
