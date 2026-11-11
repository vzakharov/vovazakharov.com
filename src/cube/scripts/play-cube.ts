/**
 * Shoots `/cube` through floor 1's hole from both sides, on the dev server:
 * from floor 1 looking down into it, and from the floor-2 room beneath looking
 * up; then a body pulling floor 1's lever, three frames as it shrinks over the
 * hole and one as it falls through. Chromium runs WebGPU on SwiftShader, so the
 * frames say what the scene draws, not how fast. It fails on any page error,
 * and prints the adapter.
 *
 *   pnpm play:cube                   # frames to tmp/cube/
 *   pnpm play:cube --out <dir>       # frames there instead
 */

import path from 'node:path';

import {
  holeMiddle,
  holeQuarter,
  leverOf,
  maze,
  planted,
  type Pose,
  type Quarter,
} from '@/cube/entities/world';
import {
  EYE_HEIGHT,
  type Holed,
  plantedWalls,
  play,
  type Player,
  STILL,
} from '@/cube/features/player';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

import { withCubePage } from './lib/cube-page';

const FRAMES = path.resolve(flag('out') ?? path.join(REPO_ROOT, 'tmp/cube'));

/** Seconds per simulated frame of the pull. */
const FRAME = 1 / 60;
/**
 * Seconds after the pull each shrink frame is shot at: three before the body
 * drops through, at 1.755 s, and one in the shaft under floor 1's slab.
 */
const PULL_SHOTS = [
  ['pull-1-shrinking.png', 0.6],
  ['pull-2-shrinking.png', 1.2],
  ['pull-3-shrinking.png', 1.7],
  ['pull-4-falling.png', 2.95],
] as const;

/**
 * The poses `play` gives a body pulling the lever from the middle of floor 1's
 * hole, standing still and looking down past it, at each of `PULL_SHOTS`.
 */
function pulled(quarter: Quarter): ReadonlyArray<readonly [string, Pose]> {
  const room = { n: 1, x: 0n, y: 0n };
  const here: Holed = {
    quarter,
    lever: leverOf(maze(planted.seed), room, quarter),
  };
  const start: Player = {
    pose: {
      ...room,
      ...holeMiddle(quarter),
      eyeAbove: EYE_HEIGHT,
      scale: 1,
      yaw: 0,
      elevation: -0.7,
    },
    shrinking: null,
  };
  const first = play(
    start,
    { ...STILL, pull: true },
    FRAME,
    plantedWalls,
    here,
  );
  if (first.shrinking === null)
    throw new Error('Floor 1’s lever is out of reach');
  const frames = [first];
  const end = Math.max(...PULL_SHOTS.map(([, at]) => at));
  while (frames.length * FRAME < end) {
    const last = frames.at(-1) ?? start;
    frames.push(play(last, STILL, FRAME, plantedWalls, here));
  }
  return PULL_SHOTS.map(([name, at]) => {
    const frame = frames[Math.round(at / FRAME) - 1] ?? start;
    return [name, frame.pose] as const;
  });
}

/** The shots by file name, around the hole floor 1's room (0, 0) holds. */
async function shots(): Promise<ReadonlyArray<readonly [string, Pose]>> {
  const quarter = await holeQuarter(planted, 1, 0n, 0n);
  if (quarter === null) throw new Error('Floor 1 has no hole');
  const { qx, qy } = quarter;
  // The hole's middle in floor 1's room sides; the eye stands west of it. At
  // 0.18 back, the room's north-west corner sits on the camera plane, and
  // SwiftShader clips the slab around it with depth loose enough to let the
  // tops of floor 2's walls through as a line.
  const u = qx * 0.5 + 0.25;
  const v = qy * 0.5 + 0.25;
  const back = 0.24;
  const down: Pose = {
    n: 1,
    x: 0n,
    y: 0n,
    u: u - back,
    v,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: 0,
    elevation: -Math.atan2(EYE_HEIGHT, back),
  };
  // Floor 2's room under that quarter, its own hole-side ceiling half a side up.
  const reach = 0.24;
  const up: Pose = {
    n: 2,
    x: BigInt(qx),
    y: BigInt(qy),
    u: 0.5 - reach,
    v: 0.5,
    eyeAbove: 0.16,
    scale: 1,
    yaw: 0,
    elevation: Math.atan2(0.5 - 0.16, reach),
  };
  return [
    ['floor-1-down.png', down],
    ['floor-2-up.png', up],
    ...pulled(quarter),
  ];
}

async function main(): Promise<void> {
  const planned = await shots();
  await withCubePage(async ({ shoot }) =>
    inTurn(planned, async ([name, pose]) =>
      shoot(path.join(FRAMES, name), pose),
    ),
  );
}

await main();
