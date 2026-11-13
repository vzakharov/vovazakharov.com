/**
 * Shoots the island around the cube from named eyes, or from one given on the
 * command line. What a layer of the outside looks like is judged from these.
 *
 *   pnpm outside:cube                        # every named eye, to tmp/cube-outside/
 *   pnpm outside:cube --eyes wake-sea,under  # those
 *   pnpm outside:cube --out <dir>            # frames there instead, <dir> absolute
 *   pnpm outside:cube --at -23,1.6,23 --yaw 135 --pitch -5 --roll 0 --name mine
 *   pnpm outside:cube --exposure 0.3 --eyelids 0.5   # the lens, on any of the above
 *   pnpm outside:cube --indoors 1            # an outside eye through floor 1's lens
 *
 * `--at` is the eye in world metres — x east, y up from the still sea, z
 * south, the cube's middle over the origin — `--yaw` degrees from east towards
 * south, `--pitch` degrees above the horizon, `--roll` degrees clockwise.
 */

import path from 'node:path';

import {
  CUBE_AT,
  CUBE_BOX,
  CUBE_METRES,
  DOORWAY,
  islandHeight,
  SUN_DIR,
  WAKE_AT,
} from '@/cube/shared/outside';
import {
  isOutside,
  type Outside,
  type Pose,
  type Whereabouts,
} from '@/cube/entities/world';
import { EYE_HEIGHT } from '@/cube/features/player';
import { OUTSIDE_LENS } from '@/cube/pages/cube/index.node-safe';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube-outside'),
);

const DEGREE = Math.PI / 180;
/** A standing eye's height over what it stands on, in metres. */
const STANDING = EYE_HEIGHT * CUBE_METRES;
/** The eye of someone propped on an elbow in the sand. */
const LYING = 0.35;

/** The doorway's middle, in metres south of the cube frame's origin. */
const DOORWAY_MIDDLE = (DOORWAY.from + DOORWAY.to) / 2;
const DOORWAY_Z = CUBE_AT[2] + DOORWAY_MIDDLE;
const EAST_FACE = CUBE_BOX.max[0];

/** An eye `above` the sand at `[x, z]`. */
const onSand = (x: number, z: number, above: number): Outside['eye'] => [
  x,
  Math.max(islandHeight([x, z]), 0) + above,
  z,
];

/** A person of floor 1 standing in its room at `u`, `v`. */
const inFirstRoom = (
  u: number,
  v: number,
  yaw: number,
  elevation = 0,
): Pose => ({
  n: 1,
  x: 0n,
  y: 0n,
  u,
  v,
  eyeAbove: EYE_HEIGHT,
  scale: 1,
  yaw,
  elevation,
});

/** Where someone at the pill's shelf stands: by the west wall, the shelf at their side. */
const AT_SHELF = { u: 0.14, v: 0.68 };

const WAKING = onSand(WAKE_AT[0], WAKE_AT[2], LYING);
const DOORWAY_V = DOORWAY_MIDDLE / CUBE_METRES;

const EYES: Record<string, Whereabouts> = {
  'wake-sea': { eye: WAKING, yaw: 135 * DEGREE, elevation: 0.02, roll: 0 },
  'wake-cube': { eye: WAKING, yaw: -45 * DEGREE, elevation: 0.14, roll: 0 },
  under: { eye: onSand(0.6, 0.4, 0.5), yaw: 0.5, elevation: 1.1, roll: 0 },
  'ladder-foot': {
    eye: onSand(EAST_FACE + 1.4, DOORWAY_Z, STANDING),
    yaw: Math.PI,
    elevation: 0.75,
    roll: 0,
  },
  'doorway-out': inFirstRoom(0.97, DOORWAY_V, 0),
  'doorway-down': inFirstRoom(0.97, DOORWAY_V, 0, -0.7),
  'room-doorway': inFirstRoom(0.25, 0.6, Math.atan2(DOORWAY_V - 0.6, 0.75)),
  'shelf-door': inFirstRoom(
    AT_SHELF.u,
    AT_SHELF.v,
    Math.atan2(DOORWAY_V - AT_SHELF.v, 1 - AT_SHELF.u),
    -0.12,
  ),
  'door-shelf': inFirstRoom(0.9, 0.3, Math.atan2(0.75 - 0.3, -0.9), -0.2),
  // Standing in the beam, looking down it at where it lands.
  'in-beam': inFirstRoom(0.6, 0.39, Math.atan2(-SUN_DIR[2], -SUN_DIR[0]), -0.3),
};

/** `--name` as a number, or `otherwise` where it is not given. */
const numberOf = (name: string, otherwise: number): number => {
  const given = flag(name);
  return given === undefined ? otherwise : Number(given);
};

/** The eye the command line gives with `--at`, if it gives one. */
function givenEye(): Record<string, Whereabouts> {
  const at = flag('at');
  if (at === undefined) return {};
  const [x, y, z] = at.split(',').map(Number);
  if (x === undefined || y === undefined || z === undefined) {
    throw new Error(`--at wants x,y,z in metres, not ${at}`);
  }
  return {
    [flag('name') ?? 'given']: {
      eye: [x, y, z],
      yaw: numberOf('yaw', 0) * DEGREE,
      elevation: numberOf('pitch', 0) * DEGREE,
      roll: numberOf('roll', 0) * DEGREE,
    },
  };
}

function chosen(): Array<[string, Whereabouts]> {
  const given = givenEye();
  const names = flag('eyes')?.split(',');
  if (names === undefined) {
    return Object.entries(Object.keys(given).length > 0 ? given : EYES);
  }
  return [
    ...names.map((name): [string, Whereabouts] => {
      const eye = EYES[name];
      if (eye === undefined) {
        throw new Error(
          `No eye is named ${name}: ${Object.keys(EYES).join(', ')}`,
        );
      }
      return [name, eye];
    }),
    ...Object.entries(given),
  ];
}

async function main(): Promise<void> {
  const lens = {
    exposure: numberOf('exposure', OUTSIDE_LENS.exposure),
    eyelids: numberOf('eyelids', OUTSIDE_LENS.eyelids),
    indoors: numberOf('indoors', 0),
  };
  // An eye in the room sees through its floor's lens unless `--indoors` asks
  // for the outside's at that adaptation: the room as an eye still used to
  // daylight sees it.
  const inside = flag('indoors') === undefined ? {} : { lens };
  await withCubePage(async ({ shoot, shootOutside }) =>
    inTurn(chosen(), async ([name, at]) => {
      const file = path.join(FRAMES, `${name}.png`);
      const started = Date.now();
      await (isOutside(at)
        ? shootOutside(file, at, lens)
        : shoot(file, at, inside));
      process.stdout.write(`  in ${String(Date.now() - started)} ms\n`);
    }),
  );
}

await main();
