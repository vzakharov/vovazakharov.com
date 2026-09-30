import * as Phaser from 'phaser';

import { type Flower, flowerGenes } from '../../model/flower-genes';
import {
  type FlowerSound,
  sameSound,
  soundOf,
} from '../../model/flower-sounds';
import type { Action, Meadow } from '../../model/game';
import { placedAt } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { type Dip, drinkDip } from '../../model/insect-motion';
import type { Flier } from '../../model/insects';
import {
  bloom,
  emerge,
  phaseOf,
  rebloom,
  type Sprouted,
  sway,
} from '../../model/motion';
import { isBeeSown, type Sown } from '../../model/pollen';
import { drawFlower } from './draw-flower';
import { FLOWER_SWAY } from './flower-layout';
import { standingFlowers } from './flower-plots';
import { type Centred, flowerLift, flowerTapReach } from './flower-sight';
import { FLOWER_TOUCH_ACTIONS, type FlowerTouch } from './flower-touch';
import { containsFlower, type TappedFigure } from './hit-areas';
import type { Lighting } from './ink';
import type { Perched } from './insect-view';
import type { Instrument } from './instrument';
import type { MeadowLayout } from './layout';
import { flowerLight } from './mushroom-light';

/** `plantedAt`: `-Infinity` for a seeded flower, standing from the start. */
type Shown = TappedFigure &
  Sprouted &
  Centred & {
    stem: Phaser.GameObjects.Graphics;
    head: Phaser.GameObjects.Graphics;
    headR: number;
    /** Where the head stands on its stem as laid out, before a drinking insect sags it. */
    headY: number;
  };

/**
 * The meadow's flowers on screen, kept by id, the visit's seeded ones and the
 * ones the bees plant alike: each stands where the layout puts it
 * (`standingFlowers`), sways in the breeze, blooms open when tapped and sags
 * under an insect drinking at it; a planted one, a bee's or the child's,
 * grows up out of the ground and opens sounding its note or drum.
 */
export class FlowerBed {
  private readonly shown = new Map<string, Shown>();
  private readonly scene: Phaser.Scene;
  private readonly instrument: Instrument;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  /** What a touch on a flower asks of the meadow (`FLOWER_TOUCH_ACTIONS`) goes here. */
  private readonly dispatch: (action: Action) => void;
  readonly seeded: readonly Flower[];
  private planted: readonly Sown[] = [];
  /** The mushrooms standing as of the last `reconcile`, whose feet a planted flower keeps off. */
  private mushrooms: Meadow['mushrooms'] = [];
  /** The screen's light as it last stood, which each flower takes from where it stands (`flowerLight`). */
  private lighting: Lighting | undefined;
  private sizes: Readonly<Record<InsectKind, number>> = {
    butterfly: 1,
    fly: 1,
    bee: 1,
  };

  constructor(
    scene: Phaser.Scene,
    instrument: Instrument,
    now: () => number,
    seeded: readonly Flower[],
    dispatch: (action: Action) => void,
  ) {
    this.scene = scene;
    this.instrument = instrument;
    this.now = now;
    this.seeded = seeded;
    this.dispatch = dispatch;
  }

  /** Stands every flower where `layout` puts it, into the objects it has. */
  paint(layout: MeadowLayout, lighting: Lighting): void {
    this.lighting = lighting;
    this.sizes = layout.insectSizes;
    const standing = standingFlowers(
      layout,
      this.seeded,
      this.planted,
      this.mushrooms,
    );
    for (const flower of [...this.seeded, ...this.planted]) {
      const shown = this.shown.get(flower.id) ?? this.show(flower, -Infinity);
      const place = standing.find(({ id }) => id === flower.id)?.place;
      // A screen may have no room for some; they wait, hidden.
      shown.container.setVisible(place !== undefined);
      if (!place) continue;
      shown.container.setPosition(place.x, place.y).setDepth(place.y);
      const genes = flowerGenes(flower);
      shown.headR = drawFlower(
        shown,
        genes,
        place.size,
        flowerLight(lighting, genes, place, layout.sun),
      );
      shown.headY = shown.head.y;
      shown.disc = genes.centre * place.size;
      shown.hit.setTo(0, 0, flowerTapReach(shown.headR));
    }
  }

  /**
   * Shows what `planted` holds as of `clock`, in seconds, among `mushrooms`:
   * each new flower grows up where `layout` stands it,
   * blooming open with its sound, and each planted flower stands or hides as
   * the mushrooms' feet leave it ground (`standingFlowers`).
   */
  reconcile(
    { planted, mushrooms }: Pick<Meadow, 'planted' | 'mushrooms'>,
    layout: MeadowLayout,
    clock: number,
  ): void {
    if (planted === this.planted && mushrooms === this.mushrooms) return;
    const fresh = planted.filter(({ id }) => !this.shown.has(id));
    this.planted = planted;
    this.mushrooms = mushrooms;
    for (const flower of fresh) {
      const shown = this.show(flower, clock);
      shown.tappedAt = clock;
      // The child's own flower leads the melody, as a tap does; a bee's
      // plays from it without moving it.
      this.sound(flower, !isBeeSown(flower));
    }
    if (!this.lighting) throw new Error('A flower is planted before its paint');
    this.paint(layout, this.lighting);
  }

  /** Sways and blooms every flower at `t`, in seconds, each sagging under whatever of `insects` drinks at it. */
  update(t: number, insects: readonly Flier[]): void {
    const drunk = drinkingAt(insects, t * 1000);
    for (const [id, shown] of this.shown) {
      const open = bloom(t - shown.tappedAt);
      const { dip, flicker } = drunk.get(id) ?? { dip: 0, flicker: 0 };
      shown.container
        .setRotation(sway(t, shown.phase) * FLOWER_SWAY)
        .setScale(emerge(t - shown.plantedAt));
      shown.head
        .setScale(1 + open)
        .setRotation(open * 0.6 + flicker)
        .setY(shown.headY + dip * shown.headR);
    }
  }

  /**
   * Where an insect sits on the flower `id` this frame, `spot` of its head's
   * radius across (`perchSpot`), with the head's middle it drinks from;
   * `undefined` while the flower is not shown.
   */
  seat(id: string, spot: number, kind: InsectKind): Perched | undefined {
    const shown = this.shown.get(id);
    if (shown?.container.visible !== true) return undefined;
    const { container, head, headR, disc } = shown;
    const lift = flowerLift({ r: headR, disc }, this.sizes[kind], kind);
    const seat = placedAt(container, container.rotation, {
      x: head.x + spot * headR,
      y: head.y - lift,
    });
    const nectar = placedAt(container, container.rotation, head);
    return { ...seat, nectar };
  }

  /** Answers a tap on the flower `id`, whether it landed there or went through an insect drinking at it. */
  tap(id: string): void {
    this.touch(id, 'tap');
  }

  /**
   * Answers a finger beyond Phaser's, which plays a chord: `object`, the
   * topmost thing under it, is opened and sounded when it is a flower's head,
   * and whether it was is returned. Nothing else takes such a finger.
   */
  chordTap(object: Phaser.GameObjects.GameObject): boolean {
    for (const [id, shown] of this.shown) {
      if (shown.head !== object) continue;
      this.touch(id, 'chord');
      return true;
    }
    return false;
  }

  private touch(id: string, touch: FlowerTouch): void {
    const shown = this.shown.get(id);
    const flower = [...this.seeded, ...this.planted].find(
      (each) => each.id === id,
    );
    if (!shown || !flower) return;
    this.open(shown);
    this.sound(flower, true);
    for (const action of FLOWER_TOUCH_ACTIONS[touch]) this.dispatch(action);
  }

  /** Opens every flower in sight that makes `sound`, as a key played it. */
  answer(sound: FlowerSound): void {
    for (const flower of [...this.seeded, ...this.planted]) {
      const shown = this.shown.get(flower.id);
      if (shown?.container.visible !== true) continue;
      if (sameSound(soundOf(flowerGenes(flower)), sound)) this.open(shown);
    }
  }

  /** Blooms `shown` open from where it stands. */
  private open(shown: Shown): void {
    const now = this.now();
    shown.tappedAt = now - rebloom(now - shown.tappedAt);
  }

  private sound(flower: Flower, leads: boolean): void {
    this.instrument.flower(soundOf(flowerGenes(flower)), leads);
  }

  private show(flower: Flower, plantedAt: number): Shown {
    const hit = new Phaser.Geom.Circle();
    const stem = this.scene.add.graphics();
    const head = this.scene.add.graphics();
    const shown: Shown = {
      container: this.scene.add.container(0, 0, [stem, head]),
      stem,
      head,
      hit,
      headR: 0,
      headY: 0,
      disc: 0,
      plantedAt,
      phase: phaseOf(flower),
      tappedAt: -Infinity,
    };
    head.setInteractive(
      hit,
      containsFlower(() => shown.headR),
    );
    head.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.tap(flower.id);
    });
    this.shown.set(flower.id, shown);
    return shown;
  }
}

/** What the insects do at `time`, in ms, to the flowers under them, by flower id (`drinkDip`). */
function drinkingAt(insects: readonly Flier[], time: number): Map<string, Dip> {
  const drunk = new Map<string, Dip>();
  for (const { leg } of insects) {
    const under = drinkDip(leg, time);
    if (!under) continue;
    const was = drunk.get(under.id) ?? { dip: 0, flicker: 0 };
    drunk.set(under.id, {
      dip: was.dip + under.dip,
      flicker: was.flicker + under.flicker,
    });
  }
  return drunk;
}
