import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import type { Light } from '../../model/light';
import type { MushroomGenes } from '../../model/mushroom-genes';
import {
  headOutlines,
  MUSHROOM_INK,
  stemOutline,
  type TapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { capFrame, stemAt } from '../../model/mushroom-pose';
import { CURVE_STEPS } from '../../model/mushroom-profile';
import { mix, nudgeHue } from './colour';
import { type Lighting, litSide } from './ink';
import {
  capLight,
  mushroomShadow,
  shadedHalf,
  sideways,
  STEM_LIGHT,
} from './mushroom-light';
import { PALETTE } from './palette';
import {
  crescent,
  fillShape,
  inkedFill,
  paintShadow,
  strokeShape,
} from './shapes';

const SHADE_ALPHA = 0.26;
const SPOT_SHADE_ALPHA = 0.13;
const SHINE_ALPHA = 0.45;
/** The cap's warm rim light and the pale line inside it: each one's width, in the cap's height, and alpha. */
const RIM = { width: 0.06, alpha: 0.6 };
const RIM_FINE = { width: 0.025, alpha: 0.4 };
/**
 * The selection band's width outside a mushroom's own ink, per unit of its
 * size and at the least in pixels, and its ink edge's.
 */
const SELECTION_BAND = 0.05;
const SELECTION_BAND_LEAST = 5;
const SELECTION_EDGE = 2.5;

/** Centred on `graphics`' own position, the mushroom's foot (`mushroomShadow`). */
export function drawMushroomShadow(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  light: Light,
  turn = 0,
): void {
  paintShadow(graphics, mushroomShadow(genes, size, light, turn));
}

/**
 * Paints one mushroom into `graphics`, whose own position is the foot and
 * whose rotation is the lean, `turn` — so the scene squashes and rocks it from
 * the ground, the foot kept level with it — lit from where `lighting`, in
 * that turned frame, says (`mushroomLights`). `haze`, from 0 to 1, takes
 * every colour toward the air's, as distance does.
 */
export function drawMushroom(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  lighting: Lighting,
  { haze = 0, turn = 0 } = {},
): void {
  const { toward } = lighting;
  const tone = (colour: number) => mix(colour, PALETTE.air, haze);
  const ink = Math.max(2, size * MUSHROOM_INK);
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const toMushroom = (point: Point) => canvas(cap(point));
  const red = nudgeHue(PALETTE.capRed, genes.hueNudge);
  const shade = (alpha: number) => {
    graphics.fillStyle(PALETTE.shadeCool, alpha * (1 - haze));
  };
  const lit = (colour: number, alpha: number) => {
    graphics.fillStyle(tone(colour), alpha * (1 - haze));
  };

  const stem = stemOutline(genes, turn).map((point) => canvas(point));
  inkedFill(graphics, stem, PALETTE.stem, ink, lighting, tone);
  // The outline runs up the stem's right side and back down its left.
  const [right, left] = [
    stem.slice(0, CURVE_STEPS + 1),
    stem.slice(CURVE_STEPS + 1, (CURVE_STEPS + 1) * 2),
  ];
  const [sunSide, shadeSide] =
    litSide(toward) === 1 ? [right, left] : [left, right];
  const middle = canvas(stemAt(genes, 0.5));
  const stemWidth = genes.stemWidth * size;
  for (const [colour, alpha, depth, side] of STEM_LIGHT) {
    // Shade is laid over the fill's own haze, as the cap's is.
    graphics.fillStyle(
      side === 'shade' ? colour : tone(colour),
      alpha * sideways(toward) * (1 - haze),
    );
    fillShape(
      graphics,
      crescent(side === 'sun' ? sunSide : shadeSide, middle, stemWidth * depth),
    );
  }

  const [top, under] = headOutlines(genes);
  graphics.fillStyle(tone(PALETTE.gills));
  fillShape(
    graphics,
    under.map((point) => toMushroom(point)),
  );

  const dome = top.map((point) => toMushroom(point));
  inkedFill(graphics, dome, red, ink, lighting, tone);

  const interior = toMushroom({ x: 0, y: genes.capHeight * 0.3 });
  const capHeight = genes.capHeight * size;
  for (const layer of capLight(genes, toward)) {
    switch (layer.kind) {
      case 'shade': {
        shade(SHADE_ALPHA * layer.strength);
        const arc = layer.arc.map((point) => toMushroom(point));
        fillShape(graphics, crescent(arc, interior, capHeight * 0.34));
        break;
      }
      case 'rim': {
        const arc = layer.arc.map((point) => toMushroom(point));
        for (const [colour, { width, alpha }] of [
          [PALETTE.capLit, RIM],
          [PALETTE.rimLight, RIM_FINE],
        ] as const) {
          lit(colour, alpha * layer.strength);
          fillShape(graphics, crescent(arc, interior, capHeight * width));
        }
        break;
      }
      case 'shine': {
        const centre = toMushroom(layer.centre);
        const [rx, ry] = layer.radii;
        lit(PALETTE.rimLight, SHINE_ALPHA);
        graphics.fillEllipse(centre.x, centre.y, rx * size * 2, ry * size * 2);
        break;
      }
      case 'spot': {
        // Each with a shade of its own, so a spot stays white where the cap
        // turns from the light.
        const centre = toMushroom(layer.spot);
        const r = layer.spot.r * size;
        graphics.fillStyle(tone(PALETTE.spot));
        graphics.fillCircle(centre.x, centre.y, r);
        shade(SPOT_SHADE_ALPHA);
        fillShape(
          graphics,
          crescent(shadedHalf(centre, r, toward), centre, r * 0.4),
        );
        break;
      }
      default: {
        return layer satisfies never;
      }
    }
  }
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
