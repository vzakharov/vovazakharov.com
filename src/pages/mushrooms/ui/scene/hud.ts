import type * as Phaser from 'phaser';

import { DOOR_ASPECT, type Furnishing } from '../../model/house';
import {
  type CapKind,
  GENE_RANGES,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import { paintDoor, paintWindow } from './draw-house';
import { drawMushroom } from './draw-mushroom';
import { PALETTE } from './palette';
import type { Brush } from './shapes';

/** The seed every pictogram's mushroom grows from, so each looks the same on every visit. */
const ICON_SEED = 11;
/** How far below a button its shadow falls, in its radii, and how dark. */
const DISC_DROP = 0.07;
const DISC_SHADOW_ALPHA = 0.25;
/**
 * A pictogram's spots, in the cap's frame: fewer and larger than a meadow
 * mushroom's, so they read as spots at a button's size.
 */
const ICON_SPOTS = [
  { x: -0.24, y: 0.16, r: 0.085 },
  { x: 0.02, y: 0.3, r: 0.09 },
  { x: 0.26, y: 0.13, r: 0.08 },
  { x: -0.05, y: 0.08, r: 0.06 },
];

/**
 * A button's disc, opaque so nothing behind it reads through, and centred on
 * the graphics' own position so a tap can press it in by scale.
 */
function drawDisc(graphics: Phaser.GameObjects.Graphics, r: number): void {
  graphics.clear();
  graphics.fillStyle(PALETTE.shadeInk, DISC_SHADOW_ALPHA);
  graphics.fillCircle(0, r * DISC_DROP, r);
  graphics.fillStyle(PALETTE.hud);
  graphics.fillCircle(0, 0, r);
  graphics.lineStyle(Math.max(2, r * 0.1), PALETTE.ink);
  graphics.strokeCircle(0, 0, r);
}

/**
 * A mushroom with `cap`, standing upright: the pictogram's own, not a
 * meadow's. Its cap is wider and taller than any the meadow grows and its stem
 * short, so the cap, which is what tells the four apart, fills the button.
 */
function iconGenes(cap: CapKind): MushroomGenes {
  const genes = mushroomGenes({ seed: ICON_SEED, cap });
  return {
    ...genes,
    lean: 0,
    stemBend: 0,
    capTilt: 0,
    stemHeight: GENE_RANGES.stemHeight[0],
    stemWidth: GENE_RANGES.stemWidth[1],
    capWidth: GENE_RANGES.capWidth[1],
    capHeight: 0.58,
    domePower: 0.85,
    spots: genes.spots.length > 0 ? ICON_SPOTS : [],
  };
}

/**
 * A mushroom `height` tall, centred on `(x, y)`, and whatever `over` paints on
 * it in its own frame, given the size it is drawn at.
 */
function drawIcon(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  height: number,
  x: number,
  y: number,
  over?: (size: number) => void,
): void {
  const size = height / (genes.stemHeight + genes.capHeight);
  graphics.save();
  graphics.translateCanvas(x, y + height / 2);
  drawMushroom(graphics, genes, size);
  over?.(size);
  graphics.restore();
}

/** A pictogram's ink, and no haze. */
function iconBrush(r: number): Brush {
  return { ink: Math.max(2, r * 0.07), tone: (colour) => colour };
}

/**
 * The house pictogram's windows and door, in its mushroom's units: far larger
 * than a meadow house's, so they read at a button's size.
 */
const ICON_WINDOWS = [
  { kind: 'cross', x: -0.25 },
  { kind: 'square', x: 0.25 },
] as const;
const ICON_PANE = 0.22;
const ICON_DOOR_WIDTH = 0.19;

/** The house button: a fly agaric with two windows in its cap and a door in its stem. */
export function drawHouseButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  drawDisc(graphics, r);
  const genes = { ...iconGenes('spotted'), spots: [], stemWidth: 0.28 };
  const brush = iconBrush(r * 0.8);
  drawIcon(graphics, genes, r * 1.35, 0, 0, (size) => {
    const cap = capFrame(genes);
    const canvas = toCanvas(size);
    for (const { kind, x } of ICON_WINDOWS) {
      const middle = { x, y: genes.capHeight * 0.3 };
      paintWindow(
        graphics,
        kind,
        (point) =>
          canvas(
            cap({
              x: middle.x + point.x * ICON_PANE,
              y: middle.y + point.y * ICON_PANE,
            }),
          ),
        brush,
      );
    }
    paintDoor(
      graphics,
      (point) =>
        canvas({ x: point.x * ICON_DOOR_WIDTH, y: point.y * ICON_DOOR_WIDTH }),
      DOOR_ASPECT,
      0,
      brush,
    );
  });
}

/** One of the house picker's buttons: a window of its kind, or the door. */
export function drawFurnishButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  piece: Furnishing,
): void {
  drawDisc(graphics, r);
  const brush = iconBrush(r);
  if (piece === 'door') {
    const width = r * 0.78;
    paintDoor(
      graphics,
      ({ x, y }) => ({ x: x * width, y: -(y - DOOR_ASPECT / 2) * width }),
      DOOR_ASPECT,
      0,
      brush,
    );
    return;
  }
  const side = r * 1.15;
  paintWindow(
    graphics,
    piece,
    ({ x, y }) => ({ x: x * side, y: -y * side }),
    brush,
  );
}

/** One of the picker's buttons: a mushroom wearing `cap`. */
export function drawCapButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  cap: CapKind,
): void {
  drawDisc(graphics, r);
  drawIcon(graphics, iconGenes(cap), r * 1.4, 0, 0);
}

/**
 * `+` (`sign` 1) or `−` (`sign` -1): a fly agaric with the sign on a badge
 * half the button across, the sign bold enough to say what the button does
 * on its own.
 */
export function drawGrowButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  sign: 1 | -1,
): void {
  drawDisc(graphics, r);
  drawIcon(graphics, iconGenes('spotted'), r * 1.15, -r * 0.24, -r * 0.1);
  const badge = { x: r * 0.36, y: r * 0.36, r: r * 0.5 };
  graphics.fillStyle(sign > 0 ? PALETTE.grow : PALETTE.shrink);
  graphics.fillCircle(badge.x, badge.y, badge.r);
  graphics.lineStyle(Math.max(2, r * 0.08), PALETTE.ink);
  graphics.strokeCircle(badge.x, badge.y, badge.r);
  const arm = badge.r * 0.62;
  // Bars rather than strokes, so the cross's arms meet square.
  const bar = Math.max(4, r * 0.17);
  graphics.fillStyle(PALETTE.hud);
  graphics.fillRect(badge.x - arm, badge.y - bar / 2, arm * 2, bar);
  if (sign > 0) {
    graphics.fillRect(badge.x - bar / 2, badge.y - arm, bar, arm * 2);
  }
}

/**
 * The mute button as a pictogram: a speaker, with sound waves when the meadow
 * is heard and a cross when it is not.
 */
export function drawMuteButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  muted: boolean,
): void {
  const ink = Math.max(2, r * 0.1);
  drawDisc(graphics, r);

  const unit = r * 0.14;
  graphics.fillStyle(PALETTE.ink);
  graphics.fillRect(-4.2 * unit, -1.5 * unit, 2 * unit, 3 * unit);
  graphics.fillTriangle(
    -2.6 * unit,
    -1.5 * unit,
    0.6 * unit,
    -4 * unit,
    0.6 * unit,
    4 * unit,
  );
  graphics.fillTriangle(
    -2.6 * unit,
    -1.5 * unit,
    0.6 * unit,
    4 * unit,
    -2.6 * unit,
    1.5 * unit,
  );

  graphics.lineStyle(ink, PALETTE.ink);
  if (muted) {
    const at = 3 * unit;
    const arm = 1.4 * unit;
    graphics.lineBetween(at - arm, -arm, at + arm, arm);
    graphics.lineBetween(at - arm, arm, at + arm, -arm);
    return;
  }
  for (const reach of [2.2, 3.8]) {
    graphics.beginPath();
    graphics.arc(0, 0, reach * unit, -0.8, 0.8);
    graphics.strokePath();
  }
}
