import * as Phaser from 'phaser';

import type { Meadow } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import { shake, wobble } from '../../model/motion';
import {
  containsCircle,
  type WithCircleHit,
  type WithGraphics,
} from './hit-areas';
import { tapReach } from './sky-layout';

/** How deep a pressed button sinks in, against a mushroom's squash. */
const PRESS_DEPTH = 0.6;
/** A head shake's reach to either side, in the button's radii, and its turn in radians. */
const SHAKE_REACH = 0.3;
const SHAKE_TURN = 0.25;
/** A control that cannot act now, faded; a tap on it still shakes its head. */
export const DIMMED_ALPHA = 0.4;

export type Button = WithGraphics &
  WithCircleHit & {
    /** Where the layout stands it; each frame's movement is an offset from here. */
    home: Circle;
    pressedAt: number;
    /** When it last shook its head at a tap it could not act on. */
    refusedAt: number;
  };

/** Whether a control can act on `meadow`. */
export type Able = (meadow: Meadow) => boolean;

/**
 * Makes buttons that press in and `act` when tapped while `can` holds for the
 * meadow `meadow()` returns, and shake their heads and `refuse` when it does
 * not.
 */
export function buttonMaker(
  scene: Phaser.Scene,
  depth: number,
  now: () => number,
  meadow: () => Meadow | undefined,
  refuse: () => void,
): (act: () => void, can?: Able) => Button {
  return (act, can = () => true) => {
    const hit = new Phaser.Geom.Circle();
    const graphics = scene.add
      .graphics()
      .setDepth(depth)
      .setInteractive(hit, containsCircle);
    const button: Button = {
      graphics,
      hit,
      home: { x: 0, y: 0, r: 0 },
      pressedAt: -Infinity,
      refusedAt: -Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      const shown = meadow();
      if (shown && !can(shown)) {
        button.refusedAt = now();
        refuse();
        return;
      }
      button.pressedAt = now();
      act();
    });
    return button;
  };
}

/** Sets `button` at `x, y` and `grown` of its size, pressing or shaking as its last tap has it. */
export function standButton(
  button: Button,
  t: number,
  { x, y }: Point,
  grown: number,
): void {
  const no = shake(t - button.refusedAt);
  const press = 1 + wobble(t - button.pressedAt) * PRESS_DEPTH;
  button.graphics
    .setVisible(grown > 0)
    .setPosition(x + no * button.home.r * SHAKE_REACH, y)
    .setRotation(no * SHAKE_TURN)
    .setScale(press * grown);
}

export function placeButton(button: Button, home: Circle): void {
  button.home = home;
  button.graphics.setPosition(home.x, home.y);
  button.hit.setTo(0, 0, tapReach(home.r));
}
