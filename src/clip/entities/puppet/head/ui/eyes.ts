import {
  add,
  clamp,
  clipped,
  ellipse,
  ink,
  INK_PALETTE,
  lerp,
  type Path,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import type { Face } from './face';
import { EYE_AT, EYE_BAG, EYE_WHITE, LED_AT, SOCKET } from './head-shapes';
import { HEAD_PALETTE } from './palette-head';
import { mirrored } from './warp';

/** A lid's lower edge across an eye `rx` by `ry` at `centre`, `shut` of the way down. */
const lidOver = (
  [cx, cy]: Point,
  rx: number,
  ry: number,
  shut: number,
): Path => {
  const edge = lerp(cy - ry - 2, cy + ry + 2, shut);
  const [left, right, top] = [cx - rx - 6, cx + rx + 6, cy - ry - 8];
  return [
    { kind: 'M', points: [[left, top]] },
    { kind: 'L', points: [[right, top]] },
    { kind: 'L', points: [[right, edge - 3]] },
    {
      kind: 'Q',
      points: [
        [cx, edge + 5],
        [left, edge - 3],
      ],
    },
    { kind: 'Z', points: [] },
  ];
};

/** The man's own eye, on the viewer's right, and the brow over it. */
export function eye({ pen, look, seed, bend, spot }: Face): void {
  const white = bend(EYE_WHITE);
  const [gx, gy] = look.gaze;
  const iris = spot(add(EYE_AT, [gx * 10, gy * 7]));
  ink(pen, white, { fill: HEAD_PALETTE.eyeWhite, stroke: null });
  clipped(pen, white, () => {
    ink(pen, ellipse(iris, 10.5), {
      fill: HEAD_PALETTE.iris,
      width: 3,
      seed: seed + 5,
      wobble: 0.5,
    });
    ink(pen, ellipse(iris, 4.8), { fill: INK_PALETTE.ink, stroke: null });
    ink(pen, ellipse(add(iris, [-4, -4]), 2.4), {
      fill: HEAD_PALETTE.glint,
      stroke: null,
    });
    ink(pen, bend(lidOver(EYE_AT, 25, 19, look.lid)), {
      fill: INK_PALETTE.skin,
      width: 4,
      seed: seed + 6,
    });
  });
  ink(pen, white, { width: 4.5, seed: seed + 4 });
  ink(pen, bend(EYE_BAG), { width: 3, alpha: 0.7, seed: seed + 7 });
  const scowl = 4 + look.brow * 13;
  ink(
    pen,
    bend(
      polygon([
        [14, -63 + scowl],
        [76, -72 - scowl * 0.45],
        [74, -59 - scowl * 0.2],
        [17, -52 + scowl],
      ]),
    ),
    { fill: HEAD_PALETTE.hair, width: 3, seed: seed + 8 },
  );
}

/** A socket of the mask and the LED burning in it; `side` -1 is the viewer's left. */
export function led({ pen, look, seed, bend, spot }: Face, side: -1 | 1): void {
  const centre: Point = [-side * LED_AT[0], LED_AT[1]];
  const socket = bend(side < 0 ? SOCKET : mirrored(SOCKET));
  const [gx, gy] = look.gaze;
  const [x, y] = spot(add(centre, [gx * 6, gy * 4]));
  const shut = clamp((look.lid - 0.3) / 0.7, 0, 1);
  const { ctx, boil } = pen;
  ink(pen, socket, { fill: HEAD_PALETTE.hollow, width: 4, seed: seed + 20 });
  // The flicker is the boil's: the LED breathes with the line.
  const flicker = 1 + 0.06 * Math.sin(boil * 2.4 + seed);
  const glow = ctx.createRadialGradient(x, y, 4, x, y, 46 * flicker);
  glow.addColorStop(0, look.led);
  glow.addColorStop(0.35, `${look.led}99`);
  glow.addColorStop(1, `${look.led}00`);
  ctx.save();
  ctx.globalAlpha *= 1 - shut * 0.8;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 46 * flicker, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  clipped(pen, socket, () => {
    ink(pen, ellipse([x, y], 11.5), {
      fill: look.led,
      stroke: `${HEAD_PALETTE.glint}55`,
      width: 2,
    });
    ink(pen, ellipse([x - 3.5, y - 4], 3.4), {
      fill: HEAD_PALETTE.glint,
      stroke: null,
      alpha: 0.9,
    });
    if (shut > 0) {
      ink(pen, bend(lidOver(centre, 27, 23, shut)), {
        fill: INK_PALETTE.metalDark,
        width: 4,
        seed: seed + 21,
      });
    }
  });
  ink(pen, socket, { width: 4, seed: seed + 20 });
}
