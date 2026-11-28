import {
  at,
  ellipse,
  ink,
  inLayer,
  noise,
  path,
  type Pen,
  type Point,
  polygon,
  STAGE,
} from '@/clip/shared/ink';
import { pulse } from '@/clip/shared/score';
import { SCREEN, testCard } from '@/clip/shared/tape';
import {
  bunnyWallpaper,
  type Cell,
  motifAt,
  wallpaperEyes,
} from '@/clip/entities/bunny';

import { BEDROOM_PALETTE } from './palette-bedroom';

/** Where the wall meets the floor. */
const FLOOR_Y = 540;
/** The window on the back wall, and the set on its stand in the right-hand corner. */
const WINDOW = { x: 800, y: 110, width: 210, height: 240 } as const;
const TV = { x: 1060, y: 360, width: 170, height: 130 } as const;
/** The sitting man's face on the stage, where a close camera looks and his sweat runs from. */
export const SLEEPER_FACE: Point = [412, 285];

/** The wallpaper's cell, and the cell the bunny has stepped out of. */
const CELL = 150;
const HOLE: Cell = { column: 2, row: 1 };

const rect = (x: number, y: number, w: number, h: number) =>
  polygon([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

/** Where the bunny gone from the wallpaper was printed: its head's centre. */
export const HOLE_AT: Point = motifAt(CELL, HOLE);

/**
 * The bunny wallpaper and the floor; `holed` once one of the bunnies has
 * gone, `watching` how far the printed ones have opened their eyes on `target`.
 */
export function walls(
  pen: Pen,
  holed: boolean,
  watching = 0,
  target: Point = [0, 0],
): void {
  const area = { x: 0, y: 0, ...STAGE, height: FLOOR_Y };
  const hole = holed ? { hole: HOLE } : {};
  bunnyWallpaper(pen, { area, cell: CELL, ...hole, seed: 201 });
  if (watching > 0) {
    wallpaperEyes(pen, { area, cell: CELL, ...hole, target, awake: watching });
  }
  ink(pen, rect(-20, FLOOR_Y, STAGE.width + 40, STAGE.height - FLOOR_Y + 20), {
    fill: BEDROOM_PALETTE.floor,
    seed: 202,
  });
  for (let k = 1; k < 4; k += 1) {
    const y = FLOOR_Y + k * k * 18;
    ink(
      pen,
      polygon([
        [-20, y],
        [STAGE.width + 20, y],
      ]),
      { stroke: BEDROOM_PALETTE.floorSeam, width: 3, seed: 203 + k },
    );
  }
}

/** The window's centre, for a camera to find it. */
export const WINDOW_AT: Point = [
  WINDOW.x + WINDOW.width / 2,
  WINDOW.y + WINDOW.height / 2,
];

/**
 * The window: night and the moon — or, `summer`, a village afternoon that
 * cannot be out there at 3 am: a hot sky, the sun, a field and a fence.
 */
export function window(pen: Pen, summer = false): void {
  const { x, y, width, height } = WINDOW;
  const { sky, moon, sill, summerSky, sun, field, fence } = BEDROOM_PALETTE;
  ink(pen, rect(x, y, width, height), {
    fill: summer ? summerSky : sky,
    width: 8,
    seed: 211,
  });
  ink(pen, ellipse([x + width * 0.7, y + height * 0.28], summer ? 34 : 26), {
    fill: summer ? sun : moon,
    seed: 212,
  });
  if (summer) {
    ink(
      pen,
      polygon([
        [x, y + height * 0.72],
        [x + width * 0.4, y + height * 0.64],
        [x + width, y + height * 0.7],
        [x + width, y + height],
        [x, y + height],
      ]),
      { fill: field, width: 4, seed: 216 },
    );
    for (let k = 0; k < 6; k += 1) {
      const post = x + 14 + k * 38;
      ink(pen, rect(post, y + height * 0.76, 8, 34), {
        fill: fence,
        width: 3,
        seed: 217 + k,
      });
    }
  }
  ink(
    pen,
    polygon([
      [x + width / 2, y],
      [x + width / 2, y + height],
    ]),
    { width: 7, seed: 213 },
  );
  ink(
    pen,
    polygon([
      [x, y + height / 2],
      [x + width, y + height / 2],
    ]),
    { width: 7, seed: 214 },
  );
  ink(pen, rect(x - 20, y + height, width + 40, 18), {
    fill: sill,
    seed: 215,
  });
}

/** The bed, headboard at the left; the blanket goes on over whoever is in it. */
export function bed(pen: Pen): void {
  ink(pen, rect(150, 300, 40, 330), {
    fill: BEDROOM_PALETTE.bedFrame,
    seed: 221,
  });
  ink(pen, rect(170, 470, 600, 110), {
    fill: BEDROOM_PALETTE.sheet,
    seed: 222,
  });
  ink(pen, rect(170, 580, 600, 30), {
    fill: BEDROOM_PALETTE.bedFrame,
    seed: 223,
  });
  ink(pen, rect(750, 420, 30, 210), {
    fill: BEDROOM_PALETTE.bedFrame,
    seed: 224,
  });
  ink(pen, ellipse([250, 455], 70, 34), {
    fill: BEDROOM_PALETTE.pillow,
    seed: 225,
  });
}

/** The blanket pulled up to his waist. */
export function blanket(pen: Pen): void {
  ink(
    pen,
    polygon([
      [300, 500],
      [470, 470],
      [640, 490],
      [770, 480],
      [775, 600],
      [290, 600],
    ]),
    { fill: BEDROOM_PALETTE.blanket, seed: 231 },
  );
  ink(
    pen,
    polygon([
      [470, 490],
      [520, 590],
    ]),
    { stroke: BEDROOM_PALETTE.blanketFold, width: 5, seed: 232 },
  );
}

/** The set on its stand, the channel's colours on it, swelling on every quarter. */
export function tvSet(pen: Pen): number {
  const { ctx, playhead } = pen;
  const { x, y, width, height } = TV;
  ink(pen, rect(x + 20, y + height + 10, width - 40, STAGE.height), {
    fill: BEDROOM_PALETTE.stand,
    seed: 241,
  });
  ink(pen, rect(x - 14, y - 14, width + 28, height + 28), {
    fill: BEDROOM_PALETTE.tvBody,
    width: 7,
    seed: 242,
  });
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 14);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(width / SCREEN.width, height / SCREEN.height);
  testCard(pen);
  ctx.restore();
  const beat = pulse(playhead);
  return Math.exp((-beat.fraction * beat.seconds) / 0.18);
}

/**
 * The set's light over the room, `swell` the beat's push on it: each quarter
 * washes the room in the next of the screen's colours.
 */
export function tvGlow(pen: Pen, swell: number, cold = false): void {
  const { ctx, playhead } = pen;
  const { washes, coldWash, glowEdge } = BEDROOM_PALETTE;
  const wash = cold
    ? coldWash
    : (washes[pulse(playhead).index % washes.length] ?? washes[0]);
  const centre: Point = [TV.x + TV.width / 2, TV.y + TV.height / 2];
  const gradient = ctx.createRadialGradient(...centre, 10, ...centre, 1000);
  gradient.addColorStop(0, wash);
  gradient.addColorStop(1, glowEdge);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * swell;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}

/**
 * A flat shadow on the wallpaper, thrown away from the set: `figure` drawn
 * on a layer of its own, pushed left and stretched, filled with the shadow's
 * colour and laid down at `alpha`.
 */
export function castShadow(
  pen: Pen,
  alpha: number,
  figure: (layer: Pen) => void,
): void {
  inLayer(pen, alpha, (layer) => {
    const { ctx } = layer;
    ctx.save();
    ctx.translate(TV.x, FLOOR_Y);
    ctx.transform(1.35, 0, -0.25, 1.25, 0, 0);
    ctx.translate(-TV.x - 60, -FLOOR_Y);
    figure(layer);
    ctx.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = BEDROOM_PALETTE.castShadow;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  });
}

/** Night over the whole stage, `amount` of the way to black. */
export function night(pen: Pen, amount: number): void {
  const { ctx } = pen;
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.fillStyle = BEDROOM_PALETTE.night;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}

// How far from the middle of his face a drop starts, and where his lap is.
const FACE_REACH = 60;
const LAP_Y = 480;
const DROPS = 11;
// Each drop's fall, in seconds, from his face to his lap.
const FALL = 0.65;
const SWEAT_DROP = path(
  'M 0,-9 C 4,-3 6,2 6,5 C 6,9 3,11 0,11 C -3,11 -6,9 -6,5 C -6,2 -4,-3 0,-9 Z',
);

/**
 * Sweat running off his face: `amount` of `DROPS` drops at a time, each
 * sliding off a point of his face and falling into his lap, staggered so
 * they never fall in step.
 */
export function sweatDrops(pen: Pen, amount: number): void {
  const count = Math.round(DROPS * amount);
  for (let n = 0; n < count; n += 1) {
    const phase = (pen.playhead / FALL + noise(311, n) * 0.5 + n / DROPS) % 1;
    const startX = SLEEPER_FACE[0] + noise(312, n) * FACE_REACH;
    const startY = SLEEPER_FACE[1] + noise(313, n) * FACE_REACH;
    const y = startY + (LAP_Y - startY) * phase * phase;
    at(pen, { x: startX, y, scale: 0.9 + 0.5 * phase }, () => {
      ink(pen, SWEAT_DROP, {
        fill: BEDROOM_PALETTE.sweat,
        width: 2.5,
        seed: 314 + n,
      });
    });
  }
}

/** The damp spreading on the pillow behind him, `amount` 0 → 1. */
export function dampPillow(pen: Pen, amount: number): void {
  if (amount <= 0) return;
  ink(pen, ellipse([262, 452], 46 * amount, 20 * amount), {
    fill: BEDROOM_PALETTE.damp,
    stroke: null,
    seed: 321,
  });
}
