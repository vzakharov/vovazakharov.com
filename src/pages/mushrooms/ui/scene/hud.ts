import type * as Phaser from 'phaser';

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
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import { BEE_VEINS, paintBeeBody, paintBeeLegs } from './draw-bee';
import { paintWing, SIDES } from './draw-buzz';
import { paintFlyBody, paintFlyLegs } from './draw-fly';
import { paintDoor, paintWindow } from './draw-house';
import { paintBody, paintWings, scaled } from './draw-insect';
import { drawMushroom } from './draw-mushroom';
import { iconGenes, iconSize, SPECIES_ICON_HEIGHT } from './icon-genes';
import type { Lighting } from './ink';
import { PALETTE } from './palette';
import type { Brush } from './shapes';

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
  graphics.lineStyle(Math.max(2, r * 0.1), PALETTE.ink);
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
    const cap = capFrame(genes);
    const canvas = toCanvas(size);
    for (const { kind, x } of ICON_WINDOWS) {
      const middle = { x, y: genes.capHeight * 0.3 };
      paintWindow(
        graphics,
        kind,
        (point) =>
          canvas(
            cap({
              x: middle.x + point.x * ICON_PANE,
              y: middle.y + point.y * ICON_PANE,
            }),
          ),
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
