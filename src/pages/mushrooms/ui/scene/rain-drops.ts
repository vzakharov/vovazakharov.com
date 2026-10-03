import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Circle, Point } from '../../model/geometry';
import { planeSeen } from '../../model/ground';
import { between } from '../../model/random';
import { type DrawnMushroom, drawnMushrooms } from './hit-areas';
import { PALETTE } from './palette';
import {
  dropColumn,
  type DropsInAir,
  firstCrossing,
  gushToStart,
  lerpPoint,
  MOST_DROPS,
  steadyToStart,
} from './rain-fall';
import { browRow, ofGround, type View } from './view';

/** The pool's slots: the drops in the air and the rings of those just landed. */
const SLOTS = 160;
/** How fast a drop falls, in screen heights a second. */
const FALL_SPEED = 1.5;
/** How far a drop drifts across for each px it falls: the streaks' slant. */
const SLANT = 0.22;
/** How far above the screen's top a new drop may start, in screen heights, so they come in staggered. */
const LEAD_IN = 0.7;
/** How long a splash's ring widens and fades, in seconds. */
const SPLASH_S = 0.3;
/** A streak's length and a ring's width at the screen's foot, in screen heights. */
const STREAK_LONG = 0.045;
const RING_WIDE = 0.05;
/** How big a drop landing at the brow is drawn, against one at the screen's foot. */
const FAR_SIZE = 0.45;

/** The baked streak and ring, in px, larger than they are drawn so they stay crisp on a dense screen. */
const STREAK = { key: 'rain-streak', wide: 6, long: 56 } as const;
const RING = { key: 'rain-ring', wide: 64, tall: 24, line: 5 } as const;

/** Where a drop lands: a foot on the plane, or a point on a cap in its graphics' own frame. */
type CapLanding = { cap: Phaser.GameObjects.Graphics; local: Point };
type Landing = { foot: Point } | CapLanding;

/** One of the pool's drops: falling while it has a `landing` and has not splashed, then splashing. */
type Slot = {
  drop: Phaser.GameObjects.Image;
  ring: Phaser.GameObjects.Image;
  landing: Landing | undefined;
  /** How far above its landing the drop started, in px, and when, in seconds. */
  fall: number;
  droppedAt: number;
  /** When it landed and its ring began, in seconds; `undefined` while it falls. */
  splashedAt: number | undefined;
  /** Whether a gush started it, so it falls outside the steady count. */
  gushed: boolean;
  /** How big it is drawn, as a factor from `FAR_SIZE` at the brow to 1 at the screen's foot. */
  nearness: number;
};

function bake(scene: Phaser.Scene): void {
  if (!scene.textures.exists(STREAK.key)) {
    const graphics = scene.make.graphics({}, false);
    // Fainter toward the tail, so a streak reads as a falling drop.
    const steps = 8;
    for (let step = 0; step < steps; step++) {
      const from = (STREAK.long * step) / steps;
      graphics
        .fillStyle(PALETTE.rainDrop, 0.15 + (0.85 * (step + 1)) / steps)
        .fillRect(0, from, STREAK.wide, STREAK.long / steps);
    }
    graphics.generateTexture(STREAK.key, STREAK.wide, STREAK.long).destroy();
  }
  if (!scene.textures.exists(RING.key)) {
    const graphics = scene.make.graphics({}, false);
    graphics
      .lineStyle(RING.line, PALETTE.rainSplash, 1)
      .strokeEllipse(
        RING.wide / 2,
        RING.tall / 2,
        RING.wide - RING.line,
        RING.tall - RING.line,
      );
    graphics.generateTexture(RING.key, RING.wide, RING.tall).destroy();
  }
}

/**
 * The shower's drops and their splashes: at most `MOST_DROPS` images of
 * one baked streak in the air, each falling, slanted, to a landing picked
 * when it starts — the top of the first drawn cap its path crosses, else
 * the ground — and splashing there as a ring that widens and fades. A
 * landing is kept as a foot on the plane or a point on its cap and placed
 * afresh each frame, so a splash stays put as the child turns and walks.
 * A drop in the air finishes its fall whatever the downpour does.
 */
export class RainDrops {
  private readonly scene: Phaser.Scene;
  private readonly depth: number;
  private readonly slots: Slot[] = [];
  private readonly matrix = new Phaser.GameObjects.Components.TransformMatrix();
  private readonly parent = new Phaser.GameObjects.Components.TransformMatrix();
  /** The mushrooms a drop may land on this frame, read once the first drop starts in it. */
  private caps: DrawnMushroom[] | undefined;

  constructor(scene: Phaser.Scene, depth: number) {
    this.scene = scene;
    this.depth = depth;
    bake(scene);
  }

  /**
   * Starts as many drops as `downpour` (0 to 1) asks for at `t`, in
   * seconds, densest under the tapped cloud `under` while it shows, and
   * moves every drop and splash to where `view` puts its landing now.
   */
  update(
    t: number,
    downpour: number,
    under: Circle | undefined,
    view: View,
  ): void {
    this.caps = undefined;
    const wanted = steadyToStart(downpour, this.air());
    for (let index = 0; index < wanted; index++) {
      if (!this.start(t, view, under, LEAD_IN, false)) break;
    }
    for (const slot of this.slots) this.drive(slot, t, view);
  }

  /** Starts a gush of drops under the cloud `under` just tapped while it rains. */
  gush(t: number, under: Circle | undefined, view: View): void {
    this.caps = undefined;
    const wanted = gushToStart(this.inAir());
    for (let index = 0; index < wanted; index++) {
      if (!this.start(t, view, under, LEAD_IN / 3, true, 1)) break;
    }
  }

  /** How many drops are falling now. */
  inAir(): number {
    return this.air().all;
  }

  private air(): DropsInAir {
    const air = { all: 0, gushed: 0 };
    for (const slot of this.slots) {
      if (!falling(slot)) continue;
      air.all++;
      if (slot.gushed) air.gushed++;
    }
    return air;
  }

  /** Starts a drop in a free slot; whether one was free. */
  private start(
    t: number,
    view: View,
    under: Circle | undefined,
    lead: number,
    gushed: boolean,
    share?: number,
  ): boolean {
    const slot = this.inAir() < MOST_DROPS ? this.free(t) : undefined;
    if (!slot) return false;
    const x = dropColumn(Math.random, view.width, under, share);
    const brow = browRow(view, x);
    const row = between(Math.random, brow, view.height);
    const foot = planeSeen(view, view.eye, { x, y: row });
    if (!foot) return true;
    const ground = ofGround(view, foot);
    // From a streak's length over the screen's top, which the walk's bob
    // never moves by as much.
    const fall = ground.y + (STREAK_LONG + Math.random() * lead) * view.height;
    const from = { x: ground.x - SLANT * fall, y: ground.y - fall };
    const cap = this.capOn(from, ground);
    Object.assign(slot, {
      landing: cap ? pick(cap, 'cap', 'local') : { foot },
      fall: fall * (cap?.along ?? 1),
      droppedAt: t,
      splashedAt: undefined,
      gushed,
      nearness:
        FAR_SIZE + (1 - FAR_SIZE) * ((row - brow) / (view.height - brow)),
    });
    return true;
  }

  /** The first drawn cap the path `from` → `to` crosses, and how far along. */
  private capOn(
    from: Point,
    to: Point,
  ): (CapLanding & { along: number }) | undefined {
    this.caps ??= drawnMushrooms(this.scene);
    let first: (CapLanding & { along: number }) | undefined;
    for (const { object, area } of this.caps) {
      const matrix = object.getWorldTransformMatrix(this.matrix, this.parent);
      const a = matrix.applyInverse(from.x, from.y);
      const b = matrix.applyInverse(to.x, to.y);
      const along = firstCrossing(area.cap, a, b);
      if (along === undefined || (first && first.along <= along)) continue;
      first = { cap: object, local: lerpPoint(a, b, along), along };
    }
    return first;
  }

  /** A slot neither falling nor splashing at `t`, made while the pool has room. */
  private free(t: number): Slot | undefined {
    const idle = this.slots.find(
      (slot) =>
        !falling(slot) &&
        (slot.splashedAt === undefined || t - slot.splashedAt >= SPLASH_S),
    );
    if (idle || this.slots.length >= SLOTS) return idle;
    const { scene, depth, slots } = this;
    const slot: Slot = {
      drop: scene.add
        .image(0, 0, STREAK.key)
        .setOrigin(0.5, 1)
        .setRotation(-Math.atan(SLANT))
        .setDepth(depth)
        .setVisible(false),
      ring: scene.add.image(0, 0, RING.key).setDepth(depth).setVisible(false),
      landing: undefined,
      fall: 0,
      droppedAt: 0,
      splashedAt: undefined,
      gushed: false,
      nearness: 1,
    };
    slots.push(slot);
    return slot;
  }

  /** Where `landing` stands in the world now, or `undefined` once its cap is gone. */
  private placed(landing: Landing, view: View): Point | undefined {
    if ('foot' in landing) return ofGround(view, landing.foot);
    const { cap, local } = landing;
    if (!cap.active || !cap.visible) return undefined;
    return cap
      .getWorldTransformMatrix(this.matrix, this.parent)
      .transformPoint(local.x, local.y, { x: 0, y: 0 });
  }

  private drive(slot: Slot, t: number, view: View): void {
    const at = slot.landing && this.placed(slot.landing, view);
    if (!at) {
      slot.landing = undefined;
      slot.drop.setVisible(false);
      slot.ring.setVisible(false);
      return;
    }
    const scale = slot.nearness * view.height;
    const left = slot.fall - FALL_SPEED * view.height * (t - slot.droppedAt);
    if (slot.splashedAt === undefined && left > 0) {
      slot.drop
        .setPosition(at.x - SLANT * left, at.y - left)
        .setScale((scale * STREAK_LONG) / STREAK.long)
        .setVisible(true);
      return;
    }
    slot.drop.setVisible(false);
    slot.splashedAt ??= t;
    const age = (t - slot.splashedAt) / SPLASH_S;
    if (age >= 1) {
      slot.landing = undefined;
      slot.ring.setVisible(false);
      return;
    }
    const opened = 1 - (1 - age) ** 2;
    slot.ring
      .setPosition(at.x, at.y)
      .setScale(((scale * RING_WIDE) / RING.wide) * (0.3 + 0.7 * opened))
      .setAlpha(0.9 * (1 - age))
      .setVisible(true);
  }
}

function falling(slot: Slot): boolean {
  return slot.landing !== undefined && slot.splashedAt === undefined;
}
