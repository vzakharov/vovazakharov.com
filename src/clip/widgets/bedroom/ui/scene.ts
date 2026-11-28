import { at, lerp, type Pen } from '@/clip/shared/ink';
import { jaw, KICKS, pulse, punch } from '@/clip/shared/score';
import { reality } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import { puppet } from '@/clip/entities/puppet';

import { bed, blanket, night, tvGlow, tvSet, walls, window } from './room';

/** Where the bunny is: nowhere yet, by the window, or at the foot of the bed. */
type Visit = 'none' | 'window' | 'foot';

const VISITS = {
  window: { x: 1080, y: 250, nearness: 0.4, bunnyScale: 0.45 },
  foot: { x: 870, y: 330, nearness: 0.5, bunnyScale: 0.6 },
} as const;

/** The man sat up in bed, nodding on every beat against his will. */
function sleeper(pen: Pen, raw: boolean): void {
  const { playhead } = pen;
  const beat = pulse(playhead);
  const nod = Math.exp(-beat.fraction * 4) * (raw ? 0.9 : 0.6);
  puppet(pen, {
    place: { x: 420, y: 592, scale: 0.6 },
    pose: 'sit',
    outfit: 'pajama',
    look: {
      nod,
      jaw: jaw(playhead),
      gaze: [0.8, 0.1],
      turn: 0.35,
      lid: raw ? 0 : 0.35,
      brow: raw ? 0.9 : 0.5,
      sweat: raw ? 0.8 : 0.2,
    },
    mark: 251,
  });
}

/** The bedroom as a whole, the camera jolted a little on every kick. */
function bedroom(pen: Pen, visit: Visit, p: number): void {
  const raw = visit !== 'none';
  reality(pen, (inner) => {
    const kick = punch(KICKS, inner.playhead);
    const zoom = lerp(1, raw ? 1.12 : 1.05, p) + 0.025 * kick;
    const tilt = raw ? -1.5 + 0.8 * kick : 0;
    at(inner, { x: 640, y: 360, scale: zoom, rot: tilt }, () => {
      at(inner, { x: -640, y: -360 }, () => {
        walls(inner, raw);
        window(inner);
        if (visit === 'window') {
          bunny(inner, { ...VISITS.window, arms: 'down', seed: 261 });
        }
        bed(inner);
        sleeper(inner, raw);
        blanket(inner);
        if (visit === 'foot') {
          bunny(inner, { ...VISITS.foot, arms: 'reach', seed: 262 });
        }
        const swell = tvSet(inner);
        night(inner, 0.5);
        tvGlow(inner, swell);
      });
    });
  });
}

/** The first half: the room, the set pulsing, him nodding along. */
export const bedroomWide: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(pen, 'none', p);
};

/** The second half's first lines: a bunny gone from the wallpaper, one by the window. */
export const bedroomWindow: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(pen, 'window', p);
};

/** The second half's last lines: the bunny at the foot of the bed. */
export const bedroomFoot: Drawing = (pen: Pen, { p }: Local) => {
  bedroom(pen, 'foot', p);
};
