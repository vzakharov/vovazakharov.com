import { tileId, type TileKey, tileRect } from '@/island/entities/terrain';

const parentOf = ({ level, x, y }: TileKey): TileKey | null =>
  level === 0
    ? null
    : { level: level - 1, x: Math.floor(x / 2), y: Math.floor(y / 2) };

/** Whether `inner` lies inside `outer`, `outer` itself included. */
const within = (inner: TileKey, outer: TileKey) =>
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
  selected: readonly TileKey[],
  has: (id: string) => boolean,
): TileKey[] {
  const standIns = new Map<string, TileKey>();
  for (const key of selected) {
    if (has(tileId(key))) continue;
    for (let up = parentOf(key); up !== null; up = parentOf(up)) {
      if (has(tileId(up))) {
        standIns.set(tileId(up), up);
        break;
      }
    }
  }
  // A stand-in inside another is drawn by the outer one.
  const outer = [...standIns.values()].filter(
    (key) =>
      ![...standIns.values()].some(
        (other) => other !== key && within(key, other),
      ),
  );
  const own = selected.filter(
    (key) => has(tileId(key)) && !outer.some((standIn) => within(key, standIn)),
  );
  return [...outer, ...own];
}

/** Plane metres from `(x, y)` to the nearest point of the tile. */
export function distanceTo(key: TileKey, x: number, y: number): number {
  const { west, south, east, north } = tileRect(key);
  return Math.hypot(
    x - Math.min(east, Math.max(west, x)),
    y - Math.min(north, Math.max(south, y)),
  );
}

/** `keys` nearest to plane point `(x, y)` first, the coarser first at a tie. */
export const nearestFirst = (
  keys: readonly TileKey[],
  x: number,
  y: number,
): TileKey[] =>
  keys
    .map((key) => ({ key, distance: distanceTo(key, x, y) }))
    .toSorted((a, b) => a.distance - b.distance || a.key.level - b.key.level)
    .map(({ key }) => key);
