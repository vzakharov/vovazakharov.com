import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isSeat, type Perch, type Side } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { carriedFrom, landingBob } from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import type { Carried } from '../../model/insect-paths';
import { startLeg, steer, type Steering } from '../../model/insect-steering';
import type { Flier } from '../../model/insects';
import { phaseOf, smooth, wobble } from '../../model/motion';
import { containsCircle, type TappedFigure } from './hit-areas';
import {
  drawLook,
  fidget,
  type Flying,
  type Look,
  lookOf,
  newDrink,
  poseLook,
} from './insect-look';
import { tappedInsect } from './insect-tap';
import type { MeadowLayout } from './layout';
import { tapReach } from './sky-layout';
import type { MeadowSound } from './sound';

/** How far a flight's flutter lifts it at most, per unit of the insect's size. */
const FLUTTER = 0.28;
/** How much a tapped insect jolts, against a mushroom's squash. */
const JOLT = 0.7;
/** How long a landing's bob cut short by a take-off takes to die away, in ms. */
const BOB_FADE = 200;
/**
 * The band of the screen's height a butterfly flies in from and out to off
 * screen, its phase picking where.
 */
const AWAY_BAND = [0.18, 0.5] as const;

/** Where an insect sits on a perch, and at a flower the head's middle it drinks from. */
export type Perched = Point & { nectar?: Point };

/** Where a perch stands on screen this frame, `undefined` while it has nowhere to be. */
export type PerchAt = (perch: Perch, insect: Flier) => Perched | undefined;

/** An insect on screen: its look, and where and how it flies. */
type Shown = TappedFigure &
  Flying & {
    look: Look;
    /** How far its open wings span on screen, in pixels, as last painted. */
    span: number;
    /** Where its current leg set off, as fractions of the screen's width and height. */
    from: Point;
    /** Where its flight had it last frame, on screen. */
    at: Point;
    /** How far its fidgets on its perch moved it off `at` last frame. */
    offset: Point;
    /** How far its landing's bob sank it last frame, in units of its size. */
    bob: number;
    /** How far a landing's bob had sunk it as its current leg set off, which dies away over `BOB_FADE`. */
    bobFrom: number;
    /** Where its perch stood last frame, which it keeps to while the perch has nowhere to be. */
    end: Point | undefined;
    /** How its body is held from one frame to the next (`steer`). */
    steering: Steering;
    /**
     * Where its perch stood on its current leg's first frame, or the first
     * since the screen was last painted, which its leg sets off by; `undefined`
     * before it.
     */
    aim: Point | undefined;
    /** How it was turned as its leg set off, which it turns from into its heading; `undefined` flying in. */
    turnedFrom: number | undefined;
    /** What its current leg carried over from the one it cut short or followed. */
    carried: Carried;
  };

/**
 * The meadow's insects on screen, reconciled with the state by id: each a
 * container of its kind's parts (`insect-look.ts`), above everything in the
 * meadow and under the buttons, flown along its leg every frame. A leg's
 * start is where it was last drawn, kept as a share of the screen so a
 * resize mid-flight never makes it jump; its end is wherever its perch
 * stands that frame, so it lands on a breathing cap or a swaying flower.
 */
export class InsectView {
  private readonly shown = new Map<string, Shown>();
  private width = 1;
  private height = 1;
  private sizes: Readonly<Record<InsectKind, number>> = {
    butterfly: 1,
    fly: 1,
    bee: 1,
  };
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
      const last = { ...shown.flier.leg, ...shown.carried };
      shown.flier = flier;
      if (!newLeg) continue;
      const { from, to, departs } = flier.leg;
      shown.carried = carriedFrom(last, departs);
      // From where it was drawn, fidgets and all, so a startle never jumps.
      shown.from =
        from.kind === 'away'
          ? this.fraction(this.offScreen(from.side, shown))
          : this.fraction({
              x: shown.at.x + shown.offset.x,
              y: shown.at.y + shown.offset.y,
            });
      shown.bobFrom = shown.bob;
      shown.end = undefined;
      shown.steering = startLeg(shown.steering);
      shown.aim = undefined;
      if (to.kind === 'flower') newDrink(shown.look);
      shown.turnedFrom =
        from.kind === 'away' ? undefined : shown.container.rotation;
    }
  }

  /**
   * Paints every insect at `layout`'s sizes, into the objects it has. Each
   * takes its aim afresh, and forgets where its perch stood last frame, since
   * both were measured on the screen as it was.
   */
  paint({ width, height, insectSizes }: MeadowLayout): void {
    this.width = width;
    this.height = height;
    this.sizes = insectSizes;
    for (const shown of this.shown.values()) {
      shown.aim = undefined;
      shown.steering = { ...shown.steering, perch: undefined };
      this.draw(shown);
    }
  }

  /** Flies every insect to where its leg has it at `t`, in seconds, its perch standing where `perchAt` says. */
  update(t: number, perchAt: PerchAt): void {
    for (const shown of this.shown.values()) this.fly(shown, t, perchAt);
  }

  /** The insect a tap at `finger`, in CSS px, reaches as they are drawn (`tappedInsect`); `undefined` for none. */
  reached(finger: Point): string | undefined {
    return tappedInsect(
      finger,
      // In the order they were added, which is the order they are drawn in.
      [...this.shown.values()].map(({ flier, container, hit }) => ({
        ...pick(flier, 'id'),
        ...pick(container, 'x', 'y'),
        r: hit.radius * container.scaleX,
      })),
    );
  }

  private sizeOf({ flier }: Shown): number {
    return this.sizes[flier.kind];
  }

  private fly(shown: Shown, t: number, perchAt: PerchAt): void {
    const now = t * 1000;
    const { leg } = shown.flier;
    const size = this.sizeOf(shown);
    const motion = {
      ...pick(shown, 'phase'),
      ...pick(shown.flier, 'kind'),
      flutter: size * FLUTTER,
    };
    const start = this.toScreen(shown.from);
    const seated =
      leg.to.kind === 'away' ? undefined : perchAt(leg.to, shown.flier);
    const end =
      (leg.to.kind === 'away' ? this.offScreen(leg.to.side, shown) : seated) ??
      shown.end ??
      start;
    const stay = { ...leg, ...shown.carried };
    const perched = isSeat(leg.to);
    // It sets off by where its perch stood as the leg set off, so a perch
    // rocking under a tap never swings the way a short flight bows about.
    const aim = shown.aim ?? end;
    shown.aim = aim;
    // Settled on its perch, it turns to face up the screen, give or take,
    // as Syama drew it on the caps.
    const { steering, point } = steer(
      shown.steering,
      {
        leg,
        ...pick(shown, 'carried'),
        start,
        end,
        aim,
        sat: shown.turnedFrom,
        perched,
        size,
        motion,
      },
      now,
    );
    shown.steering = steering;
    const { turn } = steering;
    // A bob cut short by a take-off dies away rather than jumping.
    const bob =
      ((perched ? landingBob(leg, now) : 0) +
        shown.bobFrom * (1 - smooth((now - leg.departs) / BOB_FADE))) *
      size;
    const jolt = 1 + wobble(t - shown.tappedAt) * JOLT;
    const moment = { stay, now, motion, ...pick(shown, 'flier'), size };
    const offset = perched ? fidget(shown.look, moment) : { x: 0, y: 0 };
    Object.assign(shown, { end, at: point, offset, bob: bob / size });
    const middle = { x: point.x + offset.x, y: point.y + bob + offset.y };
    shown.container
      .setPosition(middle.x, middle.y)
      .setRotation(turn)
      .setScale(jolt * (1 - bob / size / 2));
    poseLook(shown.look, moment, {
      middle,
      rotation: turn,
      nectar: seated?.nectar,
    });
  }

  private show(flier: Flier): Shown {
    const hit = new Phaser.Geom.Circle();
    const { look, stack } = lookOf(this.scene, flier);
    const container = this.scene.add
      .container(0, 0, stack)
      .setDepth(this.depth)
      .setInteractive(hit, containsCircle);
    const shown: Shown = {
      container,
      hit,
      look,
      flier,
      span: 0,
      from: { x: 0, y: 0 },
      at: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      bob: 0,
      bobFrom: 0,
      end: undefined,
      steering: {
        facing: 0,
        turn: 0,
        at: -Infinity,
        setOff: undefined,
        perch: undefined,
      },
      aim: undefined,
      turnedFrom: undefined,
      carried: { launch: 0, speed: 0, drink: 0 },
      phase: phaseOf(flier),
      tappedAt: -Infinity,
    };
    const { from } = flier.leg;
    if (from.kind === 'away') {
      shown.at = this.offScreen(from.side, shown);
      shown.from = this.fraction(shown.at);
    }
    // The top insect under a finger takes the tap for them all and hands it
    // to the one it reaches. An insect is not the meadow: its tap leaves the
    // selection and any picker as they are, whatever `onTap` passes on to the
    // perch under it.
    container.on(
      Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
      (pointer: Phaser.Input.Pointer) => {
        const id =
          this.reached({ x: pointer.worldX, y: pointer.worldY }) ?? flier.id;
        const tapped = this.shown.get(id) ?? shown;
        tapped.tappedAt = this.now();
        this.voice.takeOff(tapped.flier.kind);
        this.onTap(tapped.flier.id);
      },
    );
    this.draw(shown);
    this.shown.set(flier.id, shown);
    return shown;
  }

  private draw(shown: Shown): void {
    const size = this.sizeOf(shown);
    drawLook(shown.look, size, shown.flier, this.now() * 1000);
    shown.span = wingspan(shown.look.genes) * size;
    shown.hit.setTo(0, 0, tapReach(shown.span / 2));
  }

  /** Just past `side`'s edge, at a height in `AWAY_BAND` its phase picks. */
  private offScreen(side: Side, shown: Shown): Point {
    const reach = wingspan(shown.look.genes) * this.sizeOf(shown);
    const down =
      AWAY_BAND[0] +
      (AWAY_BAND[1] - AWAY_BAND[0]) * (0.5 + 0.5 * Math.sin(shown.phase * 3));
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
