import type { CubeCell, Vec3 } from '@/island/shared/globe';
import {
  capGap,
  CUBE_MIN_LEVEL,
  cubeTileId,
  tileCap,
  type TileKeyed,
} from '@/island/entities/terrain';

/** A tile's parent on its face; a root, at `CUBE_MIN_LEVEL`, has none held. */
const parentOf = ({ face, level, x, y }: CubeCell): CubeCell | null =>
  level <= CUBE_MIN_LEVEL
    ? null
    : { face, level: level - 1, x: Math.floor(x / 2), y: Math.floor(y / 2) };

/** `key`'s parent, its parent's, and so on to its root, nearest first. */
function ancestorsOf(key: CubeCell): CubeCell[] {
  const up = parentOf(key);
  return up === null ? [] : [up, ...ancestorsOf(up)];
}

/** Whether `inner` lies inside `outer`, `outer` itself included. */
const within = (inner: CubeCell, outer: CubeCell) =>
  inner.face === outer.face &&
  inner.level >= outer.level &&
  Math.floor(inner.x / 2 ** (inner.level - outer.level)) === outer.x &&
  Math.floor(inner.y / 2 ** (inner.level - outer.level)) === outer.y;

/**
 * `coverOf`'s cover, its stand-ins taken only finer than level `above`, and
 * whether every selected tile is drawn or stood in for.
 */
function standInCover(
  selected: readonly CubeCell[],
  has: (id: string) => boolean,
  above = CUBE_MIN_LEVEL - 1,
): { readonly cover: CubeCell[]; readonly whole: boolean } {
  const standIns = new Map<string, CubeCell>();
  let whole = true;
  for (const key of selected) {
    if (has(cubeTileId(key))) continue;
    const standIn = ancestorsOf(key).find(
      (up) => up.level > above && has(cubeTileId(up)),
    );
    if (standIn === undefined) whole = false;
    else standIns.set(cubeTileId(standIn), standIn);
  }
  // A stand-in inside another is drawn by the outer one.
  const outer = [...standIns.values()].filter(
    (key) =>
      ![...standIns.values()].some(
        (other) => other !== key && within(key, other),
      ),
  );
  const own = selected.filter(
    (key) =>
      has(cubeTileId(key)) && !outer.some((standIn) => within(key, standIn)),
  );
  return { cover: [...outer, ...own], whole };
}

/**
 * The tiles to draw for a selection while some of it is still loading. A
 * selected tile in hand draws itself; one not yet in hand is covered by its
 * nearest ancestor in hand, which then also stands in for every selected
 * tile under it, so no two drawn tiles overlap. A selected tile with no
 * ancestor in hand is left out.
 */
export const coverOf = (
  selected: readonly CubeCell[],
  has: (id: string) => boolean,
): CubeCell[] => standInCover(selected, has).cover;

/**
 * The tiles to draw for `selected` while `shown`, the last selection wholly
 * in hand, still stands, each overlap settled on its own:
 *
 * - a shown tile gives way to the selected tiles inside it once every one of
 *   them is in hand or stood in for by a held tile finer than it, so the view
 *   refines while the selection loads, never back to a coarser tile;
 * - a selected tile holding shown tiles draws once in hand, the shown ones
 *   until then;
 * - a selected tile beyond every shown one is covered as `coverOf` covers, by
 *   any stand-in but one containing a shown tile, which would hide the finer
 *   ground under the eye.
 */
export function coverAround(
  selected: readonly CubeCell[],
  shown: readonly CubeCell[],
  has: (id: string) => boolean,
): CubeCell[] {
  const shownIds = new Set(shown.map((key) => cubeTileId(key)));
  // Each shown tile and every tile containing one.
  const blocked = new Set(shownIds);
  for (const key of shown) {
    for (const up of ancestorsOf(key)) blocked.add(cubeTileId(up));
  }
  const drawn: CubeCell[] = [];
  for (const key of selected) {
    if (!blocked.has(cubeTileId(key))) continue;
    const inside = shown.filter((s) => within(s, key));
    drawn.push(...(has(cubeTileId(key)) ? [key] : inside));
  }
  for (const tile of shown) {
    if (selected.some((key) => within(tile, key))) continue;
    const finer = selected.filter((key) => within(key, tile));
    const { cover, whole } = standInCover(finer, has, tile.level);
    drawn.push(...(finer.length > 0 && whole ? cover : [tile]));
  }
  const beyond = selected.filter(
    (key) =>
      !blocked.has(cubeTileId(key)) &&
      !ancestorsOf(key).some((up) => shownIds.has(cubeTileId(up))),
  );
  return [...drawn, ...coverOf(beyond, (id) => has(id) && !blocked.has(id))];
}

/** Radians from direction `eye` (any length) to the nearest point of the tile. */
export const distanceTo = (key: CubeCell, eye: Vec3): number =>
  capGap(tileCap(key), eye);

/** `tiles` nearest to direction `eye` first, the coarser first at a tie. */
export const nearestFirst = <T extends TileKeyed<CubeCell>>(
  tiles: readonly T[],
  eye: Vec3,
): T[] =>
  tiles
    .map((tile) => ({ tile, distance: distanceTo(tile.key, eye) }))
    .toSorted(
      (a, b) => a.distance - b.distance || a.tile.key.level - b.tile.key.level,
    )
    .map(({ tile }) => tile);
