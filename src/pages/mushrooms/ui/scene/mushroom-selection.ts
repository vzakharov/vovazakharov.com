import type * as Phaser from 'phaser';

import type { TapArea } from '../../model/mushroom-outline';
import { standAt, type Standing } from './bed-place';
import {
  drawSelection,
  drawSelectionRing,
  type RingGraphics,
} from './draw-mushroom';
import type { Body } from './house-view';

/**
 * How much nearer than its mushroom each part of the selection is drawn: the
 * band between the ring's edge and its yellow, all of it over the shadow.
 */
const NEARER = { ringEdge: -0.4, band: -0.3, ringTop: -0.2 };

/** A mushroom as the selection is drawn round it: where it stands on the screen, and where it takes taps. */
export type Selected = Pick<Body, 'graphics' | 'genes' | 'size' | 'turn'> &
  Standing & { hit: TapArea };

/**
 * The selected mushroom's band, set each frame to its graphics' own pose so
 * it moves as the mushroom does, and its ring on the ground, which says which
 * of two crossed mushrooms it is.
 */
export class MushroomSelection {
  private readonly outline: Phaser.GameObjects.Graphics;
  private readonly footRing: RingGraphics;

  constructor(scene: Phaser.Scene) {
    this.outline = scene.add.graphics().setVisible(false);
    this.footRing = {
      edge: scene.add.graphics().setVisible(false),
      band: scene.add.graphics().setVisible(false),
    };
  }

  /**
   * Paints the band round `selected`, just behind it, and its ring over its
   * shadow and under its stem: the ring's edge under the band, its yellow over
   * it (`RingGraphics`). With none selected, both hide.
   */
  paint(selected: Selected | undefined): void {
    const { edge, band } = this.footRing;
    for (const graphics of [this.outline, edge, band]) {
      graphics.clear().setVisible(selected !== undefined);
    }
    if (!selected) return;
    const { genes, size, turn, hit } = selected;
    this.stand(selected);
    drawSelection(this.outline, hit, size);
    drawSelectionRing(this.footRing, genes, size, turn, hit.stem);
  }

  /** Stands the band and ring where `selected` stands. */
  stand({ stands }: Selected): void {
    standAt(this.outline, stands, NEARER.band);
    standAt(this.footRing.edge, stands, NEARER.ringEdge);
    standAt(this.footRing.band, stands, NEARER.ringTop);
  }

  /** Takes `selected`'s pose this frame. */
  pose({ graphics }: Selected): void {
    this.outline
      .setPosition(graphics.x, graphics.y)
      .setScale(graphics.scaleX, graphics.scaleY)
      .setRotation(graphics.rotation);
    // As wide as the foot it rings, which widens as the mushroom squashes.
    for (const ring of Object.values(this.footRing)) {
      ring.setScale(graphics.scaleX);
    }
  }
}
