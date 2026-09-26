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

/** A button's disc, centred on the graphics' own position so a tap can press it in by scale. */
function drawDisc(graphics: Phaser.GameObjects.Graphics, r: number): void {
  graphics.clear();
  graphics.fillStyle(PALETTE.hud, 0.55);
  graphics.fillCircle(0, 0, r);
  graphics.lineStyle(Math.max(2, r * 0.1), PALETTE.ink, 0.8);
  graphics.strokeCircle(0, 0, r);
}

/** A mushroom with `cap`, standing upright: the pictogram's own, not a meadow's. */
function iconGenes(cap: CapKind): MushroomGenes {
  return {
    ...mushroomGenes({ seed: ICON_SEED, cap }),
    lean: 0,
    stemBend: 0,
    capTilt: 0,
    // A tall, even dome, so a two-tone cap's band reads at a button's size.
    capHeight: GENE_RANGES.capHeight[1],
    domePower: 0.8,
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

/** `+` (`sign` 1) or `−` (`sign` -1): a fly agaric with the sign on a badge. */
export function drawGrowButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  sign: 1 | -1,
): void {
  drawDisc(graphics, r);
  drawIcon(graphics, iconGenes('spotted'), r * 1.25, -r * 0.14, 0);
  const badge = { x: r * 0.46, y: r * 0.42, r: r * 0.36 };
  graphics.fillStyle(sign > 0 ? PALETTE.grow : PALETTE.shrink);
  graphics.fillCircle(badge.x, badge.y, badge.r);
  graphics.lineStyle(Math.max(2, r * 0.07), PALETTE.ink);
  graphics.strokeCircle(badge.x, badge.y, badge.r);
  const arm = badge.r * 0.55;
  graphics.lineStyle(Math.max(3, r * 0.11), PALETTE.hud);
  graphics.lineBetween(badge.x - arm, badge.y, badge.x + arm, badge.y);
  if (sign > 0) {
    graphics.lineBetween(badge.x, badge.y - arm, badge.x, badge.y + arm);
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
