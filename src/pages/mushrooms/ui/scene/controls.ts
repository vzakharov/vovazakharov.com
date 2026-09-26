import type * as Phaser from 'phaser';

import { canFurnish, isEmpty, isFull, type Meadow } from '../../model/game';
import { type Furnishing, FURNISHINGS } from '../../model/house';
import { CAP_KINDS, type CapKind } from '../../model/mushroom-genes';
import {
  type Button,
  buttonMaker,
  DIMMED_ALPHA,
  placeButton,
  standButton,
} from './button';
import {
  drawCapButton,
  drawFurnishButton,
  drawGrowButton,
  drawHouseButton,
  drawMuteButton,
} from './hud';
import type { MeadowLayout } from './layout';
import { Picker } from './picker';

export type ControlHandlers = {
  mute: () => void;
  pick: () => void;
  remove: () => void;
  grow: (cap: CapKind) => void;
  house: () => void;
  furnish: (piece: Furnishing) => void;
  /** A tap on a control that cannot act. */
  refuse: () => void;
};

/**
 * The buttons over the meadow: mute, `+`, `−` and the house, and the two
 * pickers — the four caps `+` opens and the windows and door the house does.
 * Each presses in when a tap sets it acting; one that cannot act shakes its
 * head instead. A picker comes up one button after another and goes the same
 * way back, a picked cap flying down to where its mushroom grows; the house's
 * stays open for window after window.
 */
export class Controls {
  private readonly mute: Button;
  private readonly plus: Button;
  private readonly minus: Button;
  private readonly house: Button;
  private readonly picker: Picker<CapKind>;
  private readonly housePicker: Picker<Furnishing>;
  /** As of the last paint, which says what each button can do. */
  private meadow: Meadow | undefined;
  private readonly now: () => number;

  constructor(
    scene: Phaser.Scene,
    handlers: ControlHandlers,
    now: () => number,
    depth: number,
  ) {
    this.now = now;
    const button = buttonMaker(
      scene,
      depth,
      now,
      () => this.meadow,
      handlers.refuse,
    );
    this.mute = button(handlers.mute);
    this.plus = button(handlers.pick, (meadow) => !isFull(meadow));
    this.minus = button(handlers.remove, (meadow) => !isEmpty(meadow));
    this.house = button(handlers.house, (meadow) => !isEmpty(meadow));
    this.picker = new Picker(
      {
        items: CAP_KINDS,
        pick: handlers.grow,
        draw: drawCapButton,
        flies: true,
      },
      button,
    );
    this.housePicker = new Picker(
      {
        items: FURNISHINGS,
        pick: handlers.furnish,
        can: canFurnish,
        draw: drawFurnishButton,
        flies: false,
      },
      button,
    );
  }

  /** Draws every button where `layout` puts it, as `meadow` leaves it. */
  paint(layout: MeadowLayout, meadow: Meadow, muted: boolean): void {
    this.meadow = meadow;
    placeButton(this.mute, layout.mute);
    drawMuteButton(this.mute.graphics, layout.mute.r, muted);
    placeButton(this.plus, layout.plus);
    drawGrowButton(this.plus.graphics, layout.plus.r, 1);
    this.plus.graphics.setAlpha(isFull(meadow) ? DIMMED_ALPHA : 1);
    placeButton(this.minus, layout.minus);
    drawGrowButton(this.minus.graphics, layout.minus.r, -1);
    this.minus.graphics.setAlpha(isEmpty(meadow) ? DIMMED_ALPHA : 1);
    placeButton(this.house, layout.house);
    drawHouseButton(this.house.graphics, layout.house.r);
    this.house.graphics.setAlpha(isEmpty(meadow) ? DIMMED_ALPHA : 1);
    const now = this.now();
    // Each picker opens where the other stands, so the one opening sends the other off at once.
    this.picker.paint(
      layout.picker,
      layout.plus,
      meadow.picking,
      now,
      meadow,
      layout.mushrooms,
      meadow.furnishing,
    );
    this.housePicker.paint(
      layout.housePicker,
      layout.house,
      meadow.furnishing,
      now,
      meadow,
      layout.mushrooms,
      meadow.picking,
    );
  }

  update(t: number): void {
    for (const button of [this.mute, this.plus, this.minus, this.house]) {
      standButton(button, t, button.home, 1);
    }
    this.picker.update(t);
    this.housePicker.update(t);
  }
}
