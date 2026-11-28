import {
  at,
  clamp,
  lerp,
  noise,
  type Pen,
  type Point,
  STAGE,
} from '@/clip/shared/ink';
import { jaw, KICKS, pulse, punch } from '@/clip/shared/score';
import { reality } from '@/clip/shared/tape';
import { bunny } from '@/clip/entities/bunny';
import { type Look, puppet } from '@/clip/entities/puppet';

import {
  bed,
  blanket,
  castShadow,
  night,
  SLEEPER_FACE,
  tvGlow,
  tvSet,
  walls,
  window,
} from './room';
import { dampPillow, sweatDrops } from './sweat';

/** Where the bunny is: nowhere, stepping off the wallpaper, by the window, at the foot of the bed. */
export type Visit =
  | { at: 'none' }
  | { at: 'wall'; from: Point; out: number }
  | { at: 'window' }
  | { at: 'foot'; nearness: number };

/** How the room stands in one line of the verse. */
export type Room = {
  /** The second half: the camera tilted and shaken on the kicks, not bobbing. */
  raw: boolean;
  visit: Visit;
  /** One of the printed bunnies has gone, leaving its hole. */
  holed: boolean;
  /** How far the wallpaper's bunnies have opened their eyes on him, 0 → 1. */
  watching: number;
  /** The window shows a summer afternoon. */
  summer: boolean;
  /** 0 dry, 1 pouring: on his face, off his chin, into the pillow. */
  sweat: number;
  /** The set's light one cold colour instead of the channel's. */
  cold: boolean;
  /** Whether the set is in the room; off behind a reversed camera. */
  tv: boolean;
  /** How much of the night lies over it all. */
  dark: number;
  /** His face, past what the beat and the vocal give it. */
  look: Partial<Look>;
};

export const ROOM: Room = {
  raw: false,
  visit: { at: 'none' },
  holed: false,
  watching: 0,
  summer: false,
  sweat: 0.2,
  cold: false,
  tv: true,
  dark: 0.5,
  look: {},
};

/** Where the camera looks on the stage, how close, how tilted, and whether it faces the room from the other side. */
export type Camera = {
  focus: Point;
  zoom: number;
  tilt?: number;
  reversed?: boolean;
};

/**
 * The man sat up in bed, nodding on every beat against his will and growling
 * with the vocal's jaw, his face as the room sets it.
 */
function sleeper(pen: Pen, room: Room): void {
  const { playhead } = pen;
  const beat = pulse(playhead);
  const { raw, sweat, look } = room;
  const nod = Math.exp(-beat.fraction * 4) * (raw ? 1 : 0.6);
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
      sweat,
      ...look,
    },
    mark: 251,
  });
}

/** The bunny's shadow on the wallpaper, climbing and darkening as `rise` goes 0 → 1. */
function bunnyShadow(pen: Pen, rise: number): void {
  castShadow(pen, 0.3 + 0.5 * rise, (layer) => {
    bunny(layer, {
      x: 640,
      y: 520 - 200 * rise,
      nearness: 0.45,
      bunnyScale: lerp(0.35, 1.1, rise),
      arms: 'reach',
      rendering: 'shadow',
      seed: 263,
    });
  });
}

/** The bunny wherever its visit puts it, drawn in front of the wall or the bed. */
function visitor(pen: Pen, visit: Visit, layer: 'wall' | 'floor'): void {
  if (visit.at === 'wall' && layer === 'wall') {
    const { from, out } = visit;
    bunny(pen, {
      x: from[0] + 70 * out,
      y: from[1] + 20 * out,
      bunnyScale: lerp(0.093, 0.32, out),
      nearness: lerp(0.15, 0.35, out),
      arms: 'reach',
      opacity: clamp(out * 3, 0, 1),
      seed: 264,
    });
  }
  if (visit.at === 'window' && layer === 'wall') {
    bunny(pen, {
      x: 1080,
      y: 250,
      nearness: 0.4,
      bunnyScale: 0.45,
      arms: 'down',
      seed: 261,
    });
  }
  if (visit.at === 'foot' && layer === 'floor') {
    const { nearness } = visit;
    bunny(pen, {
      x: 870,
      y: 330,
      nearness,
      bunnyScale: lerp(0.6, 0.75, (nearness - 0.5) / 0.2),
      arms: 'reach',
      seed: 262,
    });
  }
}

/** The room in stage units, as the camera then frames it. */
function interior(pen: Pen, room: Room, shadowRise: number): void {
  const t = pen.playhead;
  walls(pen, room.holed, room.watching, SLEEPER_FACE);
  window(pen, room.summer);
  const swell = Math.exp((-pulse(t).fraction * pulse(t).seconds) / 0.18);
  castShadow(pen, 0.35 + 0.35 * swell, (layer) => {
    sleeper(layer, room);
  });
  if (shadowRise > 0) bunnyShadow(pen, shadowRise);
  visitor(pen, room.visit, 'wall');
  bed(pen);
  dampPillow(pen, clamp((room.sweat - 0.4) / 0.6, 0, 1));
  sleeper(pen, room);
  if (room.sweat > 0.5) sweatDrops(pen, room.sweat);
  blanket(pen);
  visitor(pen, room.visit, 'floor');
  if (room.tv) tvSet(pen);
  night(pen, room.dark);
  tvGlow(pen, swell, room.cold);
}

/**
 * The bedroom through `camera`, jolted by the kicks: first half, the frame
 * bobs, almost a dance; raw, it is shaken and tilted further. `shadowRise`
 * puts the bunny's shadow up the wall, 0 leaving it off.
 */
export function bedroom(
  pen: Pen,
  room: Room,
  camera: Camera,
  shadowRise = 0,
): void {
  reality(pen, (inner) => {
    const t = inner.playhead;
    const kick = punch(KICKS, t);
    const jitter = Math.floor(t * 40);
    const shake = room.raw ? 14 * kick : 0;
    const dx = shake * noise(271, jitter);
    const dy = (room.raw ? 0 : 7 * kick) + shake * noise(272, jitter);
    const tilt =
      (camera.tilt ?? 0) + (room.raw ? 1.5 * kick * noise(273, jitter) : 0);
    const zoom = camera.zoom * (1 + 0.025 * kick);
    const [fx, fy] = camera.focus;
    at(inner, { x: STAGE.width / 2 + dx, y: STAGE.height / 2 + dy }, () => {
      at(inner, { scale: zoom, rot: tilt, flip: camera.reversed }, () => {
        at(inner, { x: -fx, y: -fy }, () => {
          interior(inner, room, shadowRise);
        });
      });
    });
  });
}
