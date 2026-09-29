import * as Phaser from 'phaser';

import { containsPoint, type Point } from '../../model/geometry';
import type { Tapped } from '../../model/motion';
import { TAP_PARTS, type TapArea } from '../../model/mushroom-outline';
import {
  drawnHolds,
  fingerPad,
  type MushroomTarget,
  tappedMushroom,
} from './mushroom-tap';

export type WithGraphics = { graphics: Phaser.GameObjects.Graphics };
export type WithCircleHit = { hit: Phaser.Geom.Circle };
/** A creature shown as a container of its parts, answering a tap on a circle and set moving by it. */
export type TappedFigure = Tapped &
  WithCircleHit & { container: Phaser.GameObjects.Container };

/**
 * Hit tests, bound for use as an object's hit callback. A mushroom's area is
 * its `tapArea` in its graphics' own canvas frame, pixels with y down: what is
 * drawn there, and round a mushroom smaller than a finger its `fingerPad`,
 * which answers only where no mushroom's drawn parts hold the tap and this
 * pad's middle is the nearest (`tappedMushroom`). Where drawn parts hold it,
 * Phaser hands it to the front-most object that answers.
 */
export function containsMushroom(
  area: TapArea,
  x: number,
  y: number,
  mushroom: Phaser.GameObjects.GameObject,
) {
  if (drawnHolds(area, { x, y })) return true;
  if (!fingerPad(area) || !(mushroom instanceof Phaser.GameObjects.Graphics))
    return false;
  const finger = mushroom
    .getWorldTransformMatrix()
    .transformPoint(x, y, { x: 0, y: 0 });
  return (
    tappedMushroom(finger, shownMushrooms(mushroom.scene))?.of === mushroom
  );
}

/** The scene's mushrooms that take a tap, back to front as they are painted. */
function shownMushrooms(
  scene: Phaser.Scene,
): Array<MushroomTarget & { of: Phaser.GameObjects.Graphics }> {
  return scene.children.list
    .flatMap((object) => {
      const input = object.input;
      const area: unknown = input?.hitArea;
      return object instanceof Phaser.GameObjects.Graphics &&
        object.visible &&
        input?.enabled === true &&
        input.hitAreaCallback === containsMushroom &&
        isTapArea(area)
        ? [{ object, area }]
        : [];
    })
    .toSorted((a, b) => a.object.depth - b.object.depth)
    .map(({ object, area }) => ({
      of: object,
      area,
      local: ({ x, y }: Point) => {
        const { x: lx, y: ly } = object
          .getWorldTransformMatrix()
          .applyInverse(x, y);
        return { x: lx, y: ly };
      },
    }));
}

/** Whether a hit area `containsMushroom` is bound to holds a mushroom's parts, as `MushroomBed` fills them in. */
function isTapArea(value: unknown): value is TapArea {
  return (
    typeof value === 'object' &&
    value !== null &&
    TAP_PARTS.every((part) => Array.isArray(Reflect.get(value, part)))
  );
}

export function containsOutline(area: readonly Point[], x: number, y: number) {
  return area.length > 2 && containsPoint(area, { x, y });
}

export function containsCircle(area: Phaser.Geom.Circle, x: number, y: number) {
  return Phaser.Geom.Circle.Contains(area, x, y);
}
