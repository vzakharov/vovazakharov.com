import type { Ranged } from '@/kernel/shared/typings';

import { ink, noise, path, type Pen } from '@/clip/shared/ink';
import { jaw, pulse, through } from '@/clip/shared/score';
import { broadcast, SCREEN, snow } from '@/clip/shared/tape';
import type { Drawing } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import {
  alphabetBlock,
  cardboardSun,
  cloud,
  MEADOW_PALETTE,
  rollingHills,
} from '@/clip/entities/meadow';
import { type Look, type PoseName, puppet } from '@/clip/entities/puppet';

import { KIDS_SHOW_PALETTE } from './palette-kids-show';

/** When the host's jaw drops all the way, and the span over which the set falls into static. */
export type KidsShowCues = {
  jawDrop: number;
  fall: Ranged;
};

// The host's pose on each bar's hit, round and round.
const HOST_POSES: readonly PoseName[] = [
  'welcome',
  'sing',
  'point',
  'sing',
  'shrug',
];
// The host's face for the children: eyes to camera, brow up.
const HOST_LOOK: Partial<Look> = { gaze: [0, 0], brow: -0.4 };
// How much nearer the camera is on each bar, kept: the last bar is half again
// as near as the first.
const PUNCH = 0.06;
// How far the bunny rises behind its hill on each bar.
const NOTCH = 14;
// The host's head, the point the camera punches in on, held in the upper third.
const HOST: readonly [number, number] = [440, 225];
// The floor between the host's soles and his size: hands and torso in frame.
const HOST_FLOOR = 668;
const HOST_SCALE = 0.72;
const BLOCKS = ['А', 'Б', 'В'] as const;
// The felt hillock the bunny rises behind.
const MOUND = path('M 500,720 C 530,540 910,540 940,720 Z');

/**
 * The set as it stands on the bar's hit: everything but the host's jaw is
 * drawn at that moment, so nothing moves between hits.
 */
function set(pen: Pen, bar: number, jawOpen: number): void {
  const { ctx } = pen;
  const zoom = 1 + PUNCH * bar;
  const [hx, hy] = HOST;
  ctx.fillStyle = KIDS_SHOW_PALETTE.sky;
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.scale(zoom, zoom);
  ctx.translate(-hx, -hy);

  ctx.fillStyle = KIDS_SHOW_PALETTE.backdrop;
  ctx.fillRect(-200, 250, SCREEN.width + 400, 110);
  // The sun looks out of the screen on the first bar, then at the host, a
  // little differently on every hit.
  const gaze: readonly [number, number] =
    bar === 0
      ? [0, 0]
      : [-0.85 + 0.15 * noise(21, bar), 0.45 + 0.15 * noise(22, bar)];
  cardboardSun(pen, {
    x: 650,
    y: 150,
    scale: 1,
    smile: 0.8,
    bob: 0,
    gaze: [...gaze],
    seed: 11,
  });
  cloud(pen, { x: 140, y: 90, scale: 0.8, seed: 3 });
  rollingHills(pen, { x: -200, y: 300, width: 1360, height: 520, seed: 9 });

  bunny(pen, {
    x: 720,
    y: 560 - NOTCH * bar,
    nearness: 0.1,
    scale: 1.2,
    swaying: 0,
    seed: 41,
  });
  ink(pen, MOUND, {
    fill: MEADOW_PALETTE.hills[3],
    width: 4,
    seed: 12,
  });

  for (const [n, letter] of BLOCKS.entries()) {
    alphabetBlock(pen, {
      letter,
      x: 110 + n * 72,
      y: 700,
      scale: 0.66,
      colouring: n,
      seed: 70 + n,
    });
  }
  alphabetBlock(pen, {
    letter: 'Г',
    x: 146,
    y: 634,
    scale: 0.66,
    colouring: 3,
    seed: 74,
  });

  puppet(pen, {
    place: { x: hx, y: HOST_FLOOR, scale: HOST_SCALE },
    pose: HOST_POSES[bar % HOST_POSES.length],
    outfit: 'suit',
    look: { ...HOST_LOOK, jaw: jawOpen },
    mark: 500,
  });
  ctx.restore();
}

/**
 * The intro's children's show: the host sings to camera on the meadow set,
 * which jolts on each bar's hit and holds still between; from `jawDrop` the
 * jaw hangs open, and through `fall` the set sinks into snow.
 */
export const kidsShow =
  (cues: KidsShowCues): Drawing =>
  (pen) => {
    const t = pen.playhead;
    const { index, fraction, seconds } = pulse(t);
    const hit = t - fraction * seconds;
    const bar = Math.max(0, index);
    const jawOpen = t >= cues.jawDrop ? 1 : jaw(t);
    const falling = t >= cues.fall.from ? through(cues.fall, t) : 0;
    broadcast(
      pen,
      (inner) => {
        set({ ...inner, playhead: Math.max(0, hit) }, bar, jawOpen);
        if (falling > 0) snow(inner, Math.min(1, falling * 1.6));
      },
      { wear: 0.2 + 0.7 * falling },
    );
  };
