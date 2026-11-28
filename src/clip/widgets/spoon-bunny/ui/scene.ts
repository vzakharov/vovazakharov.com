import type { Ranged } from '@/kernel/shared/typings';

import {
  at,
  clamp,
  lerp,
  mix,
  type Pen,
  type Point,
  smoothstep,
  STAGE,
} from '@/clip/shared/ink';
import { KICKS, pulse, punch, through } from '@/clip/shared/score';
import { reality } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';

import { headBack, type Seated, seated } from './back';
import { headFront } from './face';
import { closingDark, kitchen, lamplight } from './kitchen';

const SEED = 640;
const CENTRE: Point = [STAGE.width / 2, STAGE.height / 2];
/** Where the camera looks when it is right behind it: its head and shoulders. */
const BEHIND: Point = [632, 392];
const NEAREST = 2.2;
/** Where it looks once the head has come round: the face, and what hangs from it. */
const FACE: Point = [574, 326];
const FACE_SCALE = 3.85;
/** Where the spoon stops when it turns, held up beside its cheek. */
const HELD_LIFT = 0.55;

/** The stage drawn at `scale` about `focus`, turned `rot` degrees. */
function camera(
  pen: Pen,
  scale: number,
  focus: Point,
  rot: number,
  draw: () => void,
): void {
  at(pen, { x: CENTRE[0], y: CENTRE[1], scale, rot }, () => {
    at(pen, { x: -focus[0], y: -focus[1] }, draw);
  });
}

/**
 * Its supper on the song's pulse: the spoon reaches its mouth on the hit, the
 * shoulders shudder with the chewing, and it goes back down for more.
 */
function supper(t: number): Seated {
  const { fraction, seconds } = pulse(t);
  const lift =
    fraction >= 0.5
      ? smoothstep(0.62, 1, fraction)
      : 1 - smoothstep(0.12, 0.5, fraction);
  const since = fraction * seconds;
  const chewing =
    Math.exp(-3 * since) * Math.abs(Math.sin(since * Math.PI * 11));
  return {
    lift,
    hunch: 0.3 + 0.6 * chewing,
    headY: 80 + 10 * lift + 6 * chewing,
    droop: Math.sin((t / 3.1) * Math.PI * 2) * 0.6 + chewing * 0.5,
    raised: 0,
    seed: SEED,
  };
}

/** The kitchen, `figure` in it, and the lamplight over both. */
function room(pen: Pen, figure: () => void): void {
  kitchen(pen);
  figure();
  lamplight(pen);
}

/**
 * The spoon bunny from behind, at its supper at a lamplit table: `nearness`
 * 0 sees the room, 1 is right behind its shoulders. The camera creeps a
 * further `creep` through the shot.
 */
export const spoonBunny =
  (nearness: number, creep = 0.06): Drawing =>
  (pen: Pen, { p }: Local) => {
    const near = clamp(nearness + creep * p, 0, 1);
    const pose = supper(pen.playhead);
    reality(pen, (inner) => {
      camera(
        inner,
        lerp(1, NEAREST, near ** 1.3),
        mix(CENTRE, BEHIND, smoothstep(0, 1, near)),
        0,
        () => {
          room(inner, () => {
            seated(inner, pose, () => {
              headBack(inner, pose.droop, SEED);
            });
          });
        },
      );
    });
  };

/** How far the hanging eye swings, in radians, `since` seconds after the head comes round. */
const swingAfter = (since: number): number =>
  since <= 0
    ? 0.8
    : 0.8 * Math.exp(-2.6 * since) * Math.cos(since * Math.PI * 3.2);

/**
 * The one reveal: right behind it at its supper, and over `turn` (song
 * seconds) its head snaps round on a body that stays turned away — the
 * torn mouth, the bloody teeth, the human eye on its nerve.
 */
export const spoonBunnyReveal =
  (turn: Ranged): Drawing =>
  (pen: Pen, { sinceCut }: Local) => {
    const t = pen.playhead;
    const u = smoothstep(0, 1, through(turn, t));
    const before = supper(Math.min(t, turn.from));
    const pose: Seated = {
      ...before,
      lift: lerp(before.lift, HELD_LIFT, u),
      hunch: lerp(before.hunch, 1, u),
      headY: lerp(before.headY, 16, u),
      droop: lerp(before.droop, -0.4, u),
      raised: u,
    };
    const facing = Math.cos(Math.PI * u);
    const since = t - turn.to;
    const jolt = punch(KICKS, t);
    const creep = sinceCut * 0.25;
    const held = Math.max(0, since);
    const scale =
      lerp(NEAREST + creep, FACE_SCALE, u) * (1 + 0.06 * jolt + 0.05 * held);
    const focus = mix(BEHIND, FACE, u);
    reality(pen, (inner) => {
      camera(inner, scale, focus, jolt * 2.5 * (u > 0 ? 1 : 0), () => {
        room(inner, () => {
          seated(inner, pose, () => {
            at(inner, { rot: -11 * u }, () => {
              inner.ctx.scale(Math.max(Math.abs(facing), 0.04), 1);
              if (facing > 0) headBack(inner, pose.droop, SEED);
              else {
                headFront(
                  inner,
                  { swing: swingAfter(since), drip: (t * 0.8) % 1 },
                  SEED,
                );
              }
            });
          });
        });
      });
      closingDark(inner, u);
    });
  };
