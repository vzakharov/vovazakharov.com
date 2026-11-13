import {
  CEILING_HEIGHT,
  ROOM_METRES,
  WALL_HALF,
} from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/shared/lib/vec';
import { DOORWAY } from '@/cube/shared/outside';

/**
 * A patch of the room the doorway's beam lands on, in metres of the room:
 * its middle, the way it faces, and `flux`, the square metres of the beam's
 * cross-section it takes — what it throws back is that times the sun's light
 * and its own colour.
 */
export type SunPatch = { at: Vec3; facing: Vec3; flux: number };

/** The room the beam crosses: its side and its height, in metres. */
const SIDE = ROOM_METRES;
const HEIGHT = ROOM_METRES * CEILING_HEIGHT;

/** The east wall's inner face, where the beam enters. */
export const DOOR_INNER = SIDE * (1 - WALL_HALF);

/** How many rays cross the doorway along it and up it. */
const RAYS = { along: 8, up: 16 };

/** The faces a ray from the doorway can end on, and how each is told apart. */
const ENDS = [
  { facing: [0, 1, 0], axis: 1, at: 0 },
  { facing: [0, -1, 0], axis: 1, at: HEIGHT },
  { facing: [0, 0, 1], axis: 2, at: 0 },
  { facing: [0, 0, -1], axis: 2, at: SIDE },
  { facing: [1, 0, 0], axis: 0, at: 0 },
] as const satisfies ReadonlyArray<{ facing: Vec3; axis: number; at: number }>;

/**
 * Where the sun's beam through floor 1's doorway lands, for a sun toward
 * `sun` (unit, x east, y up, z south, east of the wall): the doorway's rays
 * followed to the floor, ceiling and walls, gathered into patches `cell`
 * metres long. Their flux adds up to the doorway's area seen from the sun.
 */
export function beamPatches(sun: Vec3, cell = 1.25): SunPatch[] {
  const wide = DOORWAY.to - DOORWAY.from;
  const each = (wide * DOORWAY.height * sun[0]) / (RAYS.along * RAYS.up);
  const patches = new Map<
    string,
    { sum: [number, number, number]; n: number; facing: Vec3 }
  >();
  for (let i = 0; i < RAYS.along; i += 1) {
    for (let j = 0; j < RAYS.up; j += 1) {
      const from: Vec3 = [
        DOOR_INNER,
        (DOORWAY.height * (j + 0.5)) / RAYS.up,
        DOORWAY.from + (wide * (i + 0.5)) / RAYS.along,
      ];
      // The nearest face the ray, running against `sun`, comes to.
      const [end, run] = ENDS.map(
        (face) => [face, (from[face.axis] - face.at) / sun[face.axis]] as const,
      )
        .filter(([, far]) => far > 0)
        .reduce((near, other) => (other[1] < near[1] ? other : near));
      const hit = from.map((start, axis) => start - sun[axis]! * run) as [
        number,
        number,
        number,
      ];
      const along = end.axis === 0 ? hit[2] : hit[0];
      const key = `${end.facing.join(',')}/${String(Math.floor(along / cell))}`;
      const patch = patches.get(key) ?? {
        sum: [0, 0, 0],
        n: 0,
        facing: end.facing,
      };
      patch.sum = [
        patch.sum[0] + hit[0],
        patch.sum[1] + hit[1],
        patch.sum[2] + hit[2],
      ];
      patch.n += 1;
      patches.set(key, patch);
    }
  }
  return [...patches.values()].map(({ sum, n, facing }) => ({
    at: [sum[0] / n, sum[1] / n, sum[2] / n],
    facing,
    flux: n * each,
  }));
}
