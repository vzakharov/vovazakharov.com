/**
 * Shoots `/cube` through floor 1's hole from both sides, on the dev server:
 * from floor 1 looking down into it, and from the floor-2 room beneath looking
 * up; then a body pulling floor 1's lever beside the hole: shrinking where it
 * stands, looking at its hands and around, walking small to the hole, hopping
 * in, falling and landed. Chromium runs WebGPU on SwiftShader, so the
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
  type Quad,
  type Quarter,
} from '@/cube/entities/world';
import {
  EYE_HEIGHT,
  FIRST_LOOK,
  handsOf,
  type Holed,
  isStanding,
  plantedWalls,
  play,
  type Player,
  standingAt,
  STILL,
} from '@/cube/features/player';

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(flag('out') ?? path.join(REPO_ROOT, 'tmp/cube'));

/** Seconds per simulated frame of the pull. */
const FRAME = 1 / 60;

/** Whether a body has been falling for `seconds`. */
const fallingFor =
  (seconds: number) =>
  ({ act }: Player): boolean =>
    act?.act === 'falling' && act.actFor >= seconds;

/**
 * The pull's shots in the order they come, each taken on the first frame its
 * test passes, `t` being the seconds since the pull.
 */
const PULL_SHOTS: ReadonlyArray<
  readonly [string, (player: Player, t: number) => boolean]
> = [
  ['pull-1-shrinking.png', (_, t) => t >= 1],
  ['pull-2-palms.png', (_, t) => t >= 1.7],
  ['pull-3-backs.png', (_, t) => t >= 2.9],
  ['pull-4-around.png', (_, t) => t >= 4.6],
  ['pull-5-small.png', isStanding],
  ['pull-6-hop.png', fallingFor(0.2)],
  ['pull-7-falling.png', fallingFor(1)],
  ['pull-8-landed.png', (player) => player.pose.n === 2 && isStanding(player)],
];

/** A frame to shoot: its file name, the eye's pose and the hands before it. */
type Shot = readonly [name: string, pose: Pose, hands: readonly Quad[]];

/** Seconds a pull may take to play out before the script gives up on it. */
const PULL_LIMIT = 30;

/**
 * The poses `play` gives a body pulling floor 1's lever from halfway between
 * it and the hole, facing it, then, once small and let go, turning to the hole
 * and walking in, at each of `PULL_SHOTS`.
 */
function pulled(quarter: Quarter): Shot[] {
  const room = { n: 1, x: 0n, y: 0n };
  const lever = leverOf(maze(planted.seed), room, quarter);
  const here: Holed = { quarter, lever, shrinkLook: FIRST_LOOK };
  const middle = holeMiddle(quarter);
  const u = (middle.u + lever.at.u) / 2;
  const v = (middle.v + lever.at.v) / 2;
  const toHole = Math.atan2(middle.v - v, middle.u - u);
  let player = play(
    standingAt({
      ...room,
      u,
      v,
      eyeAbove: EYE_HEIGHT,
      scale: 1,
      yaw: toHole + Math.PI,
      elevation: 0,
    }),
    { ...STILL, pull: true },
    FRAME,
    plantedWalls,
    here,
  );
  if (isStanding(player)) throw new Error('Floor 1’s lever is out of reach');
  const taken: Shot[] = [];
  let turned = false;
  for (let t = FRAME; taken.length < PULL_SHOTS.length; t += FRAME) {
    if (t > PULL_LIMIT) throw new Error('The pull never played out');
    const shot = PULL_SHOTS[taken.length];
    if (shot === undefined) break;
    const [name, due] = shot;
    if (due(player, t)) taken.push([name, player.pose, handsOf(player)]);
    const free = isStanding(player) && player.pose.n === 1;
    player = play(
      player,
      free
        ? { ...STILL, walking: true, walk: 1, yawBy: turned ? 0 : Math.PI }
        : STILL,
      FRAME,
      plantedWalls,
      player.pose.n === 1 ? here : null,
    );
    turned ||= free;
  }
  return taken;
}

/** The shots by file name, around the hole floor 1's room (0, 0) holds. */
async function shots(): Promise<Shot[]> {
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
    ['floor-1-down.png', down, []],
    ['floor-2-up.png', up, []],
    ...pulled(quarter),
  ];
}

async function main(): Promise<void> {
  const planned = await shots();
  await withCubePage(async ({ shoot }) =>
    inTurn(planned, async ([name, pose, hands]) =>
      shoot(path.join(FRAMES, name), pose, { moving: hands }),
    ),
  );
}

await main();
