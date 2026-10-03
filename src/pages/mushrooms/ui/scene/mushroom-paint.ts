/**
 * What every species' painter shares: the brush a mushroom is painted with,
 * its stem, and the layers of light on its cap (`capLight`), each painted
 * the one way whatever head it lies on.
 */

import type * as Phaser from 'phaser';

import {
  ellipse,
  type Point,
  ROUND_STEPS,
  type Scaled,
} from '../../model/geometry';
import type { MushroomGenes } from '../../model/mushroom-genes';
import {
  capOnCanvas,
  inkWidth,
  stemOutline,
  toCanvas,
} from '../../model/mushroom-outline';
import { stemAt } from '../../model/mushroom-pose';
import {
  type Chorded,
  CURVE_STEPS,
  detailed,
} from '../../model/mushroom-profile';
import { mix } from './colour';
import type { WithGraphics } from './hit-areas';
import { inkFor, type Lighting, litSide } from './ink';
import type { Hazed } from './layout';
import {
  type CapLight,
  shadedHalf,
  sideways,
  stemLight,
} from './mushroom-light';
import { heldHaze, type MushroomTints, mushroomTints } from './mushroom-tints';
import { PALETTE } from './palette';
import { type Brush, crescent, fillShape, inkUnder } from './shapes';

const SHINE_ALPHA = 0.45;
const SPOT_SHADE_ALPHA = 0.13;
/** A rim light's warm band and the pale line inside it, each one's width as a share of its layer's depth, and alpha. */
const RIM = { width: 1, alpha: 0.6 };
const RIM_FINE = { width: 0.42, alpha: 0.4 };
/** The fewest chords a spot or the shine is painted round with, and Phaser's own count for an ellipse, which a near shine keeps. */
const LEAST_ROUND = 6;
const PHASER_ELLIPSE = 32;

/** Something painted into its graphics through a haze. */
export type HazedGraphics = WithGraphics & Hazed;

/**
 * One mushroom's brush: its graphics, genes and fills, the light it is lit
 * by, its size and ink line in pixels, `tone` taking a colour through its
 * haze, the maps from its own frame and its cap's to the canvas, and how
 * many chords each of its curves is painted with (`curveSteps`).
 */
export type MushroomBrush = Brush &
  HazedGraphics &
  Scaled &
  Chorded & {
    genes: MushroomGenes;
    tints: MushroomTints;
    canvas: (point: Point) => Point;
    toMushroom: (point: Point) => Point;
  };

export function mushroomBrush(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  lighting: Lighting,
  haze: number,
  steps = CURVE_STEPS,
): MushroomBrush {
  const canvas = toCanvas(size);
  const held = heldHaze(genes, haze);
  return {
    graphics,
    genes,
    tints: mushroomTints(genes),
    lighting,
    size,
    ink: inkWidth(size),
    haze: held,
    tone: (colour) => mix(colour, PALETTE.air, held),
    canvas,
    toMushroom: capOnCanvas(genes, size),
    steps,
  };
}

/** Cool shade laid over whatever is painted, at `alpha` of full, less as the haze grows. */
export function shadeWith({ graphics, haze }: MushroomBrush, alpha: number) {
  graphics.fillStyle(PALETTE.shadeCool, alpha * (1 - haze));
}

/** A light of `colour` laid over whatever is painted, hazed as the fill is. */
export function lightWith(
  { graphics, haze, tone }: MushroomBrush,
  colour: number,
  alpha: number,
) {
  graphics.fillStyle(tone(colour), alpha * (1 - haze));
}

/** The stem's outline on the canvas, as it stands turned `turn`. */
export function stemPoints(brush: MushroomBrush, turn: number): Point[] {
  const { genes, steps, canvas } = brush;
  return stemOutline(genes, turn, steps).map((point) => canvas(point));
}

/**
 * The stem's ink under it, then its fill and its light (`stemLight`): cool
 * shade on the side turned from the sun, warm light on the side toward it.
 * `inkLaid` says the caller laid its ink first.
 */
export function paintStem(
  brush: MushroomBrush,
  stem: readonly Point[],
  { inkLaid = false } = {},
): void {
  const { graphics, genes, tints, lighting, tone, size, haze, steps } = brush;
  if (!inkLaid) inkStem(brush, stem);
  graphics.fillStyle(tone(tints.stem));
  fillShape(graphics, stem);
  // The outline runs up the stem's right side and back down its left.
  const [right, left] = [
    stem.slice(0, steps + 1),
    stem.slice(steps + 1, (steps + 1) * 2),
  ];
  const [sunSide, shadeSide] = bySun(lighting.toward, [left, right]);
  const middle = brush.canvas(stemAt(genes, 0.5));
  const stemWidth = genes.stemWidth * size;
  for (const [colour, alpha, depth, side] of stemLight(tints.stemLit, steps)) {
    // Shade is laid over the fill's own haze, as the cap's is.
    graphics.fillStyle(
      side === 'shade' ? colour : tone(colour),
      alpha * sideways(lighting.toward) * (1 - haze),
    );
    fillShape(
      graphics,
      crescent(side === 'sun' ? sunSide : shadeSide, middle, stemWidth * depth),
    );
  }
}

/** A shape's `left` and `right` sides as the light `toward` falls on them: the sun's side first. */
export function bySun<Side>(
  toward: Point,
  [left, right]: readonly [Side, Side],
): [Side, Side] {
  return litSide(toward) === 1 ? [right, left] : [left, right];
}

/** The stem's ink line, laid before its fill. */
export function inkStem(brush: MushroomBrush, stem: readonly Point[]): void {
  const { graphics, tints, ink, lighting, tone } = brush;
  inkUnder(graphics, stem, inkFor(tone(tints.stem)), ink, lighting);
}

/**
 * Each of `layers` painted on the cap: a crescent reaching `depth` px in from
 * its arc toward `interior` (a shade or a light by its kind), the shine, and
 * each spot with a shade of its own, so a spot stays white where the cap turns
 * from the light. `depth` gives each crescent kind its reach.
 */
export function paintCapLight(
  brush: MushroomBrush,
  layers: readonly CapLight[],
  interior: Point,
  depth: (kind: Exclude<CapLight['kind'], 'shine' | 'spot'>) => number,
  shadeAlpha: number,
): void {
  const { graphics, toMushroom, size, tints, tone, lighting, steps } = brush;
  const near = steps === CURVE_STEPS;
  const along = (arc: readonly Point[]) =>
    arc.map((point) => toMushroom(point));
  for (const layer of layers) {
    switch (layer.kind) {
      case 'shade':
      case 'dip-shade': {
        shadeWith(brush, shadeAlpha * layer.strength);
        fillShape(
          graphics,
          crescent(along(layer.arc), interior, depth(layer.kind)),
        );
        break;
      }
      case 'rim':
      case 'dip-light': {
        const arc = along(layer.arc);
        for (const [colour, { width, alpha }] of [
          [tints.capLit, RIM],
          [PALETTE.rimLight, RIM_FINE],
        ] as const) {
          lightWith(brush, colour, alpha * layer.strength);
          fillShape(
            graphics,
            crescent(arc, interior, depth(layer.kind) * width),
          );
        }
        break;
      }
      case 'shine': {
        const centre = toMushroom(layer.centre);
        const [rx, ry] = layer.radii;
        lightWith(brush, PALETTE.rimLight, SHINE_ALPHA);
        graphics.fillEllipse(
          centre.x,
          centre.y,
          rx * size * 2,
          ry * size * 2,
          detailed(PHASER_ELLIPSE, steps, LEAST_ROUND),
        );
        break;
      }
      case 'spot': {
        const centre = toMushroom(layer.spot);
        const r = layer.spot.r * size;
        graphics.fillStyle(tone(PALETTE.spot));
        // Phaser rounds a circle with a hundred points whatever its size.
        if (near) graphics.fillCircle(centre.x, centre.y, r);
        else {
          const round = detailed(ROUND_STEPS, steps, LEAST_ROUND);
          fillShape(graphics, ellipse(centre, r, r, round));
        }
        shadeWith(brush, SPOT_SHADE_ALPHA);
        const half = shadedHalf(centre, r, lighting.toward, steps);
        fillShape(graphics, crescent(half, centre, r * 0.4));
        break;
      }
      default: {
        return layer satisfies never;
      }
    }
  }
}
