import type * as Phaser from 'phaser';

import type { FlowerColour } from '../../model/flower-genes';
import {
  FLOWER_SHAPES,
  type FlowerShape,
  PICKED_COLOURS,
} from '../../model/flower-sounds';
import {
  canFurnish,
  isEmpty,
  isFull,
  type Meadow,
  type Planted,
  shapeSeed,
} from '../../model/game';
import type { Point } from '../../model/geometry';
import { type Furnishing, FURNISHINGS } from '../../model/house';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
import { MUSHROOM_SPECIES, type Species } from '../../model/mushroom-genes';
import type { Sown } from '../../model/pollen';
import {
  type Button,
  buttonMaker,
  DIMMED_ALPHA,
  placeButton,
  standButton,
} from './button';
import { placeIn } from './clump-layout';
import { drawColourButton, drawShapeButton } from './flower-icons';
import { standingOn } from './flower-layout';
import {
  drawFurnishButton,
  drawGrowButton,
  drawHouseButton,
  drawMuteButton,
  drawReleaseButton,
  drawSpeciesButton,
} from './hud';
import type { MeadowLayout } from './layout';
import { Picker } from './picker';
import { flowerPicker } from './sky-layout';

export type ControlHandlers = {
  mute: () => void;
  pick: () => void;
  remove: () => void;
  grow: (species: Species) => void;
  house: () => void;
  furnish: (piece: Furnishing) => void;
  release: (kind: InsectKind) => void;
  /** The flower picker's two stages: a colour picked, then a shape planted. */
  colour: (colour: FlowerColour) => void;
  plant: (shape: FlowerShape) => void;
  /** Whether the tuft the flower picker is open on can still take a flower. */
  plantable: (meadow: Meadow) => boolean;
  /** Whether the meadow has room for another mushroom, full or not. */
  roomy: (meadow: Meadow) => boolean;
  /** A tap on a control that cannot act. */
  refuse: () => void;
};

/**
 * The buttons over the meadow: mute, `+`, `−`, the house and one per insect,
 * and the pickers — the four caps `+` opens, the windows and door the house
 * does, and the flower picker a tuft opens, its five colours standing where
 * the house's five do and then its four shapes where the caps do.
 * Each presses in when a tap sets it acting; one that cannot act shakes its
 * head instead. A picker comes up one button after another and goes the same
 * way back, a picked cap flying down to where its mushroom grows; the house's
 * stays open for window after window.
 */
export class Controls {
  private readonly mute: Button;
  private readonly plus: Button;
  /** Whether `+` can act: a meadow short of full, with room for one more. */
  private readonly growable: (meadow: Meadow) => boolean;
  private readonly minus: Button;
  private readonly house: Button;
  /** Each always acts: at its kind's limit, the oldest of the kind makes room. */
  private readonly releases: Record<InsectKind, Button>;
  /** Those buttons that give way to an open picker (`Controls.yielding`). */
  private yielding: MeadowLayout['yielding'] = [];
  private readonly picker: Picker<Species, Planted>;
  private readonly housePicker: Picker<Furnishing>;
  private readonly colourPicker: Picker<FlowerColour>;
  private readonly shapePicker: Picker<FlowerShape, Sown>;
  /** Where the flower picker last opened, which it folds back into. */
  private tuft: Point = { x: 0, y: 0 };
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
    this.growable = (meadow) => !isFull(meadow) && handlers.roomy(meadow);
    this.plus = button(handlers.pick, this.growable);
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
        items: MUSHROOM_SPECIES,
        pick: handlers.grow,
        draw: drawSpeciesButton,
        flies: (meadow) => meadow.mushrooms.at(-1),
      },
      button,
    );
    this.housePicker = new Picker(
      {
        items: FURNISHINGS,
        pick: handlers.furnish,
        can: canFurnish,
        draw: drawFurnishButton,
      },
      button,
    );
    this.colourPicker = new Picker(
      { items: PICKED_COLOURS, pick: handlers.colour, draw: drawColourButton },
      button,
    );
    this.shapePicker = new Picker(
      {
        items: FLOWER_SHAPES,
        pick: handlers.plant,
        can: handlers.plantable,
        draw: (graphics, r, shape, hairline, meadow) => {
          drawShapeButton(
            graphics,
            r,
            shapeSeed(meadow.planting, shape),
            hairline,
          );
        },
        look: (shape, meadow) => String(shapeSeed(meadow.planting, shape)),
        flies: (meadow) => meadow.planted.at(-1),
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
    this.plus.face.setAlpha(this.growable(meadow) ? 1 : DIMMED_ALPHA);
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
    const { picking, furnishing, planting } = meadow;
    if (planting) this.tuft = standingOn(layout.camera, planting.foot);
    const stages = flowerPicker(layout);
    const colouring = planting !== undefined && planting.chosen === undefined;
    const shaping = planting?.chosen !== undefined;
    const mushroomAt = (mushroom: Planted) =>
      placeIn(layout.mushrooms, mushroom);
    const flowerAt = (sown: Sown) =>
      'parent' in sown ? undefined : standingOn(layout.camera, sown.foot);
    // Every picker opens where another stands, so the one opening sends the
    // rest off at once.
    this.picker.paint(
      layout.picker,
      layout.plus,
      picking,
      now,
      meadow,
      ratio,
      furnishing || planting !== undefined,
      mushroomAt,
    );
    this.housePicker.paint(
      layout.housePicker,
      layout.house,
      furnishing,
      now,
      meadow,
      ratio,
      picking || planting !== undefined,
    );
    this.colourPicker.paint(
      stages.colours,
      this.tuft,
      colouring,
      now,
      meadow,
      ratio,
      picking || furnishing || shaping,
    );
    this.shapePicker.paint(
      stages.shapes,
      this.tuft,
      shaping,
      now,
      meadow,
      ratio,
      picking || furnishing,
      flowerAt,
    );
  }

  update(t: number): void {
    const open =
      this.meadow?.picking === true ||
      this.meadow?.furnishing === true ||
      this.meadow?.planting !== undefined;
    const shown = (name: MeadowLayout['yielding'][number]) =>
      open && this.yielding.includes(name) ? 0 : 1;
    for (const button of [this.mute, this.plus, this.minus]) {
      standButton(button, t, button.home, 1);
    }
    standButton(this.house, t, this.house.home, shown('house'));
    for (const kind of INSECT_KINDS) {
      const button = this.releases[kind];
      standButton(button, t, button.home, shown(kind));
    }
    for (const picker of [
      this.picker,
      this.housePicker,
      this.colourPicker,
      this.shapePicker,
    ]) {
      picker.update(t);
    }
  }
}
