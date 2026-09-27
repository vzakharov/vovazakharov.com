import * as Phaser from 'phaser';

import { type Flower, flowerGenes } from '../../model/flower-genes';
import { placedAt } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { type Dip, drinkDip } from '../../model/insect-motion';
import type { Flier } from '../../model/insects';
import {
  bloom,
  emerge,
  phaseOf,
  type Sprouted,
  sway,
} from '../../model/motion';
import type { Sown } from '../../model/pollen';
import { drawFlower } from './draw-flower';
import { standingFlowers } from './flower-plots';
import { FLOWER_SWAY, flowerLift } from './flower-sight';
import { containsCircle, type TappedFigure } from './hit-areas';
import type { Perched } from './insect-view';
import type { MeadowLayout } from './layout';
import { tapReach } from './sky-layout';
import type { MeadowSound } from './sound';

/** `plantedAt`: `-Infinity` for a seeded flower, standing from the start. */
type Shown = TappedFigure &
  Sprouted & {
    stem: Phaser.GameObjects.Graphics;
    head: Phaser.GameObjects.Graphics;
    headR: number;
    /** Where the head stands on its stem as laid out, before a drinking insect sags it. */
    headY: number;
    /** The radius of the head's centre, which a drinking insect sits above (`flowerLift`). */
    disc: number;
  };

/**
 * The meadow's flowers on screen, kept by id, the visit's seeded ones and the
 * ones the bees plant alike: each stands where the layout puts it
 * (`standingFlowers`), sways in the breeze, blooms open when tapped and sags
 * under an insect drinking at it; a planted one grows up out of the ground
 * and opens with a chime.
 */
export class FlowerBed {
  private readonly shown = new Map<string, Shown>();
  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  /** A tap on a flower is a tap on the meadow too, which this passes on. */
  private readonly onTap: () => void;
  readonly seeded: readonly Flower[];
  private planted: readonly Sown[] = [];
  private sizes: Readonly<Record<InsectKind, number>> = {
    butterfly: 1,
    fly: 1,
    bee: 1,
  };

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    seeded: readonly Flower[],
    onTap: () => void,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.seeded = seeded;
    this.onTap = onTap;
  }

  /** Stands every flower where `layout` puts it, into the objects it has. */
  paint(layout: MeadowLayout): void {
    this.sizes = layout.insectSizes;
    const standing = standingFlowers(layout, this.seeded, this.planted);
    for (const flower of [...this.seeded, ...this.planted]) {
      const shown = this.shown.get(flower.id) ?? this.show(flower, -Infinity);
      const place = standing.find(({ id }) => id === flower.id)?.place;
      // A narrow screen has room for fewer; the rest wait, hidden.
      shown.container.setVisible(place !== undefined);
      if (!place) continue;
      shown.container.setPosition(place.x, place.y).setDepth(place.y);
      const genes = flowerGenes(flower);
      shown.headR = drawFlower(shown, genes, place.size);
      shown.headY = shown.head.y;
      shown.disc = genes.centre * place.size;
      shown.hit.setTo(0, 0, tapReach(shown.headR * 1.2));
    }
  }

  /**
   * Shows what `planted` holds as of `clock`, in seconds: each new flower
   * grows up where `layout` rings it round its parent, blooming open with a
   * chime.
   */
  reconcile(
    planted: readonly Sown[],
    layout: MeadowLayout,
    clock: number,
  ): void {
    if (planted === this.planted) return;
    const fresh = planted.filter(({ id }) => !this.shown.has(id));
    this.planted = planted;
    for (const flower of fresh) {
      const shown = this.show(flower, clock);
      shown.tappedAt = clock;
      this.chime(flower);
    }
    this.paint(layout);
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
    const lift = flowerLift(disc, this.sizes[kind], kind);
    const seat = placedAt(container, container.rotation, {
      x: head.x + spot * headR,
      y: head.y - lift,
    });
    const nectar = placedAt(container, container.rotation, head);
    return { ...seat, nectar };
  }

  /** Answers a tap on the flower `id`, whether it landed there or went through an insect drinking at it. */
  tap(id: string): void {
    const shown = this.shown.get(id);
    const flower = [...this.seeded, ...this.planted].find(
      (each) => each.id === id,
    );
    if (!shown || !flower) return;
    shown.tappedAt = this.now();
    this.chime(flower);
    this.onTap();
  }

  /** A flower's own note, the same for the same flower. */
  private chime(flower: Flower): void {
    const { fold, rings } = flowerGenes(flower);
    this.voice.chime(fold + rings);
  }

  private show(flower: Flower, plantedAt: number): Shown {
    const hit = new Phaser.Geom.Circle();
    const stem = this.scene.add.graphics();
    const head = this.scene.add.graphics().setInteractive(hit, containsCircle);
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
