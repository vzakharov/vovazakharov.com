import * as Phaser from 'phaser';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import type { Graphic } from '@/mushrooms/shared/ui';

import { TAP_PARTS, type TapArea } from '../fungus/index.node-safe';
import {
  drawnHolds,
  type MushroomTarget,
  type WithTapArea,
} from './mushroom-tap';

/**
 * A mushroom's hit test, bound for use as its graphics' hit callback: its
 * `tapArea` in its graphics' own canvas frame, pixels with y down, at
 * whatever scale the view draws it; Phaser hands a tap to the front-most
 * object that answers.
 */
export function containsMushroom(area: TapArea, x: number, y: number) {
  return drawnHolds(area, { x, y });
}

/** A shown mushroom's graphics and its tap area, in that graphics' own frame. */
export type DrawnMushroom = WithTapArea & Graphic;

/** The scene's mushrooms that take a tap, in the scene's display order. */
export function drawnMushrooms(scene: Phaser.Scene): DrawnMushroom[] {
  return scene.children.list.flatMap((object) => {
    const input = object.input;
    const area: unknown = input?.hitArea;
    return object instanceof Phaser.GameObjects.Graphics &&
      object.visible &&
      input?.enabled === true &&
      input.hitAreaCallback === containsMushroom &&
      isTapArea(area)
      ? [{ object, area }]
      : [];
  });
}

/** The scene's mushrooms that take a tap, back to front as they are painted. */
export function shownMushrooms(scene: Phaser.Scene): MushroomTarget[] {
  return drawnMushrooms(scene)
    .toSorted((a, b) => a.object.depth - b.object.depth)
    .map(({ object, area }) => ({
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
