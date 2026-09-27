import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Perch, Side } from '../../model/flight';
import type { Point } from '../../model/geometry';
import { type InsectGenes, insectGenes } from '../../model/insect-genes';
import {
  bodyTurn,
  flightPoint,
  flyingTurn,
  heading,
  landingBob,
  type Path,
  turned,
  type Turns,
  wingBeat,
} from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import type { Flier } from '../../model/insects';
import { phaseOf, wobble } from '../../model/motion';
import { drawInsect, type InsectParts } from './draw-insect';
import { containsCircle, type TappedFigure } from './hit-areas';
import type { MeadowLayout } from './layout';
import { tapReach } from './sky-layout';
import type { MeadowSound } from './sound';

/** How far a flight's flutter lifts it at most, per unit of the insect's size. */
const FLUTTER = 0.28;
/** How far its wings fold at the most closed, seen from above, as a share of open. */
const FOLDED = 0.12;
/** How much the hind wings trail the fore wings' beat, as a share of the way open. */
const HIND_LAG = 0.15;
/** How much a tapped butterfly jolts, against a mushroom's squash. */
const JOLT = 0.7;
/**
 * The band of the screen's height a butterfly flies in from and out to off
 * screen, its phase picking where.
 */
const AWAY_BAND = [0.18, 0.5] as const;

/** Where a perch stands on screen this frame, `undefined` while it has nowhere to be. */
export type PerchAt = (perch: Perch, insect: Flier) => Point | undefined;

type Shown = TappedFigure &
  InsectParts & {
    genes: InsectGenes;
    flier: Flier;
    /** Where its current leg set off, as fractions of the screen's width and height. */
    from: Point;
    /** Where it was drawn last frame, on screen. */
    at: Point;
    /** Where its perch stood last frame, which it keeps to while the perch has nowhere to be. */
    end: Point | undefined;
    /** Which way its flight heads, in radians from +x. */
    facing: number;
    /** How it was turned as its leg set off, which it turns from into its heading; `undefined` flying in. */
    turnedFrom: number | undefined;
    /** Its current leg's turns, fixed on the leg's first frame and at its landing. */
    turns: Turns | undefined;
  };

/**
 * The meadow's butterflies on screen, reconciled with the state by id: each a
 * container of its hind wings, fore wings and body, above everything in the
 * meadow and under the buttons, flown along its leg every frame. A leg's
 * start is where it was last drawn, kept as a share of the screen so a
 * resize mid-flight never makes it jump; its end is wherever its perch
 * stands that frame, so it lands on a breathing cap or a swaying flower.
 */
export class InsectView {
  private readonly shown = new Map<string, Shown>();
  private width = 1;
  private height = 1;
  private size = 1;
  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  private readonly depth: number;
  /** Seconds on the scene's clock. */
  private readonly now: () => number;
  private readonly onTap: (id: string) => void;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    depth: number,
    onTap: (id: string) => void,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.depth = depth;
    this.onTap = onTap;
  }

  /** Shows what `insects` holds: a new one set off from off screen, a gone one destroyed, a new leg started from where it was drawn. */
  reconcile(insects: readonly Flier[]): void {
    const ids = new Set(insects.map(({ id }) => id));
    for (const [id, shown] of this.shown) {
      if (ids.has(id)) continue;
      shown.container.destroy();
      this.shown.delete(id);
    }
    for (const flier of insects) {
      const shown = this.shown.get(flier.id) ?? this.show(flier);
      if (shown.flier.legs === flier.legs && shown.flier === flier) continue;
      const newLeg = shown.flier.legs !== flier.legs;
      shown.flier = flier;
      if (!newLeg) continue;
      const { from } = flier.leg;
      shown.from =
        from.kind === 'away'
          ? this.fraction(this.offScreen(from.side, shown))
          : this.fraction(shown.at);
      shown.end = undefined;
      shown.turns = undefined;
      shown.turnedFrom =
        from.kind === 'away' ? undefined : shown.container.rotation;
    }
  }

  /** Paints every butterfly at `layout`'s size, into the objects it has. */
  paint({ width, height, insectSize }: MeadowLayout): void {
    this.width = width;
    this.height = height;
    this.size = insectSize;
    for (const shown of this.shown.values()) this.draw(shown);
  }

  /** Flies every butterfly to where its leg has it at `t`, in seconds, its perch standing where `perchAt` says. */
  update(t: number, perchAt: PerchAt): void {
    for (const shown of this.shown.values()) this.fly(shown, t, perchAt);
  }

  private fly(shown: Shown, t: number, perchAt: PerchAt): void {
    const now = t * 1000;
    const { leg } = shown.flier;
    const motion = { ...pick(shown, 'phase'), flutter: this.size * FLUTTER };
    const start = this.toScreen(shown.from);
    const end =
      (leg.to.kind === 'away'
        ? this.offScreen(leg.to.side, shown)
        : perchAt(leg.to, shown.flier)) ??
      shown.end ??
      start;
    const path: Path = { ...leg, start, end };
    const point = flightPoint(path, now, motion);
    // A flight going nowhere has no heading, so it keeps the one it had.
    if (Math.hypot(end.x - start.x, end.y - start.y) > 1) {
      shown.facing = heading(path, now, motion);
    }
    const bob = landingBob(leg, now) * this.size;
    const jolt = 1 + wobble(t - shown.tappedAt) * JOLT;
    Object.assign(shown, { end, at: point });
    const flying = flyingTurn(shown.facing, path, now, motion);
    // Settled on its perch, it turns to face up the screen, give or take,
    // as Syama drew it on the caps.
    shown.turns = turned(
      shown.turns,
      shown.turnedFrom,
      leg,
      now,
      flying,
      leg.to.kind !== 'away',
    );
    shown.container
      .setPosition(point.x, point.y + bob)
      .setRotation(bodyTurn(leg, now, flying, shown.turns))
      .setScale(jolt * (1 - bob / this.size / 2));
    const open = wingBeat(leg, now, motion);
    shown.fore.setScale(FOLDED + (1 - FOLDED) * open, 1);
    const lagging = open + (1 - open) * HIND_LAG;
    shown.hind.setScale(FOLDED + (1 - FOLDED) * lagging, 1);
  }

  private show(flier: Flier): Shown {
    const hit = new Phaser.Geom.Circle();
    const [hind, fore, body] = [0, 1, 2].map(() => this.scene.add.graphics());
    if (!hind || !fore || !body) throw new Error('A butterfly with no parts');
    const container = this.scene.add
      .container(0, 0, [hind, fore, body])
      .setDepth(this.depth)
      .setInteractive(hit, containsCircle);
    const genes = insectGenes(flier);
    const shown: Shown = {
      container,
      hind,
      fore,
      body,
      hit,
      genes,
      flier,
      from: { x: 0, y: 0 },
      at: { x: 0, y: 0 },
      end: undefined,
      facing: 0,
      turnedFrom: undefined,
      turns: undefined,
      phase: phaseOf(flier),
      tappedAt: -Infinity,
    };
    const { from } = flier.leg;
    if (from.kind === 'away') {
      shown.at = this.offScreen(from.side, shown);
      shown.from = this.fraction(shown.at);
    }
    // A butterfly is not the meadow: its tap leaves the selection and any picker as they are.
    container.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      shown.tappedAt = this.now();
      this.voice.trill();
      this.onTap(flier.id);
    });
    this.draw(shown);
    this.shown.set(flier.id, shown);
    return shown;
  }

  private draw(shown: Shown): void {
    drawInsect(shown, shown.genes, this.size);
    shown.hit.setTo(0, 0, tapReach((wingspan(shown.genes) * this.size) / 2));
  }

  /** Just past `side`'s edge, at a height in `AWAY_BAND` its phase picks. */
  private offScreen(side: Side, { genes, phase }: Shown): Point {
    const reach = wingspan(genes) * this.size;
    const down =
      AWAY_BAND[0] +
      (AWAY_BAND[1] - AWAY_BAND[0]) * (0.5 + 0.5 * Math.sin(phase * 3));
    return {
      x: side === 'left' ? -reach : this.width + reach,
      y: this.height * down,
    };
  }

  private fraction({ x, y }: Point): Point {
    return { x: x / this.width, y: y / this.height };
  }

  private toScreen({ x, y }: Point): Point {
    return { x: x * this.width, y: y * this.height };
  }
}
