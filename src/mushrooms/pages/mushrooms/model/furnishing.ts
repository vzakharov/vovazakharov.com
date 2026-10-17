/**
 * Which mushroom a pick of a window or a door goes into, and whether it has
 * room for it.
 */

import type { Meadow, Planted } from './game';
import { furnished, type Furnishing, windowSlots } from './house';
import { mushroomGenes } from './mushroom-genes';

/** `mushroom` with `piece` put into its house, or `undefined` when it has no room for it. */
function withPiece(mushroom: Planted, piece: Furnishing): Planted | undefined {
  const house = furnished(
    mushroom.house,
    piece,
    windowSlots(mushroomGenes(mushroom)).length,
  );
  return house && { ...mushroom, house };
}

export function selectedMushroom({
  mushrooms,
  selected,
}: Meadow): Planted | undefined {
  return mushrooms.find(({ id }) => id === selected);
}

/**
 * The newest mushroom with room for any of `pieces`, or with none that has
 * room the newest: the one a house tap acts on while nothing is selected, so
 * a full mushroom never greys the picker out while another still has room.
 */
export function newestWithRoom(
  { mushrooms }: Meadow,
  pieces: readonly Furnishing[],
): Planted | undefined {
  return (
    mushrooms.findLast((mushroom) =>
      pieces.some((piece) => withPiece(mushroom, piece) !== undefined),
    ) ?? mushrooms.at(-1)
  );
}

/**
 * The selected mushroom with `piece` put into its house, or with none
 * selected the newest that has room for it; `undefined` when that one has no
 * room.
 */
export function furnishedTarget(
  meadow: Meadow,
  piece: Furnishing,
): Planted | undefined {
  const mushroom =
    meadow.selected === undefined
      ? newestWithRoom(meadow, [piece])
      : selectedMushroom(meadow);
  return mushroom && withPiece(mushroom, piece);
}

/**
 * Whether a pick of `piece` would furnish anything: not on an empty meadow,
 * not into a full row of windows, not a second door.
 */
export function canFurnish(meadow: Meadow, piece: Furnishing): boolean {
  return furnishedTarget(meadow, piece) !== undefined;
}
