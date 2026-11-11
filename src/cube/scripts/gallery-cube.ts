/**
 * Shoots one frame a floor from where a visitor stands: at eye height in a
 * room near the floor's middle, looking down the longest run of open walls it
 * can find there, a little off the axis. What a floor's theme looks like is
 * judged from these, and they are the frames of the build's timelapse.
 *
 *   pnpm gallery:cube                    # floors 1 to 8, to tmp/cube-gallery/
 *   pnpm gallery:cube --floors 1,12,40   # those
 *   pnpm gallery:cube --out <dir>        # frames there instead
 */

import path from 'node:path';

import {
  opens,
  type Pose,
  type Room,
  type Step,
  stepped,
  STEPS,
} from '@/cube/entities/world';
import { EYE_HEIGHT, plantedWalls } from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube-gallery'),
);

const FLOORS = (flag('floors') ?? '1,2,3,4,5,6,7,8').split(',').map(Number);

/** How many rooms each way from the floor's middle a view is looked for. */
const REACH = 3;
/** The longest run counted: past it the far end is haze anyway. */
const LONGEST = 8;
/** How far off the run's axis the eye looks, so walls show their faces. */
const ASKEW = 0.3;
/** How far behind its room's middle the eye stands, in room sides. */
const BACK = 0.3;

/** How many walls in a row open from `room` towards `step`. */
function run(room: Room, step: Step, counted = 0): number {
  if (counted === LONGEST || !opens(plantedWalls, room, step)) return counted;
  return run(stepped(room, step), step, counted + 1);
}

/** The rooms of floor `n` within `REACH` of its middle. */
function middleRooms(n: number): Room[] {
  const side = 2n ** BigInt(n - 1);
  const middle = side / 2n;
  const offsets = Array.from(
    { length: 2 * REACH + 1 },
    (_, index) => BigInt(index - REACH) + middle,
  ).filter((at) => at >= 0n && at < side);
  return offsets.flatMap((x) => offsets.map((y) => ({ n, x, y })));
}

/** The pose floor `n` is shot from. */
function viewOf(n: number): Pose {
  const views = middleRooms(n).flatMap((room) =>
    STEPS.map((step) => ({ room, step, length: run(room, step) })),
  );
  const best = views.reduce((kept, view) =>
    view.length > kept.length ? view : kept,
  );
  const [dx, dy] = best.step;
  return {
    ...best.room,
    u: 0.5 - dx * BACK,
    v: 0.5 - dy * BACK,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: Math.atan2(dy, dx) + ASKEW,
    elevation: -0.04,
  };
}

async function main(): Promise<void> {
  await withCubePage(async ({ shoot }) =>
    inTurn(FLOORS, async (n) =>
      shoot(
        path.join(FRAMES, `floor-${String(n).padStart(2, '0')}.png`),
        viewOf(n),
      ),
    ),
  );
}

await main();
