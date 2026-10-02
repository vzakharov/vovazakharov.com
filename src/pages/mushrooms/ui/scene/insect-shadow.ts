/**
 * The round shadow a flying insect casts on the ground under it, so a near
 * one and a far one read apart: a flat ellipse, never the insect's outline,
 * lying on the ground at its plane point as anything standing there would —
 * sized and foreshortened by its distance, fainter in the haze, sorted among
 * the beds by its row and sunk under the brow with them.
 */

import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { EYE_HEIGHT, type Layered } from '../../model/ground';
import { depthOf, UNPLACED } from './bed-place';
import type { ShadowLayer } from './mushroom-light';
import { PALETTE } from './palette';
import { hazeAhead } from './repaint-queue';
import {
  behindHills,
  onScreen,
  type Placed,
  sunk,
  sunkAway,
  type View,
} from './view';

/** How wide a shadow lies, against the insect's open wings. */
const ACROSS = 0.6;
/** The flattest a shadow is drawn near the eye: its height against its width. */
const ROUNDEST = 0.6;
/** How dark a shadow is at its full, before the haze takes it. */
const ALPHA = 0.32;
/** How much nearer than the ground it lies on a shadow is drawn: behind whatever stands on its row. */
const NEARER = -0.5;
/** The half width the shadow is drawn at before it is scaled, in CSS px. */
const DRAWN_HALF = 32;

/** A shadow as `view` lays it on the screen, in CSS px, at what depth, and how dark. */
export type ShadowPlace = ShadowLayer & Pick<Placed, 'y'> & Layered;

/**
 * Where `view` lays the shadow of an insect `span` CSS px across at its own
 * size over the ground `ground` (`ofGround`'s place, before it sinks), as
 * dark as `presence` of its full: none once it has sunk away under the
 * brow (`sunkAway`) or where it lies off the screen.
 */
export function shadowOf(
  view: View,
  ground: Placed,
  span: number,
  presence: number,
): ShadowPlace | undefined {
  if (!(presence > 0) || !(ground.ahead > 0)) return undefined;
  const drawn = sunk(view, ground);
  const across = span * ground.zoom * ACROSS;
  const tall = across * Math.min(ROUNDEST, EYE_HEIGHT / ground.ahead);
  const bottom = { ...drawn, y: drawn.y + tall / 2 };
  if (sunkAway(view, bottom, tall) || !onScreen(view, drawn, -across)) {
    return undefined;
  }
  const behind = behindHills(ground);
  return {
    ...pick(drawn, 'x', 'y'),
    across,
    tall,
    alpha: ALPHA * presence * (1 - hazeAhead(view, ground)),
    depth: depthOf({ ...UNPLACED, depth: ground.y, behind }, NEARER),
  };
}

/** The insects' shadows, one ellipse each by the insect's id, drawn once and placed every frame. */
export class InsectShadows {
  private readonly scene: Phaser.Scene;
  private readonly shadows = new Map<string, Phaser.GameObjects.Graphics>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Lays `id`'s shadow where `place` says, or hides it for none. */
  lay(id: string, place: ShadowPlace | undefined): void {
    const shadow = this.shadows.get(id) ?? this.add(id);
    shadow.setVisible(place !== undefined);
    if (!place) return;
    const { x, y, across, tall, alpha, depth } = place;
    shadow
      .setPosition(x, y)
      .setScale(across / 2 / DRAWN_HALF, tall / 2 / DRAWN_HALF)
      .setAlpha(alpha)
      .setDepth(depth);
  }

  /** Destroys `id`'s shadow, its insect gone. */
  drop(id: string): void {
    this.shadows.get(id)?.destroy();
    this.shadows.delete(id);
  }

  private add(id: string): Phaser.GameObjects.Graphics {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(PALETTE.shadowCool);
    shadow.fillEllipse(0, 0, 2 * DRAWN_HALF, 2 * DRAWN_HALF);
    this.shadows.set(id, shadow);
    return shadow;
  }
}
