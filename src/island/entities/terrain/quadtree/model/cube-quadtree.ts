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
  groundSpread,
  HIGHEST_GROUND,
  LOWEST_GROUND,
} from '../../height';
import {
  capGap,
  cubeTileId,
  cubeTileSide,
  type TileCap,
  tileCap,
} from '../../tile';
import { covering } from './cube-neighbours';
import { cubeChildren, cubeSplitRule } from './cube-split';
import { type Framed, outside } from './view';

export type CubeSelectOptions = Framed & {
  /** The coast, when the selection should follow it (`cubeSplitRule`). */
  readonly coast?: CoastDistance;
  /**
   * The ground's height at a unit direction, metres, which bounds each tile's
   * relief for the horizon and the frustum; the ground's whole range bounds
   * it without.
   */
  readonly ground?: (direction: Vec3) => number;
};

/** The lowest and highest a tile and every tile under it draws, metres. */
type Bracket = readonly [low: number, high: number];

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
  const { coast, frustum, ground } = options;
  const seaHorizon = Math.acos(Math.min(1, R / length(eye)));

  /**
   * The tile's bracket within `within`, its parent's: the ground at the
   * cap's points widened by the spread to the farthest point from them, and
   * the sea over it wherever that ground is below the sea.
   */
  const relief = (key: CubeCell, cap: TileCap, within: Bracket): Bracket => {
    if (ground === undefined) return within;
    // The cap's points are the tile's corners, edge middles and centre, so
    // every point of the tile lies within half a side of one, along its
    // edges' directions.
    const slack = groundSpread(cubeTileSide(key) / 2);
    if (slack >= within[1] - within[0]) return within;
    const heights = [...cap.border, cap.centre].map((p) => ground(p));
    return [
      Math.max(within[0], Math.min(...heights) - slack),
      Math.min(within[1], Math.max(0, ...heights) + slack),
    ];
  };

  /** Each tile kept so far by its id, with its bracket. */
  const brackets = new Map<string, Bracket>();

  /**
   * Whether any of tile `key`, under `parent`, may show; a tile that may is
   * kept in `brackets`, and its children are bracketed within it.
   */
  const visible = (key: CubeCell, parent?: CubeCell) => {
    const cap = tileCap(key);
    const within = (parent && brackets.get(cubeTileId(parent))) ?? WHOLE;
    const bracket = relief(key, cap, within);
    const [low, high] = bracket;
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
    if (!visible(key, parent)) return;
    if (!splits(key)) {
      leaves.set(cubeTileId(key), key);
      return;
    }
    for (const child of cubeChildren(key)) descend(child, key);
  };
  for (const face of FACES) descend({ face, level: 0, x: 0, y: 0 });

  balanceCube(leaves, visible);

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
