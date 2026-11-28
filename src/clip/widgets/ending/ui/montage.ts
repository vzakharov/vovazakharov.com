import type { Seeded } from '@/kernel/shared/typings';

import {
  at,
  lerp,
  noise,
  type Pen,
  reseed,
  rng,
  STAGE,
} from '@/clip/shared/ink';
import { KICKS, punch } from '@/clip/shared/score';
import { TAPE_FPS, torn } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';

import { ENDING_PALETTE } from './palette-ending';

/** The colours a kick flashes the whole frame for one tape frame. */
const FLASHES = [
  ENDING_PALETTE.magenta,
  ENDING_PALETTE.yellow,
  ENDING_PALETTE.paleDot,
  ENDING_PALETTE.cyan,
  ENDING_PALETTE.red,
] as const;

const FRAME = 1 / TAPE_FPS;
// How near a cut a kick counts as landing on it, in seconds.
const ON_KICK = 0.03;

/** The violence in `[0, 1]` at a montage's start and at its end, and its seed. */
export type Fury = Seeded & { fury: readonly [number, number] };

/**
 * How the montage chews: `cuts` the sorted times a new picture comes in, the
 * first being the montage's own start.
 */
export type Chewing = Fury & { cuts: readonly number[] };

/** The pool entry slice `n` shows: never the one before it. */
function pick(n: number, size: number, seed: number): number {
  let index = 0;
  for (let k = 0; k <= n; k += 1) {
    index = (index + 1 + (reseed(seed, k) % Math.max(1, size - 1))) % size;
  }
  return index;
}

/** The whole frame the difference from white: a negative. */
function negative({ ctx }: Pen): void {
  ctx.save();
  ctx.globalCompositeOperation = 'difference';
  ctx.fillStyle = ENDING_PALETTE.negative;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}

function fill({ ctx }: Pen, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
}

/**
 * A montage that tears through `pool` a picture a cut: a kick slams in on one
 * frame of flat colour and a negative, the camera jolts on the hit, the tape
 * tears and replays frames like a deck chewing itself, and a slice may end in
 * hard black before the next. The worse the `fury`, the more of each.
 */
export const chewing =
  (pool: readonly Drawing[], { cuts, fury, seed }: Chewing): Drawing =>
  (pen: Pen, local: Local) => {
    const t = pen.playhead;
    const end = t - local.sinceCut + local.seconds;
    const n = Math.max(
      0,
      cuts.findLastIndex((cut) => cut <= t),
    );
    const from = cuts[n] ?? t;
    const to = cuts[n + 1] ?? end;
    const length = Math.max(FRAME, to - from);
    const since = t - from;
    const rage = lerp(fury[0], fury[1], local.p);
    const random = rng(reseed(seed, n));
    const kick = KICKS.some((k) => Math.abs(k - from) < ON_KICK);

    if (kick && since < FRAME) {
      fill(pen, FLASHES[n % FLASHES.length] ?? ENDING_PALETTE.paleDot);
      return;
    }
    const gapFrom =
      random() < 0.2 + 0.5 * rage ? lerp(0.85, 0.5, rage * random()) : 1;
    if (since / length > gapFrom) {
      fill(pen, ENDING_PALETTE.black);
      return;
    }

    // A stuttering slice replays its first few frames, rolling a step each time.
    const stutters = random() < 0.15 + 0.5 * rage;
    const loop = (2 + Math.floor(random() * 3)) * FRAME;
    const replay = stutters ? since % loop : since;
    const roll = stutters
      ? ((Math.floor(since / loop) * 97) % 180) *
        rage *
        (random() < 0.5 ? -1 : 1)
      : 0;
    const shown = from + replay;
    const picture = pool[pick(n, pool.length, seed)];

    const hit = punch(KICKS, t);
    const frame = Math.floor(t * TAPE_FPS);
    const jolt = {
      x: STAGE.width / 2 + noise(seed, frame) * 70 * hit,
      y: STAGE.height / 2 + noise(seed + 1, frame) * 50 * hit,
      scale: 1.04 + (0.15 + 0.4 * rage) * hit + 0.3 * rage * random(),
      rot: noise(seed + 2, n) * (4 + 10 * rage) * Math.max(hit, rage * 0.4),
    };
    const tearEvery = random() < 0.5 ? 1 : 3;
    torn(
      pen,
      (inner) => {
        const replayed = { ...inner, playhead: shown };
        at(inner, jolt, () => {
          at(
            inner,
            { x: -STAGE.width / 2, y: -STAGE.height / 2 + roll },
            () => {
              picture?.(replayed, {
                sinceCut: replay,
                p: replay / length,
                seconds: length,
              });
            },
          );
        });
      },
      {
        amount: Math.min(
          1,
          0.15 + 0.85 * rage * (0.4 + 0.6 * random()) + hit * 0.4,
        ),
        seed: reseed(seed + n, Math.floor(frame / tearEvery)),
      },
    );
    const negativeFrames = kick ? 3 : 0;
    if (since < negativeFrames * FRAME || random() < 0.25 * rage) {
      negative(pen);
    }
  };
