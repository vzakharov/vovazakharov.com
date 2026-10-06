/**
 * The flower picker's pictograms, no words on either stage: a swatch of each
 * colour, and on a flower a cross that pulls it up, then the very flower
 * each shape grows in the colour picked, drawn by the meadow's own flower
 * drawing from the seed it will grow from — its head large on a short stem,
 * so its petals and rings read at a button's size.
 */

import type * as Phaser from 'phaser';

import { type FlowerColour, flowerGenes } from '../../model/flower-genes';
import { paintFlowerHead, paintFlowerStem } from './draw-flower';
import { drawDisc, iconLighting } from './hud';
import { PALETTE } from './palette';
import { inkedDisc } from './shapes';

/** A colour swatch's radius, in its button's. */
const SWATCH = 0.62;
/** A swatch's ink, in its button's radius, as a pictogram's is. */
const SWATCH_INK = 0.07;
/** A flower's head reach, and its stem from the foot to the head, in its button's radius. */
const HEAD_REACH = 0.58;
const STEM = 0.9;
/** How far below the button's middle the flower's foot stands, in its radius. */
const FOOT_DOWN = 0.85;

/** One of the colour stage's buttons: a swatch of `colour`. */
export function drawColourButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  colour: FlowerColour,
  hairline: number,
): void {
  drawDisc(graphics, r);
  inkedDisc(
    graphics,
    { x: 0, y: 0 },
    r * SWATCH,
    PALETTE.flowers[colour],
    Math.max(2, r * SWATCH_INK),
    iconLighting(hairline),
  );
}

/** The cross's arm from its middle, and its bars' width, in its button's radius. */
const CROSS_ARM = 0.42;
const CROSS_BAR = 0.17;

/** The button beside the colours that pulls up the flower the picker is open on: a cross, in the `−` badge's colour. */
export function drawPullButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  drawDisc(graphics, r);
  const arm = r * CROSS_ARM;
  const bar = Math.max(4, r * CROSS_BAR);
  // Bars rather than strokes, so the arms meet square, as the `+` badge's do.
  graphics.save();
  graphics.rotateCanvas(Math.PI / 4);
  graphics.fillStyle(PALETTE.shrink);
  graphics.fillRect(-arm, -bar / 2, arm * 2, bar);
  graphics.fillRect(-bar / 2, -arm, bar, arm * 2);
  graphics.restore();
}

/**
 * One of the shape stage's buttons: the flower grown from `seed`, or the
 * bare disc while no colour is picked.
 */
export function drawShapeButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  seed: number | undefined,
  hairline: number,
): void {
  drawDisc(graphics, r);
  if (seed === undefined) return;
  const genes = flowerGenes({ seed });
  const lighting = iconLighting(hairline);
  const stem = r * STEM;
  graphics.save();
  graphics.translateCanvas(0, r * FOOT_DOWN);
  paintFlowerStem(graphics, genes, stem, lighting);
  graphics.translateCanvas(genes.stemBend * stem, -stem);
  paintFlowerHead(
    graphics,
    genes,
    (r * HEAD_REACH) / genes.petalLength,
    lighting,
  );
  graphics.restore();
}
