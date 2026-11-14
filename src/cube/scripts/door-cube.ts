/**
 * Shoots a door of `/cube` at eye level, on the dev server: shut, half open
 * and open, from the side it opens away from, and shut from the other side,
 * on a shallow floor and a deep one. Each floor's door is the first the maze
 * has in its north-west rooms. Chromium runs WebGPU on SwiftShader, so the
 * frames say what the scene draws, not how fast.
 *
 *   pnpm door:cube                   # frames to tmp/cube/door/
 *   pnpm door:cube --out <dir>       # frames there instead
 *   pnpm door:cube --floors 5,6      # those floors instead
 */

import path from 'node:path';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  type DoorWall,
  eastKind,
  isRoom,
  maze,
  planted,
  type Pose,
} from '@/cube/entities/world';
import { EYE_HEIGHT } from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube/door'),
);

/** The floors shot, `--floors 6,8` by default: a shallow one lit enough to see a door by, and a deep one. */
const FLOORS = (flag('floors') ?? '6,8').split(',').map(Number);

/** How many rooms across, from the north-west corner, a door is looked for in. */
const SEARCH = 24n;

/** How far back from the door the eye stands, in room sides. */
const BACK = 0.3;

const rolled = maze(planted.seed);

/** The first east wall of floor `n` that is a door, row by row from the north-west. */
function doorOn(n: number): DoorWall {
  for (let y = 0n; y < SEARCH; y += 1n) {
    for (let x = 0n; x < SEARCH; x += 1n) {
      const inside = isRoom(n, x, y) && isRoom(n, x + 1n, y);
      if (inside && eastKind(rolled, n, x, y) === 'door') {
        return { n, x, y, isEast: true };
      }
    }
  }
  throw new Error(`Floor ${String(n)} has no door in its first rooms`);
}

/** An eye `BACK` from `door`'s doorway, level with it, west of it or east. */
function before({ n, x, y }: DoorWall, east: boolean): Pose {
  return {
    n,
    x: east ? x + 1n : x,
    y,
    u: east ? BACK : 1 - BACK,
    v: DOORWAY_CUT.middle - 0.08,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: east ? Math.PI : 0,
    elevation: -0.05,
  };
}

await withCubePage(async ({ shoot }) =>
  inTurn(FLOORS, async (n) => {
    const door = doorOn(n);
    const at = before(door, false);
    const named = (what: string) =>
      path.join(FRAMES, `floor-${String(n)}-${what}.png`);
    const leaf = (angle: number) => ({ door: { ...door, toward: 1, angle } });
    await shoot(named('shut'), at);
    await shoot(named('half'), at, leaf(Math.PI / 4));
    await shoot(named('open'), at, leaf(Math.PI / 2));
    await shoot(named('shut-far-side'), before(door, true));
  }),
);
