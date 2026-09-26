import * as Phaser from 'phaser';

import { isEmpty, isFull, type Meadow } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import { emerge, launch, shake, sink, wobble } from '../../model/motion';
import { CAP_KINDS, type CapKind } from '../../model/mushroom-genes';
import {
  containsCircle,
  type WithCircleHit,
  type WithGraphics,
} from './hit-areas';
import { drawCapButton, drawGrowButton, drawMuteButton } from './hud';
import type { MeadowLayout } from './layout';
import { tapReach } from './sky-layout';

/** How deep a pressed button sinks in, against a mushroom's squash. */
const PRESS_DEPTH = 0.6;
/**
 * How far apart the picker's buttons come up, one after another from the end
 * nearest `+`, and go again in the reverse order.
 */
const PICK_STAGGER = 0.07;
/** A control that cannot act now, faded; a tap on it still shakes its head. */
const DIMMED_ALPHA = 0.4;
/** A head shake's reach to either side, in the button's radii, and its turn in radians. */
const SHAKE_REACH = 0.3;
const SHAKE_TURN = 0.25;

export type ControlHandlers = {
  mute: () => void;
  pick: () => void;
  remove: () => void;
  grow: (cap: CapKind) => void;
  /** A tap on a control that cannot act. */
  refuse: () => void;
};

type Button = WithGraphics &
  WithCircleHit & {
    /** Where the layout stands it; each frame's movement is an offset from here. */
    home: Circle;
    pressedAt: number;
    /** When it last shook its head at a tap it could not act on. */
    refusedAt: number;
  };

/** One of the picker's caps, which come and go with it. */
type CapButton = Button & {
  /** When it starts coming up, and going; `-Infinity` for both before the picker first opens. */
  shownAt: number;
  hiddenAt: number;
  /** The slot the mushroom it was picked for grows in, which it flies to as it goes. */
  towards: number | undefined;
  /** Where the layout stands that slot's mushroom. */
  target: Point | undefined;
};

/** The picker's buttons in the order they unfold from `+`, the nearest first. */
function unfolding({ picker, plus }: MeadowLayout): number[] {
  const away = ({ x, y }: Point) => Math.hypot(x - plus.x, y - plus.y);
  return [...picker.entries()]
    .toSorted(([, a], [, b]) => away(a) - away(b))
    .map(([index]) => index);
}

/**
 * The buttons over the meadow: mute, `+` and `−`, and the picker's four caps.
 * Each presses in when a tap sets it acting; `+` on a full meadow and `−` on
 * an empty one shake their heads instead. The picker comes up one cap after
 * another and goes the same way back, the picked cap flying down to where its
 * mushroom grows.
 */
export class Controls {
  private readonly mute: Button;
  private readonly plus: Button;
  private readonly minus: Button;
  private readonly picker: CapButton[];
  private picking = false;
  /** The cap a tap has just picked, until the picker closes on it. */
  private picked: CapButton | undefined;
  /** As of the last paint, which says what `+` and `−` can do. */
  private meadow: Meadow | undefined;
  private readonly scene: Phaser.Scene;
  private readonly refuse: () => void;
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
    this.refuse = handlers.refuse;
    this.mute = this.button(handlers.mute);
    this.plus = this.button(handlers.pick, (meadow) => !isFull(meadow));
    this.minus = this.button(handlers.remove, (meadow) => !isEmpty(meadow));
    this.picker = CAP_KINDS.map((cap) => {
      // Into the object the tap handler presses, not a copy of it.
      const button: CapButton = Object.assign(
        this.button(() => {
          this.picked = button;
          handlers.grow(cap);
        }),
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

  /** Draws every button where `layout` puts it, as `meadow` leaves it. */
  paint(layout: MeadowLayout, meadow: Meadow, muted: boolean): void {
    this.meadow = meadow;
    this.place(this.mute, layout.mute);
    drawMuteButton(this.mute.graphics, layout.mute.r, muted);
    this.place(this.plus, layout.plus);
    drawGrowButton(this.plus.graphics, layout.plus.r, 1);
    this.plus.graphics.setAlpha(isFull(meadow) ? DIMMED_ALPHA : 1);
    this.place(this.minus, layout.minus);
    drawGrowButton(this.minus.graphics, layout.minus.r, -1);
    this.minus.graphics.setAlpha(isEmpty(meadow) ? DIMMED_ALPHA : 1);
    const opening = meadow.picking && !this.picking;
    const closing = !meadow.picking && this.picking;
    this.picking = meadow.picking;
    const order = unfolding(layout);
    const leaving = order.filter((index) => this.picker[index] !== this.picked);
    const now = this.now();
    for (const [index, button] of this.picker.entries()) {
      const at = layout.picker[index];
      const cap = CAP_KINDS[index];
      if (!at || !cap) continue;
      this.place(button, at);
      drawCapButton(button.graphics, at.r, cap);
      if (opening) {
        button.shownAt = now + order.indexOf(index) * PICK_STAGGER;
        button.hiddenAt = Infinity;
        button.towards = undefined;
      } else if (closing && button === this.picked) {
        button.hiddenAt = now;
        button.towards = meadow.mushrooms.at(-1)?.slot;
      } else if (closing) {
        const turn = leaving.length - 1 - leaving.indexOf(index);
        button.hiddenAt = now + turn * PICK_STAGGER;
      }
      button.target =
        button.towards === undefined
          ? undefined
          : layout.mushrooms[button.towards];
      // Out of reach the moment the picker closes, while it is still going.
      if (meadow.picking) button.graphics.setInteractive();
      else button.graphics.disableInteractive();
    }
    if (!meadow.picking) this.picked = undefined;
  }

  update(t: number): void {
    for (const button of [this.mute, this.plus, this.minus]) {
      this.stand(button, t, button.home, 1);
    }
    for (const button of this.picker) {
      const { home, target, towards, shownAt, hiddenAt } = button;
      const flight = towards === undefined ? undefined : launch(t - hiddenAt);
      // A cap waiting its turn in the stagger has not come up yet.
      const up = t < shownAt ? 0 : emerge(t - shownAt);
      const going = flight ? flight.scale : sink(t - hiddenAt);
      const at =
        flight && target
          ? {
              x: home.x + (target.x - home.x) * flight.travel,
              y: home.y + (target.y - home.y) * flight.travel,
            }
          : home;
      this.stand(button, t, at, Math.min(up, going));
    }
  }

  /** Sets `button` at `x, y` and `grown` of its size, pressing or shaking as its last tap has it. */
  private stand(button: Button, t: number, { x, y }: Point, grown: number) {
    const no = shake(t - button.refusedAt);
    const press = 1 + wobble(t - button.pressedAt) * PRESS_DEPTH;
    button.graphics
      .setVisible(grown > 0)
      .setPosition(x + no * button.home.r * SHAKE_REACH, y)
      .setRotation(no * SHAKE_TURN)
      .setScale(press * grown);
  }

  private place(button: Button, home: Circle): void {
    button.home = home;
    button.graphics.setPosition(home.x, home.y);
    button.hit.setTo(0, 0, tapReach(home.r));
  }

  /** A button that does `act` when tapped, while `can` says it is able to. */
  private button(
    act: () => void,
    can: (meadow: Meadow) => boolean = () => true,
  ): Button {
    const hit = new Phaser.Geom.Circle();
    const graphics = this.scene.add
      .graphics()
      .setDepth(this.depth)
      .setInteractive(hit, containsCircle);
    const button: Button = {
      graphics,
      hit,
      home: { x: 0, y: 0, r: 0 },
      pressedAt: -Infinity,
      refusedAt: -Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (this.meadow && !can(this.meadow)) {
        button.refusedAt = this.now();
        this.refuse();
        return;
      }
      button.pressedAt = this.now();
      act();
    });
    return button;
  }
}
