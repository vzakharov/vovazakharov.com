import type * as Phaser from 'phaser';

import { type Point, sample } from '../../model/geometry';
import type { MushroomGenes } from '../../model/mushroom-genes';
import {
  CURVE_STEPS,
  domeArc,
  domeBand,
  gillsOutline,
  stemOutline,
  type TapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { capFrame, stemAt } from '../../model/mushroom-pose';
import { mix, nudgeHue } from './colour';
import { PALETTE } from './palette';
import { crescent, fillShape, strokeShape } from './shapes';

/** Where a two-tone cap changes colour, as a fraction of its height. */
const TONE_SPLIT = 0.42;
const SHADE_ALPHA = 0.2;
const SPOT_SHADE_ALPHA = 0.1;
const HIGHLIGHT_ALPHA = 0.35;
/**
 * The selection band's width outside a mushroom's own ink, per unit of its
 * size and at the least in pixels, and its ink edge's.
 */
const SELECTION_BAND = 0.05;
const SELECTION_BAND_LEAST = 5;
const SELECTION_EDGE = 2.5;

/**
 * The dome's right-hand arc, from past its crown down to the rim: where the
 * light does not reach.
 */
function shadeArc(genes: MushroomGenes): Point[] {
  return domeArc(genes, genes.capWidth / 2, [0.3, Math.PI / 2]);
}

/** Centred on `graphics`' own position, the mushroom's foot. */
export function drawMushroomShadow(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
): void {
  graphics.fillStyle(PALETTE.groundShadow, 0.22);
  graphics.fillEllipse(0, 0, genes.capWidth * size * 0.8, size * 0.07);
}

/**
 * Paints one mushroom into `graphics`, whose own position is the foot and
 * whose rotation is the lean — so the scene squashes and rocks it from the
 * ground. `haze`, from 0 to 1, takes every colour toward the sky's, as
 * distance does.
 */
export function drawMushroom(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  haze = 0,
): void {
  const tone = (colour: number) => mix(colour, PALETTE.skyHorizon, haze);
  const ink = Math.max(2, size * 0.014);
  const inkColour = tone(PALETTE.ink);
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const toMushroom = (point: Point) => canvas(cap(point));
  const red = tone(nudgeHue(PALETTE.capRed, genes.hueNudge));
  const dark = tone(nudgeHue(PALETTE.capDark, genes.hueNudge));

  const stem = stemOutline(genes).map((point) => canvas(point));
  graphics.fillStyle(tone(PALETTE.stem));
  fillShape(graphics, stem);
  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA * (1 - haze));
  fillShape(
    graphics,
    crescent(
      stem.slice(0, CURVE_STEPS + 1),
      canvas(stemAt(genes, 0.5)),
      genes.stemWidth * size * 0.3,
    ),
  );
  graphics.lineStyle(ink, inkColour);
  strokeShape(graphics, stem);

  const gills = gillsOutline(genes).map((point) => toMushroom(point));
  graphics.fillStyle(tone(PALETTE.gills));
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

  graphics.fillStyle(PALETTE.shadeInk, SHADE_ALPHA * (1 - haze));
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
    graphics.fillStyle(tone(PALETTE.spot));
    graphics.fillCircle(centre.x, centre.y, r);
    graphics.fillStyle(PALETTE.shadeInk, SPOT_SHADE_ALPHA * (1 - haze));
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

  graphics.lineStyle(ink, inkColour);
  strokeShape(graphics, dome);
}

/**
 * A thick band in `PALETTE.selection` round `outlines`, the mushroom's cap,
 * gills and stem in its graphics' frame, edged in ink. Painted into a graphics
 * just behind the mushroom, so only the band outside its own ink line shows.
 */
export function drawSelection(
  graphics: Phaser.GameObjects.Graphics,
  outlines: TapArea,
  size: number,
): void {
  const band = Math.max(SELECTION_BAND_LEAST, size * SELECTION_BAND) * 2;
  const parts = Object.values(outlines);
  // Every edge before any band, so the bands run into one another where the
  // stem meets the cap and no ink crosses them there.
  graphics.lineStyle(band + SELECTION_EDGE * 2, PALETTE.ink);
  for (const part of parts) strokeShape(graphics, part);
  graphics.lineStyle(band, PALETTE.selection);
  for (const part of parts) strokeShape(graphics, part);
}

/** The selected mushroom's ring on the ground, centred on `graphics`' own position, its foot. */
export function drawSelectionRing(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
): void {
  const across = genes.capWidth * size * 0.8;
  const tall = across * 0.24;
  const band = Math.max(SELECTION_BAND_LEAST, size * SELECTION_BAND);
  graphics.lineStyle(band + SELECTION_EDGE * 2, PALETTE.ink);
  graphics.strokeEllipse(0, 0, across, tall);
  graphics.lineStyle(band, PALETTE.selection);
  graphics.strokeEllipse(0, 0, across, tall);
}
