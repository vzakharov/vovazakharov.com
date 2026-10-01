import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isSeat, type Perch, perchName } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { carriedFrom, landingBob } from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import { startLeg, steer } from '../../model/insect-steering';
import type { Flier } from '../../model/insects';
import { smooth, wobble } from '../../model/motion';
import type { Host } from './bed-place';
import { containsCircle } from './hit-areas';
import type { Lighting } from './ink';
import {
  type Away,
  awayDown,
  entry,
  fromUnits,
  offScreen,
  type Seen,
  type Stage,
  toUnits,
} from './insect-away';
import { drawLook, fidget, lookOf, newDrink, poseLook } from './insect-look';
import { drawnInsect, type Seats } from './insect-seat';
import { freshShown, type Shown } from './insect-shown';
import { tappedInsect } from './insect-tap';
import type { MeadowLayout } from './layout';
import { clumpRow, type FootRows } from './perch-sight';
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

/**
 * Where an insect sits on a perch, at a flower the head's middle it drinks
 * from, and on a cap or a flower the host it sits on, which draws it.
 */
export type Perched = Point & { nectar?: Point; on?: Host };

/** Where a perch stands in the world this frame, `undefined` while it has nowhere to be. */
export type PerchAt = (perch: Perch, insect: Flier) => Perched | undefined;

/**
 * The meadow's insects, reconciled with the state by id: each a container of
 * its kind's parts (`insect-look.ts`), above everything in the meadow and
 * under the buttons, flown along its leg every frame. A leg's start is where
 * it was last drawn, kept in ground units so a resize mid-flight never makes
 * it jump; its end is wherever its perch stands that frame, so it lands on a
 * breathing cap or a swaying flower.
 *
 * Every leg is flown in the world as the opening eye lays it out. One
 * sitting on a cap or a flower is drawn where that host draws its seat; one
 * in flight, through the view standing over a ground row (`ofLayout`), the
 * leg's two rows mixed by how far along it is, carried onto the host it left
 * and the one it lands on as it nears either (`drawnInsect`); one in the air,
 * over the clump's row. Drawn at its own size wherever it is, and hidden
 * nearer the eye than `V_NEAR`. Away is just past
 * the screen's edge where the view stands now, at the row it flies over: one
 * in from away enters by the edge nearer its first perch where the screen
 * shows that perch, else by the world's end nearer it; one leaving goes out
 * by its seed's side.
 */
export class InsectView {
  private readonly shown = new Map<string, Shown>();
  /** The insects drawn sitting on their perch last frame, by id. */
  private readonly sat = new Set<string>();
  /** The perch each insect's current leg set off sitting on, by id. */
  private readonly leftFrom = new Map<string, Perch>();
  private stage: Stage = { width: 1, height: 1, world: 1, unit: 1 };
  /** The row the opening clump stands on, in world px, as last painted. */
  private clump = 1;
  /** The row each perch stands over, as the scene last saw them. */
  private feet: FootRows = new Map();
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
  /** The view the frame is drawn through now; none before the eye's first fit. */
  private readonly view: () => View | undefined;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    depth: number,
    onTap: (id: string) => void,
    view: () => View | undefined,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.depth = depth;
    this.onTap = onTap;
    this.view = view;
  }

  /** Takes the rows the perches stand over (`footRows`), as the scene sees them now. */
  see(feet: FootRows): void {
    this.feet = feet;
  }

  /** Shows what `insects` holds: a new one set off from off screen, a gone one destroyed, a new leg started from where it was drawn. */
  reconcile(insects: readonly Flier[]): void {
    const ids = new Set(insects.map(({ id }) => id));
    for (const [id, shown] of this.shown) {
      if (ids.has(id)) continue;
      shown.container.destroy();
      this.shown.delete(id);
      this.sat.delete(id);
      this.leftFrom.delete(id);
    }
    for (const flier of insects) {
      const shown = this.shown.get(flier.id) ?? this.show(flier);
      if (shown.flier.legs === flier.legs && shown.flier === flier) continue;
      const newLeg = shown.flier.legs !== flier.legs;
      const last = { ...shown.flier.leg, ...shown.carried };
      shown.flier = flier;
      if (!newLeg) continue;
      const { from, to, departs } = flier.leg;
      if (this.sat.has(flier.id)) this.leftFrom.set(flier.id, last.to);
      else this.leftFrom.delete(flier.id);
      shown.carried = carriedFrom(last, departs);
      // From where it was drawn, fidgets and all, so a startle never jumps.
      shown.entering = from.kind === 'away';
      shown.fromRow = from.kind === 'away' ? this.clump : shown.row;
      shown.from = toUnits(
        this.stage,
        from.kind === 'away'
          ? offScreen(this.seen(), from.side, this.awayOf(shown), shown.fromRow)
          : { x: shown.at.x + shown.offset.x, y: shown.at.y + shown.offset.y },
      );
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
  paint(layout: MeadowLayout, lighting: Lighting): void {
    const { width, height, camera, insectSizes } = layout;
    this.lighting = lighting;
    this.stage = { width, height, ...pick(camera, 'world', 'unit') };
    this.clump = clumpRow(layout);
    this.sizes = insectSizes;
    for (const shown of this.shown.values()) {
      shown.look.lighting = lighting;
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

  private fly(shown: Shown, t: number, perchAt: PerchAt): void {
    const now = t * 1000;
    const { leg, id } = shown.flier;
    const size = this.sizeOf(shown);
    const motion = {
      ...pick(shown, 'phase'),
      ...pick(shown.flier, 'kind'),
      flutter: size * FLUTTER,
    };
    const seated =
      leg.to.kind === 'away' ? undefined : perchAt(leg.to, shown.flier);
    if (shown.entering && leg.from.kind === 'away') {
      shown.entering = false;
      shown.fromRow = this.rowOf(leg.to) ?? this.clump;
      const away = this.awayOf(shown);
      const { side } = leg.from;
      const set = entry(this.seen(), side, away, shown.fromRow, seated);
      shown.from = toUnits(this.stage, set);
    }
    const start = fromUnits(this.stage, shown.from);
    const end =
      (leg.to.kind === 'away'
        ? offScreen(this.seen(), leg.to.side, this.awayOf(shown), shown.fromRow)
        : seated) ??
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
    const toRow =
      (leg.to.kind === 'away' ? undefined : this.rowOf(leg.to)) ??
      shown.fromRow;
    const sitting = perched && now >= leg.arrives;
    const flown = sitting ? 1 : alongOf(point, start, end);
    const row = shown.fromRow + (toRow - shown.fromRow) * flown;
    Object.assign(shown, { end, at: point, offset, bob: bob / size, row });
    if (sitting) this.sat.add(id);
    else this.sat.delete(id);
    const seats = this.seatsOf(shown, perched ? seated : undefined, perchAt);
    const middle = drawnInsect(
      this.view(),
      { x: point.x + offset.x, y: point.y + bob + offset.y },
      { flown, row },
      seats,
    );
    shown.container.setVisible(middle !== undefined);
    if (!middle) return;
    shown.container
      .setPosition(middle.x, middle.y)
      .setRotation(turn)
      .setScale(jolt * (1 - bob / size / 2));
    poseLook(shown.look, moment, {
      middle,
      rotation: turn,
      nectar:
        seated?.nectar &&
        drawnInsect(
          this.view(),
          seated.nectar,
          { flown, row },
          pick(seats, 'to'),
        ),
    });
  }

  /** The hosts `shown`'s leg is drawn between: the one it left sitting, and `seated`'s, where it flies to sit. */
  private seatsOf(
    shown: Shown,
    seated: Perched | undefined,
    perchAt: PerchAt,
  ): Seats {
    const left = this.leftFrom.get(shown.flier.id);
    return {
      left: left && perchAt(left, shown.flier)?.on,
      to: seated?.on,
    };
  }

  /** The row `perch` stands over; `undefined` for one the scene has not seen standing. */
  private rowOf(perch: Perch): number | undefined {
    return perch.kind === 'away' ? undefined : this.feet.get(perchName(perch));
  }

  /** The stage as last painted, seen through the view the frame is drawn through now. */
  private seen(): Seen {
    return { ...this.stage, view: this.view() };
  }

  /**
   * How an insect stands away (`insect-away.ts`): past an edge by its open
   * wings' span at its size now — measured afresh, since a new one stands
   * away before its first `draw` — at a height its phase picks.
   */
  private awayOf(shown: Shown): Away {
    return {
      span: wingspan(shown.look.genes) * this.sizeOf(shown),
      drop: awayDown(this.stage.height, shown.phase),
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
    const shown = freshShown({ container, hit, look, flier }, this.clump);
    const { from } = flier.leg;
    if (from.kind === 'away') {
      shown.at = offScreen(
        this.seen(),
        from.side,
        this.awayOf(shown),
        shown.fromRow,
      );
      shown.from = toUnits(this.stage, shown.at);
      shown.entering = true;
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
}
