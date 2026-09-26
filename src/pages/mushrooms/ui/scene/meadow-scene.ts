import * as Phaser from 'phaser';

import {
  firstMushrooms,
  type Mushroom,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { mulberry32 } from '../../model/random';
import { drawMushroom } from './draw-mushroom';
import { type MeadowLayout, meadowLayout } from './layout';
import { paintBackdrop } from './paint-backdrop';

/** The registry key the host writes the device pixel ratio under. */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/**
 * The meadow, painted once per viewport size. Everything that varies between
 * visits comes from one seed, so a resize repaints the same meadow rather
 * than a new one.
 */
export class MeadowScene extends Phaser.Scene {
  private readonly visitSeed = Math.floor(Math.random() * 2 ** 32);
  private mushrooms: Mushroom[] = [];

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
  private paint(): void {
    const ratio = Number(this.registry.get(PIXEL_RATIO_KEY) ?? 1);
    this.cameras.main.setOrigin(0, 0).setZoom(ratio);
    this.children.removeAll(true);
    const layout = meadowLayout(
      this.scale.width / ratio,
      this.scale.height / ratio,
    );
    // Its own stream, so the backdrop never shifts the mushrooms' seeds.
    paintBackdrop(this, layout, mulberry32(this.visitSeed ^ 0x5e_ed));
    this.paintMushrooms(layout);
  }

  private paintMushrooms({ mushrooms }: MeadowLayout): void {
    this.mushrooms.forEach((mushroom, index) => {
      const place = mushrooms[index];
      if (!place) return;
      const genes = mushroomGenes(mushroom);
      const graphics = this.add.graphics({ x: place.x, y: place.y });
      graphics.setRotation(genes.lean);
      drawMushroom(graphics, genes, place.size);
    });
  }
}
