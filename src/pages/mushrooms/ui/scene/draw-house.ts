import type * as Phaser from 'phaser';

import { type Point, sample } from '../../model/geometry';
import {
  doorPlace,
  PANE,
  type WindowKind,
  windowSlots,
} from '../../model/house';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import { paintMouse,type Peeking } from './draw-mouse';
import { PALETTE } from './palette';
import {
  arch,
  box,
  type Brush,
  ellipse,
  fillShape,
  type Place,
  strokeShape,
} from './shapes';

/** How far a window's frame reaches in from its edge, in its square's side. */
const FRAME = 0.1;
/** A tall window's width, in its square's side. */
const TALL_WIDTH = 0.62;
/** How far the door's frame stands out round the doorway, in door widths. */
const DOOR_FRAME = 0.09;
/** How far an open door's leaf folds back towards its hinge. */
const LEAF_FOLD = 0.8;

function paint(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  outline: readonly Point[],
  fill: number,
  { ink, tone }: Brush,
  bare = false,
): void {
  const points = outline.map((point) => place(point));
  graphics.fillStyle(tone(fill));
  fillShape(graphics, points);
  if (bare) return;
  graphics.lineStyle(ink, tone(PALETTE.ink));
  strokeShape(graphics, points);
}

/** A pane's glint, top left, as a lit window has. */
function paintShine(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  at: Point,
  r: number,
  brush: Brush,
): void {
  paint(graphics, place, ellipse(at, r, r * 0.7), PALETTE.windowShine, brush, true);
}

/**
 * One window of `kind` in its frame, as Syama drew them: a round pane with a
 * cross, a porthole with a thick rim, a square of four panes, a tall arched
 * one.
 */
export function paintWindow(
  graphics: Phaser.GameObjects.Graphics,
  kind: WindowKind,
  place: Place,
  brush: Brush,
): void {
  const middle = { x: 0, y: 0 };
  const bar = FRAME * 0.8;
  switch (kind) {
    case 'cross': {
      const pane = 0.5 - FRAME;
      paint(graphics, place, ellipse(middle, 0.5), PALETTE.wood, brush);
      paint(graphics, place, ellipse(middle, pane), PALETTE.windowPane, brush);
      paintShine(graphics, place, { x: -0.18, y: 0.2 }, 0.1, brush);
      paint(graphics, place, box(-pane, -bar / 2, pane, bar / 2), PALETTE.wood, brush, true);
      paint(graphics, place, box(-bar / 2, -pane, bar / 2, pane), PALETTE.wood, brush, true);
      return;
    }
    case 'round': {
      paint(graphics, place, ellipse(middle, 0.5), PALETTE.wood, brush);
      paint(graphics, place, ellipse(middle, 0.3), PALETTE.windowPane, brush);
      paintShine(graphics, place, { x: -0.1, y: 0.11 }, 0.08, brush);
      // Rivets round the rim, a porthole's.
      for (const angle of sample(0, Math.PI * 2, 6, (turn) => turn).slice(0, -1)) {
        const at = { x: 0.4 * Math.cos(angle), y: 0.4 * Math.sin(angle) };
        paint(graphics, place, ellipse(at, 0.035), PALETTE.woodDeep, brush, true);
      }
      return;
    }
    case 'square': {
      const pane = 0.5 - FRAME;
      paint(graphics, place, box(-0.5, -0.5, 0.5, 0.5), PALETTE.wood, brush);
      paint(graphics, place, box(-pane, -pane, pane, pane), PALETTE.windowPane, brush);
      paintShine(graphics, place, { x: -0.2, y: 0.2 }, 0.09, brush);
      paint(graphics, place, box(-pane, -bar / 2, pane, bar / 2), PALETTE.wood, brush, true);
      paint(graphics, place, box(-bar / 2, -pane, bar / 2, pane), PALETTE.wood, brush, true);
      return;
    }
    case 'tall': {
      const inset = FRAME * 0.9;
      paint(graphics, place, arch(TALL_WIDTH, 1, -0.5), PALETTE.wood, brush);
      paint(
        graphics,
        place,
        arch(TALL_WIDTH - inset * 2, 1 - inset * 2, -0.5 + inset),
        PALETTE.windowPane,
        brush,
      );
      paintShine(graphics, place, { x: -0.08, y: 0.22 }, 0.07, brush);
      // A sill under it, a little wider than the window.
      const sill = TALL_WIDTH / 2 + 0.07;
      paint(graphics, place, box(-sill, -0.56, sill, -0.46), PALETTE.woodDeep, brush);
      return;
    }
    default: {
      const unknown: never = kind;
      throw new Error(`No window of kind ${String(unknown)}`);
    }
  }
}

/**
 * An arched wooden door in its frame, `aspect` door widths tall, `open` from
 * 0 (shut) to 1 (swung back on its left-hand hinge, the doorway dark behind
 * it) — and whatever `inside` paints in the doorway, before the leaf.
 */
export function paintDoor(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  aspect: number,
  open: number,
  brush: Brush,
  inside?: () => void,
): void {
  paint(
    graphics,
    place,
    arch(1 + DOOR_FRAME * 2, aspect + DOOR_FRAME),
    PALETTE.woodDeep,
    brush,
  );
  paint(graphics, place, arch(1, aspect), PALETTE.doorway, brush, true);
  if (open > 0) inside?.();
  // The leaf, folded towards its hinge as it swings open.
  const fold = 1 - LEAF_FOLD * open;
  const leafPlace: Place = ({ x, y }) => place({ x: -0.5 + (x + 0.5) * fold, y });
  paint(graphics, leafPlace, arch(1, aspect), PALETTE.wood, brush);
  graphics.lineStyle(Math.max(1, brush.ink * 0.6), brush.tone(PALETTE.woodDeep));
  for (const x of [-1 / 6, 1 / 6]) {
    const line = [
      { x, y: 0.06 },
      { x, y: aspect - 0.5 + Math.sqrt(0.25 - x * x) - 0.08 },
    ].map((point) => leafPlace(point));
    graphics.lineBetween(line[0]?.x ?? 0, line[0]?.y ?? 0, line[1]?.x ?? 0, line[1]?.y ?? 0);
  }
  paint(
    graphics,
    leafPlace,
    ellipse({ x: 0.3, y: aspect * 0.42 }, 0.085),
    PALETTE.doorKnob,
    brush,
  );
}

/** The doorway's outline in the door's frame: what a mouse is seen through. */
export function doorway(aspect: number): Point[] {
  return arch(1, aspect);
}

/** A window's frame on a mushroom's cap, `grown` of its size round its slot's middle. */
export function windowPlace(
  genes: MushroomGenes,
  size: number,
  slot: Point,
  grown: number,
): Place {
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const side = PANE * grown;
  return ({ x, y }) => canvas(cap({ x: slot.x + x * side, y: slot.y + y * side }));
}

/** A door's frame on a mushroom's stem, `grown` of its size round its middle; and its aspect. */
export function doorFrame(
  genes: MushroomGenes,
  size: number,
  grown: number,
): { place: Place; aspect: number } {
  const door = doorPlace(genes);
  const canvas = toCanvas(size);
  const width = door.width * grown;
  const aspect = door.height / door.width;
  const cos = Math.cos(door.tilt);
  const sin = Math.sin(door.tilt);
  return {
    aspect,
    place: ({ x, y }) => {
      const across = x * width;
      const up = (y - aspect / 2) * width;
      return canvas({
        x: door.x + across * cos + up * sin,
        y: door.y - across * sin + up * cos,
      });
    },
  };
}

/** How far a piece has popped in: from 0, past its size, and back to 1. */
type Popped = { popped: number };
/** A window as the house paints it. */
export type ShownWindow = Popped & { kind: WindowKind };
/** A door as the house paints it, and how open it stands. */
export type ShownDoor = Popped & Peeking & { open: number };

/**
 * A mushroom's windows and door, painted into `graphics` in the frame
 * `drawMushroom` paints it in — the foot at the graphics' own position — so
 * they go wherever the mushroom does. Each window in its slot of
 * `windowSlots`, in the order it was put in; the door over the stem's foot,
 * with the mouse in its doorway while it is open.
 */
export function paintHouse(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
  door: ShownDoor | undefined,
  brush: Brush,
): void {
  const slots = windowSlots(genes);
  for (const [index, { kind, popped }] of windows.entries()) {
    const slot = slots[index];
    if (!slot || popped <= 0) continue;
    paintWindow(graphics, kind, windowPlace(genes, size, slot, popped), brush);
  }
  if (!door || door.popped <= 0) return;
  const { place, aspect } = doorFrame(genes, size, door.popped);
  paintDoor(graphics, place, aspect, door.open, brush, () => {
    paintMouse(graphics, place, doorway(aspect), door, brush);
  });
}
