import * as Phaser from 'phaser';

import { isFull, type Meadow } from '../../model/game';
import type { Circle } from '../../model/geometry';
import { emerge, wobble } from '../../model/motion';
import { CAP_KINDS, type CapKind } from '../../model/mushroom-genes';
import { containsCircle } from './hit-areas';
import { drawCapButton, drawGrowButton, drawMuteButton } from './hud';
import { type MeadowLayout, TAP_RADIUS } from './layout';

/** How deep a pressed button sinks in, against a mushroom's squash. */
const PRESS_DEPTH = 0.6;
/** How far apart the picker's buttons come up, one after another. */
const PICK_STAGGER = 0.07;
/** A button that would do nothing now, shown faded but still pressable. */
const DIMMED_ALPHA = 0.4;

export type ControlHandlers = {
  mute: () => void;
  pick: () => void;
  remove: () => void;
  grow: (cap: CapKind) => void;
};

type Button = {
  graphics: Phaser.GameObjects.Graphics;
  hit: Phaser.Geom.Circle;
  pressedAt: number;
  /** When it came up, for the picker's buttons; `-Infinity` for the rest. */
  shownAt: number;
};

/**
 * The buttons over the meadow: mute, `+` and `−`, and the picker's four caps.
 * Each is drawn by code, presses in when tapped whether or not it can act, and
 * sits above everything at `depth`.
 */
export class Controls {
  private readonly mute: Button;
  private readonly plus: Button;
  private readonly minus: Button;
  private readonly picker: Button[];
  private picking = false;
  private readonly scene: Phaser.Scene;
  private readonly now: () => number;
  private readonly depth: number;

  constructor(
    scene: Phaser.Scene,
    handlers: ControlHandlers,
    now: () => number,
    depth: number,
  ) {
    this.scene = scene;
    this.now = now;
    this.depth = depth;
    this.mute = this.button(handlers.mute);
    this.plus = this.button(handlers.pick);
    this.minus = this.button(handlers.remove);
    this.picker = CAP_KINDS.map((cap) =>
      this.button(() => {
        handlers.grow(cap);
      }),
    );
  }

  /** Draws every button where `layout` puts it, as `meadow` leaves it. */
  paint(layout: MeadowLayout, meadow: Meadow, muted: boolean): void {
    this.place(this.mute, layout.mute);
    drawMuteButton(this.mute.graphics, layout.mute.r, muted);
    this.place(this.plus, layout.plus);
    drawGrowButton(this.plus.graphics, layout.plus.r, 1);
    this.plus.graphics.setAlpha(isFull(meadow) ? DIMMED_ALPHA : 1);
    this.place(this.minus, layout.minus);
    drawGrowButton(this.minus.graphics, layout.minus.r, -1);
    this.minus.graphics.setAlpha(meadow.selected === undefined ? DIMMED_ALPHA : 1);
    const opening = meadow.picking && !this.picking;
    this.picking = meadow.picking;
    for (const [index, button] of this.picker.entries()) {
      const at = layout.picker[index];
      const cap = CAP_KINDS[index];
      if (!at || !cap) continue;
      this.place(button, at);
      drawCapButton(button.graphics, at.r, cap);
      if (opening) button.shownAt = this.now() + index * PICK_STAGGER;
      button.graphics.setVisible(meadow.picking);
      if (meadow.picking) button.graphics.setInteractive();
      else button.graphics.disableInteractive();
    }
  }

  update(t: number): void {
    for (const button of [this.mute, this.plus, this.minus, ...this.picker]) {
      const press = 1 + wobble(t - button.pressedAt) * PRESS_DEPTH;
      // A picker button waiting its turn in the stagger has not come up yet.
      const since = t - button.shownAt;
      button.graphics.setScale(since < 0 ? 0 : press * emerge(since));
    }
  }

  private place(button: Button, { x, y, r }: Circle): void {
    button.graphics.setPosition(x, y);
    button.hit.setTo(0, 0, Math.max(r, TAP_RADIUS));
  }

  private button(act: () => void): Button {
    const hit = new Phaser.Geom.Circle();
    const graphics = this.scene.add
      .graphics()
      .setDepth(this.depth)
      .setInteractive(hit, containsCircle);
    const button: Button = {
      graphics,
      hit,
      pressedAt: -Infinity,
      shownAt: -Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      button.pressedAt = this.now();
      act();
    });
    return button;
  }
}
