import * as Phaser from 'phaser';

import { containsPoint } from '../../model/geometry';
import type { TapArea } from '../../model/mushroom-outline';

export type WithGraphics = { graphics: Phaser.GameObjects.Graphics };
export type WithCircleHit = { hit: Phaser.Geom.Circle };

/**
 * Hit tests, bound for use as an object's hit callback. A mushroom's area is
 * its `tapArea` in its graphics' own canvas frame, pixels with y down.
 */
export function containsMushroom(area: TapArea, x: number, y: number) {
  return Object.values(area).some((outline) =>
    containsPoint(outline, { x, y }),
  );
}

export function containsCircle(area: Phaser.Geom.Circle, x: number, y: number) {
  return Phaser.Geom.Circle.Contains(area, x, y);
}
