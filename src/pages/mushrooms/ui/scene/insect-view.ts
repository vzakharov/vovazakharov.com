import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isSeat, type Span } from '../../model/flight';
import { outOfView } from '../../model/flight-in';
import type { Point } from '../../model/geometry';
import { CLUMP_DISTANCE } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import { carriedFrom, landingBob } from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import { startLeg, steer } from '../../model/insect-steering';
import type { Flier } from '../../model/insects';
import { smooth, wobble } from '../../model/motion';
import { onHost } from './bed-place';
import { containsCircle } from './hit-areas';
import type { Lighting } from './ink';
import {
  type Away,
  awayDown,
  entryAloft,
  offAloft,
  reachesScreen,
  seenFor,
} from './insect-away';
import {
  type Aloft,
  aloftAt,
  aloftFramed,
  centreOf,
  framedOf,
  mixD,
  type SeatEnds,
} from './insect-frame';
import { drawLook, fidget, lookOf, newDrink, poseLook } from './insect-look';
import { drawnFlier, drawnSitter, seatAloft } from './insect-seat';
import { freshShown, type Shown } from './insect-shown';
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

/** How far along from `start` to `end` `point` stands, from 0 to 1, by its distance to each. */
function alongOf(point: Point, start: Point, end: Point): number {
  const gone = Math.hypot(point.x - start.x, point.y - start.y);
  const left = Math.hypot(point.x - end.x, point.y - end.y);
  return gone + left > 0 ? gone / (gone + left) : 1;
}

/** How far `aloft` stands from `view`'s eye on the plane, in the clump's size. */
function fromEye(view: View, aloft: Aloft): number {
  return Math.hypot(aloft.x - view.eye.x, aloft.y - view.eye.y);
}

/**
 * The meadow's insects, reconciled with the state by id: each a container of
 * its kind's parts (`insect-look.ts`), above everything in the meadow and
 * under the buttons, flown along its leg every frame. A leg's start is where
 * it was last drawn, a fixed point in the world; its end is wherever its
 * perch stands that frame, so it lands on a breathing cap or a swaying
 * flower.
 *
 * Every leg is flown on the plane, steered in its frame (`insect-frame.ts`):
 * the opening layout's pinhole stood at the eye, turned to a centre fixed as
 * the leg sets off, its size there its own over its distance. It is drawn at
 * its own size over its distance, veered round the eye (`drawnFlier`); one
 * sitting on a cap or a flower, where that host draws its seat
 * (`drawnSitter`). It is hidden once its own drawn extent leaves the screen
 * (`reachesScreen`), however near the eye that is: an insect flies higher
 * than a cap, so the meadow's own cull by distance would drop one still on
 * the screen. One in from away comes up over the brow (`entryAloft`), and
 * where the screen shows no open perch, flies out of view by the side its
 * perch stands to before the rest of its way; one leaving goes out just past
 * the screen's edge where the view stands now, by its seed's side.
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
      // From where it was drawn, fidgets and all, so a startle never jumps;
      // one in from away picks its start on its first frame (`enter`).
      Object.assign(shown, {
        from: shown.drawn,
        out: undefined,
        departs,
        centre: undefined,
        flown: 0,
        end: undefined,
        goal: undefined,
        entering: from.kind === 'away',
        bobFrom: shown.bob,
        steering: startLeg(shown.steering),
        aim: undefined,
        turnedFrom: from.kind === 'away' ? undefined : shown.container.rotation,
      });
      if (to.kind === 'flower') newDrink(shown.look);
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

  /** Flies every insect to where its leg has it at `t`, in seconds, its perch standing where `perchAt` says. */
  update(t: number, perchAt: PerchAt): void {
    const view = this.view();
    for (const shown of this.shown.values()) this.fly(shown, view, t, perchAt);
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

  private sizeOf({ flier }: Shown): number {
    return this.sizes[flier.kind];
  }

  private fly(shown: Shown, view: View, t: number, perchAt: PerchAt): void {
    const now = t * 1000;
    const { leg } = shown.flier;
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
      (leg.to.kind === 'away'
        ? offAloft(
            view,
            leg.to.side,
            this.awayOf(shown, view),
            fromEye(view, shown.from),
          )
        : goal) ??
      shown.goal ??
      shown.from;
    shown.goal = end;
    const centre = shown.centre ?? centreOf(view.eye, shown.from, end);
    shown.centre = centre;
    const start = framedOf(view, centre, shown.from);
    const framedEnd = framedOf(view, centre, end);
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
    const { steering, point } = steer(
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
    // A bob cut short by a take-off dies away rather than jumping.
    const bob =
      ((perched ? landingBob(leg, now) : 0) +
        shown.bobFrom * (1 - smooth((now - leg.departs) / BOB_FADE))) *
      size;
    const jolt = 1 + wobble(t - shown.tappedAt) * JOLT;
    const moment = { stay, now, motion, ...pick(shown, 'flier'), size };
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
    const ends: SeatEnds = {
      ...(leg.from.kind === 'away' ? {} : pick(shown, 'from')),
      ...(perched ? { to: end } : {}),
    };
    const forward = mixD(start.forward, framedEnd.forward, flown);
    const lifted = (down: number) =>
      drawnFlier(
        view,
        aloftFramed(view, centre, {
          x: point.x + offset.x * zoom,
          y: point.y + (offset.y + down) * zoom,
          forward,
        }),
        flown,
        ends,
      );
    const flying = lifted(0);
    shown.drawn = flying.aloft;
    const middle =
      sitting && seat
        ? drawnSitter(view, seat, { ...offset, y: offset.y + bob })
        : bob === 0
          ? flying.drawn
          : lifted(bob).drawn;
    const visible =
      middle !== undefined && reachesScreen(view, middle, shown.span);
    shown.container.setVisible(visible);
    if (!visible) return;
    const { x, y } = middle;
    const drawnZoom = middle.zoom;
    shown.container
      .setPosition(x, y)
      .setRotation(turn)
      .setScale(jolt * (1 - bob / size / 2) * drawnZoom);
    // A finger's reach on the screen, however small the insect is drawn.
    shown.hit.setTo(0, 0, tapReach((shown.span * drawnZoom) / 2) / drawnZoom);
    const nectar = seat?.nectar && onHost(seat.on, seat.nectar);
    poseLook(shown.look, moment, {
      middle,
      rotation: turn,
      // Where the nectar is to the body as the look draws it, unzoomed.
      nectar: nectar && {
        x: x + (nectar.x - x) / drawnZoom,
        y: y + (nectar.y - y) / drawnZoom,
      },
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
   * How an insect stands away (`insect-away.ts`): past an edge by its open
   * wings' span at its size now — measured afresh, since a new one stands
   * away before its first `draw` — at a height its phase picks.
   */
  private awayOf(shown: Shown, view: View): Away {
    return {
      span: wingspan(shown.look.genes) * this.sizeOf(shown),
      drop: awayDown(view.height, shown.phase),
    };
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
}
