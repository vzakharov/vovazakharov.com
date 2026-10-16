import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isSeat, type Span } from '../../model/flight';
import {
  type Aloft,
  centreOf,
  framedOf,
  panOf,
} from '../../model/flight-frame';
import { outOfView } from '../../model/flight-in';
import type { Point } from '../../model/geometry';
import { CLUMP_DISTANCE } from '../../model/ground';
import { dartAt, dartWay } from '../../model/insect-dart';
import type { InsectKind } from '../../model/insect-genes';
import { aloft, carriedFrom, landingBob } from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import { startLeg, steer } from '../../model/insect-steering';
import { caughtAloft, type Flier, isShying } from '../../model/insects';
import { smooth, wobble } from '../../model/motion';
import { aloftAt } from '../../model/pinhole';
import { wingsShut } from '../../model/roost';
import { containsCircle } from './hit-areas';
import type { Lighting } from './ink';
import { type Away, entryAloft, legEnd, ownAway, seenFor } from './insect-away';
import { drawnInsect } from './insect-drawn';
import { eyeFrameOf, mixD } from './insect-frame';
import {
  drawLook,
  fidget,
  type Folded,
  lookOf,
  newDrink,
  poseLook,
} from './insect-look';
import { seatAloft } from './insect-seat';
import { InsectShadows } from './insect-shadow';
import { freshShown, legSetOff, type Shown } from './insect-shown';
import { tappedInsect } from './insect-tap';
import type { MeadowLayout } from './layout';
import { isSeated, type PerchAt } from './perch-hosts';
import type { MeadowSound } from './sound';
import { tapReach } from './tap-reach';
import type { View } from './view';

/** How far a flight's flutter lifts it at most, per unit of the insect's size. */
const FLUTTER = 0.28;
/** How much a tapped insect jolts, against a mushroom's squash. */
const JOLT = 0.7;
/** How long a landing's bob cut short by a take-off takes to die away, in ms. */
const BOB_FADE = 200;
/** How long a shadow takes to fade out as its insect lands, and in as it takes off from a seat, in ms. */
const SHADOW_FADE = 400;

/** How far along from `start` to `end` `point` stands, from 0 to 1, by its distance to each. */
function alongOf(point: Point, start: Point, end: Point): number {
  const gone = Math.hypot(point.x - start.x, point.y - start.y);
  const left = Math.hypot(point.x - end.x, point.y - end.y);
  return gone + left > 0 ? gone / (gone + left) : 1;
}

/** A frame's clock in seconds, where each perch stands, and its wings' fold. */
type Frame = Folded & { t: number; perchAt: PerchAt };

/**
 * The meadow's insects, reconciled with the state by id: each a container of
 * its kind's parts (`insect-look.ts`), above everything in the meadow and
 * under the buttons, flown along its leg every frame. A leg starts where it
 * was last drawn, a fixed point in the world, and ends wherever its perch
 * stands that frame, so it lands on a breathing cap or a swaying flower.
 *
 * Each leg is steered in its own frame on the plane (`insect-frame.ts`) and
 * drawn at its size over its distance (`insect-drawn.ts`). It hides once its
 * drawn extent leaves the screen (`reachesScreen`), never by distance: an
 * insect flies higher than a cap, so the meadow's cull by distance would drop
 * one still on screen. One in from away comes up over the brow
 * (`entryAloft`); one leaving goes out past the screen's edge where the view
 * stood as it set off, by its seed's side (`legEnd`).
 */
export class InsectView {
  private readonly shown = new Map<string, Shown>();
  /** The light the insects are drawn in, as the screen last stood. */
  private lighting: Lighting | undefined;
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
  /** The view the frame is drawn through now. */
  private readonly view: () => View;
  private readonly shadows: InsectShadows;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    depth: number,
    onTap: (id: string) => void,
    view: () => View,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.depth = depth;
    this.onTap = onTap;
    this.view = view;
    this.shadows = new InsectShadows(scene);
  }

  /** Shows what `insects` holds: a new one set off from off screen, a gone one destroyed, a new leg started from where it was drawn. */
  reconcile(insects: readonly Flier[]): void {
    const ids = new Set(insects.map(({ id }) => id));
    for (const [id, shown] of this.shown) {
      if (ids.has(id)) continue;
      shown.container.destroy();
      this.shadows.drop(id);
      this.shown.delete(id);
    }
    for (const flier of insects) {
      const shown = this.shown.get(flier.id) ?? this.show(flier);
      if (shown.flier.legs === flier.legs && shown.flier === flier) continue;
      const newLeg = shown.flier.legs !== flier.legs;
      const last = { ...shown.flier.leg, ...shown.carried };
      shown.flier = flier;
      if (!newLeg) continue;
      shown.carried = carriedFrom(last, flier.leg.departs);
      Object.assign(shown, legSetOff(shown, flier.leg));
      if (flier.leg.to.kind === 'flower') newDrink(shown.look);
    }
  }

  /**
   * Paints every insect at `layout`'s sizes, into the objects it has. Each
   * takes its aim afresh, and forgets where its perch stood last frame, since
   * both were measured in its frame on the screen as it was.
   */
  paint(layout: MeadowLayout, lighting: Lighting): void {
    this.lighting = lighting;
    this.sizes = layout.insectSizes;
    for (const shown of this.shown.values()) {
      shown.look.lighting = lighting;
      shown.aim = undefined;
      shown.steering = { ...shown.steering, perch: undefined };
      this.draw(shown);
    }
  }

  /**
   * Flies every insect to where its leg has it at `t`, in seconds, its perch
   * standing where `perchAt` says, its wings at rest held as `duskLevel`
   * (`duskness`) shuts them.
   */
  update(t: number, perchAt: PerchAt, duskLevel = 0): void {
    const shut = wingsShut(duskLevel);
    const view = this.view();
    for (const shown of this.shown.values())
      this.fly(shown, view, { t, perchAt, shut });
  }

  /** The insect a tap at `finger`, in CSS px, reaches as they are drawn (`tappedInsect`); `undefined` for none. */
  reached(finger: Point): string | undefined {
    return tappedInsect(
      finger,
      // In the order they were added, which is the order they are drawn in.
      [...this.shown.values()]
        .filter(({ container }) => container.visible)
        .map(({ flier, container, hit }) => ({
          ...pick(flier, 'id'),
          ...pick(container, 'x', 'y'),
          r: hit.radius * container.scaleX,
        })),
    );
  }

  /** Where each insect was last drawn, by id: the point its next leg sets off from (`legSetOff`); none for one not yet flown in. */
  drawnAlofts(): ReadonlyMap<string, Aloft> {
    return new Map(
      [...this.shown].flatMap(([id, { entering, drawn }]) =>
        entering ? [] : [[id, drawn] as const],
      ),
    );
  }

  /** How each insect drawn stands away as `view` stands it (`awayOf`), by id: what its leg out is drawn to. */
  awaysOf(view: View): ReadonlyMap<string, Away> {
    return new Map(
      [...this.shown].map(([id, shown]) => [id, this.awayOf(shown, view)]),
    );
  }

  private sizeOf({ flier }: Shown): number {
    return this.sizes[flier.kind];
  }

  private fly(shown: Shown, view: View, { t, perchAt, shut }: Frame): void {
    const now = t * 1000;
    const { leg, id } = shown.flier;
    const size = this.sizeOf(shown);
    const motion = {
      ...pick(shown, 'phase'),
      ...pick(shown.flier, 'kind'),
      flutter: size * FLUTTER,
    };
    const place =
      leg.to.kind === 'away' ? undefined : perchAt(leg.to, shown.flier);
    const seat = place && isSeated(place) ? place : undefined;
    const goal =
      place && (isSeated(place) ? seatAloft(view, place) : place.aloft);
    if (shown.entering) this.enter(shown, view, goal);
    const stretch = this.stretch(shown, now);
    const end =
      stretch.out ??
      legEnd(view, leg.to, () => this.awayOf(shown, view), {
        ...pick(shown, 'from'),
        kept: shown.goal,
        perch: goal,
      });
    shown.goal = end;
    const centre = shown.centre ?? centreOf(view.eye, shown.from, end);
    shown.centre = centre;
    const frame = eyeFrameOf(view);
    const start = framedOf(frame, centre, shown.from);
    const framedEnd = framedOf(frame, centre, end);
    // Its size in its frame, where it was last frame.
    const zoom =
      CLUMP_DISTANCE / mixD(start.forward, framedEnd.forward, shown.flown);
    const stay = { ...leg, ...shown.carried };
    const perched = !stretch.out && isSeat(leg.to);
    // It sets off by where its perch stood as the leg set off, so a perch
    // rocking under a tap never swings the way a short flight bows about.
    const aim = shown.aim ?? framedEnd;
    shown.aim = aim;
    // Settled on its perch, it turns to face up the screen, give or take,
    // as Syama drew it on the caps.
    const { steering, point: flight } = steer(
      shown.steering,
      {
        leg: stretch.span,
        ...pick(shown, 'carried'),
        start,
        end: framedEnd,
        aim,
        sat: shown.turnedFrom,
        perched,
        size: size * zoom,
        motion: { ...motion, flutter: motion.flutter * zoom },
      },
      now,
    );
    shown.steering = steering;
    const { turn } = steering;
    // Shying, it darts off its flight without turning (`insect-dart.ts`).
    const dart = isShying(shown.flier)
      ? dartAt(leg, now, motion.kind) * size * zoom
      : 0;
    const point = {
      x: flight.x + shown.dartWay.x * dart,
      y: flight.y + shown.dartWay.y * dart,
    };
    // A bob cut short by a take-off dies away rather than jumping.
    const bob =
      ((perched ? landingBob(leg, now) : 0) +
        shown.bobFrom * (1 - smooth((now - leg.departs) / BOB_FADE))) *
      size;
    const jolt = 1 + wobble(t - shown.tappedAt) * JOLT;
    const moment = {
      stay,
      now,
      motion,
      ...pick(shown, 'flier'),
      size,
      shut,
    };
    const offset = perched ? fidget(shown.look, moment) : { x: 0, y: 0 };
    const sitting = perched && now >= leg.arrives;
    const flown = sitting ? 1 : alongOf(point, start, framedEnd);
    Object.assign(shown, {
      at: point,
      end: framedEnd,
      offset,
      bob: bob / size,
      flown,
    });
    // Fading out as it lands, and in as it takes off from a seat.
    const presence =
      (perched ? smooth((leg.arrives - now) / SHADOW_FADE) : 1) *
      (isSeat(leg.from) ? smooth((now - leg.departs) / SHADOW_FADE) : 1);
    const drawn = drawnInsect(view, {
      frameAt: centre,
      at: point,
      zoom,
      forward: mixD(start.forward, framedEnd.forward, flown),
      offset,
      sunk: bob,
      flown,
      ends: {
        ...(leg.from.kind === 'away' ? {} : pick(shown, 'from')),
        ...(perched ? { to: end } : {}),
      },
      ...(seat && { seat }),
      sitting,
      presence,
      above: this.depth,
      ...pick(shown, 'span'),
      turn,
      airborne: aloft(stay, now),
    });
    shown.drawn = drawn.aloft;
    this.shadows.lay(id, drawn.shadow);
    const { posed } = drawn;
    shown.container.setVisible(posed !== undefined);
    if (!posed) return;
    const { middle, depth, alpha, hit, nectar, rotation } = posed;
    shown.container
      .setDepth(depth)
      .setAlpha(alpha)
      .setPosition(middle.x, middle.y)
      .setRotation(rotation)
      .setScale(jolt * (1 - bob / size / 2) * middle.zoom);
    shown.hit.setTo(0, 0, hit);
    poseLook(shown.look, moment, {
      middle,
      rotation,
      ...(nectar && { nectar }),
    });
  }

  /** Sets `shown`'s leg in from away off where `entryAloft` says, its first perch standing at `goal`. */
  private enter(shown: Shown, view: View, goal: Aloft | undefined): void {
    const { from } = shown.flier.leg;
    if (from.kind !== 'away') return;
    shown.entering = false;
    const set = entryAloft(
      view,
      from.side,
      this.awayOf(shown, view),
      goal && seenFor(view, goal),
    );
    Object.assign(shown, {
      ...pick(set, 'from', 'out'),
      drawn: set.from,
      centre: undefined,
      flown: 0,
    });
  }

  /**
   * The stretch of `shown`'s leg drawn at `now`, in ms: while it flies out
   * of view (`out`), to past the screen's side, over `outOfView`; else the
   * rest of its leg, which, once it is out, sets off again from there.
   */
  private stretch(shown: Shown, now: number): { span: Span; out?: Aloft } {
    const { leg } = shown.flier;
    const { out, steering } = shown;
    if (!out) return { span: { ...leg, ...pick(shown, 'departs') } };
    const by = leg.departs + outOfView(leg);
    if (now < by) {
      return { span: { ...pick(leg, 'departs'), arrives: by }, out };
    }
    // Out of view: the rest of the way sets off from past the side.
    Object.assign(shown, {
      from: out,
      drawn: out,
      out: undefined,
      departs: by,
      centre: undefined,
      flown: 0,
      aim: undefined,
      end: undefined,
      goal: undefined,
      steering: startLeg(steering),
    });
    return { span: { ...leg, departs: by } };
  }

  /**
   * How an insect stands away (`ownAway`), at its size now — measured
   * afresh, since a new one stands away before its first `draw`.
   */
  private awayOf(shown: Shown, view: View): Away {
    return ownAway(view, shown.look.genes, this.sizeOf(shown), shown.phase);
  }

  private show(flier: Flier): Shown {
    const hit = new Phaser.Geom.Circle();
    if (!this.lighting) throw new Error('An insect is shown before its paint');
    const { look, stack } = lookOf(this.scene, flier, this.lighting);
    const container = this.scene.add
      .container(0, 0, stack)
      .setDepth(this.depth)
      .setInteractive(hit, containsCircle);
    const view = this.view();
    // Over the screen's top middle, until its first leg sets off; one in
    // from away picks its start on its first frame (`enter`).
    const from = aloftAt(view, { x: view.width / 2, y: 0 }, CLUMP_DISTANCE);
    const shown = freshShown({ container, hit, look, flier }, from);
    shown.entering = flier.leg.from.kind === 'away';
    // The top insect under a finger takes the tap for them all and hands it
    // to the one it reaches. An insect is not the meadow: its tap leaves the
    // selection and any picker as they are, whatever `onTap` passes on to the
    // perch under it.
    container.on(
      Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
      (pointer: Phaser.Input.Pointer) => {
        const finger = { x: pointer.worldX, y: pointer.worldY };
        const id = this.reached(finger) ?? flier.id;
        const tapped = this.shown.get(id) ?? shown;
        tapped.tappedAt = this.now();
        const { kind } = tapped.flier;
        const pan = panOf(this.view().eye, tapped.drawn);
        // Caught in the air it shies away from the finger, in its own voice.
        if (caughtAloft(tapped.flier, tapped.tappedAt * 1000)) {
          tapped.dartWay = dartWay(finger, tapped.container, tapped.phase);
          this.voice.shy(kind, pan);
        } else {
          this.voice.takeOff(kind, pan);
        }
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
}
