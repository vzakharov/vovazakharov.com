/**
 * Shoots `/cube` through floor 1's hole from both sides, on the dev server:
 * from floor 1 looking down into it, and from the floor-2 room beneath looking
 * up; then a body taking floor 1's pill from its shelf: holding it before its
 * eyes, swallowing it, shrinking where it stands, looking at its hands and
 * around, walking small to the hole, hopping in, falling and landed. Chromium runs WebGPU on SwiftShader, so the
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
  type InRoomOf,
  pillOn,
  planted,
  type Pose,
  type Quad,
  type Quarter,
} from '@/cube/entities/world';
import {
  EYE_HEIGHT,
  handsOf,
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

import { withCubePage } from './lib/cube-page';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';
import { inTurn } from '@/scene/scripts/lib/in-turn';

const FRAMES = path.resolve(flag('out') ?? path.join(REPO_ROOT, 'tmp/cube'));

/** Seconds per simulated frame of the act. */
const FRAME = 1 / 60;

/** Whether a body has been at `act` for `seconds`. */
const actingFor =
  (act: NonNullable<Player['act']>['act'], seconds: number) =>
  (player: Player): boolean =>
    player.act?.act === act && player.act.actFor >= seconds;

/**
 * The act's shots in the order they come, each taken on the first frame its
 * test passes.
 */
const ACT_SHOTS: ReadonlyArray<readonly [string, (player: Player) => boolean]> =
  [
    ['pill-0-asked.png', isAsking],
    ['pill-1-shrinking.png', actingFor('shrinking', 1)],
    ['pill-2-palms.png', actingFor('shrinking', 1.7)],
    ['pill-3-backs.png', actingFor('shrinking', 2.9)],
    ['pill-4-around.png', actingFor('shrinking', 4.6)],
    [
      'pill-5-small.png',
      (player) => isStanding(player) && takenOf(player) !== null,
    ],
    ['pill-6-hop.png', actingFor('falling', 0.2)],
    ['pill-7-falling.png', actingFor('falling', 1)],
    [
      'pill-8-landed.png',
      (player) => player.pose.n === 2 && isStanding(player),
    ],
  ];

/** A frame to shoot: its file name, the eye's pose, the hands before it and the pill off its shelf. */
type Shot = readonly [
  name: string,
  pose: Pose,
  hands: readonly Quad[],
  taken: InRoomOf | null,
];

/** Seconds the act may take to play out before the script gives up on it. */
const ACT_LIMIT = 40;
/** How far out from its pill the body stands to take it, in room sides. */
const STOOD_BACK = 0.13;

/**
 * The poses `play` gives a body taking floor 1's pill from before its shelf,
 * answering yes once asked, then, once small and let go, turning to the hole
 * and walking in, at each of `ACT_SHOTS`.
 */
function swallowed(quarter: Quarter): Shot[] {
  const room = { n: 1, x: 0n, y: 0n };
  const here = plantedHoledOf(room, quarter);
  const { shelf } = here;
  const [pillU, , pillV] = pillOn(shelf).centre;
  const u = pillU + shelf.facing.u * STOOD_BACK;
  const v = pillV + shelf.facing.v * STOOD_BACK;
  const middle = holeMiddle(quarter);
  const toHole = Math.atan2(middle.v - v, middle.u - u);
  let player = play(
    standingAt({
      ...room,
      u,
      v,
      eyeAbove: EYE_HEIGHT,
      scale: 1,
      yaw: Math.atan2(pillV - v, pillU - u),
      elevation: 0,
    }),
    { ...STILL, use: true },
    FRAME,
    plantedWalls,
    here,
  );
  if (isStanding(player)) throw new Error('Floor 1’s pill is out of reach');
  const taken: Shot[] = [];
  let turned = false;
  for (let t = FRAME; taken.length < ACT_SHOTS.length; t += FRAME) {
    if (t > ACT_LIMIT) throw new Error('The act never played out');
    const shot = ACT_SHOTS[taken.length];
    if (shot === undefined) break;
    const [name, due] = shot;
    if (due(player)) {
      taken.push([name, player.pose, handsOf(player), takenOf(player)]);
    }
    const free = isStanding(player) && player.pose.n === 1;
    const turn = turned ? 0 : toHole - player.pose.yaw;
    player = play(
      player,
      free
        ? { ...STILL, walking: true, walk: 1, yawBy: turn }
        : { ...STILL, answer: isAsking(player) ? 'yes' : null },
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
    ['floor-1-down.png', down, [], null],
    ['floor-2-up.png', up, [], null],
    ...swallowed(quarter),
  ];
}

async function main(): Promise<void> {
  const planned = await shots();
  await withCubePage(async ({ shoot }) =>
    inTurn(planned, async ([name, pose, hands, taken]) =>
      shoot(path.join(FRAMES, name), pose, { moving: hands, taken }),
    ),
  );
}

await main();
