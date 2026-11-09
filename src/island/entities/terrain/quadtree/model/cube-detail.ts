import {
  DIRECTIONS,
  FACES,
  type FacePoint,
  neighbour,
  R,
  sphereToFace,
  type Vec3,
} from '@/island/shared/globe';

import {
  capGap,
  capsApart,
  CUBE_MAX_LEVEL,
  type CubeTileKey,
  cubeTileId,
  cubeTileSide,
  type TileCap,
  tileCap,
  TILE_GRID,
  tileHolds,
} from '../../tile';
import { type CoastDistance, cubeSplitRule } from './cube-split';

const CELLS = TILE_GRID - 1;

/** Twice the longest vertex spacing of a tile, metres. */
const twoSpacings = (key: CubeTileKey) => (2 * cubeTileSide(key)) / CELLS;

/** A leaf near a point, with what it asks at most and where it lies. */
type Asking = {
  readonly most: number;
  readonly side: number;
  readonly cap: TileCap;
};

const asking = (key: CubeTileKey): Asking => ({
  most: twoSpacings(key),
  side: cubeTileSide(key),
  cap: tileCap(key),
});

/**
 * What a leaf asks of the cut at unit direction `p`: its twice-spacing,
 * ramping to nothing half its side past its cap.
 */
const reach = ({ most, side, cap }: Asking, p: Vec3) =>
  most * Math.max(0, 1 - (capGap(cap, p) * R) / (side / 2));

/** The cells two steps or fewer from `key`, `key` included, across faces. */
function nearby(key: CubeTileKey): CubeTileKey[] {
  const found = new Map<string, CubeTileKey>([[cubeTileId(key), key]]);
  let ring: CubeTileKey[] = [key];
  for (let step = 0; step < 2; step++) {
    ring = ring.flatMap((cell) =>
      DIRECTIONS.map((direction) => {
        const { face, level, x, y } = neighbour(cell, direction);
        return { face, level, x, y };
      }),
    );
    for (const cell of ring) found.set(cubeTileId(cell), cell);
  }
  return [...found.values()];
}

/** The cut's floor: the finest level's twice-spacing where it is widest. */
const FLOOR = twoSpacings({
  face: 'px',
  level: CUBE_MAX_LEVEL,
  x: 2 ** (CUBE_MAX_LEVEL - 1),
  y: 2 ** (CUBE_MAX_LEVEL - 1),
});


/**
 * The shortest relief, in metres, to draw at unit direction `p` seen from
 * `eye`: over the leaves of `cubeSplitRule(eye, coast)` taken before balancing
 * and culling, the largest of each leaf's twice-spacing, ramped down to
 * nothing half the leaf's side past its cap. Balance and culling only ever
 * leave a point under a tile at least as fine as its leaf, so no selected tile
 * aliases the cut; it is a pure, continuous function of the direction, across
 * face edges included, so tiles of any levels and faces cut the same octaves
 * along the edge they share. `coast` must be what the selection was given.
 */
export function cubeDetailCut(
  eye: Vec3,
  coast?: CoastDistance,
): (p: Vec3) => number {
  const rule = cubeSplitRule(eye, coast);
  const decided = new Map<string, boolean>();
  const splits = (key: CubeTileKey) => {
    const id = cubeTileId(key);
    const known = decided.get(id);
    if (known !== undefined) return known;
    const verdict = rule(key);
    decided.set(id, verdict);
    return verdict;
  };

  /** The leaf holding the point, straight down its face. */
  const holding = ({ face, u, v }: FacePoint) => {
    let leaf: CubeTileKey = { face, level: 0, x: 0, y: 0 };
    while (splits(leaf)) {
      const level = leaf.level + 1;
      const last = 2 ** level - 1;
      const index = (c: number) =>
        Math.min(last, Math.max(0, Math.floor(((c + 1) / 2) * 2 ** level)));
      leaf = { face, level, x: index(u), y: index(v) };
    }
    return leaf;
  };

  /**
   * The other leaves that may ask more of a point in `leaf` than `leaf`
   * does: the coarser ones, and those of its own level, whose sides differ
   * with where they lie. One of `level` within half its side of the point is
   * within two steps of `leaf`'s ancestor there, so those are all it takes.
   * Most asking first.
   */
  const around = (leaf: CubeTileKey): readonly Asking[] => {
    const found: Asking[] = [];
    const own = tileCap(leaf);
    const ownId = cubeTileId(leaf);
    // The tiles of the level above, near its ancestor, that split and whose
    // every ancestor splits: a tile's parent is among them or on the path.
    let open = new Set<string>(
      FACES.map((face) => cubeTileId({ face, level: 0, x: 0, y: 0 })),
    );
    for (let level = 1; level <= leaf.level; level++) {
      const shift = leaf.level - level;
      const ancestor = {
        face: leaf.face,
        level,
        x: leaf.x >> shift,
        y: leaf.y >> shift,
      };
      const next = new Set<string>();
      for (const key of nearby(ancestor)) {
        const parent = { ...key, level: level - 1, x: key.x >> 1, y: key.y >> 1 };
        if (!open.has(cubeTileId(parent))) continue;
        if (splits(key)) {
          next.add(cubeTileId(key));
          continue;
        }
        if (cubeTileId(key) === ownId) continue;
        const near = asking(key);
        if (capsApart(near.cap, own) * R < near.side / 2) found.push(near);
      }
      open = next;
    }
    return found.toSorted((a, b) => b.most - a.most);
  };

  const neighbourhoods = new Map<string, readonly Asking[]>();
  let last: {
    leaf: CubeTileKey;
    own: Asking;
    others: readonly Asking[];
  } | null = null;
  return (p) => {
    const point = sphereToFace(p);
    if (last === null || !tileHolds(last.leaf, point)) {
      const leaf = holding(point);
      const id = cubeTileId(leaf);
      const others = neighbourhoods.get(id) ?? around(leaf);
      neighbourhoods.set(id, others);
      last = { leaf, own: asking(leaf), others };
    }
    // A point on the edge of `last.leaf` may hold another leaf too: a finer
    // one asks less, and a coarser or same-level one is among `others`, so
    // the max agrees.
    let best = Math.max(FLOOR, reach(last.own, p));
    for (const other of last.others) {
      if (other.most <= best) break;
      best = Math.max(best, reach(other, p));
    }
    return best;
  };
}
