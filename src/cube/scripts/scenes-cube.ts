/**
 * Shoots the intro's scenes as their cameras play them, a frame every half
 * second, each through the lens the scene holds at that moment. A scene is
 * judged from these as a storyboard.
 *
 *   pnpm scenes:cube                     # every scene, to tmp/cube-scenes/
 *   pnpm scenes:cube --scenes waking     # those, of waking, look-under,
 *                                        # climb and descent
 *   pnpm scenes:cube --every 1           # a frame every second instead
 *   pnpm scenes:cube --out <dir>         # frames there instead, <dir> absolute
 *
 * The body's own legs are left out: the hook that puts an eye outside takes
 * no quads to stand under it.
 */

import path from 'node:path';

import {
  climb,
  descent,
  lookUnder,
  outsideOf,
  type Shot,
  shotAt,
  shotOf,
  type Track,
  waking,
} from '@/cube/features/player';
import { lensOf, LIT_STAGE } from '@/cube/pages/cube/index.node-safe';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube-scenes'),
);
const EVERY = Number(flag('every') ?? 0.5);

const { land, ladder, arrival, wake, indoors } = LIT_STAGE;

/** A standing eye's height over the sand, in metres. */
const STANDING = 1.6;

/** An eye on its feet at `x`, `z`, looking along `yaw`. */
const standing = (x: number, z: number, yaw: number): Shot =>
  shotOf({
    eye: [x, land.height(x, z) + STANDING, z],
    yaw,
    elevation: 0,
    roll: 0,
  });

/** How far along the walk from the shore the cube first comes near. */
const NEARING = 0.32;

const SCENES: Record<string, () => Track<unknown>> = {
  waking: () => waking(LIT_STAGE),
  'look-under': () =>
    lookUnder(
      standing(
        wake.at[0] * NEARING,
        wake.at[1] * NEARING,
        Math.atan2(-wake.at[1], -wake.at[0]),
      ),
      LIT_STAGE,
    ),
  climb: () =>
    climb(
      standing(ladder.foot[0] + 0.9, ladder.foot[2] + 0.3, Math.PI),
      LIT_STAGE,
    ),
  descent: () =>
    descent(
      {
        ...shotOf({ eye: arrival, yaw: 0, elevation: 0, roll: 0 }),
        exposure: indoors,
      },
      LIT_STAGE,
    ),
};

async function main(): Promise<void> {
  const names = flag('scenes')?.split(',') ?? Object.keys(SCENES);
  const frames = names.flatMap((name) => {
    const scene = SCENES[name];
    if (scene === undefined) {
      throw new Error(
        `No scene is named ${name}: ${Object.keys(SCENES).join(', ')}`,
      );
    }
    const track = scene();
    const count = Math.floor(track.runs / EVERY) + 1;
    return Array.from({ length: count }, (_, index) => ({
      file: path.join(FRAMES, name, `${String(index).padStart(3, '0')}.png`),
      shot: shotAt(track, index * EVERY),
    }));
  });
  await withCubePage(async ({ shootOutside }) =>
    inTurn(frames, async ({ file, shot }) =>
      shootOutside(file, outsideOf(shot), lensOf(shot)),
    ),
  );
}

await main();
