import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isSeat, type Perch, type Side } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import {
  bodyTurn,
  carriedFrom,
  flyingTurn,
  landingBob,
  turned,
  type Turns,
  wrap,
} from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import {
  type Carried,
  flightPoint,
  heading,
  type Path,
} from '../../model/insect-paths';
import type { Flier } from '../../model/insects';
import { phaseOf, wobble } from '../../model/motion';
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
import type { MeadowLayout } from './layout';
import { tapReach } from './sky-layout';
import type { MeadowSound } from './sound';

/** How far a flight's flutter lifts it at most, per unit of the insect's size. */
const FLUTTER = 0.28;
/** How fast its body turns at the most, in radians a second: 0.18 in a 60 Hz frame. */
const TURN_RATE = 10.8;
/** A flight shorter than this, in units of the insect's size, goes nowhere and has no heading of its own. */
const GOING_NOWHERE = 0.3;
/** How much a tapped insect jolts, against a mushroom's squash. */
const JOLT = 0.7;
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
    /** Where its perch stood last frame, which it keeps to while the perch has nowhere to be. */
    end: Point | undefined;
    /** Which way its flight heads, in radians from +x. */
    facing: number;
    /** When it was last flown, in seconds on the scene's clock; `-Infinity` before its first frame. */
    flownAt: number;
    /** Where its perch stood on its current leg's first frame, which it heads for; `undefined` before it. */
    aim: Point | undefined;
    /** How it was turned as its leg set off, which it turns from into its heading; `undefined` flying in. */
    turnedFrom: number | undefined;
    /** Its current leg's turns, fixed on the leg's first frame and at its landing. */
    turns: Turns | undefined;
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
      shown.end = undefined;
      shown.turns = undefined;
      shown.aim = undefined;
      if (to.kind === 'flower') newDrink(shown.look);
      shown.turnedFrom =
        from.kind === 'away' ? undefined : shown.container.rotation;
    }
  }

  /** Paints every insect at `layout`'s sizes, into the objects it has. */
  paint({ width, height, insectSizes }: MeadowLayout): void {
    this.width = width;
    this.height = height;
    this.sizes = insectSizes;
    for (const shown of this.shown.values()) this.draw(shown);
  }

  /** Flies every insect to where its leg has it at `t`, in seconds, its perch standing where `perchAt` says. */
  update(t: number, perchAt: PerchAt): void {
    for (const shown of this.shown.values()) this.fly(shown, t, perchAt);
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
    const path: Path = { ...stay, start, end };
    const point = flightPoint(path, now, motion);
    const perched = isSeat(leg.to);
    // It heads for where its perch stood as the leg set off, so a perch
    // rocking under a tap never swings a short flight's heading about. A
    // flight going nowhere, a flutter up and back onto the same seat, has no
    // heading, so it keeps the one it had; and a flier that has landed keeps
    // the heading it landed on, which its rest facing turns from, however its
    // perch sways under it.
    const aim = shown.aim ?? end;
    shown.aim = aim;
    const still =
      Math.hypot(aim.x - start.x, aim.y - start.y) <= size * GOING_NOWHERE;
    if (!still && !(perched && now >= leg.arrives)) {
      shown.facing = heading({ ...path, end: aim }, now, motion);
    }
    const bob = perched ? landingBob(leg, now) * size : 0;
    const jolt = 1 + wobble(t - shown.tappedAt) * JOLT;
    const moment = { stay, now, motion, ...pick(shown, 'flier'), size };
    const offset = perched ? fidget(shown.look, moment) : { x: 0, y: 0 };
    Object.assign(shown, { end, at: point, offset });
    const flying = flyingTurn(shown.facing, path, now, motion);
    // Settled on its perch, it turns to face up the screen, give or take,
    // as Syama drew it on the caps.
    shown.turns = turned(
      shown.turns,
      shown.turnedFrom,
      leg,
      now,
      flying,
      perched,
    );
    // Its body follows the turn its leg gives it no faster than a body can,
    // so no blend of a take-off, a zigzag and a landing ever spins it.
    const wanted = bodyTurn(leg, now, flying, shown.turns);
    const most = TURN_RATE * Math.max(0, t - shown.flownAt);
    const was = shown.container.rotation;
    const turn = Number.isFinite(most)
      ? wrap(was + Math.max(-most, Math.min(most, wrap(wanted - was))))
      : wanted;
    shown.flownAt = t;
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
      end: undefined,
      facing: 0,
      aim: undefined,
      flownAt: -Infinity,
      turnedFrom: undefined,
      turns: undefined,
      carried: { launch: 0, speed: 0, drink: 0 },
      phase: phaseOf(flier),
      tappedAt: -Infinity,
    };
    const { from } = flier.leg;
    if (from.kind === 'away') {
      shown.at = this.offScreen(from.side, shown);
      shown.from = this.fraction(shown.at);
    }
    // An insect is not the meadow: its own tap leaves the selection and any
    // picker as they are, whatever `onTap` passes on to the perch under it.
    container.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      shown.tappedAt = this.now();
      this.voice.takeOff(flier.kind);
      this.onTap(flier.id);
    });
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
