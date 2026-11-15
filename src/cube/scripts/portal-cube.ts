/**
 * Shoots a portal door of `/cube` at eye level, on the dev server: shut,
 * open on the rooms it leads to, open a minute on, when it leads elsewhere,
 * and from the far side, just through it and looking back. The door is the
 * floor's portal 0. Chromium runs WebGPU
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
  isSameWall,
  maze,
  planted,
  portalsOf,
  type Pose,
  roomBeyond,
} from '@/cube/entities/world';
import { EYE_HEIGHT } from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube/portal'),
);

const FLOOR = Number(flag('floor') ?? '6');

/** How many minutes on a portal is watched for leading elsewhere. */
const SEARCH = 60;

/** How far off the doorway's middle the eye stands, in room sides. */
const ASIDE = 0.08;

/** How far back from the door the eye stands, in room sides. */
const BACK = 0.3;

/** How far before the wall's line the eye stands in the doorway, in room sides. */
const THRESHOLD = 0.001;

/** How far past the far door the body stands once through, in room sides. */
const THROUGH = 0.25;

const MINUTE = 60_000;

/** The instant the frames are shot at: the start of a minute of the shared clock. */
const AT = 29_000_000 * MINUTE;

/** A leaf swung as far as a door opens. */
const LEAF_OPEN = Math.PI / 2;

const named = (what: string) => path.join(FRAMES, `${what}.png`);

/** The first portal of floor `n` whose way through leads off it at `AT`. */
function portalOn(n: number): Facing {
  const [first] = portalsOf(maze(planted.seed), n);
  if (first === undefined) {
    throw new Error(`Floor ${String(n)} has no portal`);
  }
  return { ...first.wall, toward: 1 };
}

/**
 * An eye `back` before `door`'s wall line on its west or north side, level
 * with its doorway, looking through it.
 */
function before({ n, x, y, isEast }: DoorWall, back: number): Pose {
  const aside = DOORWAY_CUT.middle - ASIDE;
  return {
    n,
    x,
    y,
    u: isEast ? 1 - back : aside,
    v: isEast ? aside : 1 - back,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: isEast ? 0 : Math.PI / 2,
    elevation: -0.05,
  };
}

/** The first minute after `AT` in which `way` leads somewhere else. */
function nextTurn(way: Facing, far: Facing): number {
  for (let minute = 1; minute <= SEARCH; minute += 1) {
    const then = farSideOf(way, AT + minute * MINUTE);
    if (then !== null && !isSameWall(then, far)) return AT + minute * MINUTE;
  }
  throw new Error('The portal leads to one place all through the search');
}

await withCubePage(async ({ shoot, setClock }) => {
  const way = portalOn(FLOOR);
  const far = farSideOf(way, AT);
  if (far === null) throw new Error('The portal found leads nowhere');
  const at = before(way, BACK);
  const open = { door: { ...way, angle: LEAF_OPEN } };
  await setClock(AT);
  await shoot(named('shut'), at);
  await shoot(named('open'), at, open);
  // The last frame before the crossing: nearer the wall's line than the near plane.
  await shoot(
    named('threshold'),
    { ...before(way, THRESHOLD), yaw: at.yaw + 0.5 },
    open,
  );
  await setClock(nextTurn(way, far));
  await shoot(named('open-next-minute'), at, open);
  await setClock(AT);
  // The body `THROUGH` past the near wall's line, as the crossing carries it.
  const through = carried(
    { ...before(way, 1 - THROUGH), ...roomBeyond(way) },
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
