import { at, clamp, lerp, noise, type Pen } from '@/clip/shared/ink';
import { jaw, KICKS, pulse, punch, SECTIONS } from '@/clip/shared/score';
import { reality } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';
import { bunny } from '@/clip/entities/bunny';
import { puppet } from '@/clip/entities/puppet';

import {
  bed,
  blanket,
  castShadow,
  night,
  tvGlow,
  tvSet,
  walls,
  window,
} from './room';

/** Where the bunny is: nowhere yet, by the window, or at the foot of the bed. */
type Visit = 'none' | 'window' | 'foot';

const VISITS = {
  window: { x: 1080, y: 250, nearness: 0.4, bunnyScale: 0.45 },
  foot: { x: 870, y: 330, nearness: 0.5, bunnyScale: 0.6 },
} as const;

const VERSE = {
  from: SECTIONS.find(({ name }) => name === 'verse, first half')?.from ?? 0,
  to: SECTIONS.find(({ name }) => name === 'verse, second half')?.to ?? 1,
};

/** 0 at the verse's first beat, 1 at its last. */
const verseProgress = (t: number): number =>
  clamp((t - VERSE.from) / (VERSE.to - VERSE.from), 0, 1);

/**
 * The man sat up in bed, nodding on every beat against his will — harder as
 * the verse goes on — and growling with the vocal's jaw.
 */
function sleeper(pen: Pen, raw: boolean): void {
  const { playhead } = pen;
  const beat = pulse(playhead);
  const drive = lerp(0.45, 1, verseProgress(playhead));
  const nod = Math.exp(-beat.fraction * 4) * drive;
  const growl = jaw(playhead);
  puppet(pen, {
    place: { x: 420, y: 592, scale: 0.6 },
    pose: 'sit',
    outfit: 'pajama',
    look: {
      nod,
      jaw: growl,
      gaze: [0.8, 0.1],
      turn: 0.35,
      lid: raw ? 0 : 0.35 * (1 - growl),
      brow: clamp((raw ? 0.8 : 0.4) + 0.4 * growl, 0, 1),
      sweat: raw ? 0.8 : 0.2,
    },
    mark: 251,
  });
}

/** The bunny's shadow on the wallpaper, climbing as `rise` goes 0 → 1. */
function bunnyShadow(pen: Pen, rise: number): void {
  bunny(pen, {
    x: 640,
    y: 520 - 200 * rise,
    nearness: 0.45,
    bunnyScale: lerp(0.35, 1.1, rise),
    arms: 'reach',
    rendering: 'shadow',
    seed: 263,
  });
}

/**
 * The bedroom as a whole. First half: the room bobs on every kick, almost a
 * dance. Second half: a Dutch tilt, the camera shaken on each kick, the
 * bunny's shadow up the wall.
 */
function bedroom(pen: Pen, visit: Visit, p: number): void {
  const raw = visit !== 'none';
  reality(pen, (inner) => {
    const t = inner.playhead;
    const kick = punch(KICKS, t);
    const zoom = lerp(1, raw ? 1.12 : 1.05, p) + 0.025 * kick;
    const bob = raw ? 0 : 7 * kick;
    const shake = raw ? 14 * kick : 0;
    const dx = shake * noise(271, Math.floor(t * 40));
    const dy = bob + shake * noise(272, Math.floor(t * 40));
    const tilt = raw ? -4 + 1.5 * kick * noise(273, Math.floor(t * 40)) : 0;
    at(inner, { x: 640 + dx, y: 360 + dy, scale: zoom, rot: tilt }, () => {
      at(inner, { x: -640, y: -360 }, () => {
        walls(inner, raw);
        window(inner);
        const swell = Math.exp((-pulse(t).fraction * pulse(t).seconds) / 0.18);
        castShadow(inner, 0.35 + 0.35 * swell, (layer) => {
          sleeper(layer, raw);
        });
        if (raw) {
          const rise = visit === 'window' ? p * 0.6 : 0.6 + 0.4 * p;
          inLayerShadow(inner, rise);
        }
        if (visit === 'window') {
          bunny(inner, { ...VISITS.window, arms: 'down', seed: 261 });
        }
        bed(inner);
        sleeper(inner, raw);
        blanket(inner);
        if (visit === 'foot') {
          bunny(inner, { ...VISITS.foot, arms: 'reach', seed: 262 });
        }
        tvSet(inner);
        night(inner, 0.5);
        tvGlow(inner, swell);
      });
    });
  });
}

/** The bunny's shadow, darker as it climbs. */
function inLayerShadow(pen: Pen, rise: number): void {
  castShadow(pen, 0.3 + 0.5 * rise, (layer) => {
    bunnyShadow(layer, rise);
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
