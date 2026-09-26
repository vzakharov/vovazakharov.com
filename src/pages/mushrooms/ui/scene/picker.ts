import type * as Phaser from 'phaser';

import type { Meadow } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import { emerge, launch, sink, SINK_DURATION } from '../../model/motion';
import {
  type Able,
  type Button,
  DIMMED_ALPHA,
  placeButton,
  standButton,
} from './button';

/**
 * How far apart a picker's buttons come up, one after another from the end
 * nearest the button that opens it, and go again in the reverse order.
 */
const PICK_STAGGER = 0.07;

/** One of a picker's buttons, which come and go with it. */
type PickButton = Button & {
  /** When it starts coming up, and going; `-Infinity` for both before the picker first opens. */
  shownAt: number;
  hiddenAt: number;
  /** The slot the mushroom it was picked for grows in, which it flies to as it goes. */
  towards: number | undefined;
  /** Where the layout stands that slot's mushroom. */
  target: Point | undefined;
};

/** What a picker offers and does, one `Item` per button. */
export type PickerSpec<Item> = {
  items: readonly Item[];
  pick: (item: Item) => void;
  /** Whether a pick of `item` can act; one that cannot shakes its head. */
  can?: (meadow: Meadow, item: Item) => boolean;
  draw: (graphics: Phaser.GameObjects.Graphics, r: number, item: Item) => void;
  /**
   * Whether a pick closes the picker and flies to the newest mushroom's slot
   * as it goes, as a picked cap flies to where its mushroom grows.
   */
  flies: boolean;
};

/**
 * A row of buttons that unfolds from the button that opens it, one after
 * another on the clock, the nearest first, and folds back into it the same
 * way; a pick that closes it flies off to its mushroom.
 */
export class Picker<Item> {
  private readonly buttons: PickButton[];
  private open = false;
  /** The button a tap has just picked, until the picker closes on it. */
  private picked: PickButton | undefined;
  private readonly spec: PickerSpec<Item>;

  constructor(
    spec: PickerSpec<Item>,
    make: (act: () => void, can?: Able) => Button,
  ) {
    this.spec = spec;
    const { items, can, flies, pick } = spec;
    this.buttons = items.map((item) => {
      // Into the object the tap handler presses, not a copy of it.
      const button: PickButton = Object.assign(
        make(
          () => {
            if (flies) this.picked = button;
            pick(item);
          },
          can && ((meadow) => can(meadow, item)),
        ),
        {
          shownAt: -Infinity,
          hiddenAt: -Infinity,
          towards: undefined,
          target: undefined,
        },
      );
      return button;
    });
  }

  /**
   * Stands the buttons at `homes`, unfolding from `from` as `open` turns true
   * at `now` and folding back as it turns false; `slots` are where the
   * layout stands each mushroom, for a picked button to fly to. A picker
   * closing `inPlaceOf` the other, which opens where it stands, goes at once
   * rather than folding back, so the two never show together.
   */
  paint(
    homes: readonly Circle[],
    from: Point,
    open: boolean,
    now: number,
    meadow: Meadow,
    slots: readonly Point[],
    inPlaceOf = false,
  ): void {
    const opening = open && !this.open;
    const closing = !open && this.open;
    this.open = open;
    const away = ({ x, y }: Point) => Math.hypot(x - from.x, y - from.y);
    const order = [...homes.entries()]
      .toSorted(([, a], [, b]) => away(a) - away(b))
      .map(([index]) => index);
    const leaving = order.filter((index) => this.buttons[index] !== this.picked);
    for (const [index, button] of this.buttons.entries()) {
      const at = homes[index];
      const item = this.spec.items[index];
      if (!at || item === undefined) continue;
      placeButton(button, at);
      this.spec.draw(button.graphics, at.r, item);
      const able = this.spec.can?.(meadow, item) ?? true;
      button.graphics.setAlpha(able ? 1 : DIMMED_ALPHA);
      if (opening) {
        button.shownAt = now + order.indexOf(index) * PICK_STAGGER;
        button.hiddenAt = Infinity;
        button.towards = undefined;
      } else if (closing && button === this.picked) {
        button.hiddenAt = now;
        button.towards = meadow.mushrooms.at(-1)?.slot;
      } else if (closing && inPlaceOf) {
        button.hiddenAt = now - SINK_DURATION;
      } else if (closing) {
        const turn = leaving.length - 1 - leaving.indexOf(index);
        button.hiddenAt = now + turn * PICK_STAGGER;
      }
      button.target =
        button.towards === undefined ? undefined : slots[button.towards];
      // Out of reach the moment the picker closes, while it is still going.
      if (open) button.graphics.setInteractive();
      else button.graphics.disableInteractive();
    }
    if (!open) this.picked = undefined;
  }

  update(t: number): void {
    for (const button of this.buttons) {
      const { home, target, towards, shownAt, hiddenAt } = button;
      const flight = towards === undefined ? undefined : launch(t - hiddenAt);
      // A button waiting its turn in the stagger has not come up yet.
      const up = t < shownAt ? 0 : emerge(t - shownAt);
      const going = flight ? flight.scale : sink(t - hiddenAt);
      const at =
        flight && target
          ? {
              x: home.x + (target.x - home.x) * flight.travel,
              y: home.y + (target.y - home.y) * flight.travel,
            }
          : home;
      standButton(button, t, at, Math.min(up, going));
    }
  }

}
