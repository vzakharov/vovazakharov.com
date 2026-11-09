import { type CubeCell, length, R, type Vec3 } from '@/island/shared/globe';

import { HIGHEST_GROUND, LOWEST_GROUND } from '../../height';
import {
  capGap,
  CUBE_MAX_LEVEL,
  CUBE_MIN_LEVEL,
  cubeTileSide,
  SPLIT_RATIO,
  tileCap,
} from '../../tile';

/** Levels finer than elsewhere a tile astride the coast splits to. */
const COAST_FINER = 2;

/**
 * Signed metres from the coast at a unit direction, as the coast field reads
 * there: the selection asks only its magnitude.
 */
export type CoastDistance = (direction: Vec3) => number;

/** The four tiles a tile splits into, on its own face. */
export const cubeChildren = ({ face, level, x, y }: CubeCell): CubeCell[] => [
  { face, level: level + 1, x: 2 * x, y: 2 * y },
  { face, level: level + 1, x: 2 * x + 1, y: 2 * y },
  { face, level: level + 1, x: 2 * x, y: 2 * y + 1 },
  { face, level: level + 1, x: 2 * x + 1, y: 2 * y + 1 },
];

/**
 * Metres from `eye` (world metres) to the point of a tile's cap nearest it,
 * taken at the eye's own height held within the ground's range: the distance a
 * tile's split is judged by. The cap holds the tile, so this never exceeds the
 * distance to the tile's own nearest point.
 */
function viewDistance(eye: Vec3): (key: CubeCell) => number {
  const out = length(eye);
  const ground = R + Math.min(HIGHEST_GROUND, Math.max(LOWEST_GROUND, out - R));
  return (key) => {
    const half = Math.sin(capGap(tileCap(key), eye) / 2);
    // The law of cosines, kept free of cancellation when the eye is near.
    return Math.sqrt((out - ground) ** 2 + 4 * out * ground * half * half);
  };
}

/**
 * Whether a cube tile seen from `eye` splits: while its side exceeds
 * `SPLIT_RATIO` times its distance, from `CUBE_MIN_LEVEL` down to
 * `CUBE_MAX_LEVEL`; and, given `coast`, `COAST_FINER` levels further for a
 * tile whose middle is nearer the coast than its side, since the sea's flat
 * surface meets the land there along the land grid's cells and shows their
 * size as steps. A pure function of the key, so the selection and the detail
 * cut agree on it.
 */
export function cubeSplitRule(
  eye: Vec3,
  coast?: CoastDistance,
): (key: CubeCell) => boolean {
  const distance = viewDistance(eye);
  const astride = (key: CubeCell) =>
    coast !== undefined &&
    Math.abs(coast(tileCap(key).centre)) < cubeTileSide(key);
  return (key) => {
    if (key.level < CUBE_MIN_LEVEL) return true;
    if (key.level >= CUBE_MAX_LEVEL) return false;
    const ratio = cubeTileSide(key) / distance(key);
    return (
      ratio > SPLIT_RATIO ||
      (ratio > SPLIT_RATIO / 2 ** COAST_FINER && astride(key))
    );
  };
}
