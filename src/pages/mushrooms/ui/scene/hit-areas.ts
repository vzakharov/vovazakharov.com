import * as Phaser from 'phaser';

/** Phaser's hit tests, bound for use as an object's hit callback. */
export function containsRectangle(
  area: Phaser.Geom.Rectangle,
  x: number,
  y: number,
) {
  return Phaser.Geom.Rectangle.Contains(area, x, y);
}

export function containsCircle(area: Phaser.Geom.Circle, x: number, y: number) {
  return Phaser.Geom.Circle.Contains(area, x, y);
}
