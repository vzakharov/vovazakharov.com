/**
 * Shoots the pill on its shelf and the hand taking it, on the dev server: on
 * each floor asked for, the shelf from across its room and from close by,
 * and the act as a sheet of frames a tenth of a second apart — on floor 1
 * once answered yes and once no, elsewhere the one swallow. Chromium runs
 * WebGPU on SwiftShader, so the frames say what the scene draws, not how fast.
 *
 *   pnpm pill:cube                   # floors 1, 2 and 5, to tmp/cube-pill/
 *   pnpm pill:cube --floors 1,3      # those
 *   pnpm pill:cube --out <dir>       # frames there instead
 *   pnpm pill:cube --whole 5,12      # each act's frames 5 and 12 whole, too
 */

import path from 'node:path';

import {
  holeQuarter,
  pillOn,
  planted,
  type Pose,
  type Room,
} from '@/cube/entities/world';
import {
  canTake,
  EYE_HEIGHT,
  handsOf,
  type Holed,
  isAsking,
  isStanding,
  plantedHoledOf,
  plantedWalls,
  play,
  type Player,
  standingAt,
  STILL,
  takenOf,
} from '@/cube/features/player';

import { type SheetFrame, withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(
  flag('out') ?? path.join(REPO_ROOT, 'tmp/cube-pill'),
);
const FLOORS = (flag('floors') ?? '1,2,5').split(',').map(Number);
/** The frames of each act also shot whole, by their place in its sheet. */
const WHOLE = (flag('whole') ?? '').split(',').filter(Boolean).map(Number);

/** Seconds per simulated frame, and how many of them between two shot. */
const FRAME = 1 / 60;
const EVERY = 6;
/** Seconds the pill is looked at before it is answered. */
const ANSWERED_AFTER = 1.6;
/** Seconds of what follows the act that a sheet takes in. */
const AFTER = 0.5;
/** How many frames a sheet has across. */
const COLUMNS = 6;

/** The room of floor `n` that has its hole, and that hole's shelf and look. */
async function holedOn(n: number): Promise<{ room: Room; here: Holed }> {
  const side = 2 ** (n - 1);
  const rooms = Array.from({ length: side * side }, (_, index) => ({
    n,
    x: BigInt(index % side),
    y: BigInt(Math.floor(index / side)),
  }));
  const quarters = await Promise.all(
    rooms.map(async ({ x, y }) => holeQuarter(planted, n, x, y)),
  );
  for (const [index, quarter] of quarters.entries()) {
    const room = rooms[index];
    if (room !== undefined && quarter !== null) {
      return { room, here: plantedHoledOf(room, quarter) };
    }
  }
  throw new Error(`Floor ${String(n)} has no hole`);
}

/** An eye in `room`, `back` out from its shelf's pill and `aside` along the wall, looking at it. */
function facing(room: Room, { shelf }: Holed, back: number, aside = 0): Pose {
  const [u, up, v] = pillOn(shelf).centre;
  const { facing: out } = shelf;
  const clamp = (at: number) => Math.min(Math.max(at, 0.08), 0.92);
  const at = {
    u: clamp(u + out.u * back + out.v * aside),
    v: clamp(v + out.v * back - out.u * aside),
  };
  const away = Math.hypot(u - at.u, v - at.v);
  return {
    ...room,
    ...at,
    eyeAbove: EYE_HEIGHT,
    scale: 1,
    yaw: Math.atan2(v - at.v, u - at.u),
    elevation: Math.atan2(up - EYE_HEIGHT, away),
  };
}

/**
 * The act from a body standing by the shelf a little askew of it, a frame
 * every tenth of a second: the pill taken, `answer` given once it is asked
 * for, and `AFTER` seconds of what follows.
 */
function acted(
  room: Room,
  here: Holed,
  answer: 'yes' | 'no' | null,
): SheetFrame[] {
  const stood = facing(room, here, 0.13, 0.04);
  const start = standingAt({ ...stood, yaw: stood.yaw + 0.4, elevation: 0 });
  if (!canTake(start.pose, here.shelf)) {
    throw new Error(`Floor ${String(room.n)}’s pill is out of reach`);
  }
  const shots: SheetFrame[] = [];
  const shoot = (player: Player) => {
    shots.push({
      staged: [
        player.pose,
        { moving: handsOf(player), taken: takenOf(player) },
      ],
      prompt: isAsking(player) ? 'ask' : isStanding(player) ? 'take' : null,
    });
  };
  let player = start;
  shoot(player);
  let asked = 0;
  let over = 0;
  for (let frame = 1; over < AFTER; frame += 1) {
    if (frame > 3000) throw new Error('The act never played out');
    const answering = isAsking(player) && asked >= ANSWERED_AFTER;
    player = play(
      player,
      { ...STILL, use: frame === 1, answer: answering ? answer : null },
      FRAME,
      plantedWalls,
      here,
    );
    if (isAsking(player)) asked += FRAME;
    if (player.act?.act !== 'taking') over += FRAME;
    if (frame % EVERY === 0) shoot(player);
  }
  return shots;
}

async function main(): Promise<void> {
  const floors = await Promise.all(FLOORS.map(async (n) => holedOn(n)));
  await withCubePage(async ({ shoot, sheet }) =>
    inTurn(floors, async ({ room, here }) => {
      const name = (what: string, type: string) =>
        path.join(
          FRAMES,
          `floor-${String(room.n).padStart(2, '0')}-${what}.${type}`,
        );
      await shoot(name('shelf-far', 'png'), facing(room, here, 0.7, 0.1));
      await shoot(name('shelf-close', 'png'), facing(room, here, 0.16, 0.05));
      const acts: ReadonlyArray<readonly [string, 'yes' | 'no' | null]> =
        room.n === 1
          ? [
              ['yes', 'yes'],
              ['no', 'no'],
            ]
          : [['swallow', null]];
      await inTurn(acts, async ([what, answer]) => {
        const frames = acted(room, here, answer);
        await sheet(name(what, 'webp'), frames, COLUMNS);
        await inTurn(WHOLE, async (index) => {
          const frame = frames[index];
          if (frame === undefined) return;
          await shoot(name(`${what}-${String(index)}`, 'png'), ...frame.staged);
        });
      });
    }),
  );
}

await main();
