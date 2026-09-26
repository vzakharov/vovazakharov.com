import * as Phaser from 'phaser';

import {
  firstFlowers,
  type Flower,
  type FlowerGenes,
  flowerGenes,
} from '../../model/flower-genes';
import {
  type Action,
  firstMeadow,
  type Meadow,
  reduce,
} from '../../model/game';
import { bloom, drift, phaseOf, sway, type Tapped } from '../../model/motion';
import { mulberry32, nextSeed, type Random } from '../../model/random';
import { Controls } from './controls';
import { drawFlower } from './draw-flower';
import { growTufts, paintTufts } from './grass';
import { containsCircle, type WithCircleHit } from './hit-areas';
import { type MeadowLayout, meadowLayout } from './layout';
import { MushroomBed } from './mushroom-bed';
import { type Backdrop, paintBackdrop } from './paint-backdrop';
import { tapReach } from './sky-layout';
import { MeadowSound, readMuted } from './sound';

/** The registry key the host writes the device pixel ratio under. */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/** Above everything in the meadow, spores included. */
const HUD_DEPTH = 2e5;
/** How far a cloud drifts each second, in CSS pixels, the nearest fastest. */
const CLOUD_SPEEDS = [7, 4, 5.5];
/** A flower's lean at the breeze's strongest, in radians. */
const FLOWER_SWAY = 0.09;

type ShownFlower = Tapped &
  WithCircleHit & {
    container: Phaser.GameObjects.Container;
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
  private flowers: Flower[] = [];
  private layout: MeadowLayout | undefined;
  private backdrop: Backdrop | undefined;
  private grass: Phaser.GameObjects.Graphics | undefined;
  private tufts: ReturnType<typeof growTufts> = [];
  private bed: MushroomBed | undefined;
  private controls: Controls | undefined;
  private readonly shownFlowers = new Map<string, ShownFlower>();
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
    const { layout, backdrop, grass, tufts, shownFlowers, bed, controls } =
      this;
    if (!layout || !backdrop) return;
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
  }

  private dispatch(action: Action): void {
    if (!this.meadow) return;
    this.meadow = reduce(this.meadow, action);
    this.bed?.reconcile(this.meadow, this.requireLayout(), this.clock);
    this.repaintControls();
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
    this.paintFlowers(layout);
    this.repaintControls();
  };

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
    const genes: FlowerGenes = flowerGenes(flower);
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
      shown.tappedAt = this.clock;
      this.voice.chime(genes.fold + genes.rings);
      // A flower is part of the meadow: a tap on it is a tap on the meadow too.
      this.dispatch({ kind: 'deselect' });
    });
    this.shownFlowers.set(flower.id, shown);
    return shown;
  }
}
