import { CEILING_HEIGHT, ROOM_METRES, WALL_HALF } from '../lib/room-shape';
import { moved, scaled, type Vec3 } from '../lib/vec';
import { type Box, DOORWAY } from './frame';

/**
 * A patch of the room the doorway's beam lands on, in metres of the shell's
 * frame — the doorway in the east face, the sun where the world has it:
 * its middle, the way it faces, and `flux`, the square metres of the beam's
 * cross-section it takes — what it throws back is that times the sun's light
 * and its own colour.
 */
/** Something flat, by the unit way it looks. */
type Facing = { facing: Vec3 };

export type SunPatch = Facing & { middle: Vec3; flux: number };

/** The room the beam crosses: its side and its height, in metres. */
const SIDE = ROOM_METRES;
const HEIGHT = ROOM_METRES * CEILING_HEIGHT;

/** The inner face of the wall behind the shell's east face, where the beam enters. */
export const DOOR_INNER = SIDE * (1 - WALL_HALF);

/** How many rays cross the doorway along it and up it. */
const RAYS = { along: 8, up: 16 };

/** A face a ray from the doorway can end on: the way it looks, and where it stands on which axis. */
type End = Facing & { axis: 0 | 1 | 2; plane: number };

const ENDS: End[] = [
  { facing: [0, 1, 0], axis: 1, plane: 0 },
  { facing: [0, -1, 0], axis: 1, plane: HEIGHT },
  { facing: [0, 0, 1], axis: 2, plane: 0 },
  { facing: [0, 0, -1], axis: 2, plane: SIDE },
  { facing: [1, 0, 0], axis: 0, plane: 0 },
];

/** Where the ray from `from` against `sun` ends: the nearest face ahead of it, and how far along the ray. */
function landing(from: Vec3, sun: Vec3): { end: End; run: number } | undefined {
  let nearest: { end: End; run: number } | undefined;
  for (const end of ENDS) {
    const run = (from[end.axis] - end.plane) / sun[end.axis];
    if (run > 0 && run < (nearest?.run ?? Infinity)) nearest = { end, run };
  }
  return nearest;
}

/** The doorway's rays, each from where it enters the room. */
function doorwayRays(): Vec3[] {
  const wide = DOORWAY.to - DOORWAY.from;
  return Array.from({ length: RAYS.along * RAYS.up }, (_, ray): Vec3 => {
    const i = ray % RAYS.along;
    const j = Math.floor(ray / RAYS.along);
    return [
      DOOR_INNER,
      (DOORWAY.height * (j + 0.5)) / RAYS.up,
      DOORWAY.from + (wide * (i + 0.5)) / RAYS.along,
    ];
  });
}

/**
 * Whether `box`, in the frame the patches are in, stands in the beam of a
 * sun toward `sun`: whether any of the doorway's rays passes through it,
 * the box taken half a ray's spacing larger so a thin thing between two
 * rays is not missed.
 */
export function crossesBeam({ min, max }: Box, sun: Vec3): boolean {
  const spare = [
    0,
    DOORWAY.height / RAYS.up / 2,
    (DOORWAY.to - DOORWAY.from) / RAYS.along / 2,
  ];
  return doorwayRays().some((from) => {
    let enters = 0;
    let leaves = Infinity;
    for (const axis of [0, 1, 2] as const) {
      const a = (from[axis] - min[axis] + (spare[axis] ?? 0)) / sun[axis];
      const b = (from[axis] - max[axis] - (spare[axis] ?? 0)) / sun[axis];
      enters = Math.max(enters, Math.min(a, b));
      leaves = Math.min(leaves, Math.max(a, b));
    }
    return leaves > enters;
  });
}

/**
 * Where the sun's beam through floor 1's doorway lands, for a sun toward
 * `sun` (unit, x east, y up, z south, east of the wall): the doorway's rays
 * followed to the floor, ceiling and walls, gathered into patches `cell`
 * metres long. Their flux adds up to the doorway's area seen from the sun.
 */
export function beamPatches(sun: Vec3, cell = 1.25): SunPatch[] {
  const wide = DOORWAY.to - DOORWAY.from;
  const each = (wide * DOORWAY.height * sun[0]) / (RAYS.along * RAYS.up);
  const patches = new Map<string, { sum: Vec3; rays: number; facing: Vec3 }>();
  for (const from of doorwayRays()) {
    const landed = landing(from, sun);
    if (landed === undefined) continue;
    const { axis, facing } = landed.end;
    const hit = moved(from, sun, -landed.run);
    const along = axis === 0 ? hit[2] : hit[0];
    const key = `${facing.join(',')}/${String(Math.floor(along / cell))}`;
    const { sum, rays } = patches.get(key) ?? { sum: [0, 0, 0], rays: 0 };
    patches.set(key, { sum: moved(sum, hit), rays: rays + 1, facing });
  }
  return [...patches.values()].map(({ sum, rays, facing }) => ({
    middle: scaled(sum, 1 / rays),
    facing,
    flux: rays * each,
  }));
}
