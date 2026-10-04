import type * as Phaser from 'phaser';

import {
  arch,
  type Circle,
  ellipse,
  type Point,
  sample,
} from '../../model/geometry';
import {
  type DoorPlace,
  doorway,
  onStem,
  paintedDoor,
  PANE,
  type WindowKind,
  windowSlots,
} from '../../model/house';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { capOnCanvas, toCanvas } from '../../model/mushroom-outline';
import { paintMouse, type Peeking } from './draw-mouse';
import { paintWorm, type ShownWorm } from './draw-worm';
import { inkFor, innerInk } from './ink';
import { haloFor, mushroomTints } from './mushroom-tints';
import { PALETTE } from './palette';
import { box, type Brush, fillShape, inkUnder, type Place } from './shapes';

/**
 * How a house piece is painted: a mushroom's brush, and the pale line round
 * the piece's outer edge where its own ink would not stand off what it sits
 * on (`haloFor`), which only the outer edge takes.
 */
type HouseBrush = Brush & { halo?: number };
/** How far a halo reaches outside its piece, in its ink line's widths. */
const HALO = 2.6;

/** How far a window's frame reaches in from its edge, in its square's side. */
const FRAME = 0.1;
/** A tall window's width, in its square's side. */
const TALL_WIDTH = 0.62;
/** A square window's glint, on its left pane: an open one's right casement has it mirrored. */
const SQUARE_SHINE: Circle = { x: -0.2, y: 0.2, r: 0.09 };
/** How far an open door's leaf folds back towards its hinge. */
const LEAF_FOLD = 0.8;

function paint(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  outline: readonly Point[],
  fill: number,
  { ink, tone, lighting, halo }: HouseBrush,
  bare = false,
): void {
  const points = outline.map((point) => place(point));
  if (!bare && halo !== undefined) {
    inkUnder(graphics, points, tone(halo), ink * HALO, lighting);
  }
  if (!bare) inkUnder(graphics, points, inkFor(tone(fill)), ink, lighting);
  graphics.fillStyle(tone(fill));
  fillShape(graphics, points);
}

/** A pane's glint, top left, as a lit window has. */
function paintShine(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  at: Point,
  r: number,
  brush: Brush,
): void {
  paint(
    graphics,
    place,
    ellipse(at, r, r * 0.7),
    PALETTE.windowShine,
    brush,
    true,
  );
}

/** A window's wooden cross, its bars reaching `pane` out from the middle. */
function paintCross(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  pane: number,
  brush: Brush,
): void {
  const bar = FRAME * 0.8;
  paint(
    graphics,
    place,
    box(-pane, -bar / 2, pane, bar / 2),
    PALETTE.wood,
    brush,
    true,
  );
  paint(
    graphics,
    place,
    box(-bar / 2, -pane, bar / 2, pane),
    PALETTE.wood,
    brush,
    true,
  );
}

/** How open a door or window is, from 0 (shut) to 1. */
type Opened = { open: number };
/** How open a window is, and the side its pane swings out to: -1 left, 1 right. */
export type WindowSwing = Opened & { swingsTo: number };
export const SHUT_WINDOW: WindowSwing = { open: 0, swingsTo: -1 };

/** How far a window's pane turns on its hinge, fully open: past square, so it lies out beside its opening. */
const PANE_SWING = (2 * Math.PI) / 3;

/**
 * Where a pane hinged at `hinge` across its window and turned `open` of the
 * way out lands, seen face-on: narrowed toward the hinge, and past square
 * folded out beyond it.
 */
function swungPlace(place: Place, hinge: number, open: number): Place {
  const across = Math.cos(PANE_SWING * open);
  return ({ x, y }) => place({ x: hinge + (x - hinge) * across, y });
}

/**
 * A window's glass on `place`, `outline` with its glint at `shine`; while
 * `open`, the dark inside showing through `outline` and the glass swung out
 * on its hinge at the side `swingsTo`, `reach` across.
 */
function paintPane(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  outline: readonly Point[],
  reach: number,
  shine: Circle,
  brush: Brush,
  { open, swingsTo }: WindowSwing,
): Place {
  const glass = open > 0 ? swungPlace(place, swingsTo * reach, open) : place;
  if (open > 0) paint(graphics, place, outline, PALETTE.doorway, brush, true);
  paint(graphics, glass, outline, PALETTE.windowPane, brush);
  paintShine(graphics, glass, shine, shine.r, brush);
  return glass;
}

/**
 * A square window's four panes swung open as two casements, each its half
 * of the cross, hinged at its side of the frame `pane` out from the middle:
 * the dark inside between them.
 */
function paintCasements(
  graphics: Phaser.GameObjects.Graphics,
  place: Place,
  pane: number,
  open: number,
  brush: Brush,
): void {
  paint(
    graphics,
    place,
    box(-pane, -pane, pane, pane),
    PALETTE.doorway,
    brush,
    true,
  );
  const bar = FRAME * 0.8;
  for (const side of [-1, 1]) {
    const casement = swungPlace(place, side * pane, open);
    const [inside, outside] = [0, side * pane].toSorted((a, b) => a - b);
    const edge = [0, (side * bar) / 2].toSorted((a, b) => a - b);
    paint(
      graphics,
      casement,
      box(inside ?? 0, -pane, outside ?? 0, pane),
      PALETTE.windowPane,
      brush,
    );
    const shine = { ...SQUARE_SHINE, x: -side * SQUARE_SHINE.x };
    paintShine(graphics, casement, shine, shine.r, brush);
    // Its half of the cross bar, and its half of the upright where the two meet.
    for (const piece of [
      box(inside ?? 0, -bar / 2, outside ?? 0, bar / 2),
      box(edge[0] ?? 0, -pane, edge[1] ?? 0, pane),
    ]) {
      paint(graphics, casement, piece, PALETTE.wood, brush, true);
    }
  }
}

/**
 * One window of `kind` in its frame, as Syama drew them: a round pane with a
 * cross, a porthole with a thick rim, a square of four panes, a tall arched
 * one. Open (`swing`), the dark inside shows and the glass stands swung out
 * on its hinge — the square's two casements one to each side.
 */
export function paintWindow(
  graphics: Phaser.GameObjects.Graphics,
  kind: WindowKind,
  place: Place,
  brush: HouseBrush,
  swing: WindowSwing = SHUT_WINDOW,
): void {
  // Only a window's outer edge takes the halo.
  const inner = { ...brush, halo: undefined };
  const middle = { x: 0, y: 0 };
  switch (kind) {
    case 'cross': {
      const pane = 0.5 - FRAME;
      paint(graphics, place, ellipse(middle, 0.5), PALETTE.wood, brush);
      const glass = paintPane(
        graphics,
        place,
        ellipse(middle, pane),
        pane,
        { x: -0.18, y: 0.2, r: 0.1 },
        inner,
        swing,
      );
      paintCross(graphics, glass, pane, inner);
      return;
    }
    case 'round': {
      paint(graphics, place, ellipse(middle, 0.5), PALETTE.wood, brush);
      paintPane(
        graphics,
        place,
        ellipse(middle, 0.3),
        0.3,
        { x: -0.1, y: 0.11, r: 0.08 },
        inner,
        swing,
      );
      // Rivets round the rim, a porthole's.
      for (const angle of sample(0, Math.PI * 2, 6, (turn) => turn).slice(
        0,
        -1,
      )) {
        const at = { x: 0.4 * Math.cos(angle), y: 0.4 * Math.sin(angle) };
        paint(
          graphics,
          place,
          ellipse(at, 0.035),
          PALETTE.woodDeep,
          inner,
          true,
        );
      }
      return;
    }
    case 'square': {
      const pane = 0.5 - FRAME;
      paint(graphics, place, box(-0.5, -0.5, 0.5, 0.5), PALETTE.wood, brush);
      if (swing.open <= 0) {
        paintPane(
          graphics,
          place,
          box(-pane, -pane, pane, pane),
          pane,
          SQUARE_SHINE,
          inner,
          swing,
        );
        paintCross(graphics, place, pane, inner);
        return;
      }
      paintCasements(graphics, place, pane, swing.open, inner);
      return;
    }
    case 'tall': {
      const inset = FRAME * 0.9;
      const width = TALL_WIDTH - inset * 2;
      paint(graphics, place, arch(TALL_WIDTH, 1, -0.5), PALETTE.wood, brush);
      paintPane(
        graphics,
        place,
        arch(width, 1 - inset * 2, -0.5 + inset),
        width / 2,
        { x: -0.08, y: 0.22, r: 0.07 },
        inner,
        swing,
      );
      // A sill under it, a little wider than the window.
      const sill = TALL_WIDTH / 2 + 0.07;
      paint(
        graphics,
        place,
        box(-sill, -0.56, sill, -0.46),
        PALETTE.woodDeep,
        inner,
      );
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
  brush: HouseBrush,
  inside?: () => void,
): void {
  paint(graphics, place, paintedDoor(aspect), PALETTE.woodDeep, brush);
  const inner = { ...brush, halo: undefined };
  paint(graphics, place, doorway(aspect), PALETTE.doorway, brush, true);
  if (open > 0) inside?.();
  // The leaf, folded towards its hinge as it swings open.
  const fold = 1 - LEAF_FOLD * open;
  const leafPlace: Place = ({ x, y }) =>
    place({ x: -0.5 + (x + 0.5) * fold, y });
  paint(graphics, leafPlace, doorway(aspect), PALETTE.wood, inner);
  graphics.lineStyle(
    Math.max(inner.lighting.hairline, inner.ink * 0.5),
    inner.tone(innerInk(PALETTE.wood)),
  );
  for (const x of [-1 / 6, 1 / 6]) {
    const line = [
      { x, y: 0.06 },
      { x, y: aspect - 0.5 + Math.sqrt(0.25 - x * x) - 0.08 },
    ].map((point) => leafPlace(point));
    graphics.lineBetween(
      line[0]?.x ?? 0,
      line[0]?.y ?? 0,
      line[1]?.x ?? 0,
      line[1]?.y ?? 0,
    );
  }
  paint(
    graphics,
    leafPlace,
    ellipse({ x: 0.3, y: aspect * 0.42 }, 0.085),
    PALETTE.doorKnob,
    inner,
  );
}

/** A window's frame on a mushroom's cap, `grown` of its size round its slot's middle. */
export function windowPlace(
  genes: MushroomGenes,
  size: number,
  slot: Point,
  grown: number,
): Place {
  const place = capOnCanvas(genes, size);
  const side = PANE * grown;
  return ({ x, y }) => place({ x: slot.x + x * side, y: slot.y + y * side });
}

/** `door`'s frame on its mushroom's stem, `grown` of its size round its middle; and its aspect. */
function doorFrame(
  door: DoorPlace,
  size: number,
  grown: number,
): { place: Place; aspect: number } {
  const canvas = toCanvas(size);
  const stem = onStem(door, grown);
  return {
    aspect: door.height / door.width,
    place: (point) => canvas(stem(point)),
  };
}

/** How far a piece has popped in: from 0, past its size, and back to 1. */
type Popped = { popped: number };
/** A window as the house paints it, and how far a worm's trip has it open. */
export type ShownWindow = Popped & { kind: WindowKind; swing?: WindowSwing };
/** A door as the house paints it: where on the stem it stands, and how open. */
export type ShownDoor = Popped & Peeking & Opened & { station: DoorPlace };

/** A mushroom's windows on its cap, each in its slot of `windowSlots` in the order it was put in; one not popped in is left out. */
export function paintWindows(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
  brush: Brush,
): void {
  const slots = windowSlots(genes);
  const onCap = {
    ...brush,
    halo: haloFor(PALETTE.wood, brush.tone(mushroomTints(genes).cap)),
  };
  for (const [index, { kind, popped, swing }] of windows.entries()) {
    const slot = slots[index];
    if (!slot || popped <= 0) continue;
    const place = windowPlace(genes, size, slot, popped);
    paintWindow(graphics, kind, place, onCap, swing);
  }
}

/**
 * A mushroom's windows and door, painted into `graphics` in the frame
 * `drawMushroom` paints it in — the foot at the graphics' own position — so
 * they go wherever the mushroom does. Each window in its slot of
 * `windowSlots`, in the order it was put in; the door at its station on the
 * stem, with the mouse in its doorway while it is open; and `worm`, out of
 * a window, over the windows.
 */
export function paintHouse(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
  door: ShownDoor | undefined,
  brush: Brush,
  worm?: ShownWorm,
): void {
  paintWindows(graphics, genes, size, windows, brush);
  if (worm) paintWorm(graphics, genes, size, worm, brush);
  if (!door || door.popped <= 0) return;
  const tints = mushroomTints(genes);
  const { place, aspect } = doorFrame(door.station, size, door.popped);
  const onItsStem = {
    ...brush,
    halo: haloFor(PALETTE.woodDeep, brush.tone(tints.stem)),
  };
  paintDoor(graphics, place, aspect, door.open, onItsStem, () => {
    paintMouse(graphics, place, doorway(aspect), door, brush);
  });
}
