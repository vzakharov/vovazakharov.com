import {
  type CubeCell,
  DIRECTIONS,
  FACES,
  length,
  neighbour,
  R,
  scaled,
  type Vec3,
} from '@/island/shared/globe';

import {
  type CoastDistance,
  cutSpread,
  groundSpread,
  HIGHEST_GROUND,
  LOWEST_GROUND,
} from '../../height';
import {
  capGap,
  cubeLevelSpacing,
  cubeTileId,
  cubeTileSide,
  TILE_GRID,
  type TileCap,
  tileCap,
} from '../../tile';
import { covering } from './cube-neighbours';
import { cubeChildren, cubeSplitRule } from './cube-split';
import { type Framed, outside } from './view';

/**
 * A tile as filled: the lowest and highest of its lattice's heights, metres,
 * and the coarsest detail cut any of them was sampled at.
 */
export type Filled = {
  readonly low: number;
  readonly high: number;
  readonly finest: number;
};

export type CubeSelectOptions = Framed & {
  /** The coast, when the selection should follow it (`cubeSplitRule`). */
  readonly coast?: CoastDistance;
  /**
   * The ground's height at a unit direction, metres, which bounds each tile's
   * relief for the horizon and the frustum; the ground's whole range bounds
   * it without.
   */
  readonly ground?: (direction: Vec3) => number;
  /**
   * A tile as filled, where one is: its heights bound its relief more tightly
   * than `ground`'s, for every tile under it filled to a cut no coarser.
   */
  readonly filled?: (key: CubeCell) => Filled | undefined;
};

/** The lowest and highest a tile and every tile under it draws, metres. */
type Bracket = readonly [low: number, high: number];

const within = ([low, high]: Bracket, [floor, ceiling]: Bracket): Bracket => [
  Math.max(low, floor),
  Math.min(high, ceiling),
];

const WHOLE: Bracket = [LOWEST_GROUND, HIGHEST_GROUND];

/** The angle over the sea's horizon from which ground `h` metres up shows. */
const rise = (h: number) => Math.acos(R / (R + Math.max(0, h)));

const faceOrder = (key: CubeCell) => FACES.indexOf(key.face);

/**
 * The leaf tiles of the cube to draw from `eye` (world metres), ordered by
 * level, then face in `FACES` order, then `y`, then `x`. A tile splits by
 * `cubeSplitRule`; one wholly past the horizon, or wholly out of `frustum`, is
 * dropped. The result is balanced across face edges too: tiles sharing an
 * edge differ by at most one level, and each tile's skirt hides the step.
 */
export function selectCubeTiles(
  eye: Vec3,
  options: CubeSelectOptions = {},
): CubeCell[] {
  const { coast, frustum, ground, filled } = options;
  const seaHorizon = Math.acos(Math.min(1, R / length(eye)));

  /**
   * The tile's bracket within `parent`'s, for the tile and every tile under
   * it: the ground at the cap's points widened by the spread to the farthest
   * point from them, and the tile's filled heights widened by what a finer
   * cut and the ground between its vertices can add — each with the sea over
   * it wherever that ground is below the sea.
   */
  const relief = (key: CubeCell, cap: TileCap, parent: Bracket): Bracket => {
    let bracket = parent;
    const own = filled?.(key);
    if (own !== undefined) {
      // Every point of the tile lies within a cell's diagonal half of a vertex.
      const slack = cutSpread(
        own.finest,
        cubeLevelSpacing(key.level, TILE_GRID - 1),
      );
      bracket = within(bracket, [
        own.low - slack,
        Math.max(0, own.high) + slack,
      ]);
    }
    if (ground === undefined) return bracket;
    // The cap's points are the tile's corners, edge middles and centre, so
    // every point of the tile lies within half a side of one, along its
    // edges' directions.
    const slack = groundSpread(cubeTileSide(key) / 2);
    if (slack >= bracket[1] - bracket[0]) return bracket;
    const heights = [...cap.border, cap.centre].map((p) => ground(p));
    return within(bracket, [
      Math.min(...heights) - slack,
      Math.max(0, ...heights) + slack,
    ]);
  };

  /**
   * What the tile draws itself, as a leaf: its filled heights exactly, the
   * sea's level with them, since the mesh is those heights and nothing more.
   */
  const drawn = (key: CubeCell, under: Bracket): Bracket => {
    const own = filled?.(key);
    return own === undefined
      ? under
      : within(under, [Math.min(0, own.low), Math.max(0, own.high)]);
  };

  /** Each tile kept so far by its id, with its bracket. */
  const brackets = new Map<string, Bracket>();

  /**
   * Whether any of tile `key`, under `parent`, may show — of the tile alone,
   * when it is a `leaf`; a tile that may is kept in `brackets`, and its
   * children are bracketed within it.
   */
  const visible = (key: CubeCell, leaf: boolean, parent?: CubeCell) => {
    const cap = tileCap(key);
    const bracket = relief(
      key,
      cap,
      (parent && brackets.get(cubeTileId(parent))) ?? WHOLE,
    );
    const [low, high] = leaf ? drawn(key, bracket) : bracket;
    if (capGap(cap, eye) > seaHorizon + rise(high)) return false;
    if (frustum !== undefined) {
      // The sphere bulges past the chords between border points by this much.
      const bulge = (R + high) * (1 - Math.cos(cap.radius));
      const hull = cap.border.flatMap((p) => [
        scaled(p, R + low),
        scaled(p, R + high),
      ]);
      if (outside(frustum, eye, hull, bulge)) return false;
    }
    brackets.set(cubeTileId(key), bracket);
    return true;
  };

  const splits = cubeSplitRule(eye, coast);

  const leaves = new Map<string, CubeCell>();
  const descend = (key: CubeCell, parent?: CubeCell) => {
    const leaf = !splits(key);
    if (!visible(key, leaf, parent)) return;
    if (leaf) {
      leaves.set(cubeTileId(key), key);
      return;
    }
    for (const child of cubeChildren(key)) descend(child, key);
  };
  for (const face of FACES) descend({ face, level: 0, x: 0, y: 0 });

  balanceCube(leaves, (key, parent) => visible(key, true, parent));

  return [...leaves.values()].toSorted(
    (a, b) =>
      a.level - b.level ||
      faceOrder(a) - faceOrder(b) ||
      a.y - b.y ||
      a.x - b.x,
  );
}

/**
 * Splits any leaf more than one level coarser than a leaf beside it, on its
 * face or across a face edge, until none is. A split's culled children stay
 * out.
 */
function balanceCube(
  leaves: Map<string, CubeCell>,
  visible: (key: CubeCell, parent: CubeCell) => boolean,
) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of leaves.values()) {
      for (const direction of DIRECTIONS) {
        const coarse = covering(leaves, neighbour(key, direction));
        if (!coarse || coarse.level >= key.level - 1) continue;
        leaves.delete(cubeTileId(coarse));
        for (const child of cubeChildren(coarse)) {
          if (visible(child, coarse)) leaves.set(cubeTileId(child), child);
        }
        changed = true;
      }
    }
  }
}
