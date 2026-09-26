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
import {
  domeHeight,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { capFrame, splayed, stemAt } from '../../model/mushroom-pose';
import { drawMushroom, drawMushroomShadow, toCanvas } from './draw-mushroom';
import { containsMushroom, type MushroomHit } from './hit-areas';
import type { Footing, MeadowLayout } from './layout';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';
import { puffSpores } from './spores';

/** Above everything in the meadow, whose depth is where its foot stands. */
const SPORE_DEPTH = 1e5;
/** How finely a mushroom's tap area follows its dome, and how far past it it reaches. */
const HIT_STEPS = 12;
const HIT_PAD = 0.08;
/** A tapped mushroom's rock to and fro, against its squash. */
const WOBBLE_ROCK = 0.35;
/** How much wider a shadow spreads per unit of the mushroom's squash. */
const SHADOW_SPREAD = 0.6;
/**
 * The selected mushroom's glow: its reach round the cap, the alpha of each of
 * its rings, and its pulse. A ring of light on the ground round the foot says
 * which of two crossed mushrooms it is.
 */
const GLOW_REACH = 0.6;
const GLOW_RINGS = 5;
const GLOW_ALPHA = 0.07;
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
    hit: MushroomHit;
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
    this.glow = scene.add.graphics().setVisible(false);
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
      const grown = Math.min(
        emerge(t - shown.plantedAt),
        sink(t - shown.goneAt),
      );
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
    const lit = this.lit();
    if (lit) {
      const pulse = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / GLOW_PERIOD);
      const alpha = (0.7 + 0.3 * pulse) * Math.min(1, lit.graphics.scaleY);
      this.glow.setAlpha(alpha).setScale(0.94 + 0.06 * pulse);
      this.footRing.setAlpha(alpha).setScale(0.96 + 0.08 * pulse);
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
    // The cap and the stem as drawn, a little padded, in the mushroom's own frame.
    const cap = capFrame(genes);
    const canvas = toCanvas(size);
    const half = genes.capWidth / 2;
    const dome = Array.from({ length: HIT_STEPS + 1 }, (_, index) => {
      const across = -half + (2 * half * index) / HIT_STEPS;
      return cap({
        x: across * (1 + HIT_PAD),
        y: domeHeight(genes, across) + genes.capHeight * HIT_PAD,
      });
    });
    const underside = [
      cap({ x: half, y: -genes.capHeight * 0.2 }),
      cap({ x: -half, y: -genes.capHeight * 0.2 }),
    ];
    shown.hit.cap.setTo([...dome, ...underside].map((point) => canvas(point)));
    const reach = (genes.stemWidth / 2) * genes.footBulge * (1 + HIT_PAD * 4);
    const { x: topX, y: topY } = stemAt(genes, 1);
    shown.hit.stem.setTo(
      [
        { x: -reach, y: 0 },
        { x: reach, y: 0 },
        { x: topX + reach, y: topY },
        { x: topX - reach, y: topY },
      ].map((point) => canvas(point)),
    );
  }

  /** The glow, behind the selected mushroom's cap and before what stands behind it, and its ring on the ground. */
  private paintGlow(): void {
    const lit = this.lit();
    this.glow.clear().setVisible(lit !== undefined);
    this.footRing.clear().setVisible(lit !== undefined);
    if (!lit) return;
    const { genes, turn, size, graphics } = lit;
    const centre = toWorld(
      graphics,
      turn,
      toCanvas(size)(capFrame(genes)({ x: 0, y: genes.capHeight * 0.45 })),
    );
    const reach = genes.capWidth * size * GLOW_REACH;
    this.glow.setPosition(centre.x, centre.y).setDepth(graphics.depth - 0.75);
    for (let ring = GLOW_RINGS; ring >= 1; ring--) {
      this.glow.fillStyle(PALETTE.glow, GLOW_ALPHA);
      this.glow.fillCircle(0, 0, (reach * ring) / GLOW_RINGS);
    }
    // Over its shadow, under its stem.
    this.footRing
      .setPosition(graphics.x, graphics.y)
      .setDepth(graphics.depth - 0.4);
    const across = genes.capWidth * size * 0.7;
    this.footRing.lineStyle(Math.max(3, size * 0.022), PALETTE.glow, 0.95);
    this.footRing.strokeEllipse(0, 0, across, across * 0.22);
  }

  private show(mushroom: Planted, plantedAt: number): Shown {
    const hit = {
      cap: new Phaser.Geom.Polygon(),
      stem: new Phaser.Geom.Polygon(),
    };
    const graphics = this.scene.add
      .graphics()
      .setInteractive(hit, containsMushroom);
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
