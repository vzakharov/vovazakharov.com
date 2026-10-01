import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { isSeat, type Perch, perchName, type Side } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { InsectKind } from '../../model/insect-genes';
import { carriedFrom, landingBob } from '../../model/insect-motion';
import { wingspan } from '../../model/insect-outline';
import type { CarryingOver } from '../../model/insect-paths';
import {
  firstSteering,
  startLeg,
  steer,
  type Steering,
} from '../../model/insect-steering';
import type { Flier } from '../../model/insects';
import { phaseOf, smooth, wobble } from '../../model/motion';
import { layoutAtRow } from './eye-crop';
import { containsCircle, type TappedFigure } from './hit-areas';
import type { Lighting } from './ink';
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
import { clumpRow, type FootRows } from './perch-sight';
import type { MeadowSound } from './sound';
import { tapReach } from './tap-reach';
import { cull, ofLayout, onScreen, type View } from './view';

/** How far a flight's flutter lifts it at most, per unit of the insect's size. */
const FLUTTER = 0.28;
/** How much a tapped insect jolts, against a mushroom's squash. */
const JOLT = 0.7;
/** How long a landing's bob cut short by a take-off takes to die away, in ms. */
const BOB_FADE = 200;
/**
 * The band of the screen's height an insect flies in from and out to off
 * screen, its phase picking where.
 */
const AWAY_BAND = [0.18, 0.5] as const;

/** How far along from `start` to `end` `point` stands, from 0 to 1, by its distance to each. */
function alongOf(point: Point, start: Point, end: Point): number {
  const gone = Math.hypot(point.x - start.x, point.y - start.y);
  const left = Math.hypot(point.x - end.x, point.y - end.y);
  return gone + left > 0 ? gone / (gone + left) : 1;
}

/** Where an insect sits on a perch, and at a flower the head's middle it drinks from. */
export type Perched = Point & { nectar?: Point };

/** Where a perch stands in the world this frame, `undefined` while it has nowhere to be. */
export type PerchAt = (perch: Perch, insect: Flier) => Perched | undefined;

/** An insect on screen: its look, and where and how it flies. */
type Shown = TappedFigure &
  Flying &
  CarryingOver & {
    look: Look;
    /** How far its open wings span on screen, in pixels, as last painted. */
    span: number;
    /**
     * Where its current leg set off: across, in ground units from the
     * world's midline; down, as a fraction of the screen's height.
     */
    from: Point;
    /**
     * Whether its leg in from away has yet to pick the screen edge it
     * enters by, which it does on its first frame, once its perch stands.
     */
    entering: boolean;
    /** The ground row, in world px, its current leg set off standing over. */
    fromRow: number;
    /** The ground row it was drawn standing over last frame. */
    row: number;
    /** Where its flight had it last frame, in the world. */
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
  };

/**
 * The meadow's insects, reconciled with the state by id: each a container of
 * its kind's parts (`insect-look.ts`), above everything in the meadow and
 * under the buttons, flown along its leg every frame. A leg's start is where
 * it was last drawn, kept in ground units so a resize mid-flight never makes
 * it jump; its end is wherever its perch stands that frame, so it lands on a
 * breathing cap or a swaying flower.
 *
 * Every leg is flown in the world as the opening eye lays it out, and drawn
 * through the view standing over a ground row (`ofLayout`): perched, its
 * perch's foot's; in flight, the leg's two rows mixed by how far along it is;
 * in the air, the clump's. Exact for a perched insect; drawn at its own size
 * wherever it is, and hidden nearer the eye than `V_NEAR`. Away is just past
 * the screen's edge where the view stands now, at the row it flies over: one
 * in from away enters by the edge nearer its first perch where the screen
 * shows that perch, else by the world's end nearer it; one leaving goes out
 * by its seed's side.
 */
export class InsectView {
  private readonly shown = new Map<string, Shown>();
  /** The screen's width and height, in CSS px, as last painted. */
  private width = 1;
  private height = 1;
  /** The world's width and its ground unit, in px, as last painted. */
  private world = 1;
  private unit = 1;
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
      shown.entering = from.kind === 'away';
      shown.fromRow = from.kind === 'away' ? this.clump : shown.row;
      shown.from =
        from.kind === 'away'
          ? this.units(this.offScreen(from.side, shown, shown.fromRow))
          : this.units({
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
  paint(layout: MeadowLayout, lighting: Lighting): void {
    const { width, height, camera, insectSizes } = layout;
    this.lighting = lighting;
    this.width = width;
    this.height = height;
    this.world = camera.world;
    this.unit = camera.unit;
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
    const { leg } = shown.flier;
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
      shown.from = this.units(this.entry(shown, leg.from.side, seated));
    }
    const start = this.placed(shown.from);
    const end =
      (leg.to.kind === 'away'
        ? this.offScreen(leg.to.side, shown, shown.fromRow)
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
    const row =
      perched && now >= leg.arrives
        ? toRow
        : shown.fromRow + (toRow - shown.fromRow) * alongOf(point, start, end);
    Object.assign(shown, { end, at: point, offset, bob: bob / size, row });
    const middle = this.screenOf(
      { x: point.x + offset.x, y: point.y + bob + offset.y },
      row,
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
      nectar: seated?.nectar && this.screenOf(seated.nectar, row),
    });
  }

  /** The row `perch` stands over; `undefined` for one the scene has not seen standing. */
  private rowOf(perch: Perch): number | undefined {
    return perch.kind === 'away' ? undefined : this.feet.get(perchName(perch));
  }

  /**
   * Where the world's `point`, standing over `row`, is drawn on the screen
   * now; `undefined` too near the eye to be drawn. As laid out before the
   * eye's first fit.
   */
  private screenOf(point: Point, row: number): Point | undefined {
    const view = this.view();
    if (!view) return point;
    const placed = ofLayout(view, point, row);
    return cull(placed) ? undefined : pick(placed, 'x', 'y');
  }

  private show(flier: Flier): Shown {
    const hit = new Phaser.Geom.Circle();
    if (!this.lighting) throw new Error('An insect is shown before its paint');
    const { look, stack } = lookOf(this.scene, flier, this.lighting);
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
      entering: false,
      fromRow: this.clump,
      row: this.clump,
      at: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      bob: 0,
      bobFrom: 0,
      end: undefined,
      steering: firstSteering({ facing: 0, turn: 0 }),
      aim: undefined,
      turnedFrom: undefined,
      carried: { launch: 0, speed: 0, drink: 0 },
      phase: phaseOf(flier),
      tappedAt: -Infinity,
    };
    const { from } = flier.leg;
    if (from.kind === 'away') {
      shown.at = this.offScreen(from.side, shown, shown.fromRow);
      shown.from = this.units(shown.at);
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

  /**
   * Where an insect in from away sets off for `seated`, its first perch: past
   * the screen's edge nearer it where the screen shows it, else past the
   * world's end nearer it; by `side` for a perch standing nowhere.
   */
  private entry(shown: Shown, side: Side, seated: Point | undefined): Point {
    if (!seated) return this.offScreen(side, shown, shown.fromRow);
    const drawn = this.screenOf(seated, shown.fromRow);
    const view = this.view();
    if (drawn && view && onScreen(view, drawn)) {
      const nearer = drawn.x < this.width / 2 ? 'left' : 'right';
      return this.offScreen(nearer, shown, shown.fromRow);
    }
    return this.pastEnd(seated.x < this.world / 2 ? 'left' : 'right', shown);
  }

  /** How far past an edge an insect stands away: its open wings' span. */
  private reachOf(shown: Shown): number {
    return wingspan(shown.look.genes) * this.sizeOf(shown);
  }

  /** How far down the screen, in px, an insect away flies: in `AWAY_BAND`, where its phase picks. */
  private awayDown(shown: Shown): number {
    const share = 0.5 + 0.5 * Math.sin(shown.phase * 3);
    return this.height * (AWAY_BAND[0] + (AWAY_BAND[1] - AWAY_BAND[0]) * share);
  }

  /**
   * In the world, just past the screen's `side` edge where the view stands
   * now, at a height `awayDown` picks, standing over `row`; past the world's
   * end on that side where the screen's edge meets no point over that row.
   */
  private offScreen(side: Side, shown: Shown, row: number): Point {
    const reach = this.reachOf(shown);
    const screen = {
      x: side === 'left' ? -reach : this.width + reach,
      y: this.awayDown(shown),
    };
    const view = this.view();
    const opening = (this.world - this.width) / 2;
    if (!view) return { ...screen, x: screen.x + opening };
    return layoutAtRow(view, screen, row) ?? this.pastEnd(side, shown);
  }

  /** In the world, just past its `side` end, at a height `awayDown` picks. */
  private pastEnd(side: Side, shown: Shown): Point {
    const reach = this.reachOf(shown);
    return {
      x: side === 'left' ? -reach : this.world + reach,
      y: this.awayDown(shown),
    };
  }

  /** A world point as `Shown.from` keeps it. */
  private units({ x, y }: Point): Point {
    return { x: (x - this.world / 2) / this.unit, y: y / this.height };
  }

  /** `Shown.from` back in the world. */
  private placed({ x, y }: Point): Point {
    return { x: this.world / 2 + x * this.unit, y: y * this.height };
  }
}
