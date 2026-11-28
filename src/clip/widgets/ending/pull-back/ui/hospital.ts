import { at, ellipse, ink, type Pen, polygon, STAGE } from '@/clip/shared/ink';
import { serotoninFall } from '@/clip/entities/serotonin';

import { ENDING_PALETTE } from '../../palette';

/**
 * A frame another picture is seen through, as `[x, y, width]` on the stage:
 * always 16:9, so the whole stage fits it exactly.
 */
export type Pane = readonly [number, number, number];

const paneHeight = (pane: Pane): number =>
  (pane[2] * STAGE.height) / STAGE.width;

const FLECK_SCALE = 0.2;

export const boxAt = (x: number, y: number, w: number, h: number) =>
  polygon([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

/** A red cross on the roof, `size` its arm's length, centred at the origin. */
function cross(pen: Pen, size: number, seed: number): void {
  const thin = size * 0.36;
  ink(pen, boxAt(-thin / 2, -size / 2, thin, size), {
    fill: ENDING_PALETTE.cross,
    stroke: null,
    seed,
  });
  ink(pen, boxAt(-size / 2, -thin / 2, size, thin), {
    fill: ENDING_PALETTE.cross,
    stroke: null,
    seed: seed + 1,
  });
}

/**
 * The hospital as a souvenir, origin at a dome's centre, `r` its radius: one
 * window lit, the pills falling inside.
 */
export function domeHospital(pen: Pen, r: number): void {
  const { ctx } = pen;
  ctx.fillStyle = ENDING_PALETTE.dome;
  ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ink(pen, ellipse([0, r * 0.62], r * 1.1, r * 0.3), {
    fill: ENDING_PALETTE.ground,
    stroke: null,
    seed: 121,
  });
  const [w, h] = [r * 1.1, r * 0.7];
  ink(pen, boxAt(-w / 2, r * 0.55 - h, w, h), {
    fill: ENDING_PALETTE.hospital,
    width: 2,
    seed: 122,
  });
  const cell = w / 7;
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const lit = row === 1 && column === 3;
      ink(
        pen,
        boxAt(
          -w / 2 + cell * (1 + column) + cell * 0.15,
          r * 0.55 - h + cell * 0.6 + row * cell * 1.2,
          cell * 0.6,
          cell * 0.7,
        ),
        {
          fill: lit ? ENDING_PALETTE.lit : ENDING_PALETTE.window,
          width: 1,
          seed: 124 + row * 5 + column,
        },
      );
    }
  }
  at(pen, { x: 0, y: r * 0.55 - h - cell * 0.5 }, () => {
    cross(pen, cell * 0.8, 140);
  });
  pillsIn(pen, r);
}

/** The pills falling inside a dome of radius `r`, at a fifth of their stage size. */
export function pillsIn(pen: Pen, r: number): void {
  at(pen, { x: -r, y: -r, scale: FLECK_SCALE }, () => {
    serotoninFall(pen, {
      width: (2 * r) / FLECK_SCALE,
      height: (2 * r) / FLECK_SCALE,
      density: 0.5,
      seed: 142,
    });
  });
}

/** The front's grid: columns and rows of windows, the building's box. */
const FRONT = { x: 250, y: 190, width: 780, height: 460 } as const;
const COLUMNS = 9;
const ROWS = 4;
const LIT = { column: 6, row: 1 } as const;
const CELL = FRONT.width / (COLUMNS + 1);
const WINDOW_WIDTH = CELL * 0.62;

/** Where the lit window is: the ward seen from outside lives in it. */
export const HOSPITAL_WINDOW: Pane = [
  FRONT.x + CELL * (LIT.column + 0.69),
  FRONT.y + 70 + LIT.row * 100,
  WINDOW_WIDTH,
];

/** The hospital at night, front on, every window dark but `HOSPITAL_WINDOW`. */
export function hospitalNight(pen: Pen): void {
  const { ctx } = pen;
  ctx.fillStyle = ENDING_PALETTE.night;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.fillStyle = ENDING_PALETTE.snowGround;
  ctx.fillRect(0, FRONT.y + FRONT.height - 10, STAGE.width, STAGE.height);
  ink(pen, boxAt(FRONT.x, FRONT.y, FRONT.width, FRONT.height), {
    fill: ENDING_PALETTE.hospitalNight,
    width: 4,
    seed: 170,
  });
  ink(pen, boxAt(FRONT.x, FRONT.y, FRONT.width * 0.12, FRONT.height), {
    fill: ENDING_PALETTE.hospitalNightShade,
    stroke: null,
    seed: 171,
  });
  const height = paneHeight(HOSPITAL_WINDOW);
  const [litX, litY, litWidth] = HOSPITAL_WINDOW;
  ink(
    pen,
    ellipse(
      [litX + litWidth / 2, litY + height / 2],
      litWidth * 1.1,
      height * 1.4,
    ),
    {
      fill: ENDING_PALETTE.lit,
      stroke: null,
      alpha: 0.22,
      seed: 169,
    },
  );
  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      if (row === LIT.row && column === LIT.column) continue;
      ink(
        pen,
        boxAt(
          FRONT.x + CELL * (column + 0.69),
          FRONT.y + 70 + row * 100,
          WINDOW_WIDTH,
          height,
        ),
        {
          fill: ENDING_PALETTE.window,
          width: 2.5,
          seed: 172 + row * 9 + column,
        },
      );
    }
  }
  at(pen, { x: STAGE.width / 2, y: FRONT.y - 46 }, () => {
    cross(pen, 70, 200);
  });
}

/** The ward's window from outside, big: the wall round it, the bars. */
export const WARD_WINDOW: Pane = [330, 150, 620];

/** The bars and the frame of `WARD_WINDOW`, drawn over what is seen through it. */
export function wardWindowBars(pen: Pen): void {
  const [x, y, w] = WARD_WINDOW;
  const h = paneHeight(WARD_WINDOW);
  for (let n = 1; n < 6; n += 1) {
    ink(pen, boxAt(x + (w * n) / 6 - 5, y, 10, h), {
      fill: ENDING_PALETTE.bars,
      width: 2,
      seed: 210 + n,
    });
  }
  ink(pen, boxAt(x, y + h * 0.5 - 5, w, 10), {
    fill: ENDING_PALETTE.bars,
    width: 2,
    seed: 217,
  });
  ink(pen, boxAt(x, y, w, h), { width: 7, seed: 218 });
}

/** The hospital's wall at night round `WARD_WINDOW`, the sill under it. */
export function wardWall(pen: Pen): void {
  const { ctx } = pen;
  const [x, y, w] = WARD_WINDOW;
  const h = paneHeight(WARD_WINDOW);
  ctx.fillStyle = ENDING_PALETTE.hospitalNight;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  for (let row = 0; row < 9; row += 1) {
    const offset = row % 2 === 0 ? 0 : 60;
    for (let column = -1; column < 12; column += 1) {
      ink(pen, boxAt(column * 120 + offset, row * 80, 120, 80), {
        stroke: ENDING_PALETTE.hospitalNightShade,
        width: 1.5,
        seed: 230 + row * 13 + column,
      });
    }
  }
  ink(pen, boxAt(x - 30, y - 30, w + 60, h + 60), {
    fill: ENDING_PALETTE.hospitalNightShade,
    width: 4,
    seed: 228,
  });
  ink(pen, boxAt(x - 50, y + h + 24, w + 100, 26), {
    fill: ENDING_PALETTE.hospital,
    width: 4,
    seed: 229,
  });
}
