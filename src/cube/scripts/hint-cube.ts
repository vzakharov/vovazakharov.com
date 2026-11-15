/**
 * Shoots the hint board beside the first portal door of `/cube`, on the dev
 * server: from each room the door stands between, across the room as a body
 * walking up to the door first sees it, and up close. Chromium runs WebGPU on
 * SwiftShader, so the frames say what the scene draws, not how fast.
 *
 *   pnpm hint:cube                   # frames to tmp/cube/hint/
 *   pnpm hint:cube --out <dir>       # frames there instead
 */

import path from 'node:path';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  maze,
  planted,
  PORTALS,
  portalsOf,
  type Pose,
} from '@/cube/entities/world';
import { EYE_HEIGHT } from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube/hint'),
);

/** How far back from the wall the eye stands, in room sides, by the frame's name. */
const BACK = { across: 0.85, close: 0.35 };

/** How far along the wall from the doorway's middle, toward the board, the eye stands. */
const ASIDE = 0.14;

const [portal] = portalsOf(maze(planted.seed), PORTALS.first);
if (portal === undefined) throw new Error('The first portal floor has none');
const { n, x, y, isEast } = portal.wall;

/** An eye `back` from the portal's wall, facing it, in its far room or its near one. */
function before(back: number, far: boolean): Pose {
  const along =
    DOORWAY_CUT.middle + (DOORWAY_CUT.middle < 0.5 ? ASIDE : -ASIDE);
  const across = far ? back : 1 - back;
  const step = far ? 1n : 0n;
  return {
    n,
    x: isEast ? x + step : x,
    y: isEast ? y : y + step,
    u: isEast ? across : along,
    v: isEast ? along : across,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: (isEast ? 0 : Math.PI / 2) + (far ? Math.PI : 0),
    elevation: 0,
  };
}

await withCubePage(async ({ shoot }) =>
  inTurn([false, true], async (far) =>
    inTurn(['across', 'close'] as const, async (from) =>
      shoot(
        path.join(FRAMES, `${far ? 'far' : 'near'}-side-${from}.png`),
        before(BACK[from], far),
      ),
    ),
  ),
);
