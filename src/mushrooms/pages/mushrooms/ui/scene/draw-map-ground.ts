import type * as Phaser from 'phaser';

import type { MapFrame } from '../../model/map-frame';
import { mix } from './colour';
import { type GroundBox, mapGround } from './map-ground';
import { fillMottles } from './mottles';
import { PALETTE } from './palette';

/** How far the map's wash goes from the meadow's ground toward its sunlit ground: a lighter green, so the things and the child's marker stand out on it. */
const WASH_LIGHT = 0.5;
/** How far a tuft's outer blades fan from its middle one, and how far apart they root, in CSS px. */
const TUFT_FAN = 0.5;
const TUFT_ROOTS = 1.2;
/** A shaded tuft's alpha: a lit one is drawn whole. */
const SHADED_TUFT = 0.7;

/**
 * Lays the map's ground (`mapGround`) inside `box`: the grass wash, its
 * mottles, then its tufts, each a fan of three blades in the lawn's inks.
 */
export function drawMapGround(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  box: GroundBox,
  seed: number,
): void {
  const { left, right, top, bottom, corner } = box;
  pen
    .fillStyle(mix(PALETTE.ground, PALETTE.groundLit, WASH_LIGHT))
    .fillRoundedRect(left, top, right - left, bottom - top, corner);
  const { mottles, tufts } = mapGround(frame, box, seed);
  fillMottles(pen, mottles);
  for (const { x, y, tall, lean, lit } of tufts) {
    pen.lineStyle(
      1.5,
      lit ? PALETTE.tuft : PALETTE.tuftDark,
      lit ? 1 : SHADED_TUFT,
    );
    for (const blade of [-1, 0, 1]) {
      const angle = lean + blade * TUFT_FAN;
      const reach = blade === 0 ? tall : tall * 0.75;
      const root = x + blade * TUFT_ROOTS;
      pen.lineBetween(
        root,
        y,
        root + Math.sin(angle) * reach,
        y - Math.cos(angle) * reach,
      );
    }
  }
}
