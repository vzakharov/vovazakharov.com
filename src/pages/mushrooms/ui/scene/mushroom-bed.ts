import * as Phaser from 'phaser';

import type { Meadow, Planted } from '../../model/game';
import type { Point } from '../../model/geometry';
import {
  breath,
  emerge,
  type Phased,
  phaseOf,
  sink,
  SINK_DURATION,
  widthFor,
  wobble,
} from '../../model/motion';
import { type MushroomGenes, mushroomGenes } from '../../model/mushroom-genes';
import { capFrame, splayed } from '../../model/mushroom-pose';
import { drawMushroom, drawMushroomShadow, toCanvas } from './draw-mushroom';
import { containsRectangle } from './hit-areas';
import type { Footing, MeadowLayout } from './layout';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';
import { puffSpores } from './spores';

/** Above everything in the meadow, whose depth is where its foot stands. */
const SPORE_DEPTH = 1e5;
/** A tapped mushroom's rock to and fro, against its squash. */
const WOBBLE_ROCK = 0.35;
/** How much wider a shadow spreads per unit of the mushroom's squash. */
const SHADOW_SPREAD = 0.6;
/** The selected mushroom's glow: its reach past the cap, and its pulse. */
const GLOW_REACH = 0.75;
const GLOW_PERIOD = 1.6;

/** A point in a creature's own frame, placed into the world. */
function toWorld(foot: Point, turn: number, { x, y }: Point): Point {
  return {
    x: foot.x + x * Math.cos(turn) - y * Math.sin(turn),
    y: foot.y + x * Math.sin(turn) + y * Math.cos(turn),
  };
}

type Shown = Phased &
  Pick<Footing, 'size'> & {
    graphics: Phaser.GameObjects.Graphics;
    /** Apart from `graphics`, so it stays on the ground as the mushroom moves. */
    shadow: Phaser.GameObjects.Graphics;
    hit: Phaser.Geom.Rectangle;
    genes: MushroomGenes;
    turn: number;
    tappedAt: number;
    plantedAt: number;
    /** When it was removed, and starts sinking; `Infinity` while it stands. */
    goneAt: number;
  };

/**
 * The meadow's mushrooms on screen, reconciled with the state by id: a new
 * one grows out of the ground, a removed one sinks back into it and is
 * destroyed once it has, and every one stands in its slot of the layout.
 */
export class MushroomBed {
  private readonly shown = new Map<string, Shown>();
  private readonly glow: Phaser.GameObjects.Graphics;
  private selected: string | undefined;

  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  private readonly onTap: (id: string) => void;
  /** Seconds on the scene's clock, which every movement is timed by. */
  private readonly now: () => number;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    onTap: (id: string) => void,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.onTap = onTap;
    this.now = now;
    this.glow = scene.add.graphics().setVisible(false);
  }

  /**
   * Shows what `meadow` holds as of `clock`. A mushroom already there when
   * the meadow opens is shown standing, with no growth.
   */
  reconcile(
    { mushrooms, selected }: Meadow,
    layout: MeadowLayout,
    clock: number,
    opening = false,
  ): void {
    const ids = new Set(mushrooms.map(({ id }) => id));
    for (const [id, shown] of this.shown) {
      if (ids.has(id) || shown.goneAt !== Infinity) continue;
      shown.goneAt = clock;
      shown.graphics.disableInteractive();
      this.voice.sink();
    }
    for (const mushroom of mushrooms) {
      if (this.shown.has(mushroom.id)) continue;
      const shown = this.show(mushroom, opening ? -Infinity : clock);
      this.place(shown, mushroom, layout);
      if (!opening) {
        puffSpores(
          this.scene,
          shown.graphics,
          shown.size * 0.5,
          SPORE_DEPTH,
        );
        this.voice.grow();
      }
    }
    this.selected = selected;
    this.paintGlow();
  }

  /** Stands every mushroom in its slot of `layout`, into the objects it has. */
  paint(meadow: Meadow, layout: MeadowLayout): void {
    for (const mushroom of meadow.mushrooms) {
      const shown = this.shown.get(mushroom.id);
      if (shown) this.place(shown, mushroom, layout);
    }
    this.paintGlow();
  }

  update(t: number): void {
    for (const [id, shown] of this.shown) {
      const grown = Math.min(emerge(t - shown.plantedAt), sink(t - shown.goneAt));
      if (t - shown.goneAt >= SINK_DURATION) {
        shown.graphics.destroy();
        shown.shadow.destroy();
        this.shown.delete(id);
        continue;
      }
      const bounce = wobble(t - shown.tappedAt);
      const stretch = breath(t, shown.phase) + bounce;
      shown.graphics
        .setScale(widthFor(stretch) * grown, (1 + stretch) * grown)
        .setRotation(shown.turn + bounce * WOBBLE_ROCK);
      shown.shadow.setScale(
        (1 + Math.max(0, -stretch) * SHADOW_SPREAD) * grown,
        grown,
      );
    }
    const lit = this.selected === undefined ? undefined : this.shown.get(this.selected);
    if (lit) {
      const pulse = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / GLOW_PERIOD);
      this.glow
        .setAlpha((0.7 + 0.3 * pulse) * Math.min(1, lit.graphics.scaleY))
        .setScale(0.94 + 0.06 * pulse);
    }
  }

  private place(shown: Shown, mushroom: Planted, layout: MeadowLayout): void {
    const place = layout.mushrooms[mushroom.slot];
    if (!place) return;
    const { x, y, size, splay, haze } = place;
    const { genes, turn } = splayed(mushroomGenes(mushroom), splay);
    Object.assign(shown, { genes, turn, size });
    shown.graphics.clear().setPosition(x, y).setDepth(y);
    drawMushroom(shown.graphics, genes, size, haze);
    // Just behind its own mushroom, and before anything standing behind it.
    shown.shadow
      .clear()
      .setPosition(x, y)
      .setDepth(y - 0.5);
    drawMushroomShadow(shown.shadow, genes, size);
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

  /** The glow, behind the selected mushroom's cap and before what stands behind it. */
  private paintGlow(): void {
    const lit = this.selected === undefined ? undefined : this.shown.get(this.selected);
    this.glow.clear().setVisible(lit !== undefined);
    if (!lit) return;
    const { genes, turn, size, graphics } = lit;
    const centre = toWorld(
      graphics,
      turn,
      toCanvas(size)(capFrame(genes)({ x: 0, y: genes.capHeight * 0.45 })),
    );
    const reach = genes.capWidth * size * GLOW_REACH;
    this.glow.setPosition(centre.x, centre.y).setDepth(graphics.depth - 0.75);
    for (let ring = 6; ring >= 1; ring--) {
      this.glow.fillStyle(PALETTE.glow, 0.12);
      this.glow.fillCircle(0, 0, (reach * ring) / 6);
    }
  }

  private show(mushroom: Planted, plantedAt: number): Shown {
    const hit = new Phaser.Geom.Rectangle();
    const graphics = this.scene.add
      .graphics()
      .setInteractive(hit, containsRectangle);
    const shown: Shown = {
      graphics,
      shadow: this.scene.add.graphics(),
      hit,
      genes: mushroomGenes(mushroom),
      turn: 0,
      size: 0,
      phase: phaseOf(mushroom),
      tappedAt: -Infinity,
      plantedAt,
      goneAt: Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      shown.tappedAt = this.now();
      const { genes, turn, size } = shown;
      const crown = capFrame(genes)({ x: 0, y: genes.capHeight * 0.9 });
      puffSpores(
        this.scene,
        toWorld(graphics, turn, toCanvas(size)(crown)),
        genes.capWidth * size * 0.75,
        SPORE_DEPTH,
      );
      this.voice.boing(Math.min(1.4, 180 / size));
      this.onTap(mushroom.id);
    });
    this.shown.set(mushroom.id, shown);
    return shown;
  }
}
