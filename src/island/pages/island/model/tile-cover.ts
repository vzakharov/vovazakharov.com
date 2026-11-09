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

/** The four tiles one level finer inside `key`. */
const childrenOf = ({ face, level, x, y }: CubeCell): CubeCell[] =>
  [0, 1, 2, 3].map((i) => ({
    face,
    level: level + 1,
    x: 2 * x + (i % 2),
    y: 2 * y + Math.floor(i / 2),
  }));

/** The finer tiles inside a drawn tile that other pieces of the cover draw. */
export type Cut = { readonly except: readonly CubeCell[] };

/** A tile drawn whole, or all of it but its `except`. */
export type CoverPiece = TileKeyed<CubeCell> & Cut;

/** A subtree's pieces, the outermost tiles they fill, and whether they fill all it needs. */
type Subcover = {
  readonly pieces: CoverPiece[];
  readonly outer: CubeCell[];
  readonly covered: boolean;
};

const NOTHING: Subcover = { pieces: [], outer: [], covered: false };
const whole = (key: CubeCell): Subcover => ({
  pieces: [{ key, except: [] }],
  outer: [key],
  covered: true,
});

/**
 * The finest cover of `selected` that the tiles in hand allow, no two pieces
 * overlapping, over the tree of the selected and `shown` tiles (the last
 * selection wholly in hand) and their ancestors. Each region draws:
 *
 * - a selected tile in hand, or a shown one nothing selected lies inside, as
 *   itself;
 * - else its children's covers, when each covers all its children need;
 * - else, when held, itself but for what its children's covers draw, so finer
 *   tiles in hand show the moment they land and the rest is stood in for;
 * - else its children's covers, left for an ancestor to complete.
 *
 * The root tiles are always in hand, so no part of the selection is left
 * undrawn. A selected tile's region needs all of it: children outside the
 * tree count when held, and a shown tile inside one draws until it arrives.
 */
export function finestCover(
  selected: readonly CubeCell[],
  shown: readonly CubeCell[],
  has: (id: string) => boolean,
): CoverPiece[] {
  const selectedIds = new Set(selected.map((key) => cubeTileId(key)));
  const shownIds = new Set(shown.map((key) => cubeTileId(key)));
  const children = new Map<string, Map<string, CubeCell>>();
  const tops = new Map<string, CubeCell>();
  for (const key of [...selected, ...shown]) {
    let at = key;
    let up = parentOf(at);
    while (up !== null) {
      const known = children.get(cubeTileId(up)) ?? new Map<string, CubeCell>();
      if (known.has(cubeTileId(at))) break;
      children.set(cubeTileId(up), known.set(cubeTileId(at), at));
      at = up;
      up = parentOf(at);
    }
    if (up === null) tops.set(cubeTileId(at), at);
  }

  function coverOf(key: CubeCell, full: boolean): Subcover {
    const id = cubeTileId(key);
    const own = has(id);
    const kept = children.get(id);
    if (own && (selectedIds.has(id) || (shownIds.has(id) && !kept))) {
      return whole(key);
    }
    const needsAll = full || selectedIds.has(id);
    const kids = needsAll
      ? childrenOf(key).map((child) => {
          const known = kept?.get(cubeTileId(child));
          if (known !== undefined) return coverOf(known, true);
          return has(cubeTileId(child)) ? whole(child) : NOTHING;
        })
      : [...(kept?.values() ?? [])].map((child) => coverOf(child, false));
    const pieces = kids.flatMap((kid) => kid.pieces);
    const outer = kids.flatMap((kid) => kid.outer);
    const covered = kids.length > 0 && kids.every((kid) => kid.covered);
    if (covered || !own) return { pieces, outer, covered };
    return {
      pieces: [...pieces, { key, except: outer }],
      outer: [key],
      covered: true,
    };
  }

  return [...tops.values()].flatMap((top) => coverOf(top, false).pieces);
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
