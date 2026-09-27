import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isAloft, isLeaving, type Perch, type Sight } from '../../model/flight';
import {
  firstFlowers,
  type Flower,
  flowerGenes,
} from '../../model/flower-genes';
import {
  type Action,
  firstMeadow,
  type Meadow,
  reduce,
} from '../../model/game';
import { placedAt, type Point } from '../../model/geometry';
import type { Flier } from '../../model/insects';
import { bloom, drift, phaseOf, sway } from '../../model/motion';
import { mulberry32, nextSeed, type Random } from '../../model/random';
import { Controls } from './controls';
import { drawFlower } from './draw-flower';
import { growTufts, paintTufts } from './grass';
import { containsCircle, type TappedFigure } from './hit-areas';
import { InsectView } from './insect-view';
import { type MeadowLayout, meadowLayout } from './layout';
import { MushroomBed } from './mushroom-bed';
import { type Backdrop, paintBackdrop } from './paint-backdrop';
import { FLOWER_SWAY, perchSight, perchSpot } from './perch-sight';
import { tapReach } from './sky-layout';
import { MeadowSound, readMuted } from './sound';

/** The registry key the host writes the device pixel ratio under. */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/** Above everything in the meadow, spores included. */
const HUD_DEPTH = 2e5;
/**
 * Above everything in the meadow too, taking a tap first and passing one at
 * rest on to its perch (`tapInsect`), but under the buttons, which keep their
 * taps.
 */
const INSECT_DEPTH = 1.5e5;
/** How far a cloud drifts each second, in CSS pixels, the nearest fastest. */
const CLOUD_SPEEDS = [7, 4, 5.5];

type ShownFlower = TappedFigure & {
  stem: Phaser.GameObjects.Graphics;
  head: Phaser.GameObjects.Graphics;
  headR: number;
};

/**
 * The meadow. Everything that varies between visits comes from one seed, so a
 * resize repaints the same meadow rather than a new one — into the objects
 * already on screen. Every movement is set each frame from the clock
 * (`model/motion.ts`), so a resize changes where a thing stands and never
 * interrupts how it moves.
 */
export class MeadowScene extends Phaser.Scene {
  private readonly visitSeed = Math.floor(Math.random() * 2 ** 32);
  /** What the player has made of the meadow; changed only by `dispatch`, which the screen follows. */
  private meadow: Meadow | undefined;
  /** The seeds each grown mushroom takes, a stream of its own. */
  private readonly growing: Random = mulberry32(this.visitSeed ^ 0x9e_0a);
  /** The seeds each released insect takes. */
  private readonly releasing: Random = mulberry32(this.visitSeed ^ 0xb7_7e_f1);
  private flowers: Flower[] = [];
  private layout: MeadowLayout | undefined;
  private backdrop: Backdrop | undefined;
  private grass: Phaser.GameObjects.Graphics | undefined;
  private tufts: ReturnType<typeof growTufts> = [];
  private bed: MushroomBed | undefined;
  private controls: Controls | undefined;
  private insects: InsectView | undefined;
  private readonly shownFlowers = new Map<string, ShownFlower>();
  /** What the insects see of the perches, as the screen and the mushrooms stand now. */
  private sight: Sight = { flowers: [], crowded: [] };
  private readonly voice = new MeadowSound(readMuted());
  /** Seconds on the scene's clock, as of the last frame. */
  private clock = 0;
  private readonly now = (): number => this.clock;

  constructor() {
    super('meadow');
  }

  create(): void {
    const random = mulberry32(this.visitSeed);
    this.meadow = firstMeadow(random);
    this.flowers = firstFlowers(random, 7);
    this.bed = new MushroomBed(this, this.voice, this.now, (id) => {
      this.dispatch({ kind: 'select', id });
    });
    this.insects = new InsectView(
      this,
      this.voice,
      this.now,
      INSECT_DEPTH,
      (id) => {
        this.tapInsect(id);
      },
    );
    this.controls = new Controls(
      this,
      {
        mute: () => {
          this.voice.toggleMuted();
          this.voice.pop();
          this.repaintControls();
        },
        pick: () => {
          this.voice.pop();
          this.dispatch({ kind: 'pick' });
        },
        remove: () => {
          this.dispatch({ kind: 'remove' });
        },
        grow: (cap) => {
          this.dispatch({ kind: 'grow', cap, seed: nextSeed(this.growing) });
        },
        house: () => {
          this.voice.pop();
          this.dispatch({ kind: 'house' });
        },
        furnish: (piece) => {
          this.dispatch({ kind: 'furnish', piece });
        },
        release: () => {
          this.voice.trill();
          this.dispatch({
            kind: 'release',
            insect: 'butterfly',
            seed: nextSeed(this.releasing),
            now: this.clock * 1000,
            ...this.sight,
          });
        },
        refuse: () => {
          this.voice.nuhUh();
        },
      },
      this.now,
      HUD_DEPTH,
    );
    this.paint();
    this.bed.reconcile(this.meadow, this.requireLayout(), this.clock, true);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.paint, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.tapMeadow, this);
    // A browser lets sound start only on a tap's release.
    this.input.on(Phaser.Input.Events.POINTER_UP, this.startSound, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.paint, this);
      this.input.off(Phaser.Input.Events.POINTER_DOWN, this.tapMeadow, this);
      this.input.off(Phaser.Input.Events.POINTER_UP, this.startSound, this);
      this.voice.stop();
    });
  }

  override update(time: number): void {
    this.clock = time / 1000;
    const t = this.clock;
    const {
      layout,
      backdrop,
      grass,
      tufts,
      shownFlowers,
      bed,
      controls,
      insects,
      perchAt,
      sight,
    } = this;
    if (!layout || !backdrop) return;
    this.dispatch({ kind: 'tick', now: time, ...sight });
    const { width, clouds } = layout;
    for (const [index, graphics] of backdrop.clouds.entries()) {
      const cloud = clouds[index];
      if (!cloud) continue;
      const { x, r } = cloud;
      const margin = r * 4;
      graphics.x =
        drift(
          x + margin,
          CLOUD_SPEEDS[index % CLOUD_SPEEDS.length] ?? 5,
          t,
          width + margin * 2,
        ) - margin;
    }
    if (grass) paintTufts(grass, tufts, t);
    bed?.update(t);
    controls?.update(t);
    for (const shown of shownFlowers.values()) {
      const open = bloom(t - shown.tappedAt);
      shown.container.setRotation(sway(t, shown.phase) * FLOWER_SWAY);
      shown.head.setScale(1 + open).setRotation(open * 0.6);
    }
    // Last, so every perch stands where this frame has put it.
    insects?.update(t, perchAt);
  }

  private dispatch(action: Action): void {
    if (!this.meadow) return;
    const meadow = reduce(this.meadow, action);
    // A frame's tick with nothing due changes nothing, and costs nothing.
    if (meadow === this.meadow) return;
    const regrown = meadow.mushrooms !== this.meadow.mushrooms;
    this.meadow = meadow;
    if (regrown) this.see();
    this.bed?.reconcile(meadow, this.requireLayout(), this.clock);
    this.insects?.reconcile(meadow.insects);
    this.repaintControls();
  }

  /**
   * Where `perch` stands this frame: a flower's head, as it sways and opens,
   * or a cap's top, as it breathes, wobbles and sinks, each butterfly at a
   * spot of its own along it.
   */
  private readonly perchAt = (
    perch: Perch,
    insect: Flier,
  ): Point | undefined => {
    const spot = perchSpot(insect);
    switch (perch.kind) {
      case 'cap': {
        return this.bed?.capTop(perch.id, spot);
      }
      case 'flower': {
        const shown = this.shownFlowers.get(perch.id);
        if (shown?.container.visible !== true) return undefined;
        const { container, head, headR } = shown;
        return placedAt(container, container.rotation, {
          ...pick(head, 'y'),
          x: head.x + spot * headR,
        });
      }
      case 'away': {
        return undefined;
      }
      default: {
        return perch satisfies never;
      }
    }
  };

  /**
   * A tap on the insect `id` startles it; at rest, the tap goes on to
   * whatever it sits on, so a creature never costs the child the thing under
   * it. In flight it takes the tap alone.
   */
  private tapInsect(id: string): void {
    const now = this.clock * 1000;
    const flier = this.meadow?.insects.find((each) => each.id === id);
    const under =
      flier && !isAloft(flier, now) && !isLeaving(flier)
        ? flier.leg.to
        : undefined;
    this.dispatch({ kind: 'startle', id, now, ...this.sight });
    switch (under?.kind) {
      case 'cap': {
        this.bed?.tap(under.id);
        break;
      }
      case 'flower': {
        const flower = this.flowers.find((each) => each.id === under.id);
        if (flower) this.tapFlower(flower);
        break;
      }
      case 'away':
      case undefined: {
        break;
      }
      default: {
        under satisfies never;
      }
    }
  }

  /** A tap that lands on nothing lets go of the selection. */
  private readonly tapMeadow = (
    _pointer: Phaser.Input.Pointer,
    over: readonly Phaser.GameObjects.GameObject[],
  ): void => {
    if (over.length === 0) this.dispatch({ kind: 'deselect' });
  };

  private readonly startSound = (): void => {
    this.voice.start();
  };

  private requireLayout(): MeadowLayout {
    if (!this.layout) throw new Error('The meadow is used before its paint');
    return this.layout;
  }

  private repaintControls(): void {
    if (this.layout && this.meadow) {
      this.controls?.paint(this.layout, this.meadow, this.voice.muted);
    }
  }

  /**
   * The canvas is sized in device pixels for a sharp picture on a dense
   * screen; the camera's zoom brings the world back to CSS pixels, which is
   * what the layout is written in.
   */
  private readonly paint = (): void => {
    const ratio = Number(this.registry.get(PIXEL_RATIO_KEY) ?? 1);
    this.cameras.main.setOrigin(0, 0).setZoom(ratio);
    const layout = meadowLayout(
      this.scale.width / ratio,
      this.scale.height / ratio,
      // Its own stream, apart from the creatures' and the backdrop's.
      this.visitSeed ^ 0xf1_0e_25,
    );
    this.layout = layout;
    // Its own stream, so the backdrop never shifts the creatures' seeds.
    const random = mulberry32(this.visitSeed ^ 0x5e_ed);
    this.backdrop = paintBackdrop(this, this.backdrop, layout, random);
    this.grass ??= this.add.graphics();
    this.tufts = growTufts(layout, random);
    if (this.meadow) this.bed?.paint(this.meadow, layout);
    this.insects?.paint(layout);
    this.paintFlowers(layout);
    this.see();
    this.repaintControls();
  };

  /** Sees the perches afresh, as the screen and the mushrooms now stand. */
  private see(): void {
    const { layout, flowers, meadow } = this;
    if (!layout || !meadow) return;
    this.sight = perchSight({ layout, flowers, ...pick(meadow, 'mushrooms') });
  }

  private paintFlowers({ flowers }: MeadowLayout): void {
    for (const [index, flower] of this.flowers.entries()) {
      const place = flowers[index];
      const shown = this.shownFlowers.get(flower.id) ?? this.showFlower(flower);
      // A narrow screen has room for fewer; the rest wait, hidden.
      shown.container.setVisible(place !== undefined);
      if (!place) continue;
      shown.container.setPosition(place.x, place.y).setDepth(place.y);
      shown.headR = drawFlower(shown, flowerGenes(flower), place.size);
      shown.hit.setTo(0, 0, tapReach(shown.headR * 1.2));
    }
  }

  private showFlower(flower: Flower): ShownFlower {
    const hit = new Phaser.Geom.Circle();
    const stem = this.add.graphics();
    const head = this.add.graphics().setInteractive(hit, containsCircle);
    const shown: ShownFlower = {
      container: this.add.container(0, 0, [stem, head]),
      stem,
      head,
      hit,
      headR: 0,
      phase: phaseOf(flower),
      tappedAt: -Infinity,
    };
    head.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.tapFlower(flower);
    });
    this.shownFlowers.set(flower.id, shown);
    return shown;
  }

  /** Answers a tap on `flower`, whether it landed there or went through a butterfly drinking at it. */
  private tapFlower(flower: Flower): void {
    const shown = this.shownFlowers.get(flower.id);
    if (!shown) return;
    const { fold, rings } = flowerGenes(flower);
    shown.tappedAt = this.clock;
    this.voice.chime(fold + rings);
    // A flower is part of the meadow: a tap on it is a tap on the meadow too.
    this.dispatch({ kind: 'deselect' });
  }
}
