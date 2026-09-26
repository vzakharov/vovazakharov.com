import * as Phaser from 'phaser';

export type WithGraphics = { graphics: Phaser.GameObjects.Graphics };
export type WithCircleHit = { hit: Phaser.Geom.Circle };

/** A mushroom's tap area: its cap and its stem as two shapes, hugging what is drawn, so it stays off a neighbour close beside it. */
export type MushroomHit = Record<'cap' | 'stem', Phaser.Geom.Polygon>;

/** Phaser's hit tests, bound for use as an object's hit callback. */
export function containsMushroom(area: MushroomHit, x: number, y: number) {
  return (
    Phaser.Geom.Polygon.Contains(area.cap, x, y) ||
    Phaser.Geom.Polygon.Contains(area.stem, x, y)
  );
}

export function containsCircle(area: Phaser.Geom.Circle, x: number, y: number) {
  return Phaser.Geom.Circle.Contains(area, x, y);
}
