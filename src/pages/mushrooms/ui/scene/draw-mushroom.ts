import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { domeHeight, type MushroomGenes } from '../../model/mushroom-genes';
import { capFrame, stemAt } from '../../model/mushroom-pose';
import { PALETTE } from './palette';
import { crescent, fillShape, rounded, sample, strokeShape } from './shapes';

const CURVE_STEPS = 28;
/** Where a two-tone cap changes colour, as a fraction of its height. */
const TONE_SPLIT = 0.5;
const SHADE_ALPHA = 0.2;
const SPOT_SHADE_ALPHA = 0.1;
const HIGHLIGHT_ALPHA = 0.35;
/** How many times the dome's corners are cut, rounding its rim. */
const RIM_ROUNDS = 2;

function nudgeHue(colour: number, nudge: number): number {
  const { h, s, v } = Phaser.Display.Color.IntegerToColor(colour);
  return Phaser.Display.Color.HSVToRGB((h + nudge + 1) % 1, s, v).color;
}

/** From the model's frame (units of size, y up) to the canvas's. */
function toCanvas(size: number): (point: Point) => Point {
  return ({ x, y }) => ({ x: x * size, y: -y * size });
}

/**
 * The stem as a closed outline around its bent centreline, foot at the
 * origin. Its sides swell a little at the middle.
 */
function stemOutline(genes: MushroomGenes): Point[] {
  const top = genes.stemWidth / 2;
  const foot = top * genes.footBulge;
  const side = (t: number, sign: number): Point => {
    const station = stemAt(genes, t);
    const half = foot + (top - foot) * t + top * 0.12 * Math.sin(Math.PI * t);
    return {
      x: station.x + sign * half * Math.cos(station.tilt),
      y: station.y - sign * half * Math.sin(station.tilt),
    };
  };
  return [
    ...sample(0, 1, CURVE_STEPS, (t) => side(t, 1)),
    ...sample(1, 0, CURVE_STEPS, (t) => side(t, -1)),
  ];
}

/**
 * The dome down to `fromLevel` of its height, in the cap's frame. The arc is
 * sampled by angle, which crowds the samples toward the rim where the dome
 * turns steepest, and the rim is rounded into the underside.
 */
function domeBand(genes: MushroomGenes, fromLevel: number): Point[] {
  const level = genes.capHeight * fromLevel;
  const half =
    (genes.capWidth / 2) *
    Math.sqrt(1 - (fromLevel === 0 ? 0 : fromLevel ** (2 / genes.domePower)));
  const arc = sample(Math.PI / 2, -Math.PI / 2, CURVE_STEPS, (angle) => {
    const x = half * Math.sin(angle);
    return { x, y: Math.max(level, domeHeight(genes, x)) };
  });
  // The lower edge sags a little, so a band reads as wrapping the dome.
  const sag = genes.capHeight * (fromLevel === 0 ? 0.1 : 0.06);
  const underside = sample(-half, half, CURVE_STEPS, (x) => ({
    x,
    y: level - sag * (1 - (x / (half || 1)) ** 2),
  })).slice(1, -1);
  return rounded([...arc, ...underside], RIM_ROUNDS);
}

/**
 * The dome's right-hand arc, from past its crown down to the rim: where the
 * light does not reach.
 */
function shadeArc(genes: MushroomGenes): Point[] {
  const half = genes.capWidth / 2;
  return sample(0.3, Math.PI / 2, CURVE_STEPS, (angle) => {
    const x = half * Math.sin(angle);
    return { x, y: domeHeight(genes, x) };
  });
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
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const toMushroom = (point: Point) => canvas(cap(point));
  const red = nudgeHue(PALETTE.capRed, genes.hueNudge);
  const dark = nudgeHue(PALETTE.capDark, genes.hueNudge);

  graphics.fillStyle(PALETTE.groundShadow, 0.22);
  graphics.fillEllipse(0, 0, genes.capWidth * size * 0.8, size * 0.07);

  const stem = stemOutline(genes).map((point) => canvas(point));
  graphics.fillStyle(PALETTE.stem);
  fillShape(graphics, stem);
  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA);
  fillShape(
    graphics,
    crescent(
      stem.slice(0, CURVE_STEPS + 1),
      canvas(stemAt(genes, 0.5)),
      genes.stemWidth * size * 0.3,
    ),
  );
  graphics.lineStyle(ink, PALETTE.ink);
  strokeShape(graphics, stem);

  const gills = sample(0, Math.PI * 2, CURVE_STEPS, (t) =>
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

  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA);
  fillShape(
    graphics,
    crescent(
      shadeArc(genes).map((point) => toMushroom(point)),
      toMushroom({ x: 0, y: genes.capHeight * 0.3 }),
      genes.capHeight * size * 0.34,
    ),
  );

  // Painted over the cap's shade, each with a shade of its own, so a spot
  // stays white where the cap turns from the light.
  for (const spot of genes.spots) {
    const centre = toMushroom(spot);
    const r = spot.r * size;
    graphics.fillStyle(PALETTE.spot);
    graphics.fillCircle(centre.x, centre.y, r);
    graphics.fillStyle(PALETTE.shadeInk, SPOT_SHADE_ALPHA);
    fillShape(
      graphics,
      crescent(
        sample(-Math.PI / 6, (Math.PI * 5) / 6, CURVE_STEPS, (angle) => ({
          x: centre.x + r * Math.cos(angle),
          y: centre.y + r * Math.sin(angle),
        })),
        centre,
        r * 0.4,
      ),
    );
  }

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
