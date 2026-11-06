import {
  planeToWorld,
  R,
  type Vec3,
  worldToPlane,
} from '@/island/shared/globe';

import { type CoastField, sampleCoastField } from './coast-field';
import { viewDistance } from './detail';
import { GROUND_SLOPE, HIGHEST_GROUND, LOWEST_GROUND } from './height';
import {
  MAX_LEVEL,
  MIN_LEVEL,
  SPLIT_RATIO,
  tileId,
  type TileKey,
  tileRect,
  tileSide,
} from './tile';
import { type Frustum, outside } from './view';

export type SelectOptions = {
  /**
   * The coast, when the selection should follow it: a tile whose centre is
   * nearer the coast than its side splits `COAST_FINER` levels finer than
   * elsewhere, since the sea's flat surface meets the land there along the
   * land grid's cells and shows their size as steps.
   */
  readonly coast?: CoastField;
  /** The camera's view, when tiles out of it should be dropped. */
  readonly frustum?: Frustum;
  /**
   * The ground's height at a plane point, metres, which bounds each tile's
   * relief for the horizon and the frustum; the ground's whole range bounds
   * it without.
   */
  readonly ground?: (x: number, y: number) => number;
};

/** Levels finer than elsewhere a tile astride the coast splits to. */
const COAST_FINER = 2;

const length = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const angleBetween = (a: Vec3, b: Vec3) =>
  Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (length(a) * length(b)))));
/** The angle over the sea's horizon from which ground `h` metres up shows. */
const rise = (h: number) => Math.acos(R / (R + Math.max(0, h)));

const children = ({ level, x, y }: TileKey): TileKey[] => [
  { level: level + 1, x: 2 * x, y: 2 * y },
  { level: level + 1, x: 2 * x + 1, y: 2 * y },
  { level: level + 1, x: 2 * x, y: 2 * y + 1 },
  { level: level + 1, x: 2 * x + 1, y: 2 * y + 1 },
];

/**
 * The leaf tiles to draw from `eye` (world metres), ordered by level, then
 * `y`, then `x`. A tile splits while its side exceeds `SPLIT_RATIO` times its
 * distance from the eye, from `MIN_LEVEL` down to `MAX_LEVEL`; one wholly past
 * the horizon, or wholly out of `frustum`, is dropped. The result is balanced:
 * tiles sharing an edge differ by at most one level, and each tile's skirt
 * hides the step in between.
 */
export function selectTiles(eye: Vec3, options: SelectOptions = {}): TileKey[] {
  const { coast, frustum, ground } = options;
  const plane = worldToPlane(eye);
  const distanceTo = viewDistance(eye);
  const seaHorizon = Math.acos(Math.min(1, R / length(eye)));

  /** The tile's lowest and highest ground, bounded by the slope around samples. */
  const relief = (
    key: TileKey,
    samples: ReadonlyArray<readonly [number, number]>,
  ) => {
    const side = tileSide(key.level);
    if (ground === undefined || GROUND_SLOPE * side >= HIGHEST_GROUND) {
      return [LOWEST_GROUND, HIGHEST_GROUND] as const;
    }
    // Every point of the tile lies within half a side of one sample.
    const slack = (GROUND_SLOPE * side) / 2;
    const heights = samples.map(([x, y]) => ground(x, y));
    return [
      Math.max(LOWEST_GROUND, Math.min(...heights) - slack),
      Math.min(HIGHEST_GROUND, Math.max(...heights) + slack),
    ] as const;
  };

  const visible = (key: TileKey) => {
    const { west, south, east, north } = tileRect(key);
    const cx = (west + east) / 2;
    const cy = (south + north) / 2;
    const middle = planeToWorld(cx, cy);
    const border = [
      [west, south],
      [east, south],
      [west, north],
      [east, north],
      [cx, south],
      [cx, north],
      [west, cy],
      [east, cy],
    ] as const;
    const reach = Math.max(
      ...border.map(([x, y]) => angleBetween(middle, planeToWorld(x, y))),
    );
    const [low, high] = relief(key, [...border.slice(0, 4), [cx, cy]]);
    if (angleBetween(eye, middle) - reach > seaHorizon + rise(high)) {
      return false;
    }
    if (frustum === undefined) return true;
    // The sphere bulges past the chords between border points by this much.
    const bulge = (R + high) * (1 - Math.cos(reach));
    const hull = border.flatMap(([x, y]) => [
      planeToWorld(x, y, low),
      planeToWorld(x, y, high),
    ]);
    return !outside(frustum, eye, hull, bulge);
  };

  const distance = (key: TileKey) => {
    const { west, south, east, north } = tileRect(key);
    return distanceTo(
      Math.min(east, Math.max(west, plane.x)),
      Math.min(north, Math.max(south, plane.y)),
    );
  };

  const astride = (key: TileKey) => {
    if (coast === undefined) return false;
    const { west, south, east, north } = tileRect(key);
    const reach = sampleCoastField(
      coast,
      (west + east) / 2,
      (south + north) / 2,
    );
    return Math.abs(reach) < tileSide(key.level);
  };

  const splits = (key: TileKey) => {
    if (key.level < MIN_LEVEL) return true;
    if (key.level >= MAX_LEVEL) return false;
    const ratio = tileSide(key.level) / distance(key);
    return (
      ratio > SPLIT_RATIO ||
      (ratio > SPLIT_RATIO / 2 ** COAST_FINER && astride(key))
    );
  };

  const leaves = new Map<string, TileKey>();
  const descend = (key: TileKey) => {
    if (!visible(key)) return;
    if (!splits(key)) {
      leaves.set(tileId(key), key);
      return;
    }
    for (const child of children(key)) descend(child);
  };
  descend({ level: 0, x: 0, y: 0 });

  balance(leaves, visible);

  return [...leaves.values()].toSorted(
    (a, b) => a.level - b.level || a.y - b.y || a.x - b.x,
  );
}

/**
 * Splits any leaf more than one level coarser than a leaf beside it, until
 * none is. A split's culled children stay out.
 */
function balance(
  leaves: Map<string, TileKey>,
  visible: (key: TileKey) => boolean,
) {
  const covering = (level: number, x: number, y: number) =>
    Array.from({ length: level + 1 }, (_, shift) =>
      leaves.get(
        tileId({ level: level - shift, x: x >> shift, y: y >> shift }),
      ),
    ).find((key) => key !== undefined);
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of leaves.values()) {
      const span = 2 ** key.level;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const x = key.x + dx;
        const y = key.y + dy;
        if (x < 0 || y < 0 || x >= span || y >= span) continue;
        const coarse = covering(key.level, x, y);
        if (!coarse || coarse.level >= key.level - 1) continue;
        leaves.delete(tileId(coarse));
        for (const child of children(coarse)) {
          if (visible(child)) leaves.set(tileId(child), child);
        }
        changed = true;
      }
    }
  }
}
