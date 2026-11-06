import {
  planeToWorld,
  R,
  type Vec3,
  worldToPlane,
} from '@/island/shared/globe';

import { MAX_LEVEL, tileId, type TileKey, tileRect, tileSide } from './tile';

export type SelectOptions = {
  /** Every tile drawn is at least this deep; `MIN_LEVEL` by default. */
  readonly minLevel?: number;
  /** The deepest level a tile splits to; `MAX_LEVEL` by default. */
  readonly maxLevel?: number;
  /**
   * A tile splits while its side exceeds this share of its distance from the
   * eye, so it keeps roughly the same angular size at every height.
   */
  readonly splitRatio?: number;
  /** Bounds on the terrain's height, metres, for distance and horizon. */
  readonly lowest?: number;
  readonly highest?: number;
};

/** 16 tiles at most, 64 km cells, so the coast reads from orbit. */
export const MIN_LEVEL = 2;
export const SPLIT_RATIO = 1;
const LOWEST = -8000;
const HIGHEST = 7000;

const length = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const angleBetween = (a: Vec3, b: Vec3) =>
  Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (length(a) * length(b)))));

const children = ({ level, x, y }: TileKey): TileKey[] => [
  { level: level + 1, x: 2 * x, y: 2 * y },
  { level: level + 1, x: 2 * x + 1, y: 2 * y },
  { level: level + 1, x: 2 * x, y: 2 * y + 1 },
  { level: level + 1, x: 2 * x + 1, y: 2 * y + 1 },
];

/**
 * The leaf tiles to draw from `eye` (world metres), ordered by level, then
 * `y`, then `x`. A tile splits while its side exceeds `splitRatio` times its
 * distance from the eye, from `minLevel` down to `maxLevel`; one wholly past the horizon is
 * dropped. The result is balanced: tiles sharing an edge differ by at most
 * one level, and each tile's skirt hides the step in between.
 */
export function selectTiles(eye: Vec3, options: SelectOptions = {}): TileKey[] {
  const minLevel = options.minLevel ?? MIN_LEVEL;
  const maxLevel = options.maxLevel ?? MAX_LEVEL;
  const splitRatio = options.splitRatio ?? SPLIT_RATIO;
  const lowest = options.lowest ?? LOWEST;
  const highest = options.highest ?? HIGHEST;

  const plane = worldToPlane(eye);
  const eyeHeight = Math.min(highest, Math.max(lowest, plane.h));
  // The sea sphere's horizon from the eye plus a peak's own over it.
  const horizon =
    Math.acos(Math.min(1, R / length(eye))) + Math.acos(R / (R + highest));

  const visible = (key: TileKey) => {
    const { west, south, east, north } = tileRect(key);
    const cx = (west + east) / 2;
    const cy = (south + north) / 2;
    const middle = planeToWorld(cx, cy);
    const reach = Math.max(
      ...(
        [
          [west, south],
          [east, south],
          [west, north],
          [east, north],
          [cx, south],
          [cx, north],
          [west, cy],
          [east, cy],
        ] as const
      ).map(([x, y]) => angleBetween(middle, planeToWorld(x, y))),
    );
    return angleBetween(eye, middle) - reach <= horizon;
  };

  const distance = (key: TileKey) => {
    const { west, south, east, north } = tileRect(key);
    const x = Math.min(east, Math.max(west, plane.x));
    const y = Math.min(north, Math.max(south, plane.y));
    const p = planeToWorld(x, y, eyeHeight);
    return Math.hypot(eye[0] - p[0], eye[1] - p[1], eye[2] - p[2]);
  };

  const splits = (key: TileKey) =>
    key.level < minLevel ||
    (key.level < maxLevel && tileSide(key.level) > splitRatio * distance(key));

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
