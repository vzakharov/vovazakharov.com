import type * as Phaser from 'phaser';

import { type Box, boxAround, type Point } from '../../model/geometry';
import { windowSlots } from '../../model/house';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { mix } from './colour';
import { paintWindows, type ShownWindow, windowPlace } from './draw-house';
import { DUSK_WASH_DEEPEST } from './dusk-view';
import type { DrawnMushroom } from './hit-areas';
import { drawnHolds } from './mushroom-tap';
import { mushroomTints } from './mushroom-tints';
import { PALETTE } from './palette';
import type { Brush } from './shapes';

/** The halo round a lit window: how far it reaches past the window's middle, in the window's side; its rings, each laid at `HALO_ALPHA` over the ones outside it. */
const HALO_REACH = 1.3;
const HALO_RINGS = 8;
const HALO_ALPHA = 0.05;

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

/** Each of `windows` popped in, as its middle and its side, in the house's own frame. */
function litWindows(
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
): Array<{ middle: Point; side: number }> {
  const slots = windowSlots(genes);
  return windows.flatMap(({ popped }, index) => {
    const slot = slots[index];
    if (!slot || popped <= 0) return [];
    const place = windowPlace(genes, size, slot, popped);
    const middle = place({ x: 0, y: 0 });
    const edge = place({ x: 0.5, y: 0 });
    return [
      { middle, side: Math.hypot(edge.x - middle.x, edge.y - middle.y) * 2 },
    ];
  });
}

/**
 * The box round everything `drawGlow` lays for `windows`, in the house's own
 * frame: each window's outermost halo ring, and `ink` either way of it for
 * the frame's own halo where it pokes past; `undefined` with none popped in.
 */
function glowBox(
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
  ink: number,
): Box | undefined {
  const lit = litWindows(genes, size, windows);
  if (lit.length === 0) return undefined;
  return boxAround(
    lit.flatMap(({ middle: { x, y }, side }) => {
      const reach = side * HALO_REACH + ink * 2;
      return [
        { x: x - reach, y: y - reach },
        { x: x + reach, y: y + reach },
      ];
    }),
  );
}

/**
 * `windows` lit, into `graphics` in their house's frame: each pane amber in a
 * soft halo, and its frame and the cap's edge round it toned as the dusk wash
 * at its deepest leaves the house under it, so a window fully lit sits on its
 * house seamlessly. A window not popped in is left to the house.
 */
function drawGlow(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  windows: readonly ShownWindow[],
  brush: Brush,
): void {
  const lit = brush.tone(PALETTE.windowLit);
  for (const { middle, side } of litWindows(genes, size, windows)) {
    graphics.fillStyle(lit, HALO_ALPHA);
    for (let ring = HALO_RINGS; ring > 0; ring--) {
      const reach = 0.5 + ((HALO_REACH - 0.5) * ring) / HALO_RINGS;
      graphics.fillCircle(middle.x, middle.y, side * reach);
    }
  }
  const washed = (colour: number) =>
    mix(brush.tone(colour), PALETTE.duskWash, DUSK_WASH_DEEPEST);
  paintWindows(
    graphics,
    genes,
    size,
    windows,
    {
      ...brush,
      tone: (colour) => {
        if (colour === PALETTE.windowPane) return lit;
        if (colour === PALETTE.windowShine) return brush.tone(colour);
        return washed(colour);
      },
    },
    brush.tone(mushroomTints(genes).cap),
  );
}

/** How many glows the game has made, which keys each one's texture apart. */
let made = 0;

/**
 * A house's lit windows (`drawGlow`) as a picture: painted into a canvas
 * texture of its own only when `paint` is called, and shown as one image
 * laid over the house, so a frame costs a textured quad rather than the
 * halo's rings tessellated afresh. The texture is the glow's alone and goes
 * with it (`destroy`).
 */
export class WindowGlow {
  readonly image: Phaser.GameObjects.Image;
  private readonly texture: Phaser.Textures.CanvasTexture;
  /** What a paint is drawn into before it is rasterized into the texture; never on the display list. */
  private readonly scratch: Phaser.GameObjects.Graphics;
  /** Texels per unit of the house's own frame at the last paint. */
  private texels = 1;
  /** Whether the last paint had no window popped in, so there is nothing to show. */
  private blank = true;

  constructor(scene: Phaser.Scene) {
    made += 1;
    const key = `window-glow-${String(made)}`;
    const texture = scene.textures.createCanvas(key, 1, 1);
    if (!texture) throw new Error(`A window glow's texture ${key} taken`);
    this.texture = texture;
    this.scratch = scene.make.graphics({}, false);
    this.image = scene.add.image(0, 0, texture).setVisible(false);
  }

  /**
   * Paints `windows` lit (`drawGlow`) into the texture at `texels` per unit
   * of the house's own frame: whatever lands on the screen at that many
   * device pixels a unit lands one texel to a pixel.
   */
  paint(
    genes: MushroomGenes,
    size: number,
    windows: readonly ShownWindow[],
    brush: Brush,
    texels: number,
  ): void {
    const { scratch, texture, image } = this;
    const box = glowBox(genes, size, windows, brush.ink);
    this.blank = box === undefined;
    if (!box) {
      image.setVisible(false);
      return;
    }
    const width = Math.max(1, Math.ceil((box.right - box.left) * texels));
    const height = Math.max(1, Math.ceil((box.bottom - box.top) * texels));
    texture.setSize(width, height);
    texture.clear(0, 0, width, height, false);
    scratch.clear().setScale(texels).translateCanvas(-box.left, -box.top);
    drawGlow(scratch, genes, size, windows, brush);
    scratch.generateTexture(texture.canvas, width, height);
    texture.refresh();
    this.texels = texels;
    image
      .setTexture(texture.key)
      .setDisplayOrigin(-box.left * texels, -box.top * texels);
  }

  /** Shows the glow at `alpha` and `depth`, laid over `house` in its transform; hidden when `shown` is false or the last paint had nothing lit. */
  follow(
    house: Phaser.GameObjects.Graphics,
    shown: boolean,
    alpha: number,
    depth: number,
  ): void {
    const { image, texels, blank } = this;
    image.setVisible(shown && !blank);
    if (!image.visible) return;
    image
      .setAlpha(alpha)
      .setDepth(depth)
      .setPosition(house.x, house.y)
      .setScale(house.scaleX / texels, house.scaleY / texels)
      .setRotation(house.rotation);
  }

  destroy(): void {
    this.image.destroy();
    this.scratch.destroy();
    this.texture.destroy();
  }
}
