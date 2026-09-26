import * as Phaser from 'phaser';

import type { Meadow, Planted } from '../../model/game';
import { placedAt } from '../../model/geometry';
import {
  beckon,
  breath,
  emerge,
  type Lit,
  phaseOf,
  sink,
  SINK_DURATION,
  type Tapped,
  widthFor,
  wobble,
} from '../../model/motion';
import { type MushroomGenes, mushroomGenes } from '../../model/mushroom-genes';
import {
  TAP_PARTS,
  type TapArea,
  tapArea,
  toCanvas,
} from '../../model/mushroom-outline';
import { capFrame, splayed } from '../../model/mushroom-pose';
import {
  drawMushroom,
  drawMushroomShadow,
  drawSelection,
  drawSelectionRing,
} from './draw-mushroom';
import { containsMushroom, type WithGraphics } from './hit-areas';
import type { Footing, MeadowLayout } from './layout';
import type { MeadowSound } from './sound';
import { puffSpores } from './spores';

/** Above everything in the meadow, whose depth is where its foot stands. */
const SPORE_DEPTH = 1e5;
/** A tapped mushroom's rock to and fro, against its squash. */
const WOBBLE_ROCK = 0.35;
/** How much wider a shadow spreads per unit of the mushroom's squash. */
const SHADOW_SPREAD = 0.6;
/** How much wider the selected mushroom's ring spreads per unit of its squash. */
const RING_SPREAD = 1.5;

type Shown = Tapped &
  Lit &
  WithGraphics &
  Pick<Footing, 'size'> & {
    /** Apart from `graphics`, so it stays on the ground as the mushroom moves. */
    shadow: Phaser.GameObjects.Graphics;
    hit: TapArea;
    genes: MushroomGenes;
    turn: number;
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
  /**
   * The selected mushroom's band, traced round its outlines just behind it and
   * set each frame to its graphics' own pose, so it grows, breathes, rocks and
   * beckons with it; and its ring on the ground, which says which of two
   * crossed mushrooms it is.
   */
  private readonly outline: Phaser.GameObjects.Graphics;
  private readonly footRing: Phaser.GameObjects.Graphics;
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
    this.outline = scene.add.graphics().setVisible(false);
    this.footRing = scene.add.graphics().setVisible(false);
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
        puffSpores(this.scene, shown.graphics, shown.size * 0.5, SPORE_DEPTH);
        this.voice.grow();
      }
    }
    if (selected !== this.selected) {
      const was = this.lit();
      if (was) was.unlitAt = clock;
      this.selected = selected;
      const now = this.lit();
      if (now) Object.assign(now, { litAt: clock, unlitAt: Infinity });
    }
    this.paintSelection();
  }

  /** Stands every mushroom in its slot of `layout`, into the objects it has. */
  paint(meadow: Meadow, layout: MeadowLayout): void {
    for (const mushroom of meadow.mushrooms) {
      const shown = this.shown.get(mushroom.id);
      if (shown) this.place(shown, mushroom, layout);
    }
    this.paintSelection();
  }

  update(t: number): void {
    for (const [id, shown] of this.shown) {
      const { graphics, shadow, plantedAt, goneAt, tappedAt, phase, turn } =
        shown;
      const grown = Math.min(emerge(t - plantedAt), sink(t - goneAt));
      if (t - goneAt >= SINK_DURATION) {
        graphics.destroy();
        shadow.destroy();
        this.shown.delete(id);
        continue;
      }
      const bounce = wobble(t - tappedAt);
      const stretch = breath(t, phase) + bounce + beckon(t, shown);
      graphics
        .setScale(widthFor(stretch) * grown, (1 + stretch) * grown)
        .setRotation(turn + bounce * WOBBLE_ROCK);
      shadow.setScale(
        (1 + Math.max(0, -stretch) * SHADOW_SPREAD) * grown,
        grown,
      );
      if (id !== this.selected) continue;
      this.outline
        .setPosition(graphics.x, graphics.y)
        .setScale(graphics.scaleX, graphics.scaleY)
        .setRotation(graphics.rotation);
      this.footRing.setScale((1 - stretch * RING_SPREAD) * grown);
    }
  }

  private lit(): Shown | undefined {
    return this.selected === undefined
      ? undefined
      : this.shown.get(this.selected);
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
    // Written into the hit area `show` registered, the object Phaser keeps testing.
    const canvas = toCanvas(size);
    const area = tapArea(genes);
    for (const part of TAP_PARTS) {
      shown.hit[part] = area[part].map((point) => canvas(point));
    }
  }

  /** The band round the selected mushroom, just behind it, and its ring over its shadow and under its stem. */
  private paintSelection(): void {
    const lit = this.lit();
    this.outline.clear().setVisible(lit !== undefined);
    this.footRing.clear().setVisible(lit !== undefined);
    if (!lit) return;
    const { genes, size, graphics, hit } = lit;
    this.outline
      .setPosition(graphics.x, graphics.y)
      .setDepth(graphics.depth - 0.3);
    drawSelection(this.outline, hit, size);
    this.footRing
      .setPosition(graphics.x, graphics.y)
      .setDepth(graphics.depth - 0.4);
    drawSelectionRing(this.footRing, genes, size);
  }

  private show(mushroom: Planted, plantedAt: number): Shown {
    const hit: TapArea = { cap: [], gills: [], stem: [] };
    // As a config: Phaser reads any other plain object passed here as one,
    // finds no callback in it and leaves the object hit-testing as `null`.
    const graphics = this.scene.add
      .graphics()
      .setInteractive({ hitArea: hit, hitAreaCallback: containsMushroom });
    const shown: Shown = {
      graphics,
      shadow: this.scene.add.graphics(),
      hit,
      genes: mushroomGenes(mushroom),
      turn: 0,
      size: 0,
      phase: phaseOf(mushroom),
      tappedAt: -Infinity,
      litAt: -Infinity,
      unlitAt: -Infinity,
      plantedAt,
      goneAt: Infinity,
    };
    graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      shown.tappedAt = this.now();
      const { genes, turn, size } = shown;
      const crown = capFrame(genes)({ x: 0, y: genes.capHeight * 0.9 });
      puffSpores(
        this.scene,
        placedAt(graphics, turn, toCanvas(size)(crown)),
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
