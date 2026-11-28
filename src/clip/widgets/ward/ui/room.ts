import {
  clipped,
  ellipse,
  ink,
  noise,
  type Pen,
  type Point,
  polygon,
  STAGE,
} from '@/clip/shared/ink';
import { writeScratched, type Writing } from '@/clip/shared/lettering';
import { SCREEN, snow } from '@/clip/shared/tape';
import { tallies } from '@/clip/entities/tally';

import { WARD_PALETTE } from './palette-ward';

/** The words the nail gouges into the paint. */
export const GOUGED_WORDS = 'КАК, СУКА, ХОРОШО';

/** Where the back wall meets the floor, and the side wall the back one. */
const FLOOR_Y = 520;
const CORNER_X = 150;
/** The padding's quilting, one diamond this wide. */
const QUILT = 90;

/** The TV on its bracket, high in the right-hand corner. */
const TV = { x: 1010, y: 70, width: 200, height: 150 } as const;

/** A rectangle as a path, for the cell's padding, furniture and masks. */
export const wardRect = (x: number, y: number, w: number, h: number) =>
  polygon([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

/** The padded back wall: the quilting's seams and a button at each crossing. */
function paddedWall(
  pen: Pen,
  [left, top, right, bottom]: readonly [number, number, number, number],
) {
  const { ctx } = pen;
  ink(pen, wardRect(left, top, right - left, bottom - top), {
    fill: WARD_PALETTE.wall,
    stroke: null,
  });
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.strokeStyle = WARD_PALETTE.seam;
  ctx.lineWidth = 3;
  const span = bottom - top + right - left;
  for (let d = -span; d < span; d += QUILT) {
    ctx.beginPath();
    ctx.moveTo(left + d, top);
    ctx.lineTo(left + d + (bottom - top), bottom);
    ctx.moveTo(left + d, bottom);
    ctx.lineTo(left + d + (bottom - top), top);
    ctx.stroke();
  }
  ctx.fillStyle = WARD_PALETTE.button;
  for (let x = left; x < right + QUILT; x += QUILT) {
    for (let y = top; y < bottom + QUILT; y += QUILT) {
      ctx.beginPath();
      ctx.arc(x + QUILT / 2, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** The words as they lie on the wall; the nail is asked where it is against the same. */
export const WRITING: Writing = {
  letterHeight: 66,
  x: 560,
  y: 215,
  alignment: 'center',
  weight: 0.16,
  seed: 43,
};

/** How far the wall is written: the words, and the tallies' spread. */
type Written = { words?: number; marks?: number };

/** The scratched words and the tallies, `progress` of the way to the edges. */
export function wallWriting(pen: Pen, { words = 1, marks = 1 }: Written): void {
  clipped(pen, wardRect(CORNER_X, 0, STAGE.width, FLOOR_Y), () => {
    tallies(pen, {
      x: CORNER_X,
      y: 0,
      width: STAGE.width - CORNER_X,
      height: FLOOR_Y,
      progress: marks,
      markHeight: 30,
      seed: 41,
    });
  });
  writeScratched(pen, GOUGED_WORDS, { ...WRITING, progress: words });
}

/** The TV's set, and snow in its glass, drawn about its frame. */
export function tvSet(pen: Pen): void {
  const { x, y, width, height } = TV;
  ink(
    pen,
    polygon([
      [x + width / 2 - 20, y + height],
      [x + width / 2 + 20, y + height],
      [x + width / 2 + 60, y + height + 70],
      [x + width / 2 + 40, y + height + 78],
    ]),
    { fill: WARD_PALETTE.tvBracket, seed: 51 },
  );
  ink(pen, wardRect(x - 14, y - 14, width + 28, height + 28), {
    fill: WARD_PALETTE.tvBody,
    width: 7,
    seed: 52,
  });
  const { ctx } = pen;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 16);
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(width / SCREEN.width, height / SCREEN.height);
  snow(pen);
  ctx.restore();
}

/** The TV's light over the room, breathing with the snow rather than flashing. */
export function tvGlow(pen: Pen, strength = 1): void {
  const { ctx, boil } = pen;
  const flicker = 0.85 + 0.15 * noise(61, boil);
  const centre: Point = [TV.x + TV.width / 2, TV.y + TV.height / 2];
  const gradient = ctx.createRadialGradient(...centre, 20, ...centre, 1100);
  gradient.addColorStop(0, WARD_PALETTE.glow);
  gradient.addColorStop(1, WARD_PALETTE.glowEdge);
  ctx.save();
  ctx.globalAlpha = strength * flicker;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}

/** Night over the whole stage, `amount` of the way to black. */
export function night(pen: Pen, amount: number): void {
  const { ctx } = pen;
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.fillStyle = WARD_PALETTE.night;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}

/** The padded cot along the back wall the two of them sit on. */
export function cot(pen: Pen): void {
  ink(pen, wardRect(330, 520, 760, 70), {
    fill: WARD_PALETTE.wallSide,
    seed: 91,
  });
  ink(pen, wardRect(340, 590, 20, 40), { fill: WARD_PALETTE.seam, seed: 92 });
  ink(pen, wardRect(1060, 590, 20, 40), { fill: WARD_PALETTE.seam, seed: 93 });
}

/** The cell itself, in stage coordinates: padded walls, the floor, the corner. */
export function cell(pen: Pen): void {
  paddedWall(pen, [CORNER_X, 0, STAGE.width + QUILT, FLOOR_Y]);
  ink(
    pen,
    polygon([
      [-40, -40],
      [CORNER_X, 0],
      [CORNER_X, FLOOR_Y],
      [-40, STAGE.height + 40],
    ]),
    { fill: WARD_PALETTE.wallSide, seed: 31 },
  );
  ink(
    pen,
    polygon([
      [CORNER_X, FLOOR_Y],
      [STAGE.width + 40, FLOOR_Y],
      [STAGE.width + 40, STAGE.height + 40],
      [-40, STAGE.height + 40],
    ]),
    { fill: WARD_PALETTE.floor, seed: 32 },
  );
  for (let k = 1; k < 4; k += 1) {
    const y = FLOOR_Y + k * k * 22;
    ink(
      pen,
      polygon([
        [CORNER_X - (y - FLOOR_Y) * 0.95, y],
        [STAGE.width + 40, y],
      ]),
      { stroke: WARD_PALETTE.floorSeam, width: 3, seed: 33 + k },
    );
  }
  ink(pen, ellipse([1150, 660], 60, 12), {
    fill: WARD_PALETTE.floorSeam,
    stroke: null,
    seed: 37,
  });
}
