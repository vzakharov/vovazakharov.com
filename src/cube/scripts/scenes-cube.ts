/**
 * Shoots the intro's scenes as the page plays them, a frame every half
 * second. A scene is
 * judged from these as a storyboard.
 *
 *   pnpm scenes:cube                     # every scene, to tmp/cube-scenes/
 *   pnpm scenes:cube --scenes waking     # those, of waking, climb, jump
 *                                        # and jump-small
 *   pnpm scenes:cube --every 1           # a frame every second instead
 *   pnpm scenes:cube --out <dir>         # frames there instead, <dir> absolute
 *
 * Each is played through the walk's own controller, so a frame holds what the
 * page draws: the body's hands on the ladder, its shadow, the ladder standing or
 * gone, and the lens as the eye has got used to the light.
 */

import path from 'node:path';

import {
  type Abroad,
  abroad,
  asleepOn,
  handsAbroad,
  INTRO_STAGE,
  outsideOf,
  roamingFree,
  type Shot,
  shotOf,
  standingOf,
  steppingOut,
  STILL,
  whereOf,
} from '@/cube/features/player';
import {
  adapted,
  lensAdapted,
  lensOf,
} from '@/cube/pages/cube/index.node-safe';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube-scenes'),
);
const EVERY = Number(flag('every') ?? 0.5);

/** The seconds a played frame lasts, and the longest a scene is played for. */
const FRAME = 1 / 30;
const LONGEST = 40;

const { land, ladder, arrival, cube } = INTRO_STAGE;

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

/**
 * The eye of a body of `scale` on the sill's edge, looking out and a little
 * down.
 */
const atDoorway = (scale: number): Shot =>
  shotOf({
    eye: [cube.max[0], ladder.top[1] + STANDING * scale, arrival[2]],
    yaw: 0,
    elevation: -0.15,
    roll: 0,
  });

/** A scene's body as it starts, the input that sets it off, and whether its eye starts used to the room. */
type Opening = { body: Abroad; press: boolean; indoors: number };

const SCENES: Record<string, () => Opening> = {
  waking: () => ({ body: asleepOn(INTRO_STAGE, 0), press: false, indoors: 0 }),
  climb: () => ({
    body: roamingFree(
      standing(ladder.foot[0] + 0.9, ladder.foot[2] + 0.3, Math.PI),
      1,
      INTRO_STAGE,
      0,
      false,
    ),
    press: true,
    indoors: 0,
  }),
  jump: () => ({
    body: steppingOut(atDoorway(1), 1, INTRO_STAGE, 0),
    press: false,
    indoors: 1,
  }),
  'jump-small': () => ({
    body: steppingOut(atDoorway(0.5), 0.5, INTRO_STAGE, 0),
    press: false,
    indoors: 1,
  }),
};

/** What the page draws of `body` `at` seconds into its scene, its eye `indoors` used to the room. */
function drawn(body: Abroad, indoors: number, at: number) {
  const { shot, ladderGone } = body;
  return {
    at,
    eye: outsideOf(shot),
    lens: lensAdapted(indoors, lensOf(shot)),
    among: {
      moving: handsAbroad(body, INTRO_STAGE),
      ladderGone,
      body: standingOf(body, INTRO_STAGE),
    },
  };
}

/** `opening` played as the page plays it, drawn every `EVERY` seconds until its scene ends. */
function played({ body: from, press, indoors: used }: Opening) {
  let body = from;
  let indoors = used;
  const frames = [drawn(body, indoors, 0)];
  let due = EVERY;
  for (let t = FRAME; t < LONGEST; t += FRAME) {
    const input = press && t === FRAME ? { ...STILL, use: true } : STILL;
    body = abroad(body, input, FRAME, 0, INTRO_STAGE, true);
    indoors = adapted(indoors, whereOf(body.shot, INTRO_STAGE), FRAME);
    const over = body.scene === null;
    if (t >= due || over) {
      frames.push(drawn(body, indoors, t));
      due += EVERY;
    }
    if (over) break;
  }
  return frames;
}

async function main(): Promise<void> {
  const names = flag('scenes')?.split(',') ?? Object.keys(SCENES);
  const frames = names.flatMap((name) => {
    const scene = SCENES[name];
    if (scene === undefined) {
      throw new Error(
        `No scene is named ${name}: ${Object.keys(SCENES).join(', ')}`,
      );
    }
    return played(scene()).map((frame, index) => ({
      ...frame,
      file: path.join(FRAMES, name, `${String(index).padStart(3, '0')}.png`),
    }));
  });
  await withCubePage(async ({ shootOutside }) =>
    inTurn(frames, async ({ file, at, eye, lens, among }) => {
      await shootOutside(file, eye, lens, among);
      // What it takes to shoot the frame again.
      process.stdout.write(
        `  ${at.toFixed(2)} s: ${JSON.stringify({ eye, lens })}\n`,
      );
    }),
  );
}

await main();
