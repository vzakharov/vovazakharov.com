import type * as Phaser from 'phaser';

import { canFurnish, isEmpty, isFull, type Meadow } from '../../model/game';
import { type Furnishing, FURNISHINGS } from '../../model/house';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
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
  drawReleaseButton,
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
  release: (kind: InsectKind) => void;
  /** A tap on a control that cannot act. */
  refuse: () => void;
};

/**
 * The buttons over the meadow: mute, `+`, `−`, the house and one per insect, and the two
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
  /** Each always acts: at its kind's limit, the oldest of the kind makes room. */
  private readonly releases: Record<InsectKind, Button>;
  /** Whether the fly and the bee give way to an open picker (`Controls.yielding`). */
  private yielding = false;
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
    const release = (kind: InsectKind) =>
      button(() => {
        handlers.release(kind);
      });
    this.releases = {
      butterfly: release('butterfly'),
      fly: release('fly'),
      bee: release('bee'),
    };
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

  /**
   * Draws every button where `layout` puts it, as `meadow` leaves it, at
   * `ratio` device pixels to a CSS pixel.
   */
  paint(
    layout: MeadowLayout,
    meadow: Meadow,
    muted: boolean,
    ratio: number,
  ): void {
    this.meadow = meadow;
    placeButton(this.mute, layout.mute, ratio, {
      look: muted ? 'muted' : 'heard',
      draw: (graphics) => {
        drawMuteButton(graphics, layout.mute.r, muted);
      },
    });
    for (const [button, home, sign] of [
      [this.plus, layout.plus, 1],
      [this.minus, layout.minus, -1],
    ] as const) {
      placeButton(button, home, ratio, {
        look: String(sign),
        draw: (graphics, hairline) => {
          drawGrowButton(graphics, home.r, sign, hairline);
        },
      });
    }
    this.plus.face.setAlpha(isFull(meadow) ? DIMMED_ALPHA : 1);
    this.minus.face.setAlpha(isEmpty(meadow) ? DIMMED_ALPHA : 1);
    placeButton(this.house, layout.house, ratio, {
      look: 'house',
      draw: (graphics, hairline) => {
        drawHouseButton(graphics, layout.house.r, hairline);
      },
    });
    this.house.face.setAlpha(isEmpty(meadow) ? DIMMED_ALPHA : 1);
    for (const kind of INSECT_KINDS) {
      const home = layout.releases[kind];
      placeButton(this.releases[kind], home, ratio, {
        look: kind,
        draw: (graphics, hairline) => {
          drawReleaseButton(graphics, home.r, kind, hairline);
        },
      });
    }
    this.yielding = layout.yielding;
    const now = this.now();
    // Each picker opens where the other stands, so the one opening sends the other off at once.
    this.picker.paint(
      layout.picker,
      layout.plus,
      meadow.picking,
      now,
      meadow,
      layout.mushrooms,
      ratio,
      meadow.furnishing,
    );
    this.housePicker.paint(
      layout.housePicker,
      layout.house,
      meadow.furnishing,
      now,
      meadow,
      layout.mushrooms,
      ratio,
      meadow.picking,
    );
  }

  update(t: number): void {
    for (const button of [this.mute, this.plus, this.minus, this.house]) {
      standButton(button, t, button.home, 1);
    }
    const open =
      this.meadow?.picking === true || this.meadow?.furnishing === true;
    for (const kind of INSECT_KINDS) {
      const button = this.releases[kind];
      const away = this.yielding && open && kind !== 'butterfly';
      standButton(button, t, button.home, away ? 0 : 1);
    }
    this.picker.update(t);
    this.housePicker.update(t);
  }
}
