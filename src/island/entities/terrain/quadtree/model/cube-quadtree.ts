import {
  DIRECTIONS,
  FACES,
  length,
  neighbour,
  R,
  scaled,
  type Vec3,
} from '@/island/shared/globe';

import { GROUND_SLOPE, HIGHEST_GROUND, LOWEST_GROUND } from '../../height';
import {
  capGap,
  type CubeTileKey,
  cubeTileId,
  cubeTileSide,
  tileCap,
} from '../../tile';
import { type CoastDistance, cubeChildren, cubeSplitRule } from './cube-split';
import type { SelectOptions } from './quadtree';
import { outside } from './view';

export type CubeSelectOptions = Pick<SelectOptions, 'frustum'> & {
  /** The coast, when the selection should follow it (`cubeSplitRule`). */
  readonly coast?: CoastDistance;
  /**
   * The ground's height at a unit direction, metres, which bounds each tile's
   * relief for the horizon and the frustum; the ground's whole range bounds
   * it without.
   */
  readonly ground?: (direction: Vec3) => number;
};

/** The angle over the sea's horizon from which ground `h` metres up shows. */
const rise = (h: number) => Math.acos(R / (R + Math.max(0, h)));

const faceOrder = (key: CubeTileKey) => FACES.indexOf(key.face);

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
): CubeTileKey[] {
  const { coast, frustum, ground } = options;
  const seaHorizon = Math.acos(Math.min(1, R / length(eye)));

  /** The tile's lowest and highest ground, bounded by the slope around samples. */
  const relief = (key: CubeTileKey, samples: readonly Vec3[]) => {
    const side = cubeTileSide(key);
    if (ground === undefined || GROUND_SLOPE * side >= HIGHEST_GROUND) {
      return [LOWEST_GROUND, HIGHEST_GROUND] as const;
    }
    // Every point of the tile lies within half a side of one sample.
    const slack = (GROUND_SLOPE * side) / 2;
    const heights = samples.map((p) => ground(p));
    return [
      Math.max(LOWEST_GROUND, Math.min(...heights) - slack),
      Math.min(HIGHEST_GROUND, Math.max(...heights) + slack),
    ] as const;
  };

  const visible = (key: CubeTileKey) => {
    const cap = tileCap(key);
    const [low, high] = relief(key, [...cap.border.slice(0, 4), cap.centre]);
    if (capGap(cap, eye) > seaHorizon + rise(high)) return false;
    if (frustum === undefined) return true;
    // The sphere bulges past the chords between border points by this much.
    const bulge = (R + high) * (1 - Math.cos(cap.radius));
    const hull = cap.border.flatMap((p) => [
      scaled(p, R + low),
      scaled(p, R + high),
    ]);
    return !outside(frustum, eye, hull, bulge);
  };

  const splits = cubeSplitRule(eye, coast);

  const leaves = new Map<string, CubeTileKey>();
  const descend = (key: CubeTileKey) => {
    if (!visible(key)) return;
    if (!splits(key)) {
      leaves.set(cubeTileId(key), key);
      return;
    }
    for (const child of cubeChildren(key)) descend(child);
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
  leaves: Map<string, CubeTileKey>,
  visible: (key: CubeTileKey) => boolean,
) {
  /** The leaf holding cell `key` or one of its ancestors, if any. */
  const covering = ({ face, level, x, y }: CubeTileKey) =>
    Array.from({ length: level + 1 }, (_, shift) =>
      leaves.get(
        cubeTileId({ face, level: level - shift, x: x >> shift, y: y >> shift }),
      ),
    ).find((key) => key !== undefined);
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of leaves.values()) {
      for (const direction of DIRECTIONS) {
        const coarse = covering(neighbour(key, direction));
        if (!coarse || coarse.level >= key.level - 1) continue;
        leaves.delete(cubeTileId(coarse));
        for (const child of cubeChildren(coarse)) {
          if (visible(child)) leaves.set(cubeTileId(child), child);
        }
        changed = true;
      }
    }
  }
}
