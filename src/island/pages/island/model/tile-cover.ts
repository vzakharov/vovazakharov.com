import type { CubeCell, Vec3 } from '@/island/shared/globe';
import {
  capGap,
  CUBE_MIN_LEVEL,
  cubeTileId,
  tileCap,
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
 * The tiles to draw for a selection while some of it is still loading. A
 * selected tile in hand draws itself; one not yet in hand is covered by its
 * nearest ancestor in hand, which then also stands in for every selected
 * tile under it, so no two drawn tiles overlap. A selected tile with no
 * ancestor in hand is left out.
 */
export function coverOf(
  selected: readonly CubeCell[],
  has: (id: string) => boolean,
): CubeCell[] {
  const standIns = new Map<string, CubeCell>();
  for (const key of selected) {
    if (has(cubeTileId(key))) continue;
    const standIn = ancestorsOf(key).find((up) => has(cubeTileId(up)));
    if (standIn !== undefined) standIns.set(cubeTileId(standIn), standIn);
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
  return [...outer, ...own];
}

/**
 * The tiles to draw for `selected` while `shown`, the last selection wholly
 * in hand, still stands. `shown` draws itself; a selected tile overlapping it
 * waits, and one beyond it is covered as `coverOf` covers, by any stand-in but
 * one containing a shown tile — that coarse ancestor would hide the fine ground
 * under the eye, so the margin may draw nothing until the selection is in hand.
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
  const beyond = selected.filter(
    (key) =>
      !blocked.has(cubeTileId(key)) &&
      !ancestorsOf(key).some((up) => shownIds.has(cubeTileId(up))),
  );
  return [...shown, ...coverOf(beyond, (id) => has(id) && !blocked.has(id))];
}

/** Radians from direction `eye` (any length) to the nearest point of the tile. */
export const distanceTo = (key: CubeCell, eye: Vec3): number =>
  capGap(tileCap(key), eye);

/** `keys` nearest to direction `eye` first, the coarser first at a tie. */
export const nearestFirst = (
  keys: readonly CubeCell[],
  eye: Vec3,
): CubeCell[] =>
  keys
    .map((key) => ({ key, distance: distanceTo(key, eye) }))
    .toSorted((a, b) => a.distance - b.distance || a.key.level - b.key.level)
    .map(({ key }) => key);
