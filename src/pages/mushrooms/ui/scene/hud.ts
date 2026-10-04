import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { DOOR_ASPECT, type Furnishing } from '../../model/house';
import {
  type Buzzing,
  insectGenes,
  type InsectKind,
  PICTOGRAM_SEED,
} from '../../model/insect-genes';
import { buzzRoot, buzzTurn, wingspan } from '../../model/insect-outline';
import { PICTOGRAM_LIGHT } from '../../model/light';
import type { MushroomGenes, Species } from '../../model/mushroom-genes';
import { capOnCanvas, toCanvas } from '../../model/mushroom-outline';
import { BEE_VEINS, paintBeeBody, paintBeeLegs } from './draw-bee';
import { paintWing, SIDES } from './draw-buzz';
import { paintFlyBody, paintFlyLegs } from './draw-fly';
import { paintDoor, paintWindow } from './draw-house';
import { paintBody, paintWings, scaled } from './draw-insect';
import { drawMushroom } from './draw-mushroom';
import { iconGenes, iconSize, SPECIES_ICON_HEIGHT } from './icon-genes';
import type { Lighting } from './ink';
import { PALETTE } from './palette';
import { type Brush, fillShape, strokeShape } from './shapes';

/**
 * A pictogram's light, the same on every button whatever the sun does, and
 * its thinnest line: `hairline`, one device pixel in CSS pixels.
 */
export const iconLighting = (hairline: number): Lighting => ({
  ...PICTOGRAM_LIGHT,
  hairline,
});

/** How far below a button its shadow falls, in its radii, and how dark. */
const DISC_DROP = 0.07;
const DISC_SHADOW_ALPHA = 0.25;
/** A button disc's ink line, for a disc of radius `r`. */
const discInk = (r: number) => Math.max(2, r * 0.1);

/**
 * A button's disc, opaque so nothing behind it reads through, and centred on
 * the graphics' own position so a tap can press it in by scale.
 */
export function drawDisc(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  graphics.clear();
  graphics.fillStyle(PALETTE.shadeInk, DISC_SHADOW_ALPHA);
  graphics.fillCircle(0, r * DISC_DROP, r);
  graphics.fillStyle(PALETTE.hud);
  graphics.fillCircle(0, 0, r);
  graphics.lineStyle(discInk(r), PALETTE.ink);
  graphics.strokeCircle(0, 0, r);
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
  hairline: number,
  over?: (size: number) => void,
): void {
  const size = iconSize(genes, height);
  graphics.save();
  graphics.translateCanvas(x, y + height / 2);
  drawMushroom(graphics, genes, size, iconLighting(hairline));
  over?.(size);
  graphics.restore();
}

/** A pictogram's ink, and no haze. */
function iconBrush(r: number, hairline: number): Brush {
  return {
    ink: Math.max(2, r * 0.07),
    tone: (colour) => colour,
    lighting: iconLighting(hairline),
  };
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
  hairline: number,
): void {
  drawDisc(graphics, r);
  const genes = { ...iconGenes('fly-agaric'), spots: [], stemWidth: 0.28 };
  const brush = iconBrush(r * 0.8, hairline);
  drawIcon(graphics, genes, r * 1.35, 0, 0, hairline, (size) => {
    const place = capOnCanvas(genes, size);
    const canvas = toCanvas(size);
    for (const { kind, x } of ICON_WINDOWS) {
      const middle = { x, y: genes.capHeight * 0.3 };
      paintWindow(
        graphics,
        kind,
        (point) =>
          place({
            x: middle.x + point.x * ICON_PANE,
            y: middle.y + point.y * ICON_PANE,
          }),
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
  hairline: number,
): void {
  drawDisc(graphics, r);
  const brush = iconBrush(r, hairline);
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

/** One of the picker's buttons: a mushroom of `species`. */
export function drawSpeciesButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  species: Species,
  hairline: number,
): void {
  drawDisc(graphics, r);
  drawIcon(
    graphics,
    iconGenes(species),
    r * SPECIES_ICON_HEIGHT,
    0,
    0,
    hairline,
  );
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
  hairline: number,
): void {
  drawDisc(graphics, r);
  drawIcon(
    graphics,
    iconGenes('fly-agaric'),
    r * 1.15,
    -r * 0.24,
    -r * 0.1,
    hairline,
  );
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

/** How far a pictogram fly's or bee's wings stand open, so both read beside its body. */
const ICON_SPREAD = 0.55;
/** How many pollen specks the bee pictogram carries: its baskets full. */
const ICON_SPECKS = 3;

/** A fly's or a bee's wings into `graphics`, `ICON_SPREAD` open, over whatever it has painted. */
function paintIconWings(
  graphics: Phaser.GameObjects.Graphics,
  genes: Buzzing,
  size: number,
  veins: number,
  lighting: Lighting,
): void {
  for (const side of SIDES) {
    const root = scaled(size)(buzzRoot(genes, side));
    graphics.save();
    graphics.translateCanvas(root.x, root.y);
    graphics.rotateCanvas(buzzTurn(side, ICON_SPREAD));
    paintWing(graphics, genes, side, size, veins, lighting);
    graphics.restore();
  }
}

/**
 * The button that releases an insect of `kind`: that insect seen from above,
 * filling the disc — a butterfly with its wings open, a fly or a bee with its
 * wings half spread, the bee's baskets full.
 */
export function drawReleaseButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
  kind: InsectKind,
  hairline: number,
): void {
  const lighting = iconLighting(hairline);
  drawDisc(graphics, r);
  graphics.save();
  switch (kind) {
    case 'butterfly': {
      const genes = insectGenes({ seed: PICTOGRAM_SEED, kind });
      const size = (r * 1.6) / wingspan(genes);
      // A little below the middle, the antennae reaching up into the room above.
      graphics.translateCanvas(0, r * 0.08);
      paintWings(graphics, genes, 'hind', size, lighting);
      paintWings(graphics, genes, 'fore', size, lighting);
      paintBody(graphics, genes, size, lighting);
      break;
    }
    case 'fly': {
      const genes = insectGenes({ seed: PICTOGRAM_SEED, kind });
      const size = (r * 1.3) / genes.bodyLength / 1.25;
      graphics.translateCanvas(0, r * 0.06);
      paintFlyLegs(graphics, genes, size, 0, lighting);
      paintFlyBody(graphics, genes, size, lighting);
      paintIconWings(graphics, genes, size, genes.veins, lighting);
      break;
    }
    case 'bee': {
      const genes = insectGenes({ seed: PICTOGRAM_SEED, kind });
      const size = (r * 1.35) / genes.bodyLength / 1.25;
      graphics.translateCanvas(0, r * 0.1);
      paintBeeLegs(graphics, genes, size, ICON_SPECKS, lighting);
      paintBeeBody(graphics, genes, size, lighting);
      paintIconWings(graphics, genes, size, BEE_VEINS, lighting);
      break;
    }
    default: {
      kind satisfies never;
    }
  }
  graphics.restore();
}

/** The folded map's panel width, half its height and its folds' zigzag, in its button's radius. */
const MAP_PANEL = 0.4;
const MAP_HALF_HEIGHT = 0.45;
const MAP_FOLD = 0.08;
/** The middle panel, turned from the light: the shade laid over it. */
const MAP_FOLD_SHADE = 0.14;
/** The dotted path across the map: where it starts, bends and ends, in the button's radius. */
const PATH = [
  { x: -0.44, y: 0.26 },
  { x: -0.05, y: -0.4 },
  { x: 0.36, y: 0.02 },
] as const;
const PATH_DOTS = 6;
/** How far along the path its dots run, the rest left to the cross that ends it. */
const PATH_DOTTED = 0.78;

/** A point `t` of the way along the quadratic `PATH`, in its button's radius. */
function alongPath(t: number): Point {
  const [from, bend, to] = PATH;
  const at = (a: number, b: number, c: number) =>
    (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c;
  return { x: at(from.x, bend.x, to.x), y: at(from.y, bend.y, to.y) };
}

/**
 * The map button's picture: a paper of three panels folded in a zigzag, in
 * Syama's indigo ink, a dotted path across it ending in a little cross. Its
 * disc is a face of its own (`drawDisc`), which shrinks away under the open
 * map's cross.
 */
export function drawMapButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  const ink = Math.max(2, r * 0.08);
  // The `edge`th fold from the left, at `side` -1 its top and 1 its bottom,
  // the folds standing alternately low and high.
  const corner = (edge: number, side: number): Point => ({
    x: (edge - 1.5) * MAP_PANEL * r,
    y: (side * MAP_HALF_HEIGHT + (edge % 2 === 0 ? 1 : -1) * MAP_FOLD) * r,
  });
  for (const index of [0, 1, 2]) {
    const panel = [
      corner(index, -1),
      corner(index + 1, -1),
      corner(index + 1, 1),
      corner(index, 1),
    ];
    graphics.fillStyle(PALETTE.hud);
    fillShape(graphics, panel);
    if (index === 1) {
      graphics.fillStyle(PALETTE.shadeInk, MAP_FOLD_SHADE);
      fillShape(graphics, panel);
    }
    graphics.lineStyle(ink, PALETTE.inkCool);
    strokeShape(graphics, panel);
  }

  graphics.fillStyle(PALETTE.inkCool);
  const dot = Math.max(1, r * 0.045);
  for (let index = 0; index < PATH_DOTS; index++) {
    const { x, y } = alongPath((index / (PATH_DOTS - 1)) * PATH_DOTTED);
    graphics.fillCircle(x * r, y * r, dot);
  }
  const end = alongPath(1);
  const arm = r * 0.09;
  graphics.save();
  graphics.translateCanvas(end.x * r, end.y * r);
  graphics.lineBetween(-arm, -arm, arm, arm);
  graphics.lineBetween(-arm, arm, arm, -arm);
  graphics.restore();
}

/** The close cross's arm from its middle, and its bars' width, in its button's radius. */
const CLOSE_ARM = 0.42;
const CLOSE_BAR = 0.15;

/** A cross of square bars `bar` wide, reaching `arm` from its middle, in the current fill. */
function fillCross(
  graphics: Phaser.GameObjects.Graphics,
  arm: number,
  bar: number,
): void {
  graphics.fillRect(-arm, -bar / 2, arm * 2, bar);
  graphics.fillRect(-bar / 2, -arm, bar, arm * 2);
}

/**
 * The open map's button: a bare cross in the map's ink, standing on the
 * sheet's grass with no disc under it, so it takes the disc's pale and its
 * shadow as a rim of the disc's ink width round its bars.
 */
export function drawCloseButton(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  const arm = r * CLOSE_ARM;
  const bar = Math.max(2, r * CLOSE_BAR);
  const rim = discInk(r);
  graphics.save();
  graphics.rotateCanvas(Math.PI / 4);
  graphics.save();
  graphics.translateCanvas(
    (r * DISC_DROP) / Math.SQRT2,
    (r * DISC_DROP) / Math.SQRT2,
  );
  graphics.fillStyle(PALETTE.shadeInk, DISC_SHADOW_ALPHA);
  fillCross(graphics, arm + rim, bar + rim * 2);
  graphics.restore();
  graphics.fillStyle(PALETTE.hud);
  fillCross(graphics, arm + rim, bar + rim * 2);
  graphics.fillStyle(PALETTE.inkCool);
  fillCross(graphics, arm, bar);
  graphics.restore();
}
