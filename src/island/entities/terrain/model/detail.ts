import type { Vec3 } from '@/island/shared/globe';

import type { CoastField } from './coast-field';
import { splitRule } from './split';
import {
  MAX_LEVEL,
  TILE_GRID,
  TILE_SQUARE,
  tileId,
  type TileKey,
  tileRect,
  tileSide,
} from './tile';

const CELLS = TILE_GRID - 1;

/** Twice the vertex spacing of a level's tiles. */
const twoSpacings = (level: number) => (2 * tileSide(level)) / CELLS;

type TileRect = ReturnType<typeof tileRect>;
type Coarser = ReadonlyArray<{
  readonly level: number;
  readonly rect: TileRect;
}>;

const inside = ({ west, south, east, north }: TileRect, x: number, y: number) =>
  west <= x && x <= east && south <= y && y <= north;

/** Metres from plane point `(x, y)` to the rectangle, 0 inside or on its edge. */
const gap = ({ west, south, east, north }: TileRect, x: number, y: number) =>
  Math.hypot(
    Math.max(0, west - x, x - east),
    Math.max(0, south - y, y - north),
  );

/** Metres between the nearest points of two rectangles, 0 where they touch. */
const apart = (a: TileRect, b: TileRect) =>
  Math.hypot(
    Math.max(0, a.west - b.east, b.west - a.east),
    Math.max(0, a.south - b.north, b.south - a.north),
  );

/**
 * What a leaf of `level` asks of the cut at a point `distance` metres from it:
 * its twice-spacing, ramping to nothing half its side out.
 */
const reach = (level: number, distance: number) =>
  twoSpacings(level) * Math.max(0, 1 - distance / (tileSide(level) / 2));

/**
 * The shortest relief, in metres, to draw at plane point `(x, y)` seen from
 * `eye`: over the leaves of `splitRule(eye, coast)` taken before balancing and
 * culling, the largest of each leaf's twice-spacing, ramped down to nothing
 * half the leaf's side past its edge. Balance and culling only ever leave a
 * point under a tile at least as fine as its leaf, so no selected tile aliases
 * the cut; it is a pure, continuous function of the point, so tiles of any
 * levels cut the same octaves along the edge they share, with no step where
 * the level changes. `coast` must be what the selection was given.
 */
export function detailCut(
  eye: Vec3,
  coast?: CoastField,
): (x: number, y: number) => number {
  const rule = splitRule(eye, coast);
  const decided = new Map<string, boolean>();
  const splits = (key: TileKey) => {
    const id = tileId(key);
    const known = decided.get(id);
    if (known !== undefined) return known;
    const verdict = rule(key);
    decided.set(id, verdict);
    return verdict;
  };

  /** The leaf holding the point, straight down. */
  const holding = (x: number, y: number) => {
    let leaf: TileKey = { level: 0, x: 0, y: 0 };
    while (splits(leaf)) {
      const level = leaf.level + 1;
      const side = tileSide(level);
      const last = 2 ** level - 1;
      const index = (p: number) =>
        Math.min(last, Math.max(0, Math.floor((p + TILE_SQUARE / 2) / side)));
      leaf = { level, x: index(x), y: index(y) };
    }
    return leaf;
  };

  /**
   * The leaves that may ask more of a point in `leaf` than `leaf` does: the
   * coarser ones. One of `level` within half its side of the point is one of
   * the eight around `leaf`'s ancestor there, so those are all it takes.
   * Coarsest first.
   */
  const around = (leaf: TileKey): Coarser => {
    const found: Array<Coarser[number]> = [];
    const own = tileRect(leaf);
    // The tiles of the level above, around its ancestor, that split and whose
    // every ancestor splits: a tile's parent is among them or on the path.
    let open = new Set<string>([tileId({ level: 0, x: 0, y: 0 })]);
    for (let level = 1; level < leaf.level; level++) {
      const span = 2 ** level;
      const cx = leaf.x >> (leaf.level - level);
      const cy = leaf.y >> (leaf.level - level);
      const next = new Set<string>();
      for (let y = Math.max(0, cy - 1); y <= Math.min(span - 1, cy + 1); y++) {
        for (
          let x = Math.max(0, cx - 1);
          x <= Math.min(span - 1, cx + 1);
          x++
        ) {
          const key = { level, x, y };
          if (!open.has(tileId({ level: level - 1, x: x >> 1, y: y >> 1 }))) {
            continue;
          }
          if (splits(key)) {
            next.add(tileId(key));
            continue;
          }
          const rect = tileRect(key);
          if (apart(rect, own) < tileSide(level) / 2) {
            found.push({ level, rect });
          }
        }
      }
      open = next;
    }
    return found;
  };

  const neighbourhoods = new Map<string, Coarser>();
  let last: { leaf: TileKey; rect: TileRect; coarser: Coarser } | null = null;
  return (x, y) => {
    if (last === null || !inside(last.rect, x, y)) {
      const leaf = holding(x, y);
      const id = tileId(leaf);
      const coarser = neighbourhoods.get(id) ?? around(leaf);
      neighbourhoods.set(id, coarser);
      last = { leaf, rect: tileRect(leaf), coarser };
    }
    // A point on the edge of `last.leaf` may hold another leaf too: a finer
    // one asks less, and a coarser one is among `coarser`, so the max agrees.
    let best = Math.max(
      twoSpacings(MAX_LEVEL),
      reach(last.leaf.level, gap(last.rect, x, y)),
    );
    for (const { level, rect } of last.coarser) {
      if (twoSpacings(level) <= best) break;
      best = Math.max(best, reach(level, gap(rect, x, y)));
    }
    return best;
  };
}
