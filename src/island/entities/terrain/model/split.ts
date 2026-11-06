import { planeToWorld, type Vec3, worldToPlane } from '@/island/shared/globe';

import { type CoastField, sampleCoastField } from './coast-field';
import { HIGHEST_GROUND, LOWEST_GROUND } from './height';
import {
  MAX_LEVEL,
  MIN_LEVEL,
  SPLIT_RATIO,
  type TileKey,
  tileRect,
  tileSide,
} from './tile';

/** Levels finer than elsewhere a tile astride the coast splits to. */
const COAST_FINER = 2;

/**
 * Metres from `eye` (world metres) to plane point `(x, y)` taken at the eye's
 * own height, held within the ground's range: the distance a tile's split is
 * judged by.
 */
export function viewDistance(eye: Vec3): (x: number, y: number) => number {
  const { h } = worldToPlane(eye);
  const level = Math.min(HIGHEST_GROUND, Math.max(LOWEST_GROUND, h));
  return (x, y) => {
    const p = planeToWorld(x, y, level);
    return Math.hypot(eye[0] - p[0], eye[1] - p[1], eye[2] - p[2]);
  };
}

/**
 * Whether a tile seen from `eye` splits: while its side exceeds `SPLIT_RATIO`
 * times its distance — the distance to its point nearest the eye — from
 * `MIN_LEVEL` down to `MAX_LEVEL`; and, given `coast`, `COAST_FINER` levels
 * further for a tile whose centre is nearer the coast than its side, since
 * the sea's flat surface meets the land there along the land grid's cells and
 * shows their size as steps. A pure function of the key, so the selection and
 * the detail cut agree on it.
 */
export function splitRule(
  eye: Vec3,
  coast?: CoastField,
): (key: TileKey) => boolean {
  const plane = worldToPlane(eye);
  const distanceTo = viewDistance(eye);
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
  return (key) => {
    if (key.level < MIN_LEVEL) return true;
    if (key.level >= MAX_LEVEL) return false;
    const ratio = tileSide(key.level) / distance(key);
    return (
      ratio > SPLIT_RATIO ||
      (ratio > SPLIT_RATIO / 2 ** COAST_FINER && astride(key))
    );
  };
}
