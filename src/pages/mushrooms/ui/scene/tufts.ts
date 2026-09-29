/**
 * The grass tufts as the child plants on them: which one a tap lands on, and
 * where on the ground a flower planted there stands. Only a tap nothing else
 * takes reaches the grass (`MeadowScene.tapMeadow`), so a tuft answers where
 * no mushroom, flower, insect or button is drawn.
 */

import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import type { Camera, FlowerFoot } from '../../model/ground';
import type { Random } from '../../model/random';
import { FLOWER_SIZE, groundOf } from './flower-layout';
import { growTufts, paintTufts, type Refusal, type Tuft } from './grass';
import type { MeadowLayout } from './layout';

/**
 * How far round its middle a tuft answers a tap at the least, in CSS px: a
 * small finger's pad round a tuft drawn smaller than one, and no more, so
 * the bare ground between the tufts stays bare.
 */
export const TUFT_REACH = 22;
/** How far round its middle a tuft drawn larger than that answers, in units of its size: its blades. */
const TUFT_BLADES = 1.4;

/** Where a tuft's blades stand thickest: halfway up the middle blade. */
function middleOf({ x, y, size }: Tuft): Point {
  return { x, y: y - size };
}

/** How far round its middle `tuft` answers a tap. */
export function tuftReach({ size }: Tuft): number {
  return Math.max(TUFT_REACH, size * TUFT_BLADES);
}

/** The tuft of `tufts` a tap at `point` lands on: the nearest whose reach holds it. */
export function tuftAt(tufts: readonly Tuft[], point: Point): Tuft | undefined {
  let nearest: Tuft | undefined;
  let least = Infinity;
  for (const tuft of tufts) {
    const middle = middleOf(tuft);
    const away = Math.hypot(middle.x - point.x, middle.y - point.y);
    if (away <= tuftReach(tuft) && away < least) {
      nearest = tuft;
      least = away;
    }
  }
  return nearest;
}

/**
 * The foot on the ground a flower planted on `tuft` stands on, as `camera`
 * shows the tuft: at its root, in a seeded flower's size.
 */
export function tuftFoot(camera: Camera, { x, y }: Tuft): FlowerFoot {
  return { ...groundOf(camera, { x, y, size: 0 }), size: FLOWER_SIZE };
}

/**
 * The meadow's grass on screen: its tufts as the layout grows them, bending
 * in the breeze, the one that last refused a flower shaking its head.
 */
export class Grass {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private tufts: readonly Tuft[] = [];
  private refused: Refusal | undefined;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /** Grows the tufts for `layout` from `random`: the same source regrows the same grass. */
  paint(layout: MeadowLayout, random: Random): void {
    this.tufts = growTufts(layout, random);
  }

  update(t: number): void {
    paintTufts(this.graphics, this.tufts, t, this.refused);
  }

  /** The tuft a tap at `point` lands on (`tuftAt`). */
  at(point: Point): Tuft | undefined {
    return tuftAt(this.tufts, point);
  }

  /** Shakes `tuft`'s head from `now`, in seconds, as it refuses a flower. */
  refuse(tuft: Tuft, now: number): void {
    this.refused = { tuft, shakenAt: now };
  }
}
