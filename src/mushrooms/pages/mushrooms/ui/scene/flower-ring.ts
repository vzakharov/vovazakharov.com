import type * as Phaser from 'phaser';

import { standAt, type Standing } from './bed-place';
import { PALETTE } from './palette';

/**
 * The ring's half-width and its stroke, in the held flower's head radius, and
 * its height in its width: flat, as a circle on the ground is seen.
 */
const RING_HALF = 0.8;
const RING_STROKE = 0.16;
const RING_FLAT = 0.34;
/** How much nearer than its flower the ring is drawn: under the stem, over the ground round it. */
const NEARER = -0.4;

/** A flower as the ring is drawn under it: where it stands, and its head's radius as laid out. */
export type Ringed = Standing & { headR: number };

/**
 * The ring on the ground where the stem of the flower the picker is open on
 * enters it: one plain stroke, plainer than a selected mushroom's band and
 * ring, standing and scaling as the flower does.
 */
export class FlowerRing {
  private readonly graphics: Phaser.GameObjects.Graphics;
  /** The head radius it was last drawn for, so a frame redraws it only when that changes. */
  private drawnFor: number | undefined;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setVisible(false);
  }

  /** Stands the ring under `ringed` this frame, or hides it with none. */
  stand(ringed: Ringed | undefined): void {
    const { graphics, drawnFor } = this;
    if (!ringed) {
      graphics.setVisible(false);
      return;
    }
    const { stands, headR } = ringed;
    if (headR !== drawnFor) {
      this.drawnFor = headR;
      const half = headR * RING_HALF;
      graphics
        .clear()
        .lineStyle(Math.max(2, headR * RING_STROKE), PALETTE.heldFlower)
        .strokeEllipse(0, 0, half * 2, half * 2 * RING_FLAT);
    }
    standAt(graphics, stands, NEARER);
    graphics.setScale(stands.zoom);
  }
}
