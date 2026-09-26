import * as Phaser from 'phaser';

import {
  firstMushrooms,
  type Mushroom,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { splayed } from '../../model/mushroom-pose';
import { mulberry32 } from '../../model/random';
import { drawMushroom } from './draw-mushroom';
import { type MeadowLayout, meadowLayout } from './layout';
import { paintBackdrop } from './paint-backdrop';

/** The registry key the host writes the device pixel ratio under. */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/**
 * The meadow. Everything that varies between visits comes from one seed, so a
 * resize repaints the same meadow rather than a new one — into the objects
 * already on screen, so whatever is animating them carries on.
 */
export class MeadowScene extends Phaser.Scene {
  private readonly visitSeed = Math.floor(Math.random() * 2 ** 32);
  private mushrooms: Mushroom[] = [];
  private backdrop: Phaser.GameObjects.Graphics[] = [];
  private readonly mushroomGraphics = new Map<
    string,
    Phaser.GameObjects.Graphics
  >();

  constructor() {
    super('meadow');
  }

  create(): void {
    this.mushrooms = firstMushrooms(mulberry32(this.visitSeed));
    this.paint();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.paint, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.scale.off(Phaser.Scale.Events.RESIZE, this.paint, this),
    );
  }

  /**
   * The canvas is sized in device pixels for a sharp picture on a dense
   * screen; the camera's zoom brings the world back to CSS pixels, which is
   * what the layout is written in.
   */
  private readonly paint = (): void => {
    const ratio = Number(this.registry.get(PIXEL_RATIO_KEY) ?? 1);
    this.cameras.main.setOrigin(0, 0).setZoom(ratio);
    const layout = meadowLayout(
      this.scale.width / ratio,
      this.scale.height / ratio,
    );
    // Its own stream, so the backdrop never shifts the mushrooms' seeds.
    this.backdrop = paintBackdrop(
      this,
      this.backdrop,
      layout,
      mulberry32(this.visitSeed ^ 0x5e_ed),
    );
    this.paintMushrooms(layout);
  };

  private paintMushrooms({ mushrooms }: MeadowLayout): void {
    for (const [index, mushroom] of this.mushrooms.entries()) {
      const place = mushrooms[index];
      if (!place) continue;
      const { x, y, size, splay } = place;
      const { genes, turn } = splayed(mushroomGenes(mushroom), splay);
      const graphics =
        this.mushroomGraphics.get(mushroom.id) ?? this.add.graphics();
      this.mushroomGraphics.set(mushroom.id, graphics);
      graphics.clear().setPosition(x, y).setRotation(turn);
      drawMushroom(graphics, genes, size);
    }
  }
}
