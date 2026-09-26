import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { PALETTE } from './palette';

/** Dots in the outer ring; the inner ring has half as many, between them. */
const RING_DOTS = 12;
const PUFF_SECONDS = 0.9;

/**
 * A puff of spores from `at`: two rings of dots, the second half a step round
 * from the first, opening to `reach` as they drift up and fade. Each dot is
 * destroyed when its tween ends.
 */
export function puffSpores(
  scene: Phaser.Scene,
  at: Point,
  reach: number,
  depth: number,
): void {
  const turn = Math.random() * Math.PI * 2;
  for (const [count, spread, radius, offset] of [
    [RING_DOTS, 1, 0.06, 0],
    [RING_DOTS / 2, 0.55, 0.08, 0.5],
  ] as const) {
    for (let index = 0; index < count; index++) {
      const angle = turn + ((index + offset) * Math.PI * 2) / count;
      const dot = scene.add
        .circle(at.x, at.y, reach * radius, PALETTE.spore)
        // An inked rim, so a pale spore still reads against the sky.
        .setStrokeStyle(Math.max(1, reach * 0.012), PALETTE.ink, 0.45)
        .setDepth(depth)
        .setScale(0.6);
      scene.tweens.add({
        targets: dot,
        x: at.x + Math.cos(angle) * reach * spread,
        // Opening flatter than a circle and drifting up, as a light thing would.
        y: at.y + Math.sin(angle) * reach * spread * 0.6 - reach * 0.35,
        scale: 1.1,
        alpha: 0,
        duration: PUFF_SECONDS * 1000,
        ease: Phaser.Math.Easing.Cubic.Out,
        onComplete: () => {
          dot.destroy();
        },
      });
    }
  }
}
