/**
 * Shoots a portal door of `/cube` at eye level, on the dev server: shut,
 * open on the rooms it leads to, open a minute on, when it leads elsewhere,
 * and from the far side, just through it and looking back. The door is the
 * first portal the floor has in its north-west rooms. Chromium runs WebGPU
 * on SwiftShader, so the frames say what the scene draws, not how fast.
 *
 *   pnpm portal:cube                 # frames to tmp/cube/portal/
 *   pnpm portal:cube --out <dir>     # frames there instead
 *   pnpm portal:cube --floor 7       # that floor's portal instead
 */

import path from 'node:path';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import {
  carried,
  type DoorWall,
  type Facing,
  farSideOf,
  isPortal,
  isRoom,
  type Pose,
} from '@/cube/entities/world';
import { EYE_HEIGHT } from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube/portal'),
);

const FLOOR = Number(flag('floor') ?? '6');

/** How many rooms across, from the north-west corner, a portal is looked for in. */
const SEARCH = 24n;

/** How far back from the door the eye stands, in room sides. */
const BACK = 0.3;

/** How far past the far door the body stands once through, in room sides. */
const THROUGH = 0.25;

const MINUTE = 60_000;

/** The instant the frames are shot at: the start of a minute of the shared clock. */
const AT = 29_000_000 * MINUTE;

/** A leaf swung as far as a door opens. */
const LEAF_OPEN = Math.PI / 2;

const named = (what: string) => path.join(FRAMES, `${what}.png`);

/** The first east wall of floor `n` that holds a portal, row by row from the north-west. */
function portalOn(n: number): DoorWall {
  for (let y = 0n; y < SEARCH; y += 1n) {
    for (let x = 0n; x < SEARCH; x += 1n) {
      const wall = { n, x, y, isEast: true };
      if (isRoom(n, x, y) && isRoom(n, x + 1n, y) && isPortal(wall)) {
        return wall;
      }
    }
  }
  throw new Error(`Floor ${String(n)} has no portal in its first rooms`);
}

/** An eye `back` west of `door`'s wall line, level with its doorway, looking east. */
const westOf = ({ n, x, y }: DoorWall, back: number): Pose => ({
  n,
  x,
  y,
  u: 1 - back,
  v: DOORWAY_CUT.middle - 0.08,
  eyeAbove: EYE_HEIGHT,
  scale: 1,
  yaw: 0,
  elevation: -0.05,
});

await withCubePage(async ({ shoot, setClock }) => {
  const wall = portalOn(FLOOR);
  const way: Facing = { ...wall, toward: 1 };
  const far = farSideOf(way, AT);
  if (far === null) throw new Error('The portal found leads nowhere');
  const at = westOf(wall, BACK);
  const open = { door: { ...way, angle: LEAF_OPEN } };
  await setClock(AT);
  await shoot(named('shut'), at);
  await shoot(named('open'), at, open);
  await setClock(AT + MINUTE);
  await shoot(named('open-next-minute'), at, open);
  await setClock(AT);
  // The body `THROUGH` past the near wall's line, as the crossing carries it.
  const through = carried(
    { ...westOf(wall, -THROUGH), x: wall.x + 1n, u: THROUGH },
    way,
    far,
  );
  const behind = { door: { ...far, angle: LEAF_OPEN } };
  await shoot(named('arrived'), through, behind);
  await shoot(
    named('arrived-looking-back'),
    { ...through, yaw: through.yaw + Math.PI },
    behind,
  );
});
