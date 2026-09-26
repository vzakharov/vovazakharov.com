import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { domeHeight, type MushroomGenes } from '../../model/mushroom-genes';
import { PALETTE } from './palette';
import { fillShape, strokeShape } from './shapes';

const CURVE_STEPS = 28;
/** Where a two-tone cap changes colour, as a fraction of its height. */
const TONE_SPLIT = 0.5;
const SHADE_ALPHA = 0.2;
const HIGHLIGHT_ALPHA = 0.35;

function nudgeHue(colour: number, nudge: number): number {
  const { h, s, v } = Phaser.Display.Color.IntegerToColor(colour);
  return Phaser.Display.Color.HSVToRGB((h + nudge + 1) % 1, s, v).color;
}

/** Samples `from`..`to` inclusive in `CURVE_STEPS` steps. */
function sample(
  from: number,
  to: number,
  point: (value: number) => Point,
): Point[] {
  return Array.from({ length: CURVE_STEPS + 1 }, (_, step) =>
    point(from + ((to - from) * step) / CURVE_STEPS),
  );
}

/**
 * The stem as a closed outline, foot at the origin and y growing downward as
 * the canvas's does. Its sides swell a little at the middle.
 */
function stemOutline(genes: MushroomGenes, size: number): Point[] {
  const height = genes.stemHeight * size;
  const top = (genes.stemWidth * size) / 2;
  const foot = top * genes.footBulge;
  const side = (t: number) =>
    foot + (top - foot) * t + top * 0.12 * Math.sin(Math.PI * t);
  const right = sample(0, 1, (t) => ({ x: side(t), y: -height * t }));
  const left = sample(1, 0, (t) => ({ x: -side(t), y: -height * t }));
  return [...right, ...left];
}

/**
 * Maps a point in the cap's own frame — origin at the middle of its underside,
 * y up — to the mushroom's, where the cap sits on the stem turned by its tilt.
 */
function capFrame(genes: MushroomGenes, size: number) {
  const cos = Math.cos(genes.capTilt);
  const sin = Math.sin(genes.capTilt);
  const lift = genes.stemHeight * size;
  return ({ x, y }: Point): Point => {
    const px = x * size;
    const py = -y * size;
    return { x: px * cos - py * sin, y: px * sin + py * cos - lift };
  };
}

/** The dome between two heights on it, in the cap's frame. */
function domeBand(genes: MushroomGenes, fromLevel: number): Point[] {
  const level = genes.capHeight * fromLevel;
  const half =
    (genes.capWidth / 2) *
    Math.sqrt(1 - (fromLevel === 0 ? 0 : fromLevel ** (2 / genes.domePower)));
  const arc = sample(half, -half, (x) => ({ x, y: domeHeight(genes, x) }));
  // The lower edge sags a little, so a band reads as wrapping the dome.
  const sag = genes.capHeight * (fromLevel === 0 ? 0.1 : 0.06);
  const underside = sample(-half, half, (x) => ({
    x,
    y: level - sag * (1 - ((2 * x) / (2 * half || 1)) ** 2),
  }));
  return [...arc, ...underside];
}

/** A crescent along the dome's lower right, where the light does not reach. */
function capShade(genes: MushroomGenes): Point[] {
  const half = genes.capWidth / 2;
  const outer = sample(half, -half * 0.1, (x) => ({
    x,
    y: domeHeight(genes, x),
  }));
  const inner = sample(-half * 0.1, half * 0.97, (x) => ({
    x: x * 0.86 - half * 0.08,
    y: domeHeight(genes, x) * 0.72,
  }));
  return [...outer, ...inner];
}

/**
 * Paints one mushroom into `graphics`, whose own position is the foot and
 * whose rotation is the lean — so a later tween can squash it from the ground.
 */
export function drawMushroom(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
): void {
  const ink = Math.max(2, size * 0.014);
  const toMushroom = capFrame(genes, size);
  const red = nudgeHue(PALETTE.capRed, genes.hueNudge);
  const dark = nudgeHue(PALETTE.capDark, genes.hueNudge);

  graphics.fillStyle(PALETTE.groundShadow, 0.22);
  graphics.fillEllipse(0, 0, genes.capWidth * size * 0.8, size * 0.07);

  const stem = stemOutline(genes, size);
  graphics.fillStyle(PALETTE.stem);
  fillShape(graphics, stem);
  const stemRight = stem.slice(0, CURVE_STEPS + 1);
  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA);
  fillShape(graphics, [
    ...stemRight,
    ...stemRight.toReversed().map(({ x, y }) => ({ x: x * 0.35, y })),
  ]);
  graphics.lineStyle(ink, PALETTE.ink);
  strokeShape(graphics, stem);

  const gills = sample(0, Math.PI * 2, (t) =>
    toMushroom({
      x: Math.cos(t) * genes.capWidth * 0.44,
      y: Math.sin(t) * genes.capHeight * 0.14,
    }),
  );
  graphics.fillStyle(PALETTE.gills);
  fillShape(graphics, gills);

  const dome = domeBand(genes, 0).map((point) => toMushroom(point));
  const [base, band] =
    genes.cap === 'dark-top'
      ? [red, dark]
      : genes.cap === 'dark-bottom'
        ? [dark, red]
        : [red, undefined];
  graphics.fillStyle(base);
  fillShape(graphics, dome);
  if (band !== undefined) {
    graphics.fillStyle(band);
    fillShape(
      graphics,
      domeBand(genes, TONE_SPLIT).map((point) => toMushroom(point)),
    );
  }

  for (const spot of genes.spots) {
    const centre = toMushroom(spot);
    graphics.fillStyle(PALETTE.spot);
    graphics.fillCircle(centre.x, centre.y, spot.r * size);
  }

  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA);
  fillShape(
    graphics,
    capShade(genes).map((point) => toMushroom(point)),
  );

  const shine = toMushroom({
    x: -genes.capWidth * 0.2,
    y: genes.capHeight * 0.72,
  });
  graphics.fillStyle(PALETTE.highlight, HIGHLIGHT_ALPHA);
  graphics.fillEllipse(
    shine.x,
    shine.y,
    genes.capWidth * size * 0.2,
    genes.capHeight * size * 0.22,
  );

  graphics.lineStyle(ink, PALETTE.ink);
  strokeShape(graphics, dome);
}
