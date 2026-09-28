import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import type { Light } from '../../model/light';
import { domeHeight, type MushroomGenes } from '../../model/mushroom-genes';
import {
  CURVE_STEPS,
  domeBand,
  gillsOutline,
  MUSHROOM_INK,
  stemOutline,
  type TapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { capFrame, stemAt } from '../../model/mushroom-pose';
import { mix, nudgeHue } from './colour';
import { inkFor, innerInk, type Lighting, litSide, longestRun } from './ink';
import { capRimArc, capShadeArc, capShine, shadedHalf } from './mushroom-light';
import { PALETTE } from './palette';
import {
  crescent,
  fillShape,
  inkUnder,
  paintCastShadow,
  strokeLine,
  strokeShape,
} from './shapes';

/** Where a two-tone cap changes colour, as a fraction of its height. */
const TONE_SPLIT = 0.42;
const SHADE_ALPHA = 0.26;
const SPOT_SHADE_ALPHA = 0.13;
const SHINE_ALPHA = 0.45;
/** The cap's warm rim light and the pale line inside it: each one's width, in the cap's height, and alpha. */
const RIM = { width: 0.06, alpha: 0.6 };
const RIM_FINE = { width: 0.025, alpha: 0.4 };
/** The pale light down the stem's sun side, in its width, and its alpha. */
const STEM_RIM = { width: 0.14, alpha: 0.35 };
/** How far a two-tone cap's band line stays in from the dome's own surface, in its height: what counts as its lower edge. */
const BAND_EDGE = 0.02;
/**
 * The selection band's width outside a mushroom's own ink, per unit of its
 * size and at the least in pixels, and its ink edge's.
 */
const SELECTION_BAND = 0.05;
const SELECTION_BAND_LEAST = 5;
const SELECTION_EDGE = 2.5;

/** Centred on `graphics`' own position, the mushroom's foot, and fallen away from the sun. */
export function drawMushroomShadow(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  light: Light,
): void {
  paintCastShadow(graphics, [genes.capWidth * size * 0.8, size * 0.07], light);
}

/**
 * Paints one mushroom into `graphics`, whose own position is the foot and
 * whose rotation is the lean — so the scene squashes and rocks it from the
 * ground — lit from where `lighting` says. `haze`, from 0 to 1, takes every
 * colour toward the air's, as distance does.
 */
export function drawMushroom(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  lighting: Lighting,
  haze = 0,
): void {
  const { toward } = lighting;
  const tone = (colour: number) => mix(colour, PALETTE.air, haze);
  const ink = Math.max(2, size * MUSHROOM_INK);
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const toMushroom = (point: Point) => canvas(cap(point));
  const red = nudgeHue(PALETTE.capRed, genes.hueNudge);
  const dark = nudgeHue(PALETTE.capDark, genes.hueNudge);
  const shade = (alpha: number) => {
    graphics.fillStyle(PALETTE.shadeCool, alpha * (1 - haze));
  };
  const lit = (colour: number, alpha: number) => {
    graphics.fillStyle(tone(colour), alpha * (1 - haze));
  };

  const stem = stemOutline(genes).map((point) => canvas(point));
  inkUnder(graphics, stem, tone(inkFor(PALETTE.stem)), ink, lighting);
  graphics.fillStyle(tone(PALETTE.stem));
  fillShape(graphics, stem);
  // The outline runs up the stem's right side and back down its left.
  const [right, left] = [
    stem.slice(0, CURVE_STEPS + 1),
    stem.slice(CURVE_STEPS + 1),
  ];
  const [sunSide, shadeSide] =
    litSide(toward) === 1 ? [right, left] : [left, right];
  const middle = canvas(stemAt(genes, 0.5));
  const stemWidth = genes.stemWidth * size;
  shade(SHADE_ALPHA);
  fillShape(graphics, crescent(shadeSide, middle, stemWidth * 0.3));
  lit(PALETTE.rimLight, STEM_RIM.alpha);
  fillShape(graphics, crescent(sunSide, middle, stemWidth * STEM_RIM.width));

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
  inkUnder(graphics, dome, tone(inkFor(base)), ink, lighting);
  graphics.fillStyle(tone(base));
  fillShape(graphics, dome);
  if (band !== undefined) {
    const upper = domeBand(genes, TONE_SPLIT);
    graphics.fillStyle(tone(band));
    fillShape(
      graphics,
      upper.map((point) => toMushroom(point)),
    );
    // A line where the tones meet, so which of them is on top reads at a
    // glance, on a button as in the meadow: along the band's lower edge
    // only, the dome's own contour being the outer ink's.
    const edge = longestRun(
      upper,
      upper.map(
        ({ x, y }) => y < domeHeight(genes, x) - genes.capHeight * BAND_EDGE,
      ),
    );
    graphics.lineStyle(ink * 0.5, tone(innerInk(band)));
    strokeLine(
      graphics,
      edge.map((point) => toMushroom(point)),
    );
  }

  const interior = toMushroom({ x: 0, y: genes.capHeight * 0.3 });
  const capHeight = genes.capHeight * size;
  shade(SHADE_ALPHA);
  fillShape(
    graphics,
    crescent(
      capShadeArc(genes, toward).map((point) => toMushroom(point)),
      interior,
      capHeight * 0.34,
    ),
  );
  const rim = capRimArc(genes, toward).map((point) => toMushroom(point));
  for (const [colour, { width, alpha }] of [
    [PALETTE.capLit, RIM],
    [PALETTE.rimLight, RIM_FINE],
  ] as const) {
    lit(colour, alpha);
    fillShape(graphics, crescent(rim, interior, capHeight * width));
  }

  // Painted over the cap's shade, each with a shade of its own, so a spot
  // stays white where the cap turns from the light.
  for (const spot of genes.spots) {
    const centre = toMushroom(spot);
    const r = spot.r * size;
    graphics.fillStyle(tone(PALETTE.spot));
    graphics.fillCircle(centre.x, centre.y, r);
    shade(SPOT_SHADE_ALPHA);
    fillShape(
      graphics,
      crescent(shadedHalf(centre, r, toward), centre, r * 0.4),
    );
  }

  const shine = toMushroom(capShine(genes, toward));
  lit(PALETTE.rimLight, SHINE_ALPHA);
  graphics.fillEllipse(
    shine.x,
    shine.y,
    genes.capWidth * size * 0.2,
    capHeight * 0.22,
  );
}

/**
 * The selection band round `outlines`, in the mushroom's graphics' frame.
 * Painted into a graphics just behind the mushroom, so only the half outside
 * its own ink line shows.
 */
export function drawSelection(
  graphics: Phaser.GameObjects.Graphics,
  outlines: TapArea,
  size: number,
): void {
  const parts = Object.values(outlines);
  strokeSelection(graphics, selectionBand(size) * 2, () => {
    for (const part of parts) strokeShape(graphics, part);
  });
}

/** The selected mushroom's ring on the ground, centred on `graphics`' own position, its foot. */
export function drawSelectionRing(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
): void {
  const across = genes.capWidth * size * 0.8;
  const tall = across * 0.24;
  strokeSelection(graphics, selectionBand(size), () => {
    graphics.strokeEllipse(0, 0, across, tall);
  });
}

function selectionBand(size: number): number {
  return Math.max(SELECTION_BAND_LEAST, size * SELECTION_BAND);
}

/**
 * What `stroke` draws, as a `band`-wide stroke in `PALETTE.selection` edged in
 * ink. Every edge goes down before any band, so where two strokes meet — the
 * stem under the cap — the bands run into one another and no ink crosses them.
 */
function strokeSelection(
  graphics: Phaser.GameObjects.Graphics,
  band: number,
  stroke: () => void,
): void {
  graphics.lineStyle(band + SELECTION_EDGE * 2, PALETTE.ink);
  stroke();
  graphics.lineStyle(band, PALETTE.selection);
  stroke();
}
