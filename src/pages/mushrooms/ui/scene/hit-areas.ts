import * as Phaser from 'phaser';

/** A mushroom's tap area: its cap and its stem, apart, so no box round both covers a neighbour. */
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
