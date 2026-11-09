import assert from 'node:assert/strict';

import {
  cross,
  type CubeCell,
  DIRECTIONS,
  dot,
  faceToSphere,
  latLonToUnit,
  length,
  neighbour,
  R,
  scaled,
  sphereToFace,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import type { CoastDistance } from '../../height';
import { cubeTileId, tileHolds } from '../../tile';

const DEGREE = Math.PI / 180;

/** The island's latitude on the prime meridian, radians. */
export const CENTRE_LAT = 10 * DEGREE;

/** The direction `metres` north of the island's centre along its meridian. */
export const northOfCentre = (metres: number) =>
  latLonToUnit({ lat: CENTRE_LAT + metres / R, lon: 0 });

/** The island's centre: 10° N on the prime meridian. */
export const CENTRE = northOfCentre(0);

export const arc = (a: Vec3, b: Vec3) =>
  Math.atan2(length(cross(a, b)), dot(a, b));

/** The eye `height` metres over direction `direction`. */
export const eyeOver = (direction: Vec3, height: number) =>
  scaled(unit(direction), R + height);

/** A disc of radius 1 000 km around `CENTRE`, signed positive outside. */
export const DISC_RADIUS = 1_000_000;
export const disc: CoastDistance = (p) => R * arc(p, CENTRE) - DISC_RADIUS;

/** Places worth looking from: the island, a face's middle, edge, corner, a pole. */
export const PLACES: ReadonlyArray<readonly [string, Vec3]> = [
  ['the centre', CENTRE],
  ['a face edge', faceToSphere('px', 1, 0.3)],
  ['a cube corner', faceToSphere('px', 1, 1)],
  ['the north pole', [0, 1, 0]],
  ['the south pole', [0, -1, 0]],
  ['a face middle', faceToSphere('nz', 0.1, -0.2)],
];

/** Whether `key` holds direction `p`. */
export const holds = (key: CubeCell, p: Vec3) =>
  tileHolds(key, sphereToFace(p));

const ancestors = ({ face, level, x, y }: CubeCell) =>
  Array.from({ length: level + 1 }, (_, shift) => ({
    face,
    level: level - shift,
    x: x >> shift,
    y: y >> shift,
  }));

/**
 * Each tile against the tile covering its same-level neighbour in every
 * direction, across face edges too: at most one level apart. Returns how many
 * of those pairs straddle a face edge.
 */
export function assertCubeBalanced(tiles: readonly CubeCell[]): number {
  const ids = new Map(tiles.map((key) => [cubeTileId(key), key]));
  let across = 0;
  for (const key of tiles) {
    for (const direction of DIRECTIONS) {
      const coarse = ancestors(neighbour(key, direction))
        .map((cell) => ids.get(cubeTileId(cell)))
        .find((found) => found !== undefined);
      if (coarse === undefined) continue;
      assert.ok(
        key.level - coarse.level <= 1,
        `${cubeTileId(key)} beside ${cubeTileId(coarse)}`,
      );
      if (coarse.face !== key.face) across += 1;
    }
  }
  return across;
}

/** No two tiles overlap: none is an ancestor of another. */
export function assertCubeDisjoint(tiles: readonly CubeCell[]) {
  const ids = new Set(tiles.map((key) => cubeTileId(key)));
  for (const key of tiles) {
    for (const above of ancestors(key).slice(1)) {
      assert.ok(!ids.has(cubeTileId(above)), cubeTileId(key));
    }
  }
}
