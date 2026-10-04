import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { windowSlots } from '../../model/house';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { mix } from './colour';
import { paintWindows, type ShownWindow, windowPlace } from './draw-house';
import { DUSK_WASH_DEEPEST } from './dusk-view';
import type { DrawnMushroom } from './hit-areas';
import { drawnHolds } from './mushroom-tap';
import { PALETTE } from './palette';
import type { Brush } from './shapes';

/** The halo round a lit window: how far it reaches past the window's middle, in the window's side; its rings, each laid at `HALO_ALPHA` over the ones outside it. */
const HALO_REACH = 1.1;
const HALO_RINGS = 4;
const HALO_ALPHA = 0.1;

/** Where each of `windows` has its middle on the cap, in the house's own frame; `undefined` for one with no slot. */
export function windowMiddles(
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
): Array<Point | undefined> {
  const slots = windowSlots(genes);
  return windows.map(({ popped }, index) => {
    const slot = slots[index];
    return slot && windowPlace(genes, size, slot, popped)({ x: 0, y: 0 });
  });
}

/** Whether one of `mushrooms` drawn nearer than `depth` stands over `at`, a point in the world. */
export function coveredAt(
  mushrooms: readonly DrawnMushroom[],
  at: Point,
  depth: number,
): boolean {
  return mushrooms.some(({ object, area }) => {
    if (object.depth <= depth) return false;
    const { x, y } = object.getWorldTransformMatrix().applyInverse(at.x, at.y);
    return drawnHolds(area, { x, y });
  });
}

/**
 * `windows` lit, into `graphics` laid over their house in its frame: each
 * pane amber in a soft halo, and its frame and the cap's edge round it toned
 * as the dusk wash at its deepest leaves the house under it, so a window
 * fully lit sits on its house seamlessly. A window not popped in is left to
 * the house.
 */
export function paintGlow(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
  brush: Brush,
): void {
  graphics.clear();
  const lit = brush.tone(PALETTE.windowLit);
  const slots = windowSlots(genes);
  for (const [index, { popped }] of windows.entries()) {
    const slot = slots[index];
    if (!slot || popped <= 0) continue;
    const place = windowPlace(genes, size, slot, popped);
    const middle = place({ x: 0, y: 0 });
    const edge = place({ x: 0.5, y: 0 });
    const side = Math.hypot(edge.x - middle.x, edge.y - middle.y) * 2;
    graphics.fillStyle(lit, HALO_ALPHA);
    for (let ring = HALO_RINGS; ring > 0; ring--) {
      const reach = 0.5 + ((HALO_REACH - 0.5) * ring) / HALO_RINGS;
      graphics.fillCircle(middle.x, middle.y, side * reach);
    }
  }
  const washed = (colour: number) =>
    mix(brush.tone(colour), PALETTE.duskWash, DUSK_WASH_DEEPEST);
  paintWindows(graphics, genes, size, windows, {
    ...brush,
    tone: (colour) => {
      if (colour === PALETTE.windowPane) return lit;
      if (colour === PALETTE.windowShine) return brush.tone(colour);
      return washed(colour);
    },
  });
}
