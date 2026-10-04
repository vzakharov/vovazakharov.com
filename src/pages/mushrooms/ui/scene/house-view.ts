import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Circle, Point } from '../../model/geometry';
import { type DoorPlace, type House, windowSlots } from '../../model/house';
import {
  blink,
  emerge,
  EMERGE_DURATION,
  lookAbout,
  type Tapped,
} from '../../model/motion';
import { capFrame } from '../../model/mushroom-pose';
import { type BedPlace, standAt } from './bed-place';
import { mix } from './colour';
import { doorHitArea, mouseHead } from './door-reach';
import { paintHouse, type ShownWindow } from './draw-house';
import type { Lights } from './dusk-view';
import { containsOutline, drawnMushrooms } from './hit-areas';
import { HouseWorm } from './house-worm';
import type { Lighted } from './ink';
import type { DoorShown, MouseDoor } from './mouse-runs';
import type { HazedGraphics } from './mushroom-paint';
import { PALETTE } from './palette';
import type { Brush } from './shapes';
import type { MeadowSound } from './sound';
import { puffFrom, type Puffing } from './spores';
import { coveredAt, WindowGlow, windowMiddles } from './window-glow';
import {
  type HousePart,
  tappedPart,
  windowFace,
  windowReaches,
} from './window-reach';
import { windowsLit } from './windows-lit';

/** How much sooner than its mouse's head a door swings all the way open. */
const DOOR_LEAD = 2;
/** How much nearer than its mushroom a house is drawn, so it stands just in front. */
const HOUSE_NEARER = 0.1;

/** Where `body`'s door stands, which the bed seats before any door goes in. */
function seated({ door }: Body): DoorPlace {
  if (!door) throw new Error('A door put in with no seat on its stem');
  return door;
}

/**
 * The mushroom a house stands in, as the bed last stood and moved it, and
 * where on its stem the bed seated its door: `undefined` until a door needs
 * one.
 */
export type Body = HazedGraphics &
  Lighted &
  Puffing & {
    door: DoorPlace | undefined;
  };

/** The windows and brush of a house's last paint, which its glow lights. */
type Painted = { windows: ShownWindow[]; brush: Brush };

/**
 * One mushroom's windows and door, in a graphics of their own that stands on
 * the mushroom's foot, just in front of it, and takes its pose every frame, so
 * they grow, wobble and sink with it. The door and the windows take a tap,
 * the nearest of them where their reaches overlap (`tappedPart`); a tap off
 * them falls through to the mushroom.
 */
export class HouseView {
  readonly graphics: Phaser.GameObjects.Graphics;
  /** When each window was put in, in `House.windows`' order. */
  private readonly windowsAt: number[] = [];
  /** When the door was put in; `undefined` while there is none. */
  private doorAt: number | undefined;
  private house: House | undefined;
  /** Where the door answers a tap (`doorHitArea`), in the graphics' own frame; empty with no door. */
  private readonly hit: Point[] = [];
  /** The mouse's peeks, and when a tap on its door called it out. */
  readonly mouse: Tapped;
  /** How far across its mouse's head was drawn at the last paint, in the graphics' own pixels: 0 with no door. */
  private shownHead = 0;
  /** How far out the mouse was at the last paint, so a still house is left be. */
  private shownOut = 0;
  private stale = true;
  /** Where each window answers a tap (`windowReaches`) and the face that cuts them (`windowFace`), in the graphics' own frame. */
  private reaches: Circle[] = [];
  private face: Point[] = [];
  /** The zoom its mushroom stands at, as last stood: what scales its graphics onto the screen, bar the mushroom's own swell and breath. */
  private zoom = 1;
  /** Its worm, which a tap on a window calls out. */
  readonly worm: HouseWorm;
  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  private readonly now: () => number;
  private readonly puffDepth: number;
  private readonly nearest: (house: HouseView, at: Point) => boolean;
  /** Its door as the mice's runs show it and answer a tap on it. */
  private readonly onDoor: MouseDoor;
  /** Its windows lit at dusk, over the dusk wash, following the house. */
  private readonly glow: WindowGlow;
  /** The windows and brush of the last paint, which the glow lights. */
  private painted: Painted | undefined;
  /** Which of the last paint's windows the glow was last painted with lit, by index: changes when a paint or a nearer mushroom does. */
  private glowed: string | undefined;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    now: () => number,
    phase: number,
    puffDepth: number,
    nearest: (house: HouseView, at: Point) => boolean,
    onDoor: MouseDoor,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.now = now;
    this.puffDepth = puffDepth;
    this.nearest = nearest;
    this.onDoor = onDoor;
    this.mouse = { phase, tappedAt: -Infinity };
    this.worm = new HouseWorm(voice, phase);
    this.glow = new WindowGlow(scene);
    this.graphics = scene.add.graphics().setInteractive({
      hitArea: this.hit,
      hitAreaCallback: (_area: readonly Point[], x: number, y: number) =>
        this.takes({ x, y }) !== undefined,
    });
    // A house is part of its mushroom, not the meadow: its tap leaves an open picker open.
    this.graphics.on(
      Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN,
      (_pointer: Phaser.Input.Pointer, x: number, y: number) => {
        const part = this.takes({ x, y });
        if (part === 'door') this.tapDoor();
        else if (part !== undefined) this.tapWindow(part);
      },
    );
  }

  /** Which part takes a tap at `at`, in the graphics' own frame; where two doors' tap areas overlap, the bed hands the tap to one (`tappedDoor`). */
  private takes(at: Point): HousePart | undefined {
    const middle = this.doorMiddle();
    const local =
      middle &&
      this.graphics.getWorldTransformMatrix().applyInverse(middle.x, middle.y);
    const door = local && {
      ...pick(local, 'x', 'y'),
      holds: ({ x, y }: Point) => containsOutline(this.hit, x, y),
    };
    const part = tappedPart(at, door, this.reaches, this.face);
    return part === 'door' && !this.nearest(this, this.onScreen(at))
      ? undefined
      : part;
  }

  private tapDoor(): void {
    this.onDoor.tap(this.mouse);
  }

  /** The worm out of window `from`, or a wriggle of it while it is out (`HouseWorm`). */
  private tapWindow(from: number): void {
    this.worm.tap(this.now(), from, this.house?.windows.length ?? 0);
  }

  /** The middle of the door's tap area on screen; `undefined` with no door. */
  doorMiddle(): Point | undefined {
    if (this.hit.length === 0) return undefined;
    const count = this.hit.length;
    return this.onScreen({
      x: this.hit.reduce((sum, { x }) => sum + x, 0) / count,
      y: this.hit.reduce((sum, { y }) => sum + y, 0) / count,
    });
  }

  /** Whether the door's tap area holds `at`, on screen: never with no door, or once out of reach (`disable`). */
  holdsTap(at: Point): boolean {
    if (this.graphics.input?.enabled !== true) return false;
    const { x, y } = this.graphics
      .getWorldTransformMatrix()
      .applyInverse(at.x, at.y);
    return containsOutline(this.hit, x, y);
  }

  private onScreen({ x, y }: Point): Point {
    const { x: sx, y: sy } = this.graphics
      .getWorldTransformMatrix()
      .transformPoint(x, y, { x: 0, y: 0 });
    return { x: sx, y: sy };
  }

  /**
   * Takes in `house` as of `clock`: each window or door new since the last
   * call pops in with a puff and a knock, unless the meadow is `opening`.
   */
  furnish(house: House, body: Body, clock: number, opening: boolean): void {
    if (house === this.house) return;
    const at = opening ? -Infinity : clock;
    const added =
      house.windows.length > this.windowsAt.length ||
      (house.door && this.doorAt === undefined);
    const slots = windowSlots(body.genes);
    for (
      let index = this.windowsAt.length;
      index < house.windows.length;
      index++
    ) {
      this.windowsAt.push(at);
      const slot = slots[index];
      if (slot && !opening) this.puff(body, capFrame(body.genes)(slot));
    }
    if (house.door && this.doorAt === undefined) {
      this.doorAt = at;
      const { x, y } = seated(body);
      if (!opening) this.puff(body, { x, y });
    }
    if (added && !opening) this.voice.knock();
    this.house = house;
    this.stale = true;
  }

  /** Whether its door is in, so that where it stands on the stem is settled. */
  get doored(): boolean {
    return this.doorAt !== undefined;
  }

  /** How far across the mouse's head is drawn on screen, as the probe reads it. */
  get drawnHead(): number {
    return this.shownHead * this.graphics.scaleX;
  }

  /** Marks the house for a repaint, as a resize or a repaint of its mushroom needs. */
  repaint(): void {
    this.stale = true;
  }

  /** Out of reach of a tap, as its mushroom sinks. */
  disable(): void {
    this.graphics.disableInteractive();
  }

  destroy(): void {
    this.graphics.destroy();
    this.glow.destroy();
  }

  /** How far a mouse is out of its door at `t`, peeking or setting off on a run: 0 with no door. */
  out(t: number): number {
    return this.doorShown(t)?.out ?? 0;
  }

  private doorShown(t: number): DoorShown | undefined {
    return this.doorAt === undefined
      ? undefined
      : this.onDoor.at(t, this.mouse);
  }

  /** Stands the house at `place`, its mushroom's: repainted at a new zoom, as its windows' reach and its worm's girth are floored on the screen. */
  stand(place: BedPlace): void {
    standAt(this.graphics, place, HOUSE_NEARER);
    if (place.zoom !== this.zoom) this.stale = true;
    this.zoom = place.zoom;
  }

  /** Takes `body`'s pose as of `t`, repaints what has moved, and lights its windows as `lights` has the dusk. */
  update(t: number, body: Body, lights?: Lights): void {
    const { graphics } = body;
    this.graphics
      .setScale(graphics.scaleX, graphics.scaleY)
      .setRotation(graphics.rotation);
    const door = this.doorShown(t);
    const out = Math.max(door?.out ?? 0, door?.open ?? 0);
    const popping = [...this.windowsAt, this.doorAt ?? -Infinity].some(
      (at) => t - at < EMERGE_DURATION,
    );
    const worm = this.worm.stirring(t);
    if (this.stale || popping || out > 0 || this.shownOut > 0 || worm) {
      // A stale house is repainted afresh, its glow with it; a moving one only where its windows did.
      if (this.stale) this.glowed = undefined;
      this.stale = false;
      this.shownOut = out;
      this.paint(t, body, door);
    }
    this.light(t, body, lights);
  }

  /**
   * Lays its glow over the house, at `lights`' depth and as lit as the dusk
   * has its windows at `t`: each window a worm has open, or a nearer
   * mushroom stands over the middle of, left to the house under the wash.
   */
  private light(t: number, body: Body, lights: Lights | undefined): void {
    const { glow, graphics, painted, mouse } = this;
    const lit = lights ? windowsLit(lights.dusk, t * 1000, mouse.phase) : 0;
    const shown = lit > 0 && graphics.visible && painted !== undefined;
    if (lights && painted && shown) this.relit(body, painted);
    glow.follow(graphics, shown, lit, lights?.depth ?? 0);
  }

  /** Repaints the glow with `painted`'s windows, those a worm has open or a nearer mushroom covers left unlit, if that differs from the last. */
  private relit(body: Body, painted: Painted): void {
    const { graphics, scene, glow, zoom } = this;
    const { genes, size } = body;
    const nearer = drawnMushrooms(scene);
    const matrix = graphics.getWorldTransformMatrix();
    const middles = windowMiddles(genes, size, painted.windows);
    const windows = painted.windows.map((window, index) => {
      const middle = middles[index];
      const at = middle && matrix.transformPoint(middle.x, middle.y);
      const hidden =
        !at ||
        (window.swing?.open ?? 0) > 0 ||
        coveredAt(nearer, pick(at, 'x', 'y'), graphics.depth);
      return hidden ? { ...window, popped: 0 } : window;
    });
    const glowed = windows.map(({ popped }) => popped).join(',');
    if (glowed === this.glowed) return;
    this.glowed = glowed;
    // Texels per unit of the house's frame: its zoom onto the world, and the camera's onto the device's pixels.
    const texels = zoom * scene.cameras.main.zoom;
    glow.paint(genes, size, windows, painted.brush, texels);
  }

  private paint(t: number, body: Body, shown: DoorShown | undefined): void {
    const { genes, size, haze, lighting } = body;
    const house = this.house;
    this.graphics.clear();
    this.hit.length = 0;
    this.shownHead = 0;
    if (!house) return;
    const brush = {
      ink: Math.max(1.5, size * 0.01),
      tone: (colour: number) => mix(colour, PALETTE.air, haze),
      lighting,
    };
    const windows = house.windows.map((kind, index) => ({
      kind,
      popped: emerge(t - (this.windowsAt[index] ?? -Infinity)),
      swing: this.worm.window(t, index),
    }));
    const door =
      this.doorAt === undefined || !shown
        ? undefined
        : {
            station: seated(body),
            popped: emerge(t - this.doorAt),
            ...pick(shown, 'out'),
            open: Math.max(shown.open, Math.min(1, shown.out * DOOR_LEAD)),
            look: shown.look ?? lookAbout(t, this.mouse.phase),
            shut: blink(t, this.mouse.phase),
          };
    this.reaches = windowReaches(
      genes,
      size,
      windows.length,
      brush.ink,
      this.zoom,
    );
    this.face = windowFace(genes, size);
    this.painted = { windows, brush };
    const worm = this.worm.shown(t, genes, size, this.zoom);
    paintHouse(this.graphics, genes, size, windows, door, brush, worm);
    if (!door) return;
    this.hit.push(...doorHitArea(door.station, size));
    this.shownHead = mouseHead(door.station.width * size * door.popped);
  }

  /** A puff of spores from `point`, in the mushroom's frame, where it stands on screen. */
  private puff(body: Body, point: Point): void {
    puffFrom(this.scene, body, point, 0.35, this.puffDepth);
  }
}
