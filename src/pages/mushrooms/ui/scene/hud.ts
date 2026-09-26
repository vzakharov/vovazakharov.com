import type * as Phaser from 'phaser';

import {
  type CapKind,
  GENE_RANGES,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { drawMushroom } from './draw-mushroom';
import { PALETTE } from './palette';

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
 * A button's disc, opaque so nothing behind it reads through, with an ink rim
 * and a shadow under it; centred on the graphics' own position so a tap can
 * press it in by scale.
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

/** A mushroom `height` tall, centred on `(x, y)`. */
function drawIcon(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  height: number,
  x: number,
  y: number,
): void {
  const size = height / (genes.stemHeight + genes.capHeight);
  graphics.save();
  graphics.translateCanvas(x, y + height / 2);
  drawMushroom(graphics, genes, size);
  graphics.restore();
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
