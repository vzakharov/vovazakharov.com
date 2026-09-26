import * as Phaser from 'phaser';

import {
  firstFlowers,
  type Flower,
  type FlowerGenes,
  flowerGenes,
} from '../../model/flower-genes';
import type { Point } from '../../model/geometry';
import {
  bloom,
  breath,
  drift,
  type Phased,
  sway,
  widthFor,
  wobble,
} from '../../model/motion';
import {
  firstMushrooms,
  type Mushroom,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { capFrame, splayed } from '../../model/mushroom-pose';
import { mulberry32, type Seeded } from '../../model/random';
import { drawFlower } from './draw-flower';
import { drawMushroom, toCanvas } from './draw-mushroom';
import { growTufts, paintTufts } from './grass';
import { drawMuteButton } from './hud';
import {
  type Footing,
  type MeadowLayout,
  meadowLayout,
  TAP_RADIUS,
} from './layout';
import { type Backdrop, paintBackdrop } from './paint-backdrop';
import { MeadowSound, readMuted } from './sound';
import { puffSpores } from './spores';

/** The registry key the host writes the device pixel ratio under. */
export const PIXEL_RATIO_KEY = 'pixelRatio';

/** Above everything in the meadow, whose depth is where its foot stands. */
const SPORE_DEPTH = 1e5;
const HUD_DEPTH = 2e5;
/** How far a cloud drifts each second, in CSS pixels, the nearest fastest. */
const CLOUD_SPEEDS = [7, 4, 5.5];
/** A flower's lean at the breeze's strongest, in radians. */
const FLOWER_SWAY = 0.09;
/** A tapped mushroom's rock to and fro, against its squash. */
const WOBBLE_ROCK = 0.35;

/** A `Phased` phase read off the seed, so it holds across repaints. */
function phaseOf({ seed }: Seeded): number {
  return (seed / 2 ** 32) * Math.PI * 2;
}

/** A point in a creature's own frame, placed into the world. */
function toWorld(foot: Point, turn: number, { x, y }: Point): Point {
  return {
    x: foot.x + x * Math.cos(turn) - y * Math.sin(turn),
    y: foot.y + x * Math.sin(turn) + y * Math.cos(turn),
  };
}

/** Phaser's hit tests, bound for use as an object's hit callback. */
function containsRectangle(area: Phaser.Geom.Rectangle, x: number, y: number) {
  return Phaser.Geom.Rectangle.Contains(area, x, y);
}

function containsCircle(area: Phaser.Geom.Circle, x: number, y: number) {
  return Phaser.Geom.Circle.Contains(area, x, y);
}

type Tapped = Phased & { tappedAt: number };

type ShownMushroom = Tapped &
  Pick<Footing, 'size'> & {
    graphics: Phaser.GameObjects.Graphics;
    hit: Phaser.Geom.Rectangle;
    genes: MushroomGenes;
    turn: number;
  };

type ShownFlower = Tapped & {
  container: Phaser.GameObjects.Container;
  stem: Phaser.GameObjects.Graphics;
  head: Phaser.GameObjects.Graphics;
  hit: Phaser.Geom.Circle;
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
  private mushrooms: Mushroom[] = [];
  private flowers: Flower[] = [];
  private layout: MeadowLayout | undefined;
  private backdrop: Backdrop | undefined;
  private grass: Phaser.GameObjects.Graphics | undefined;
  private tufts: ReturnType<typeof growTufts> = [];
  private mute: Phaser.GameObjects.Graphics | undefined;
  private readonly muteHit = new Phaser.Geom.Circle();
  private readonly shownMushrooms = new Map<string, ShownMushroom>();
  private readonly shownFlowers = new Map<string, ShownFlower>();
  private readonly voice = new MeadowSound(readMuted());
  /** Seconds on the scene's clock, as of the last frame. */
  private clock = 0;

  constructor() {
    super('meadow');
  }

  create(): void {
    const random = mulberry32(this.visitSeed);
    this.mushrooms = firstMushrooms(random);
    this.flowers = firstFlowers(random, 7);
    this.paint();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.paint, this);
    // A browser lets sound start only on a tap's release.
    this.input.on(Phaser.Input.Events.POINTER_UP, this.startSound, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.paint, this);
      this.input.off(Phaser.Input.Events.POINTER_UP, this.startSound, this);
      this.voice.stop();
    });
  }

  override update(time: number): void {
    this.clock = time / 1000;
    const t = this.clock;
    const { layout, backdrop, grass, tufts, shownMushrooms, shownFlowers } =
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
    for (const shown of shownMushrooms.values()) {
      const bounce = wobble(t - shown.tappedAt);
      const stretch = breath(t, shown.phase) + bounce;
      shown.graphics
        .setScale(widthFor(stretch), 1 + stretch)
        .setRotation(shown.turn + bounce * WOBBLE_ROCK);
    }
    for (const shown of shownFlowers.values()) {
      const open = bloom(t - shown.tappedAt);
      shown.container.setRotation(sway(t, shown.phase) * FLOWER_SWAY);
      shown.head.setScale(1 + open).setRotation(open * 0.6);
    }
  }

  private readonly startSound = (): void => {
    this.voice.start();
  };

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
    );
    this.layout = layout;
    // Its own stream, so the backdrop never shifts the creatures' seeds.
    const random = mulberry32(this.visitSeed ^ 0x5e_ed);
    this.backdrop = paintBackdrop(this, this.backdrop, layout, random);
    this.grass ??= this.add.graphics();
    this.tufts = growTufts(layout, random);
    this.paintMushrooms(layout);
    this.paintFlowers(layout);
    this.paintMute(layout);
  };

  private paintMushrooms({ mushrooms }: MeadowLayout): void {
    for (const [index, mushroom] of this.mushrooms.entries()) {
      const place = mushrooms[index];
      if (!place) continue;
      const { x, y, size, splay } = place;
      const { genes, turn } = splayed(mushroomGenes(mushroom), splay);
      const shown =
        this.shownMushrooms.get(mushroom.id) ?? this.showMushroom(mushroom);
      Object.assign(shown, { genes, turn, size });
      shown.graphics.clear().setPosition(x, y).setDepth(y);
      drawMushroom(shown.graphics, genes, size);
      // The box round the stem and the cap, in the mushroom's own frame.
      const cap = capFrame(genes);
      const canvas = toCanvas(size);
      const outline = [
        { x: 0, y: 0 },
        cap({ x: 0, y: genes.capHeight }),
        cap({ x: -genes.capWidth / 2, y: 0 }),
        cap({ x: genes.capWidth / 2, y: 0 }),
      ].map((point) => canvas(point));
      const xs = outline.map((point) => point.x);
      const ys = outline.map((point) => point.y);
      const pad = size * 0.06;
      shown.hit.setTo(
        Math.min(...xs) - pad,
        Math.min(...ys) - pad,
        Math.max(...xs) - Math.min(...xs) + pad * 2,
        Math.max(...ys) - Math.min(...ys) + pad * 2,
      );
    }
  }

  private showMushroom(mushroom: Mushroom): ShownMushroom {
    const hit = new Phaser.Geom.Rectangle();
    const graphics = this.add.graphics().setInteractive(hit, containsRectangle);
    const shown: ShownMushroom = {
      graphics,
      hit,
      genes: mushroomGenes(mushroom),
      turn: 0,
      size: 0,
      phase: phaseOf(mushroom),
      tappedAt: -Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      shown.tappedAt = this.clock;
      const { genes, turn, size } = shown;
      const crown = capFrame(genes)({ x: 0, y: genes.capHeight * 0.9 });
      puffSpores(
        this,
        toWorld(graphics, turn, toCanvas(size)(crown)),
        genes.capWidth * size * 0.75,
        SPORE_DEPTH,
      );
      this.voice.boing(Math.min(1.4, 180 / size));
    });
    this.shownMushrooms.set(mushroom.id, shown);
    return shown;
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
      shown.hit.setTo(0, 0, Math.max(shown.headR * 1.2, TAP_RADIUS));
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
    });
    this.shownFlowers.set(flower.id, shown);
    return shown;
  }

  private paintMute({ mute }: MeadowLayout): void {
    if (!this.mute) {
      this.mute = this.add
        .graphics()
        .setDepth(HUD_DEPTH)
        .setInteractive(this.muteHit, containsCircle);
      this.mute.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.voice.toggleMuted();
        this.voice.pop();
        if (this.layout) this.paintMute(this.layout);
      });
    }
    this.mute.setPosition(mute.x, mute.y);
    this.muteHit.setTo(0, 0, Math.max(mute.r, TAP_RADIUS));
    drawMuteButton(this.mute, mute.r, this.voice.muted);
  }
}
