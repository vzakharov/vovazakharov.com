/**
 * Shoots a pair of hands closed round a rung, on the dev server: a bar the
 * ladder's size across floor 1's sunbeam, seen as the climber sees it, from
 * the side along the bar, from under it and from beyond it.
 *
 *   pnpm grip:cube                # to tmp/cube-grip/
 *   pnpm grip:cube --out <dir>    # frames there instead
 */

import path from 'node:path';

import { loft, type Pose, type Vec3 } from '@/cube/entities/world';
import { grippingHand } from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube-grip'),
);

const ROOM = { n: 1, x: 0n, y: 0n };

/** The rung's middle in the room, a metre up in the doorway's beam. */
const RUNG: Vec3 = [0.4, 0.2, 0.2];
/** Its half-length and its radius, in room sides: 40 cm long, 3 cm through. */
const HALF = 0.04;
const RADIUS = 0.003;
/** How far each hand is from the rung's middle, and each elbow below it. */
const APART = 0.022;
const ELBOW: Vec3 = [0.05, -0.07, 0];

/** The climber faces west, the way the ladder leans, so the rung runs north to south. */
const AHEAD: Vec3 = [-1, 0, 0];

const rung = loft(
  // Each end is drawn nearly shut.
  ([-1, -1, 1, 1] as const).map((end, index) => {
    const radius = index === 0 || index === 3 ? RADIUS * 0.02 : RADIUS;
    return {
      centre: [RUNG[0], RUNG[1], RUNG[2] + end * HALF] as const,
      wide: [radius, 0, 0] as const,
      thick: [0, radius, 0] as const,
    };
  }),
  ROOM,
  { surface: 'metal', paint: 0xb8_bc_c0, sides: 12 },
);

const hands = (['left', 'right'] as const).flatMap((side) => {
  // Facing west, the right hand is to the north.
  const aside = side === 'right' ? -APART : APART;
  const at: Vec3 = [RUNG[0], RUNG[1], RUNG[2] + aside];
  const arm: Vec3 = [at[0] + ELBOW[0], at[1] + ELBOW[1], at[2] + aside * 0.4];
  return grippingHand(at, AHEAD, arm, side, 1, ROOM);
});

/** An eye `off` from the rung's middle, looking at it. */
function eyeAt(off: Vec3): Pose {
  const [du, up, dv] = off;
  return {
    ...ROOM,
    u: RUNG[0] + du,
    v: RUNG[2] + dv,
    eyeAbove: RUNG[1] + up,
    scale: 1,
    yaw: Math.atan2(-dv, -du),
    elevation: Math.atan2(-up, Math.hypot(du, dv)),
  };
}

const EYES: ReadonlyArray<readonly [string, Vec3]> = [
  ['climber', [0.07, 0.02, 0]],
  ['side', [0.02, 0.006, -0.085]],
  ['under', [0.02, -0.05, -0.035]],
  ['beyond', [-0.055, -0.012, -0.035]],
];

await withCubePage(async ({ shoot }) =>
  inTurn(EYES, async ([name, off]) =>
    shoot(path.join(FRAMES, `${name}.png`), eyeAt(off), {
      moving: [...rung, ...hands],
    }),
  ),
);
