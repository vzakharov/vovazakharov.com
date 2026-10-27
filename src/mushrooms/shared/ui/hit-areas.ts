import * as Phaser from 'phaser';

import { containsPoint, type Point } from '../lib/geometry';
import type { Tapped } from '../lib/motion';

export type Graphic = { object: Phaser.GameObjects.Graphics };
export type WithCircleHit = { hit: Phaser.Geom.Circle };
/** A creature shown as a container of its parts, answering a tap on a circle. */
export type CircleFigure = WithCircleHit & {
  container: Phaser.GameObjects.Container;
};
/** A `CircleFigure` set moving by its tap. */
export type TappedFigure = Tapped & CircleFigure;

export function containsOutline(area: readonly Point[], x: number, y: number) {
  return area.length > 2 && containsPoint(area, { x, y });
}

export function containsCircle(area: Phaser.Geom.Circle, x: number, y: number) {
  return Phaser.Geom.Circle.Contains(area, x, y);
}
