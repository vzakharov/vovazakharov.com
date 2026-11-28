import {
  at,
  clipped,
  ellipse,
  ink,
  type Pen,
  type Point,
  polygon,
  STAGE,
} from '@/clip/shared/ink';
import { bunnyWallpaper } from '@/clip/entities/bunny';

import { SPOON_PALETTE } from './palette-spoon';

/** The table's far edge against the wall, and its near edge at the bunny's belly. */
const TABLE_FAR = 440;
const TABLE_NEAR = 575;
/** Where the lamp hangs, over its place at the table. */
const LAMP: Point = [700, 150];
// The camera never looks past these, however it pans.
const LEFT = -200;
const RIGHT = STAGE.width + 200;
const BOTTOM = STAGE.height + 260;

/** The near edge reaches past the frame at both ends; the far edge is narrower. */
const TABLE_TOP = polygon([
  [140, TABLE_FAR],
  [1140, TABLE_FAR],
  [1340, TABLE_NEAR],
  [-60, TABLE_NEAR],
]);

// The checks' lines meet above the table, so the cloth lies flat; each is a
// check's width apart at the near edge.
const VANISH: Point = [640, -900];
const CHECK = 115;

/** Where the edge of check column `k` crosses height `y`. */
const checkEdge = (k: number, y: number): number =>
  VANISH[0] + ((k * CHECK) / (TABLE_NEAR - VANISH[1])) * (y - VANISH[1]);

function checks(pen: Pen): void {
  const { ctx } = pen;
  clipped(pen, TABLE_TOP, () => {
    ctx.fillStyle = SPOON_PALETTE.check;
    ctx.globalAlpha = 0.55;
    const rows = [TABLE_FAR, 462, 490, 524, TABLE_NEAR];
    const columns = 14;
    for (let r = 0; r < rows.length - 1; r += 1) {
      const top = rows[r] ?? 0;
      const bottom = rows[r + 1] ?? 0;
      for (let c = (r % 2) - columns; c < columns; c += 2) {
        ctx.beginPath();
        ctx.moveTo(checkEdge(c, top), top);
        ctx.lineTo(checkEdge(c + 1, top), top);
        ctx.lineTo(checkEdge(c + 1, bottom), bottom);
        ctx.lineTo(checkEdge(c, bottom), bottom);
        ctx.closePath();
        ctx.fill();
      }
    }
  });
}

/** A child's picture of a carrot in a frame, hung a little crooked. */
function picture(pen: Pen): void {
  at(pen, { x: 250, y: 215, rot: -4 }, () => {
    ink(
      pen,
      polygon([
        [-62, -78],
        [62, -78],
        [62, 78],
        [-62, 78],
      ]),
      {
        fill: SPOON_PALETTE.frame,
        width: 5,
        seed: 611,
      },
    );
    ink(
      pen,
      polygon([
        [-46, -62],
        [46, -62],
        [46, 62],
        [-46, 62],
      ]),
      {
        fill: SPOON_PALETTE.picture,
        width: 3,
        seed: 612,
      },
    );
    ink(
      pen,
      polygon([
        [-14, -22],
        [14, -22],
        [0, 44],
      ]),
      {
        fill: SPOON_PALETTE.carrot,
        width: 3,
        seed: 613,
      },
    );
    for (const lean of [-14, 0, 14]) {
      ink(
        pen,
        polygon(
          [
            [0, -22],
            [lean, -46],
          ],
          'open',
        ),
        {
          stroke: SPOON_PALETTE.carrotTop,
          width: 6,
          seed: 614 + lean,
        },
      );
    }
  });
}

function lamp(pen: Pen): void {
  const [x, y] = LAMP;
  ink(
    pen,
    polygon(
      [
        [x, -40],
        [x, y - 40],
      ],
      'open',
    ),
    { width: 4, seed: 621 },
  );
  ink(
    pen,
    polygon([
      [x - 26, y - 44],
      [x + 26, y - 44],
      [x + 78, y + 10],
      [x - 78, y + 10],
    ]),
    { fill: SPOON_PALETTE.lampShade, width: 5, seed: 622 },
  );
  ink(pen, ellipse([x, y + 14], 22, 12), {
    fill: SPOON_PALETTE.lamp,
    width: 3,
    seed: 623,
  });
}

/** The wall, the table and the floor behind and around the bunny. */
export function kitchen(pen: Pen): void {
  bunnyWallpaper(pen, {
    area: { x: LEFT, y: -200, width: RIGHT - LEFT, height: TABLE_FAR + 200 },
    cell: 130,
    // The cell this one stepped out of, bare behind its head.
    hole: { column: 3, row: 1 },
    seed: 601,
  });
  picture(pen);
  ink(
    pen,
    polygon([
      [LEFT, TABLE_FAR + 40],
      [RIGHT, TABLE_FAR + 40],
      [RIGHT, BOTTOM],
      [LEFT, BOTTOM],
    ]),
    { fill: SPOON_PALETTE.floor, width: 4, seed: 602 },
  );
  ink(pen, TABLE_TOP, { fill: SPOON_PALETTE.cloth, width: 5, seed: 603 });
  checks(pen);
  ink(pen, TABLE_TOP, { width: 5, seed: 603 });
  // The hem, scalloped, hanging off the near edge.
  const scallops: Point[] = [];
  for (let x = -60; x <= 1340; x += 50) {
    scallops.push([x, TABLE_NEAR], [x + 25, TABLE_NEAR + 26]);
  }
  ink(pen, polygon([...scallops, [1340, TABLE_NEAR]]), {
    fill: SPOON_PALETTE.cloth,
    width: 4,
    seed: 604,
  });
  lamp(pen);
}

/**
 * The dark closing in on the middle of the frame, `amount` 0 to 1; drawn in
 * stage space, over whatever the camera shows.
 */
export function closingDark(pen: Pen, amount: number): void {
  if (amount <= 0) return;
  const { ctx } = pen;
  const [cx, cy] = [STAGE.width / 2, STAGE.height / 2];
  ctx.save();
  ctx.globalAlpha *= amount;
  const dark = ctx.createRadialGradient(cx, cy, 220, cx, cy, 760);
  dark.addColorStop(0, SPOON_PALETTE.gloomFade);
  dark.addColorStop(1, SPOON_PALETTE.gloom);
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  ctx.restore();
}

/** The lamp's warm pool over the table and the dark beyond it, laid over everything. */
export function lamplight(pen: Pen): void {
  const { ctx } = pen;
  const [x, y] = LAMP;
  ctx.save();
  const pool = ctx.createRadialGradient(x, y + 200, 20, x, y + 200, 520);
  pool.addColorStop(0, SPOON_PALETTE.lampGlow);
  pool.addColorStop(1, SPOON_PALETTE.lampFade);
  ctx.fillStyle = pool;
  ctx.fillRect(LEFT, -200, RIGHT - LEFT, BOTTOM + 200);
  const gloom = ctx.createRadialGradient(x, y + 220, 300, x, y + 220, 900);
  gloom.addColorStop(0, SPOON_PALETTE.gloomFade);
  gloom.addColorStop(1, SPOON_PALETTE.gloom);
  ctx.fillStyle = gloom;
  ctx.fillRect(LEFT, -200, RIGHT - LEFT, BOTTOM + 200);
  ctx.restore();
}
